import React, {useEffect, useState, useReducer} from "react";
import Web3Modal from "web3modal";
import config from "../config/web3-config";
import TicketGroup from "../TicketGroup.json";
import TicketFactory from "../TicketFactory.json";
import { ethers } from "ethers";


const ReadOnlyContractContext = React.createContext();
const WalletContext = React.createContext();

export function Web3Context(props) {
  // context states
  const [readOnlyContract, setReadOnlyContract] = useState();
  const [signer, setSigner] = useState(null)
  const [address, setAddress] = useState("")

  // wallet function states
  const [provider, setProvider] = useState()
  const [connection, setConnection] = useState()

  const web3Modal = new Web3Modal({
    cacheProvider: true,
    providerOptions: {}
  })

  async function connectWallet(action) {
    setSigner("loading")
    try {
      switch (action) {
        case "login":
          const connection = await web3Modal.connect()
          const provider = new ethers.providers.Web3Provider(connection)
          const accounts = await provider.listAccounts()
          const signer = provider.getSigner()
          // if (network != config.network) return "Network Error"
          setProvider(provider)
          setConnection(connection)
          setAddress(accounts[0])
          setSigner(signer)
          return
      
        case "logout":
          console.log("calling logout")
          handleDisconnect()

      }
    } catch (e) {
      console.log(e)
    }
  }

  function handleDisconnect(code, message) {
    console.log("disconnected")
    web3Modal.clearCachedProvider()
    setConnection("")
    setAddress("")
    setSigner("")
    setProvider("")
    return
  }

  function handleAccountsChanged() {
    console.log("accounts changed")
    handleDisconnect()
  }

  function handleChainChanged(){
    console.log("chain changed")
  }

  

  useEffect(()=>{
    async function getReadOnlyContract() {
      const provider = new ethers.providers.JsonRpcProvider(config.rpcProvider)
      const contract = new ethers.Contract(config.contractAddress, TicketFactory.abi, provider)
      setReadOnlyContract(contract)
    }
    getReadOnlyContract().catch(console.error)
  },[])

  useEffect(()=>{
    if (!connection?.on) return
    console.log("on detected on connection")
    connection.on("disconnect", handleDisconnect)
    connection.on("accountsChanged", handleAccountsChanged)
    connection.on("chainChanged", handleChainChanged)

    return () => {
      if (connection.removeListener) {
        connection.removeListener("disconnect", handleDisconnect)
        connection.removeListener("accountsChanged", handleAccountsChanged)
        connection.removeListener("chainChanged", handleChainChanged)
      }
    }
  },[connection])

  return(<>
    <ReadOnlyContractContext.Provider value={readOnlyContract}>
      <WalletContext.Provider value={[{signer: signer, address:address}, connectWallet]}>

        {props.children}
     
      </WalletContext.Provider>
    </ReadOnlyContractContext.Provider>
  </>)
}

export function useReadOnlyContract() {
  const context = React.useContext(ReadOnlyContractContext);
  if (context === undefined) {
    throw new Error("useReadOnlyContractContext must be used within the ContextProvider")
  }
  return context
}

export function useWallet() {
  const context = React.useContext(WalletContext);
  if (context === undefined) {
    throw new Error("WalletContractContext must be used within the ContextProvider")
  }
  return context
}
