import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "HSK");

  // 1. Deploy Groth16Verifier
  const Verifier = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddr = await verifier.getAddress();
  console.log("Groth16Verifier deployed:", verifierAddr);

  // 2. Deploy IssuerRegistry
  const Registry = await ethers.getContractFactory("IssuerRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log("IssuerRegistry deployed:", registryAddr);

  // 3. Deploy ZKToken (mints total supply to deployer)
  const totalSupply = ethers.parseEther("1000000"); // 1M ZKPT
  const Token = await ethers.getContractFactory("ZKToken");
  const token = await Token.deploy(totalSupply);
  await token.waitForDeployment();
  const tokenAddr = await token.getAddress();
  console.log("ZKToken deployed:", tokenAddr);

  // 4. Deploy ZKAirdrop
  const claimAmount = ethers.parseEther("100"); // 100 ZKPT per claim
  const Airdrop = await ethers.getContractFactory("ZKAirdrop");
  const airdrop = await Airdrop.deploy(verifierAddr, registryAddr, tokenAddr, claimAmount);
  await airdrop.waitForDeployment();
  const airdropAddr = await airdrop.getAddress();
  console.log("ZKAirdrop deployed:", airdropAddr);

  // 5. Transfer tokens to airdrop contract
  const transferTx = await token.transfer(airdropAddr, totalSupply);
  await transferTx.wait();
  console.log("Transferred", ethers.formatEther(totalSupply), "ZKPT to airdrop contract");

  // 6. Register the dev issuer
  const issuerPubKeyHash = "8093821485214269328389004542394237209037452657522929891144731833981969398000";
  const regTx = await registry.registerIssuer(issuerPubKeyHash, "ZKPass Dev Issuer");
  await regTx.wait();
  console.log("Issuer registered:", issuerPubKeyHash);

  // 7. Read externalNullifier from the airdrop contract
  const extNull = await airdrop.externalNullifier();
  console.log("External nullifier:", extNull.toString());

  console.log("\n--- Deployment Summary ---");
  console.log("Verifier:", verifierAddr);
  console.log("Registry:", registryAddr);
  console.log("Token:", tokenAddr);
  console.log("Airdrop:", airdropAddr);
  console.log("Claim amount: 100 ZKPT");
  console.log("External Nullifier:", extNull.toString());
  console.log("Network:", (await ethers.provider.getNetwork()).name, "Chain ID:", (await ethers.provider.getNetwork()).chainId.toString());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
