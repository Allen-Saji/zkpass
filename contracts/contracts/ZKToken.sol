// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title ZKToken
/// @notice Demo ERC20 token for ZKPass identity-based airdrop.
contract ZKToken is ERC20 {
    constructor(uint256 totalSupply_) ERC20("ZKPass Demo Token", "ZKPT") {
        _mint(msg.sender, totalSupply_);
    }
}
