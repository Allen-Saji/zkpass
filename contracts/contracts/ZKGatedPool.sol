// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Groth16Verifier.sol";

/// @title ZKGatedPool
/// @notice Demo DeFi pool gated by ZK identity proofs.
///         Users must submit a valid Groth16 proof of their credentials
///         before depositing. Proofs expire after PROOF_VALIDITY seconds.
contract ZKGatedPool {
    Groth16Verifier public immutable verifier;

    uint256 public constant PROOF_VALIDITY = 1 days;

    mapping(address => uint256) public verifiedAt;

    event ProofVerified(address indexed user, uint256 disclosureFlags);
    event Deposited(address indexed user, uint256 amount);

    error InvalidProof();
    error NotVerified();
    error ProofExpired();

    constructor(address _verifier) {
        verifier = Groth16Verifier(_verifier);
    }

    /// @notice Submit a ZK proof to gain pool access, optionally deposit in same tx.
    /// @param a  Groth16 proof point A (G1)
    /// @param b  Groth16 proof point B (G2)
    /// @param c  Groth16 proof point C (G1)
    /// @param publicSignals  [minAge, allowedJurisdiction, minKycLevel, disclosureFlags, issuerPubKeyHash]
    function deposit(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[5] calldata publicSignals
    ) external payable {
        bool valid = verifier.verifyProof(a, b, c, publicSignals);
        if (!valid) revert InvalidProof();

        verifiedAt[msg.sender] = block.timestamp;
        emit ProofVerified(msg.sender, publicSignals[3]);

        if (msg.value > 0) {
            emit Deposited(msg.sender, msg.value);
        }
    }

    /// @notice Check if an address has a valid (non-expired) proof on record.
    function isVerified(address user) external view returns (bool) {
        uint256 ts = verifiedAt[user];
        if (ts == 0) return false;
        return block.timestamp - ts < PROOF_VALIDITY;
    }

    /// @notice Pool balance (for demo display).
    function poolBalance() external view returns (uint256) {
        return address(this).balance;
    }
}
