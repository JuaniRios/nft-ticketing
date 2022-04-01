// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
// import "@openzeppelin/contracts/proxy/utils/Initializable.sol";
import "hardhat/console.sol";

contract TicketGroup is ERC721URIStorageUpgradeable{
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  Counters.Counter private _itemsSold;

  uint256 constant listingPrice = 1 ether;
  address payable factoryAddress;
  address payable groupOwner;
  string universalURI;

  mapping(uint256 => TicketInfo) private idToTicketInfo;

  struct TicketInfo {
    uint256 tokenId;
    address payable owner;
    uint256 price;
    bool onSale;
    string category;
  }

  event TicketCreated (
    uint256 tokenId
  );

  function initialize(
    address payable _owner,
    address payable _factoryAddress,
    string memory _universalURI, 
    string[] memory _categories, 
    uint256[] memory _amounts, 
    uint256[] memory _pricing
    ) initializer public payable {
    groupOwner = _owner;
    factoryAddress = _factoryAddress;
    universalURI = _universalURI;
    require(msg.value == listingPrice, string(abi.encodePacked("Listing price is ", Strings.toString(listingPrice/10**18), "ETH")));
    _factoryAddress.transfer(msg.value);
    for (uint i = 0; i < _categories.length; i++) {
      createBatchToken(_universalURI, _categories[i], _pricing[i], _amounts[i]);
    }
  }

  function getTicketInfo(uint256 _tokenId) public view returns(TicketInfo memory) {
    TicketInfo memory requestedTicket = idToTicketInfo[_tokenId];
    return requestedTicket;
  }

  // create tickets (only called in constructor) and give them to the person paying for creating them
  function createBatchToken(string memory _universalURI, string memory _category, uint256 _price, uint256 _amount) private {
    for (uint i=0; i<_amount; i++) {
      _tokenIds.increment();
      uint256 newTokenId = _tokenIds.current();
      _mint(groupOwner, newTokenId);
      _setTokenURI(newTokenId, string(abi.encodePacked(_universalURI,_category)));
      createTicket(newTokenId, _price, _category);
    }

  }

  // create internal representation of a ticket from a token id
  function createTicket(uint256 _tokenId, uint256 _price, string memory _category) private {
    idToTicketInfo[_tokenId] =  TicketInfo(
      _tokenId,
      payable(groupOwner),
      _price, 
      true,
      _category
    );
    emit TicketCreated(_tokenId);
  }

  // /* Returns the listing price of the contract */
  // function getListingPrice() public pure returns (uint256) {
  //   return listingPrice;
  // }

  /* allows someone to resell a token they have purchased */
  function setTicketOnSale(uint256 _tokenId, bool _state) public {
    require(idToTicketInfo[_tokenId].owner == msg.sender, "Only ticket owner can perform this operation");
    idToTicketInfo[_tokenId].onSale = _state;
    if (_state) {
      _itemsSold.decrement();
    } else {
      _itemsSold.increment();
    }
    
  }

  /* Creates the sale of a marketplace item */
  /* Transfers ownership of the item, as well as funds between parties */
  function buyTicket(uint256 _tokenId) public payable {
    address payable owner = idToTicketInfo[_tokenId].owner;
    uint256 price = idToTicketInfo[_tokenId].price;

    require(msg.value == price, string(abi.encodePacked("Funds insufficient, please send ", price, " ETH")));
    require(idToTicketInfo[_tokenId].onSale == true, "Ticket not on sale");

    _transfer(owner, msg.sender, _tokenId);
    idToTicketInfo[_tokenId].owner = payable(msg.sender);
    idToTicketInfo[_tokenId].onSale = false;
    _itemsSold.increment();
    payable(owner).transfer(msg.value);
  }

  /* Returns all unsold market items */
  function fetchAvailableTickets() public view returns (TicketInfo[] memory) {
    uint itemCount = _tokenIds.current();
    uint unsoldItemCount = itemCount - _itemsSold.current();

    uint currentIndex = 0;

    TicketInfo[] memory items = new TicketInfo[](unsoldItemCount);
    for (uint i = 1; i < itemCount+1; i++) {

      if (idToTicketInfo[i].onSale == true) {
        uint currentId = i;
        TicketInfo storage ticket = idToTicketInfo[currentId];
        items[currentIndex] = ticket;
        currentIndex += 1;
      }
    }
    return items;
  }

  /* Returns only items that a user has purchased */
  function fetchMyTickets() public view returns (TicketInfo[] memory) {
    uint totalItemCount = _tokenIds.current();
    uint itemCount = 0;
    uint currentIndex = 0;

    for (uint i = 1; i <= totalItemCount; i++) {
      if (idToTicketInfo[i].owner == msg.sender) {
        itemCount += 1;
      }
    }

    TicketInfo[] memory items = new TicketInfo[](itemCount);
    for (uint i = 1; i <= totalItemCount; i++) {
      if (idToTicketInfo[i].owner == msg.sender) {
        // uint currentId = i; see if it breaks
        TicketInfo storage currentItem = idToTicketInfo[i];
        items[currentIndex] = currentItem;
        currentIndex++;
      }
    }
    return items;
  }

}