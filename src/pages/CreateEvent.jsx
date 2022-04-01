import { keyframes } from "@emotion/react";
import axios from "axios";
import { useState } from "react";
import { useWallet } from "../context/web3";
import config from "../config/web3-config";
import TicketFactory from  "../TicketFactory.json"
import { Button, Stack } from "@mui/material";
import { ethers } from "ethers";


export default function CreateEvent(props) {
  const [wallet, setWallet] = useWallet()
  
  const [categories, setCategories] = useState([])
  const [amounts, setAmounts] = useState([])
  const [prices, setPrices] = useState([])
  

  async function createTicketGroup(categories, amounts, prices){
    let universalURI;
    console.log("inside async")
    if (wallet.address === "") return false;
    
    // upload ticket data to ipfs
    const IPFS_URL = `https://api.pinata.cloud/pinning/pinJSONToIPFS`
    const JSONBody = {
      "title": "live concert",
      "location": "krems, Austria",
      "description": "rock and roll, baby"
    }
    const headers = {
      pinata_api_key: "f8f1931c8fca2fd7b69c",
      pinata_secret_api_key: "9da6e535a0b1a6f02177f969c0162b13d715cc7f797e045e1ca1ec5106e868cf"
    }

    try {
      console.log("posting to pinata")
      const response = await axios.post(IPFS_URL, JSONBody, {headers:headers})
      universalURI = `ipfs://${response.IpfsHash}`
      console.log(response)
    
    } catch (error) {
      console.log(error)
    }

    console.log("posting to blockchain")
    const contract = new ethers.Contract(config.contractAddress, TicketFactory.abi, wallet.signer)
    const tx = await contract.createTicketGroup(
      wallet.address, 
      universalURI, 
      categories, 
      amounts, 
      prices, 
      { value: ethers.utils.parseUnits("1", "ether") }
    )
  
  
    console.log(tx)
    return true
  
  }

  function testRun() {
    console.log("Creating Ticket Group")
    const categories = ["Premium", "Standard", "Economy"]
    const amounts = [5, 10, 7]
    const prices = [
      ethers.utils.parseUnits('0.05', 'ether'),
      ethers.utils.parseUnits('0.01', 'ether'),
      ethers.utils.parseUnits('0.005', 'ether')
    ]
    createTicketGroup(categories, amounts ,prices)
  }

  return (<>
    <Stack>
      <Button onClick={testRun}>Create Ticket Group</Button>
    </Stack>
  </>)
}


