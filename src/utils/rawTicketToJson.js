import { ethers } from "ethers"
export default async function rawTicketToJson(data, contractInstance) {
  const tokenUri = await contractInstance.tokenURI(data.tokenId)
  const ticket = {
    tokenId: data.tokenId.toString(),
    owner: data.owner,
    price: ethers.utils.formatEther(data.price).toString(), 
    onSale: data.onSale,
    category: data.category,
    tokenUri
  }
  return ticket
}