// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  [ownerAddress, buyerAddress] = await ethers.getSigners()

  universalURI = "https://myUniversalURI.com/"
  categories = ["Premium", "Standard", "Economy"]
  amounts = [5, 10, 7]
  prices = [
    ethers.utils.parseUnits('0.05', 'ether'),
    ethers.utils.parseUnits('0.01', 'ether'),
    ethers.utils.parseUnits('0.005', 'ether')
  ]

  const factory = await hre.ethers.getContractFactory("TicketFactory");
  // const TicketGroup = await factory.deploy(
  //   ownerAddress.address, 
  //   universalURI, 
  //   categories, 
  //   amounts, 
  //   prices, { value: ethers.utils.parseUnits("1", "ether") }
  // )

  TicketFactory = await factory.deploy();
  await TicketFactory.deployed()

  console.log("TicketFactory deployed to:", TicketFactory.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
