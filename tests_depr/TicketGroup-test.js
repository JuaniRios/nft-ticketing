const { expect } = require("chai");
const { ethers } = require("hardhat");

async function rawTicketToJson(data, contractInstance) {
  const tokenUri = await contractInstance.tokenURI(data.tokenId)
  ticket = {
    tokenId: data.tokenId.toString(),
    owner: data.owner,
    price: ethers.utils.formatEther(data.price).toString(), 
    onSale: data.onSale,
    category: data.category,
    tokenUri
  }
  return ticket
}


describe("TicketGroup", function() {
  let universalURI, categories, amounts, prices;
  let ownerAddress, buyerAddress;
  let factory, TicketGroup;
  let availableTickets;

  before(async function() {
    [ownerAddress, buyerAddress] = await ethers.getSigners()
    // create params for tickets
    universalURI = "https://myUniversalURI.com/"
    categories = ["Premium", "Standard", "Economy"]
    amounts = [5, 10, 7]
    prices = [ethers.utils.parseUnits('0.05', 'ether'),
                    ethers.utils.parseUnits('0.01', 'ether'),
                    ethers.utils.parseUnits('0.005', 'ether')]

    /* deploy the contract and create tickets */
    factory = await ethers.getContractFactory("TicketGroup")
    TicketGroup = await factory.deploy(ownerAddress.address, universalURI, categories, amounts, prices, { value: ethers.utils.parseUnits("1", "ether") })
    await TicketGroup.deployed()

    // get tickets
    availableTickets = await TicketGroup.connect(ownerAddress).fetchAvailableTickets()
    availableTickets = await Promise.all(availableTickets.map(async i => {
      return await rawTicketToJson(i, TicketGroup)
    }))
    // console.log(availableTickets)
  })

  it("Should have created the correct number of tickets", function(){
    expect(availableTickets.length).to.equal(amounts[0] + amounts[1] + amounts[2])
  })

  it("Should let me buy tickets", async  function(){
    //get 3 tickets of each category
    const toBuyIds = ["1","2","3","6","7","8","16","17","18"]
    // buy tickets
    for (const ticket of availableTickets) {
      if (toBuyIds.includes(ticket.tokenId)) {
        await TicketGroup.connect(buyerAddress).buyTicket(ticket.tokenId, { value: ethers.utils.parseUnits(ticket.price, "ether") })
      }
    }

    // check that tickets are no longer for sale
    for (const ticket of availableTickets) {
      ticketData = await TicketGroup.connect(buyerAddress).getTicketInfo(ticket.tokenId)
      ticketJson = await rawTicketToJson(ticketData, TicketGroup)
      if (toBuyIds.includes(ticket.tokenId)) {
        expect(ticketJson.onSale).to.equal(false)
        expect(ticketJson.owner).to.equal(buyerAddress.address)
      } else {
        expect(ticketJson.onSale).to.equal(true)
        expect(ticketJson.owner).to.equal(ownerAddress.address)
      }

    }

  });

  it("Should retrieve my tickets", async function(){
    myTickets = await TicketGroup.connect(buyerAddress).fetchMyTickets()
    myTickets = await Promise.all(myTickets.map(async data => await rawTicketToJson(data, TicketGroup)))
  });

  it("Should let me sell my tickets", async function() {
    myTickets = await TicketGroup.connect(buyerAddress).fetchMyTickets()
    myTickets = await Promise.all(myTickets.map(async data => await rawTicketToJson(data, TicketGroup)))
    soldTickets = []

    // set tucjets ib sake
    for (let i=0;i<3;i++) {
      ticketId = myTickets[i].tokenId
      await TicketGroup.connect(buyerAddress).setTicketOnSale(ticketId, true)
    }
    
    // check that they are on sale on future requests
    for (ticket of myTickets) {
      updatedTicket = await TicketGroup.connect(buyerAddress).getTicketInfo(ticket.tokenId)
      updatedTicket = await rawTicketToJson(updatedTicket, TicketGroup)
      if (["1","2","3"].includes(ticket.tokenId)) {
        expect(updatedTicket.onSale).to.equal(true)
        soldTickets.push(updatedTicket)
      } else {
        expect(updatedTicket.onSale).to.equal(false)
      }
    }

    // buy tickets from another wallet
    for (onSaleTicket of soldTickets) {
      await TicketGroup.connect(ownerAddress).buyTicket(onSaleTicket.tokenId, {value: ethers.utils.parseUnits(onSaleTicket.price, "ether") })
    }

    // check that they are from the new account that bought them
    for (onSaleTicket of soldTickets) {
      boughtTicket = await TicketGroup.connect(ownerAddress).getTicketInfo(onSaleTicket.tokenId)
      boughtTicket = await rawTicketToJson(boughtTicket, TicketGroup)
      expect(boughtTicket.owner).to.equal(ownerAddress.address)
      expect(boughtTicket.onSale).to.equal(false)
    }



  })

  //   /* execute sale of token to another user */
  //   await TicketGroup.connect(buyerAddress).createMarketSale(1, { value: auctionPrice })

  //   /* resell a token */
  //   await TicketGroup.connect(buyerAddress).resellToken(1, auctionPrice, { value: listingPrice })

  //   /* query for and return the unsold items */
  //   items = await TicketGroup.fetchMarketItems()
  //   items = await Promise.all(items.map(async i => {
  //     const tokenUri = await TicketGroup.tokenURI(i.tokenId)
  //     let item = {
  //       price: i.price.toString(),
  //       tokenId: i.tokenId.toString(),
  //       seller: i.seller,
  //       owner: i.owner,
  //       tokenUri
  //     }
  //     return item
  //   }))
  //   console.log('items: ', items)
  // })
  
})

