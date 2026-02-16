const hre = require("hardhat");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");

/**
 * SafeLayerRegistry Deployment Script
 * Deploys the SafeLayerRegistry contract to BNB Testnet/Mainnet
 */

async function main() {
  console.log(chalk.blue("\n========== SafeLayerRegistry Deployment ==========\n"));

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log(chalk.green("Deployer account:"), deployer.address);

  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log(chalk.green("Network:"), network.name);
  console.log(chalk.green("Chain ID:"), network.chainId);

  // Get balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(chalk.green("Deployer balance:"), hre.ethers.formatEther(balance), "BNB");

  // Compile contract
  console.log(chalk.blue("\nCompiling contracts..."));
  await hre.run("compile");

  // Deploy SafeLayerRegistry
  console.log(chalk.blue("\nDeploying SafeLayerRegistry..."));
  const SafeLayerRegistry = await hre.ethers.getContractFactory("SafeLayerRegistry");
  const safeLayerRegistry = await SafeLayerRegistry.deploy();
  await safeLayerRegistry.waitForDeployment();

  const contractAddress = await safeLayerRegistry.getAddress();
  console.log(chalk.green("✓ SafeLayerRegistry deployed at:"), contractAddress);

  // Save deployment info
  const deploymentInfo = {
    contractName: "SafeLayerRegistry",
    address: contractAddress,
    deployer: deployer.address,
    network: network.name,
    chainId: network.chainId,
    deploymentTime: new Date().toISOString(),
    txHash: safeLayerRegistry.deploymentTransaction()?.hash || "N/A",
    blockNumber: (await hre.ethers.provider.getBlockNumber()),
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const filename = `SafeLayerRegistry_${network.name}_${Date.now()}.json`;
  const filepath = path.join(deploymentsDir, filename);
  fs.writeFileSync(filepath, JSON.stringify(deploymentInfo, null, 2));
  console.log(chalk.green("✓ Deployment info saved to:"), filepath);

  // Log deployment summary
  console.log(chalk.blue("\n========== Deployment Summary =========="));
  console.log(chalk.yellow("Contract Address:"), contractAddress);
  console.log(chalk.yellow("Deployer:"), deployer.address);
  console.log(chalk.yellow("Network:"), network.name);
  console.log(chalk.yellow("Chain ID:"), network.chainId);
  console.log(chalk.yellow("Transaction Hash:"), safeLayerRegistry.deploymentTransaction()?.hash);

  console.log(chalk.blue("\n========== Next Steps =========="));
  console.log("1. Wait 30-60 seconds for blockchain finality");
  console.log("2. Verify contract on BscScan:");
  console.log(`   npm run verify:${network.name}`);
  console.log("3. Update your backend environment variables:");
  console.log(`   REGISTRY_ADDRESS=${contractAddress}`);
  console.log(`   REGISTRY_NETWORK=${network.name}`);

  // Print BscScan links
  if (network.chainId === 97) {
    console.log(chalk.blue("\n========== BscScan Links =========="));
    console.log("Contract:", `https://testnet.bscscan.com/address/${contractAddress}#code`);
  } else if (network.chainId === 56) {
    console.log(chalk.blue("\n========== BscScan Links =========="));
    console.log("Contract:", `https://bscscan.com/address/${contractAddress}#code`);
  }

  console.log("\n");
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(chalk.red("Error during deployment:"), error);
    process.exit(1);
  });
