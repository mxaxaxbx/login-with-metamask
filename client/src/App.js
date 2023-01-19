import { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signOut } from 'firebase/auth';
import Web3 from 'web3';
import axios from 'axios';

import "./App.css";
import ConnectWalletButton from './components/connect-wallet-button';
import mobileCheck from './helpers/mobile-check';

