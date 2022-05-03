// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "./ArticleNFTs.sol"; 

import "./IXPoap.sol";

/** MaNFTesto is a erc721 factory that creates "manifesto" NFTs, empty containers
that keep track of a Leaderboard of ArticleNFTs, voted by a token-gated community.
*/


contract MaNFTesto is ERC721, ERC721Burnable, ERC721URIStorage, Ownable { //the playlist can be transferred, sold
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
    
    struct Manifesto { // we need a Manifesto struct for new manifestos
        string name;
        uint256 manifestoID;
        string manifestoMetadata; // might point to a Cover CID or at a ENS where the proposalNFT tokens metadata are listed by token id
        Article[] articles;
        uint256 topScore;
        address memberNFTAddress; //  POAP / gating token contract address of the community
        uint256 memberEventId; // POAPs / gating token event Id of the community
        ERC721 articleNFTAddress; // the Article NFT factory address
        address manifestoDestroyer;
    }

    struct Article {
        address tokenAddress;
        uint tokenId;
        uint score;
    }    

    mapping (uint => Manifesto) public manifestos;    

    modifier hasRepToken(uint manifestoIndex) {
        Manifesto storage m = manifestos[manifestoIndex];

        uint256 balance = ERC721(m.memberNFTAddress).balanceOf(msg.sender);

        uint256 _tokenId = 0;
        for(uint256 i = 0; i < balance && _tokenId == 0; i++) {
            (uint256 tokenId, uint256 eventId) = IXPoap(m.memberNFTAddress).tokenDetailsOfOwnerByIndex(msg.sender, i);

            if(eventId == m.memberEventId) {
                _tokenId = tokenId;
            }
        }

        require(_tokenId != 0, "you need 1 membership NFT at least");
        _;
    }

    modifier onlyDestroyer(uint i) {
        Manifesto storage m = manifestos[i];
        require(msg.sender == m.manifestoDestroyer);
        _;
    }
    
    constructor() ERC721("MaNFTestoFactory", "MNFT") {}

    function safeMint(
        address to,
        string memory _nameOfManifesto, 
        string memory _manifestoMetadata, 
        address _memberNFTAddr, 
        uint256 _eventId,
        ERC721 _articleFactoryAddr, 
        address _destroyer
    ) public {

        uint256 tokenId = _tokenIdCounter.current();        
        manifestos[tokenId].name = _nameOfManifesto;
        manifestos[tokenId].manifestoID = tokenId;
        manifestos[tokenId].manifestoMetadata = _manifestoMetadata;
        manifestos[tokenId].memberNFTAddress = _memberNFTAddr;
        manifestos[tokenId].memberEventId = _eventId;
        manifestos[tokenId].articleNFTAddress = _articleFactoryAddr;
        manifestos[tokenId].manifestoDestroyer = _destroyer;
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);        
    }

    
    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal onlyDestroyer(tokenId) override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    // create a new Article struct out of an articleNFT
    function addArticle(uint256 _manifestoID, ERC721 _NFTcontract, uint256 _tokenId) external hasRepToken(_manifestoID) {
        Manifesto storage m = manifestos[_manifestoID];
        require(m.articleNFTAddress == _NFTcontract, "Invalid NFT contract address"); // make sure the songNFT belongs to the collection we declared
        
        Article memory newArticle;
        newArticle.tokenAddress = address(_NFTcontract);
        newArticle.tokenId = _tokenId;
        newArticle.score = 0;
        m.articles.push(newArticle);
    }

    function upvoteArticle (uint256 _manifestoID, uint256 index) external hasRepToken(_manifestoID) {
        Manifesto storage manifesto = manifestos[_manifestoID];
        Article storage currentArticle = manifesto.articles[index];

        currentArticle.score++;
              
        // keep track of the voter so he/she can discard the vote.
        //manifesto.voters[msg.sender] = index + 1; // 0 means, it's not a voter

        if (currentArticle.score > manifesto.topScore) { // update TopScore if it is the highest
            manifesto.topScore = currentArticle.score;
        }
    }

    function downVote (uint256 _manifestoID, uint256 index) external hasRepToken(_manifestoID) {
        // get the playlist.
        Manifesto storage manifesto = manifestos[_manifestoID];
        // sender should already have voted in this leaderboard    
        //require(manifesto.voters[msg.sender] > 0, "sender should be a voter");
        // reinitialize msg.sender as non-voter and continue.
        // manifesto.voters[msg.sender] = 0;
        // get the article.   
        Article storage currentArticle = manifesto.articles[index];
        currentArticle.score--;
    } 

    function getManifesto(uint _manifestoID) public view returns(Article[] memory) {
        Manifesto storage manifesto = manifestos[_manifestoID];
        return manifesto.articles;
    }
}