import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "HSK");

  // Deploy Groth16Verifier
  const Verifier = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddr = await verifier.getAddress();
  console.log("Groth16Verifier deployed:", verifierAddr);

  // Deploy ZKGatedPool
  const Pool = await ethers.getContractFactory("ZKGatedPool");
  const pool = await Pool.deploy(verifierAddr);
  await pool.waitForDeployment();
  const poolAddr = await pool.getAddress();
  console.log("ZKGatedPool deployed:", poolAddr);

  console.log("\n--- Deployment Summary ---");
  console.log("Verifier:", verifierAddr);
  console.log("Pool:", poolAddr);
  console.log("Network:", (await ethers.provider.getNetwork()).name, "Chain ID:", (await ethers.provider.getNetwork()).chainId.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
