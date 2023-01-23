import { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, signOut } from 'firebase/auth';
import Web3 from 'web3';
import axios from 'axios';

import "./App.css";
import ConnectWalletButton from './components/connect-wallet-button';

const firebaseConfig = {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
};


const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const App = () => {
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState('');

    const onPressConnect = async () => {
        setLoading(true);

        try {
            if (window?.ethereum?.isMetaMask) {
                // Desktop Browser
                const accounts = await window.ethereum.request({
                    method: 'eth_requestAccounts'
                });
                
                const account = Web3.utils.toChecksumAddress(accounts[0]);
                await handleLogin(account);

            } else {
                console.log('no metamask');
                window.open(downloadMetamaskUrl);

            }

        } catch (error) {
            console.log(error);
            setAddress('');
        }

        setLoading(false);
    }

    const handleLogin = async (address) => {
        const baseUrl =  'http://localhost:4000';
        const response = await axios.get(`${baseUrl}/message?address=${address}`);
        const messageToSign = response?.data?.messageToSign;
        if (!messageToSign)
            throw new Error('Invalid message to sign');
        
        const web3 = new Web3(Web3.givenProvider);
        const signature = await web3.eth.personal.sign(messageToSign, address);
        const jwtResponse = await axios.get(`${baseUrl}/jwt?address=${address}&signature=${signature}`);
        const customToken = jwtResponse?.data?.customToken;
        if(!customToken)
            throw new Error('Invalid JWT');
        
        await signInWithCustomToken(auth, customToken);
        setAddress(address);
    }

    const onPressLogout = () => {
        setAddress('');
        signOut();
    }

    return (
        <div className='App'>
            <header className='App-header'>
                <ConnectWalletButton
                    onPressConnect={onPressConnect}
                    onPressLogout={onPressLogout}
                    loading={loading}
                    address={address}
                />
            </header>
        </div>
    );

}

export default App;
