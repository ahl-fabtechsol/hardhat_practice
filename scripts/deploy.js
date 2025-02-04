import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
  const ProductManager = await ethers.getContractFactory("ProductManager");
  const productManager = await ProductManager.deploy();
  await productManager.deployed();

  console.log("ProductManager deployed to:", productManager.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
