import React, { useEffect, useState } from 'react';
import { useReadOnlyContract } from '../context/web3';
import rawTicketToJson from "../utils/rawTicketToJson"
import {useWallet} from "../context/web3"
import Button from '@mui/material/Button';
import { ethers } from 'ethers';
import config from '../config/web3-config';
import TicketFactory from "../TicketFactory.json";
import { Container, Grid, Typography, Stack, Box, Card, CardMedia, CardContent, CardActions} from '@mui/material';
import TicketGallery from '../components/TicketGallery';
import { Link } from 'react-router-dom';




export default function Home(props) {
  // const [contract] = useReadOnlyContract();
  const [wallet, setWallet] = useWallet()
  const tickets = [
    {
      title: "Rock and roll baby",
      description: "rock concert",
      image: ""
    },
    {
      title: "Rock and roll baby",
      description: "rock concert",
      image: ""
    },
    {
      title: "Rock and roll baby",
      description: "rock concert",
      image: ""
    },
    {
      title: "Rock and roll baby",
      description: "rock concert",
      image: ""
    },
    {
      title: "Rock and roll baby",
      description: "rock concert",
      image: ""
    },
    {
      title: "Rock and roll baby",
      description: "rock concert",
      image: ""
    }
  ]

  

  async function getTicketGroups() {
    const contract = new ethers.Contract(config.contractAddress, TicketFactory.abi, wallet.signer)
    const tx = await contract.getTicketGroups()
    await tx
    console.log(tx)
  }

  return (<>
  <Box sx={{bgcolor: 'background.paper', pt: 8, pb: 6,}}>
    <Container maxWidth="sm">

      <Typography component="h1" variant="h3" align="center" color="text.primary" gutterBottom>
        Discover, Sell, Buy, and Resell Tickets to your favourite events
      </Typography>

      <Stack sx={{ pt: 4 }} direction="row" spacing={2} justifyContent="center">
        <Button variant="contained"><Link to="create-event">Create an event</Link></Button>
        <Button variant="outlined">Discover</Button>
        <Button variant="outlined">Resell your tickets</Button>
      </Stack>

    </Container>

    <TicketGallery tickets={tickets}/>
  </Box>
  
  
  



  </>)
}