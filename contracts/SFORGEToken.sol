// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title SFORGEToken
 * @notice ERC-20 token for the StakeForge protocol with a built-in testnet faucet.
 * @dev Constructor mints 1,000,000 SFORGE to the deployer.
 *      Any address can call faucet() once every 24 hours to receive 1,000 SFORGE.
 */
contract SFORGEToken is ERC20 {
    // ──────────────────────────────────────────────
    //  Custom Errors
    // ──────────────────────────────────────────────
    error FaucetCooldown(uint256 nextAvailableTime);

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────
    event Faucet(address indexed user, uint256 amount);

    // ──────────────────────────────────────────────
    //  Constants
    // ──────────────────────────────────────────────
    uint256 public constant INITIAL_SUPPLY = 1_000_000 ether;
    uint256 public constant FAUCET_AMOUNT = 1_000 ether;
    uint256 public constant FAUCET_COOLDOWN = 24 hours;

    // ──────────────────────────────────────────────
    //  State
    // ──────────────────────────────────────────────
    mapping(address => uint256) public lastFaucetTime;

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────
    constructor() ERC20("StakeForge Token", "SFORGE") {
        _mint(msg.sender, INITIAL_SUPPLY);
    }

    // ──────────────────────────────────────────────
    //  External Functions
    // ──────────────────────────────────────────────

    /**
     * @notice Mints 1,000 SFORGE to the caller. Can only be used once per 24 hours.
     */
    function faucet() external {
        uint256 nextAvailable = lastFaucetTime[msg.sender] + FAUCET_COOLDOWN;
        if (block.timestamp < nextAvailable) {
            revert FaucetCooldown(nextAvailable);
        }

        lastFaucetTime[msg.sender] = block.timestamp;
        _mint(msg.sender, FAUCET_AMOUNT);

        emit Faucet(msg.sender, FAUCET_AMOUNT);
    }
}
