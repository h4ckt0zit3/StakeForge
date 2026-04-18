// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title StakeForge
 * @notice A DeFi staking contract where users lock SFORGE tokens for a chosen
 *         duration (30 / 90 / 180 days) to earn yield at tiered APY rates.
 * @dev    Rewards are calculated linearly per second since stake creation.
 *         One active stake per address maximum.
 */
contract StakeForge is ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ──────────────────────────────────────────────
    //  Custom Errors
    // ──────────────────────────────────────────────
    error StakeAlreadyExists();
    error StakeLocked();
    error NoActiveStake();
    error InsufficientBalance();
    error InvalidDuration();
    error ZeroAmount();

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────
    event Staked(
        address indexed user,
        uint256 indexed amount,
        uint256 indexed duration,
        uint256 apyBps
    );
    event Unstaked(
        address indexed user,
        uint256 indexed principal,
        uint256 indexed rewards
    );
    event RewardsClaimed(
        address indexed user,
        uint256 indexed amount
    );

    // ──────────────────────────────────────────────
    //  Types
    // ──────────────────────────────────────────────
    struct Stake {
        uint256 amount;
        uint256 startTime;
        uint256 unlockTime;
        uint256 apyBps;       // basis points (500 = 5%)
        uint256 rewardsClaimed;
    }

    // ──────────────────────────────────────────────
    //  Constants
    // ──────────────────────────────────────────────
    uint256 private constant BPS_DENOMINATOR = 10_000;
    uint256 private constant SECONDS_PER_YEAR = 365 days;

    uint256 public constant DURATION_30  = 30 days;
    uint256 public constant DURATION_90  = 90 days;
    uint256 public constant DURATION_180 = 180 days;

    uint256 public constant APY_30  = 500;   // 5%
    uint256 public constant APY_90  = 1200;  // 12%
    uint256 public constant APY_180 = 2000;  // 20%

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────
    IERC20 public immutable stakingToken;
    mapping(address => Stake) public stakes;
    uint256 public totalStaked;

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────
    constructor(address _stakingToken) {
        stakingToken = IERC20(_stakingToken);
    }

    // ──────────────────────────────────────────────
    //  External — Mutative
    // ──────────────────────────────────────────────

    /**
     * @notice Locks `amount` SFORGE tokens for a chosen duration to earn yield.
     * @param amount        The number of tokens to stake (must be > 0).
     * @param durationChoice 0 = 30 days, 1 = 90 days, 2 = 180 days.
     */
    function stake(uint256 amount, uint8 durationChoice) external nonReentrant {
        if (amount == 0) revert ZeroAmount();
        if (stakes[msg.sender].amount != 0) revert StakeAlreadyExists();

        (uint256 duration, uint256 apyBps) = _resolveDuration(durationChoice);

        stakes[msg.sender] = Stake({
            amount: amount,
            startTime: block.timestamp,
            unlockTime: block.timestamp + duration,
            apyBps: apyBps,
            rewardsClaimed: 0
        });

        totalStaked += amount;

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount, duration, apyBps);
    }

    /**
     * @notice Withdraws principal + all unclaimed rewards after the lock expires.
     */
    function unstake() external nonReentrant {
        Stake storage s = stakes[msg.sender];
        if (s.amount == 0) revert NoActiveStake();
        if (block.timestamp < s.unlockTime) revert StakeLocked();

        uint256 principal = s.amount;
        uint256 pending = _calculateRewards(s) - s.rewardsClaimed;
        uint256 total = principal + pending;

        totalStaked -= principal;
        delete stakes[msg.sender];

        stakingToken.safeTransfer(msg.sender, total);

        emit Unstaked(msg.sender, principal, pending);
    }

    /**
     * @notice Claims accrued rewards without withdrawing the principal.
     *         Rewards accrue from day one, even before the lock expires.
     */
    function claimRewards() external nonReentrant {
        Stake storage s = stakes[msg.sender];
        if (s.amount == 0) revert NoActiveStake();

        uint256 totalAccrued = _calculateRewards(s);
        uint256 pending = totalAccrued - s.rewardsClaimed;
        if (pending == 0) revert ZeroAmount();

        s.rewardsClaimed = totalAccrued;

        stakingToken.safeTransfer(msg.sender, pending);

        emit RewardsClaimed(msg.sender, pending);
    }

    // ──────────────────────────────────────────────
    //  External — View
    // ──────────────────────────────────────────────

    /**
     * @notice Returns the unclaimed rewards accrued so far for `user`.
     */
    function getPendingRewards(address user) external view returns (uint256) {
        Stake storage s = stakes[user];
        if (s.amount == 0) return 0;
        return _calculateRewards(s) - s.rewardsClaimed;
    }

    /**
     * @notice Returns the total value locked in the contract.
     */
    function getTVL() external view returns (uint256) {
        return totalStaked;
    }

    // ──────────────────────────────────────────────
    //  Internal Helpers
    // ──────────────────────────────────────────────

    /**
     * @dev Computes total rewards accrued from `startTime` to now at the
     *      stake's APY, pro-rated linearly per second.
     *      Formula: amount * apyBps * elapsed / (BPS_DENOMINATOR * SECONDS_PER_YEAR)
     */
    function _calculateRewards(Stake storage s) internal view returns (uint256) {
        uint256 elapsed = block.timestamp - s.startTime;
        return (s.amount * s.apyBps * elapsed) / (BPS_DENOMINATOR * SECONDS_PER_YEAR);
    }

    /**
     * @dev Maps a durationChoice (0, 1, 2) → (lock seconds, APY in BPS).
     */
    function _resolveDuration(uint8 choice) internal pure returns (uint256 duration, uint256 apyBps) {
        if (choice == 0) return (DURATION_30, APY_30);
        if (choice == 1) return (DURATION_90, APY_90);
        if (choice == 2) return (DURATION_180, APY_180);
        revert InvalidDuration();
    }
}
