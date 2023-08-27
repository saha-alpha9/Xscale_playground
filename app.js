require('dotenv').config();

const session = require('express-session');
const request = require('request');
const axios = require('axios');
const express = require('express');


const app = express();
const port = 3000;

app.use(session({
    secret: 'my_secret',
    resave: false,
    saveUninitialized: true
}))

// Set up express routes
app.get('/', (req,res)=>{
    res.send("Hello Everyone!")
});

app.get('/login', (req, res) => {
    const codeUrl = 'https://accounts.zoho.com/oauth/v2/auth';

    const queryParams = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.CLIENT_ID,
        scope: 'ZohoCRM.users.ALL',
        access_type: 'offline',
        redirect_uri: process.env.REDIRECT_URI,
    })

    const authUrl = `${codeUrl}?${queryParams}`

    res.redirect(authUrl)
})

app.get('/callback', async (req, res) => {
    const tokenEndPoint = 'http://accounts.zoho.com/oauth/v2/token'
    const { code } = req.query;

    const reqBody = {
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        redirect_uri: process.env.REDIRECT_URI
    }

    const option = {
        method: 'POST',
        uri: tokenEndPoint,
        form: reqBody,
        json: true
    }

    try {

        const response = await request(option);
        req.session.accessToken = response.access_token;
        req.session.refreshToken = response.refresh_token;

        res.redirect('/user');
    } catch(err) {
        // console.log(error);
        res.status(500).send('Error retriving access token');
    }
});

app.get('/user', async(req,res)=>{
    const userEndPoint = 'http://accounts.zoho.com/oauth/v2/userInfo';

    const options = {
        headers: {
            Authorization: `Bearer ${req.session.accessToken}`
        },
        json: true        
    }

    try{
        const response = await request.get(userEndpoint, options);
        res.send(response);
    } catch(err) {
        res.send('Error retrieving user info');
    }
});

// Start the Express server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});