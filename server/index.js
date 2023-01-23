const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');
const Web3 = require('web3');
const { recoverPersonalSignature } = require('@metamask/eth-sig-util');

const serviceAccount = require('./service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const app = express();
const port = 4000;

app.use(cors());

const isValidAddress = (address) => Web3.utils.isAddress(address);

const makeId = (length) => {
    let result = '';
    const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const getMessageToSign = async (req, res) => {
    try {
        const { address } = req.query;

        if (!isValidAddress(address))
            return res.send({ error: 'invalid_address' });

        const randomString = makeId(10);
        let messageToSign = `Wallet address: ${address} Nonce: ${randomString}`;

        // Get user data from firestore
        const user = await admin.firestore().collection('users').doc(address).get();
        if (user.data() && user.data().messageToSign) {
            messageToSign = user.data().messageToSign;

        } else {
            admin.firestore().collection('users').doc(address).set(
                { messageToSign },
                { merge: true }
            );

        }

        return res.send({ messageToSign });

    } catch (error) {
        console.log(error);
        return res.send({ error: 'server_error' });
    }
}

const isValidSignature = ({address, signature, messageToSign}) => {
    if (!address || typeof address !== 'string' || !signature || !messageToSign)
        return false;

    const signingAddress = recoverPersonalSignature({
        data: messageToSign,
        signature
    });

    if (!signingAddress || typeof signingAddress !== 'string')
        return false;
    
    return signingAddress.toLocaleLowerCase() === address.toLocaleLowerCase();

}

const getJWT = async (req, res) => {
    try {
        const { address, signature } = req. query;
        if(!isValidAddress(address) || !signature)
            return res.send({ error: 'invalid_parameters' });

        const [customToken, doc] = await Promise.all([
            admin.auth().createCustomToken(address),
            admin.firestore().collection('users').doc(address).get()
        ]);

        if (!doc.exists) return res.send({ error: 'invalid_message_to_sign' });

        const { messageToSign } = doc.data();

        if (!messageToSign) return res.send({ error: "invalid_message_to_sign" });

        const validSignature = isValidSignature({address, signature, messageToSign});

        if (!validSignature) return res.send({ error: 'invalid_signature' });

        // delete messageToSign as it is for one time use only
        admin.firestore().collection('users').doc(address).set(
            { messageToSign: null },
            { merge: true }
        );

        return res.send({ customToken });


    } catch (error) {
        console.log(error);
        return res.send({ error: 'server_error' });
    }
}

app.get('/jwt', getJWT);
app.get('/message', getMessageToSign);
app.get('/', (req, res) => {
    res.send('Hello world');
});

app.listen(port, () => {
    console.log(`App listening in http://0.0.0.0:${port}`);
});
