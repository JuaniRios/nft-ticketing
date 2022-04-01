import React, {useState, useEffect} from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Fab from "@mui/material/Fab"
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import {useWallet} from "../context/web3"

export default function ButtonAppBar() {
  const [wallet, setWallet] = useWallet()

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            NFT Ticketing
          </Typography>
          

          {wallet.signer ? wallet.signer === "loading" ?
              <Button color="inherit" variant="contained">Loading...</Button>
              :
              <>
                <Fab variant="extended" sx={{mr: 1}}>
                  <AccountBalanceWalletIcon sx={{ mr: 1 }} />
                  {wallet.address.slice(0,4)}...{wallet.address.slice(38)}
                </Fab>
                <Button color="inherit" variant="contained" onClick={ (e)=>setWallet("logout") }>Disconnect Wallet</Button>
                
              </>
            :
            <Button color="inherit" variant="outlined" onClick={ (e)=>setWallet("login") }>Connect Wallet</Button>
          }

        </Toolbar>
      </AppBar>
    </Box>
  );
}
