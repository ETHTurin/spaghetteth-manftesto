// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

interface IXPoap is IERC721 {
    /**
     * @dev Gets the Event Id for the token
     * @param tokenId ( uint256 ) The Token Id you want to query
     * @return ( uint256 ) representing the Event id for the token
     */
    function tokenEvent(uint256 tokenId) external view returns (uint256);

    /**
     * @dev Gets the Token Id and Event Id for a given index of the tokens list of the requested owner
     * @param owner ( address ) Owner address of the token list to be queried
     * @param index ( uint256 ) Index to be accessed of the requested tokens list
     * @return ( uint256 , uint256 ) Token Id and Event Id for the given index of the tokens list owned by the requested address
     */
    function tokenDetailsOfOwnerByIndex(address owner, uint256 index) external view returns (uint256, uint256);
}