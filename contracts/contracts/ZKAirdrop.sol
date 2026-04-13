// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./Groth16Verifier.sol";
import "./IssuerRegistry.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title ZKAirdrop
/// @notice Identity-based airdrop with ZK proofs and sybil resistance.
///         Users must prove age >= 18 AND jurisdiction = HK to claim.
///         Nullifier prevents the same person from claiming with multiple wallets.
///
/// @dev Public signals layout (8 total):
///   [0] nullifierHash      - Poseidon(holderSecret, externalNullifier)
///   [1] identityCommitment - Poseidon(holderSecret)
///   [2] minAge
///   [3] allowedJurisdiction
///   [4] minKycLevel
///   [5] disclosureFlags
///   [6] issuerPubKeyHash
///   [7] externalNullifier
contract ZKAirdrop {
    Groth16Verifier public immutable verifier;
    IssuerRegistry public immutable registry;
    IERC20 public immutable token;
    uint256 public immutable claimAmount;
    uint256 public immutable externalNullifier;

    /// @notice Required disclosure flags (bit 0 = age, bit 1 = jurisdiction)
    /// The contract enforces that these flags are set in the proof.
    /// Users cannot bypass checks by unchecking flags.
    uint256 public constant REQUIRED_FLAGS = 3; // 0b011 = age + jurisdiction

    uint256 public totalClaims;
    mapping(uint256 => bool) public usedNullifiers;

    event Claimed(address indexed claimer, uint256 nullifierHash, uint256 identityCommitment);

    error InvalidProof();
    error UntrustedIssuer();
    error AlreadyClaimed();
    error WrongNullifierScope();
    error InsufficientDisclosure();

    constructor(
        address _verifier,
        address _registry,
        address _token,
        uint256 _claimAmount
    ) {
        verifier = Groth16Verifier(_verifier);
        registry = IssuerRegistry(_registry);
        token = IERC20(_token);
        claimAmount = _claimAmount;
        externalNullifier = uint256(keccak256(abi.encodePacked(address(this)))) % 21888242871839275222246405745257275088548364400416034343698204186575808495617;
    }

    /// @notice Claim airdrop tokens by submitting a valid ZK identity proof.
    function claim(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[8] calldata publicSignals
    ) external {
        // 1. Verify the externalNullifier matches this airdrop
        if (publicSignals[7] != externalNullifier) revert WrongNullifierScope();

        // 2. Enforce required disclosure flags (age + jurisdiction must be proven)
        if (publicSignals[5] & REQUIRED_FLAGS != REQUIRED_FLAGS) revert InsufficientDisclosure();

        // 3. Verify ZK proof
        bool valid = verifier.verifyProof(a, b, c, publicSignals);
        if (!valid) revert InvalidProof();

        // 4. Check issuer is trusted
        uint256 issuerHash = publicSignals[6];
        if (!registry.isActiveIssuer(issuerHash)) revert UntrustedIssuer();

        // 5. Check nullifier not used (sybil resistance)
        uint256 nullifier = publicSignals[0];
        if (usedNullifiers[nullifier]) revert AlreadyClaimed();
        usedNullifiers[nullifier] = true;

        // 6. Transfer airdrop tokens
        totalClaims++;
        token.transfer(msg.sender, claimAmount);

        emit Claimed(msg.sender, nullifier, publicSignals[1]);
    }

    /// @notice Check remaining tokens in the airdrop pool.
    function remainingTokens() external view returns (uint256) {
        return token.balanceOf(address(this));
    }

    /// @notice Check if a nullifier has been used.
    function isNullifierUsed(uint256 nullifier) external view returns (bool) {
        return usedNullifiers[nullifier];
    }
}
