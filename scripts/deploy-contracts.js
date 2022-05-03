// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");
const fs = require("fs/promises");

const POAP_CURR_IMPL_ADDR = "0xa178b166bea52449d56895231bb1194f20c2f102";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // const [to] = await ethers.getSigners();

  // console.log(to.address);

  // return;

  const _ArticleNFTname = "SpaghettETH2022";
  const _ArticleNFTticker = "SPGA";
  const _membershipTokenAddr = "0x22C1f6050E56d2876009903609a2cC3fEf83B415";
  const _membershipEventID = 41150;
  const _Destroyer = "0xc3f6e18b429b6baf1bd31b1e504aee7827c7aab5";

  const ArticleNFTs = await hre.ethers.getContractFactory("ArticleNFTs");
  // const articleNFTs = await ArticleNFTs.attach(
  //   "0xF1B18608F814CDA7Cac8d9270226019FeD7a5DCF"
  // );
  const articleNFTs = await ArticleNFTs.deploy(
    _ArticleNFTname,
    _ArticleNFTticker,
    _membershipTokenAddr,
    _membershipEventID,
    _Destroyer
  );

  console.log("articleNFTs deployed to:", articleNFTs.address);

  const metadataUrl = "QmSjnCUZEV2k5SizYhtQUyFDHEkBqaqwrcS85bomcbmpcg";
  const [to] = await ethers.getSigners();

  const mintarticleTx = await articleNFTs.mintArticle(to.address, metadataUrl);

  await mintarticleTx.wait();

  console.log("Article minted!");

  // We get the contract to deploy
  const ManNFTesto = await hre.ethers.getContractFactory("MaNFTesto");
  const manNFTesto = await ManNFTesto.deploy();

  await manNFTesto.deployed();

  console.log("manNFTesto deployed to:", manNFTesto.address);

  const ethTurinMultisigAddr = "0xDcB65474Ac3CC31226929c1795A7CB641668b82b";
  const manftestoName = "SpaghettETH2022";
  const manfestoMetadata = "QmSwH5VPBN5JZLRcKwZevMhvQwYnFDNxrwe23Q1sNxVZDo";

  const safeMintTx = await manNFTesto.safeMint(
    ethTurinMultisigAddr,
    manftestoName,
    manfestoMetadata,
    _membershipTokenAddr,
    _membershipEventID,
    articleNFTs.address,
    _Destroyer
  );

  await safeMintTx.wait();

  const addarticleTx = await manNFTesto.addArticle(0, articleNFTs.address, 0);

  await addarticleTx.wait();

  await fs.writeFile(
    "contractsAddresses.js",
    `
    export const articletokenAddress = '${articleNFTs.address}'
    export const manftestotokenAddress = '${manNFTesto.address}'
  `
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
