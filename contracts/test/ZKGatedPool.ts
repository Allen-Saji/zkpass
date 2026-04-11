import { expect } from "chai";
import { ethers } from "hardhat";
import { readFileSync } from "fs";
import { resolve } from "path";

describe("ZKGatedPool", function () {
  async function deployFixture() {
    const [owner, user] = await ethers.getSigners();

    const Verifier = await ethers.getContractFactory("Groth16Verifier");
    const verifier = await Verifier.deploy();

    const Pool = await ethers.getContractFactory("ZKGatedPool");
    const pool = await Pool.deploy(await verifier.getAddress());

    // Load proof and public signals from circuit build
    const buildDir = resolve(__dirname, "../../circuits/build");
    const proof = JSON.parse(readFileSync(resolve(buildDir, "proof.json"), "utf8"));
    const publicSignals = JSON.parse(readFileSync(resolve(buildDir, "public.json"), "utf8"));

    // Format for Solidity: snarkjs outputs string arrays
    const a: [bigint, bigint] = [BigInt(proof.pi_a[0]), BigInt(proof.pi_a[1])];
    const b: [[bigint, bigint], [bigint, bigint]] = [
      [BigInt(proof.pi_b[0][1]), BigInt(proof.pi_b[0][0])],
      [BigInt(proof.pi_b[1][1]), BigInt(proof.pi_b[1][0])],
    ];
    const c: [bigint, bigint] = [BigInt(proof.pi_c[0]), BigInt(proof.pi_c[1])];
    const signals: [bigint, bigint, bigint, bigint, bigint] = [
      BigInt(publicSignals[0]),
      BigInt(publicSignals[1]),
      BigInt(publicSignals[2]),
      BigInt(publicSignals[3]),
      BigInt(publicSignals[4]),
    ];

    return { pool, verifier, owner, user, a, b, c, signals };
  }

  it("should accept valid proof and deposit", async function () {
    const { pool, user, a, b, c, signals } = await deployFixture();

    await expect(
      pool.connect(user).deposit(a, b, c, signals, { value: ethers.parseEther("0.01") })
    ).to.emit(pool, "ProofVerified").and.to.emit(pool, "Deposited");

    expect(await pool.isVerified(user.address)).to.be.true;
    expect(await pool.poolBalance()).to.equal(ethers.parseEther("0.01"));
  });

  it("should reject invalid proof", async function () {
    const { pool, user, a, b, c, signals } = await deployFixture();

    // Corrupt the proof
    const badA: [bigint, bigint] = [a[0] + 1n, a[1]];

    await expect(
      pool.connect(user).deposit(badA, b, c, signals)
    ).to.be.revertedWithCustomError(pool, "InvalidProof");
  });

  it("should report unverified for unknown address", async function () {
    const { pool, owner } = await deployFixture();
    expect(await pool.isVerified(owner.address)).to.be.false;
  });
});
