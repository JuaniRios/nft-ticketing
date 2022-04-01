// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/proxy/Clones.sol";

import "hardhat/console.sol";

import "./TicketGroup.sol";

contract TicketFactory is Ownable{
  address immutable ticketGroupImplementation;
  mapping (uint256 => address) idToTicketGroup;
  uint256 lastId;

  constructor() {
    ticketGroupImplementation = address(new TicketGroup());
    lastId = 0;
  }

  function sendBalanceToOwner() external{
    payable(owner()).transfer(address(this).balance);
  }

  function getOwner() external view returns(address) {
    return owner();
  } 

  event TicketGroupCreated(uint256 id, address indexed creator);

  function createTicketGroup(
    address payable _ticketGroupOwner,
    string memory _universalURI, 
    string[] memory _categories, 
    uint256[] memory _amounts, 
    uint256[] memory _pricing
  ) external payable {
    address clone = Clones.clone(ticketGroupImplementation);
    TicketGroup(clone).initialize
      {value:msg.value}
      (_ticketGroupOwner, payable(address(this)), _universalURI, _categories, _amounts, _pricing);
    idToTicketGroup[lastId] = clone;
    emit TicketGroupCreated(lastId, _ticketGroupOwner);
    lastId++;
  }

  function getTicketGroup(uint256 _id) external view  returns (address) {
    return idToTicketGroup[_id];
  }

  function getTicketGroups() external view returns(address[] memory) {
    address[] memory ticketGroups = new address[](lastId);
    for (uint256 i=0;i<lastId;i++) {
      ticketGroups[i] = idToTicketGroup[i];
    }
    return ticketGroups;
  }

  event Received(address, uint);
  receive() external payable {
    emit Received(msg.sender, msg.value);
  }

}