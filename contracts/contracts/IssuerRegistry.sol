// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title IssuerRegistry
/// @notice On-chain registry of trusted credential issuers.
///         Stores Poseidon hashes of issuer EdDSA public keys.
///         Any ZK-gated contract can check isActiveIssuer() before accepting proofs.
contract IssuerRegistry {
    struct Issuer {
        string name;
        bool active;
        uint256 addedAt;
    }

    address public owner;
    mapping(uint256 => Issuer) public issuers;
    uint256[] public issuerHashes;

    event IssuerRegistered(uint256 indexed pubKeyHash, string name);
    event IssuerRevoked(uint256 indexed pubKeyHash);

    error OnlyOwner();
    error AlreadyRegistered();
    error NotRegistered();

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function registerIssuer(uint256 pubKeyHash, string calldata name) external onlyOwner {
        if (issuers[pubKeyHash].addedAt != 0) revert AlreadyRegistered();
        issuers[pubKeyHash] = Issuer(name, true, block.timestamp);
        issuerHashes.push(pubKeyHash);
        emit IssuerRegistered(pubKeyHash, name);
    }

    function revokeIssuer(uint256 pubKeyHash) external onlyOwner {
        if (issuers[pubKeyHash].addedAt == 0) revert NotRegistered();
        issuers[pubKeyHash].active = false;
        emit IssuerRevoked(pubKeyHash);
    }

    function isActiveIssuer(uint256 pubKeyHash) external view returns (bool) {
        return issuers[pubKeyHash].active;
    }

    function getIssuer(uint256 pubKeyHash) external view returns (string memory name, bool active, uint256 addedAt) {
        Issuer memory i = issuers[pubKeyHash];
        return (i.name, i.active, i.addedAt);
    }

    function issuerCount() external view returns (uint256) {
        return issuerHashes.length;
    }
}
