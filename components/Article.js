import { ethers } from "ethers";

import {
  articletokenAddress,
  manftestotokenAddress,
} from "../contractsAddresses.js";
import { abi as articletokenAbi } from "../artifacts/contracts/ArticleNFTs.sol/ArticleNFTs.json";
import { abi as manftestotokenAbi } from "../artifacts/contracts/ManNFTesto.sol/MaNFTesto.json";

function Article({ article, onUpvote, onDownvote }) {
  return (
    <div className="border-2 border-green-200 p-4 rounded-lg bg-white">
      <p className="text-lg">{article.content}</p>
      <p className="text-zinc-600">{article.author}</p>
      <div className="flex gap-2 items-center justify-between mt-2 -ml-2">
        <div>
          <button
            onClick={onUpvote}
            className="hover:bg-zinc-100 p-2 rounded-lg uppercase text-sm text-zinc-800"
          >
            Upvote
          </button>
          <button
            onClick={onDownvote}
            className="hover:bg-zinc-100 p-2 rounded-lg uppercase text-sm text-zinc-800"
          >
            Downvote
          </button>
        </div>
        <span className="bg-gradient-to-r from-green-200 to-pink-200 rounded-full px-4 py-2">
          Score: {article.articleInfo.score}
        </span>
      </div>
    </div>
  );
}

export default Article;
