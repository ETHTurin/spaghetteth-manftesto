import Head from "next/head";
import Image from "next/image";
import { useState, useEffect } from "react";

import { ethers } from "ethers";

import {
  articletokenAddress,
  manftestotokenAddress,
} from "../contractsAddresses.js";
import { abi as articletokenAbi } from "../artifacts/contracts/ArticleNFTs.sol/ArticleNFTs.json";
import { abi as manftestotokenAbi } from "../artifacts/contracts/ManNFTesto.sol/MaNFTesto.json";
import { web3Modal } from "../web3modal.config";
import Article from "../components/Article";
import Button from "../components/Button";

import IPFSUtils from "../utils/ipfs";

function Home(props) {
  const [articles, setArticles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const manifestoId = 0;

  const [articleText, setArticleText] = useState("");
  const [walletAddr, setWalletAddr] = useState();

  let provider;

  const loadContent = async () => {
    const instance = await web3Modal.connect();

    provider = new ethers.providers.Web3Provider(instance);

    const signer = await provider.getSigner();
    const signerAddr = await signer.getAddress();

    const ensProvider = new ethers.providers.JsonRpcProvider(
      "https://mainnet.infura.io/v3/0b60056fd3f84b6f8830243ac587e717"
    );

    const ensName = await ensProvider.lookupAddress(signerAddr);

    setWalletAddr(ensName ? ensName : signerAddr);

    setIsLoading(true);
    const articleTokenContract = new ethers.Contract(
      articletokenAddress,
      articletokenAbi,
      provider
    );
    const manftestoTokenContract = new ethers.Contract(
      manftestotokenAddress,
      manftestotokenAbi,
      provider
    );

    const articleAPI = await manftestoTokenContract.getManifesto(manifestoId);
    const articleInfo = [];

    let articleIndex = 0;
    for (const article of articleAPI) {
      let uri = await articleTokenContract.tokenURI(article.tokenId);
      const authorAddr = await articleTokenContract.ownerOf(article.tokenId);
      const ensName = await ensProvider.lookupAddress(signerAddr);
      const author = ensName ? ensName : authorAddr;

      const content = await (
        await fetch(`https://ipfs.tapoon.house/ipfs/${uri}`)
      ).json();

      articleInfo.push({
        manifestoId,
        index: articleIndex,
        content: content.name,
        author,
        articleInfo: {
          score: article.score.toNumber(),
          tokenId: article.tokenId.toString(),
          tokenAddress: article.tokenAddress.toString(),
        },
      });

      articleIndex++;
    }

    articleInfo.sort((a, b) => {
      if (a.articleInfo.score > b.articleInfo.score) {
        return -1;
      }

      if (a.articleInfo.score < b.articleInfo.score) {
        return 1;
      }

      return 0;
    });

    setArticles(articleInfo);
    setIsLoading(false);
  };

  useEffect(() => {
    (async () => {
      loadContent();
    })();
  }, []);

  async function connectWallet() {
    const instance = await web3Modal.connect();

    provider = new ethers.providers.Web3Provider(instance);
    const signer = provider.getSigner();
  }

  async function mintArticle() {
    const instance = await web3Modal.connect();
    provider = new ethers.providers.Web3Provider(instance);

    const signer = await provider.getSigner();
    const signerAddress = await signer.getAddress();

    const articleTokenContract = new ethers.Contract(
      articletokenAddress,
      articletokenAbi,
      signer
    );
    const manftestoTokenContract = new ethers.Contract(
      manftestotokenAddress,
      manftestotokenAbi,
      signer
    );

    const cid = await IPFSUtils.upload(
      Buffer.from(JSON.stringify({ name: articleText }), "utf8")
    );

    const mintArticleTx = await articleTokenContract.mintArticle(
      signerAddress,
      cid
    );

    const mintArticleTxRes = await mintArticleTx.wait();

    //this is the array of the give n back values
    let event = mintArticleTxRes.events[0];
    let value = event.args[2];
    let tokenId = value.toNumber();

    const addArticleTx = await manftestoTokenContract.addArticle(
      manifestoId,
      articletokenAddress,
      tokenId
    );

    await addArticleTx.wait();

    alert("Article added!");

    await loadContent();
  }

  async function upvote(articleIndex) {
    const instance = await web3Modal.connect();

    provider = new ethers.providers.Web3Provider(instance);

    const signer = await provider.getSigner();

    const manftestoTokenContract = new ethers.Contract(
      manftestotokenAddress,
      manftestotokenAbi,
      signer
    );

    const upvoteTx = await manftestoTokenContract.upvoteArticle(
      articles[articleIndex].manifestoId,
      articleIndex
    );

    await upvoteTx.wait();

    setArticles((articles) =>
      articles
        .map((article) => {
          if (articleIndex === article.index) {
            return {
              ...article,
              articleInfo: {
                ...article.articleInfo,
                score: article.articleInfo.score + 1,
              },
            };
          }

          return article;
        })
        .sort((a, b) => {
          if (a.articleInfo.score > b.articleInfo.score) {
            return -1;
          }

          if (a.articleInfo.score < b.articleInfo.score) {
            return 1;
          }

          return 0;
        })
    );
  }

  async function downvote(articleIndex) {
    const instance = await web3Modal.connect();

    provider = new ethers.providers.Web3Provider(instance);

    const signer = await provider.getSigner();

    const manftestoTokenContract = new ethers.Contract(
      manftestotokenAddress,
      manftestotokenAbi,
      signer
    );

    const downvoteTx = await manftestoTokenContract.downVote(
      articles[articleIndex].manifestoId,
      articleIndex
    );

    await downvoteTx.wait();

    setArticles((articles) =>
      articles
        .map((article) => {
          if (articleIndex === article.index) {
            return {
              ...article,
              articleInfo: {
                ...article.articleInfo,
                score: article.articleInfo.score - 1,
              },
            };
          }

          return article;
        })
        .sort((a, b) => {
          if (a.articleInfo.score > b.articleInfo.score) {
            return -1;
          }

          if (a.articleInfo.score < b.articleInfo.score) {
            return 1;
          }

          return 0;
        })
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <Head>
        <title>SpaghettETH MaNFTesto</title>
        <meta name="description" content="SpaghettETH MaNFTesto" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <div className="container mx-auto flex justify-between gap-4 sm:justify-end items-center py-2 sm:py-8 px-4 sm:px-0">
          <div className="block sm:hidden">
            <Image
              alt="Spaghett-eth Logo"
              src="https://spaghett-eth.com/images/SpethLogo.png"
              width="64"
              height="64"
            />
          </div>
          {walletAddr ? (
            <p className="truncate sm:overflow-auto">{walletAddr}</p>
          ) : (
            <Button onClick={connectWallet}>Connect wallet</Button>
          )}
        </div>
      </header>

      <main className="flex-1 pt-8 overflow-hidden bg-zinc-100">
        <div className="container mx-auto grid grid-cols-1 sm:grid-cols-2 items-center justify-center h-full px-4 sm:px-0">
          <div className="hidden sm:flex flex-col items-center h-full">
            <Image
              alt="Spaghett-eth Logo"
              src="https://spaghett-eth.com/images/SpethLogo.png"
              width="547"
              height="547"
            />
          </div>
          <div className="flex flex-col gap-2 overflow-y-scroll h-full">
            <div className="bg-white p-2 rounded-lg sticky top-0 shadow-lg">
              <div className="bg-zinc-100 flex flex-col sm:flex gap-2 rounded p-2">
                <textarea
                  className=" min-h-full rounded-lg bg-transparent flex-1"
                  placeholder="Your article here..."
                  value={articleText}
                  onChange={(e) => setArticleText(e.target.value)}
                />
                <div className="sm:self-end">
                  <Button
                    onClick={() =>
                      articleText.trim() !== "" ? mintArticle() : null
                    }
                    disabled={articleText.trim() === ""}
                  >
                    Mint your article
                  </Button>
                </div>
              </div>
            </div>
            {isLoading ? (
              <p>Loading...</p>
            ) : (
              articles.map((article, i) => (
                <Article
                  article={article}
                  onUpvote={() => upvote(article.index)}
                  onDownvote={() => downvote(article.index)}
                  key={i}
                />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Home;
