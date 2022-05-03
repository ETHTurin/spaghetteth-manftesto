// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./IXPoap.sol";

contract ArticleNFTs is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    address memberNFTAddress; //  POAP / gating token contract address of the community
    uint256 memberEventId; //  POAPs / gating token event Id of the community
    address public articleDestroyer;

    modifier isMember {
        uint256 balance = ERC721(memberNFTAddress).balanceOf(msg.sender);

        uint256 _tokenId = 0;
        for(uint256 i = 0; i < balance && _tokenId == 0; i++) {
            (uint256 tokenId, uint256 eventId) = IXPoap(memberNFTAddress).tokenDetailsOfOwnerByIndex(msg.sender, i);

            if(eventId == memberEventId) {
                _tokenId = tokenId;
            }
        }

        require(_tokenId != 0, "you need 1 membership NFT at least");
        _;
    }

    constructor(string memory _ArticleNFTname, string memory _ArticleNFTticker, address _membershipTokenAddr, uint256 _membershipEventID, address _Destroyer) ERC721(_ArticleNFTname, _ArticleNFTticker) {
        memberNFTAddress = _membershipTokenAddr;
        memberEventId = _membershipEventID;
        articleDestroyer = _Destroyer;
    }

    function _baseURI() internal pure override returns (string memory) {
        return "";
    }

    function mintArticle(address to, string memory metadataUrl) public isMember {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataUrl);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
}