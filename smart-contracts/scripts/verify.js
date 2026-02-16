const hre = require("hardhat");
const chalk = require("chalk");
const fs = require("fs");
const path = require("path");

/**
 * SafeLayerRegistry Verification Script
 * Verifies the contract on BscScan
 * 
 * Usage:
 *   node scripts/verify.js testnet
 *   node scripts/verify.js mainnet
 */

async function main() {
  const networkArg = process.argv[2];
  
  if (!networkArg || (networkArg !== "testnet" && networkArg !== "mainnet")) {
    console.error(chalk.red("Usage: node scripts/verify.js <testnet|mainnet>"));
    process.exit(1);
  }

  const networkName = networkArg === "testnet" ? "bnbTestnet" : "bnbMainnet";

  console.log(chalk.blue(`\n========== Verifying SafeLayerRegistry on ${networkArg} ==========\n`));

  // Find the latest deployment file
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  
  if (!fs.existsSync(deploymentsDir)) {
    console.error(chalk.red("No deployments directory found. Deploy the contract first."));
    process.exit(1);
  }

  const files = fs.readdirSync(deploymentsDir)
    .filter(f => f.startsWith("SafeLayerRegistry_") && f.endsWith(".json"))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error(chalk.red("No deployment files found. Deploy the contract first."));
    process.exit(1);
  }

  // Use the most recent deployment for this network
  let contractAddress = null;
  
  for (const file of files) {
    const filepath = path.join(deploymentsDir, file);
    const deploymentInfo = JSON.parse(fs.readFileSync(filepath, "utf-8"));
    
    const expectedNetworkName = networkArg === "testnet" ? "bnbTestnet" : "bnbMainnet";
    if (deploymentInfo.network === expectedNetworkName) {
      contractAddress = deploymentInfo.address;
      console.log(chalk.green("Using deployment file:"), file);
      console.log(chalk.green("Contract address:"), contractAddress);
      break;
    }
  }

  if (!contractAddress) {
    console.error(chalk.red(`No deployment found for ${networkArg}`));
    console.log(chalk.yellow("Deployment files found for:"));
    for (const file of files) {
      const filepath = path.join(deploymentsDir, file);
      const deploymentInfo = JSON.parse(fs.readFileSync(filepath, "utf-8"));
      console.log(`  - ${deploymentInfo.network}: ${file}`);
    }
    process.exit(1);
  }

  try {
    console.log(chalk.blue("\nVerifying contract on BscScan..."));
    
    // Verify on the appropriate network
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [],
      network: networkName,
    });

    console.log(chalk.green("✓ Contract verified successfully!"));
    
    // Print BscScan links
    const explorerUrl = networkArg === "testnet" 
      ? `https://testnet.bscscan.com/address/${contractAddress}#code`
      : `https://bscscan.com/address/${contractAddress}#code`;
    
    console.log(chalk.blue("\n========== Verification Complete =========="));
    console.log("View on BscScan:");
    console.log(explorerUrl);
    
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log(chalk.yellow("✓ Contract is already verified on BscScan"));
      
      const explorerUrl = networkArg === "testnet" 
        ? `https://testnet.bscscan.com/address/${contractAddress}#code`
        : `https://bscscan.com/address/${contractAddress}#code`;
      
      console.log("View on BscScan:");
      console.log(explorerUrl);
    } else {
      console.error(chalk.red("Verification failed:"));
      console.error(error.message);
      console.log(chalk.yellow("\nTroubleshooting:"));
      console.log("1. Make sure BSCSCAN_API_KEY is set in your .env file");
      console.log("2. Wait 30-60 seconds after deployment before verifying");
      console.log("3. Check that the contract compiled correctly");
      process.exit(1);
    }
  }
}

main().catch((error) => {
  console.error(chalk.red("Error:"), error);
  process.exit(1);
});
