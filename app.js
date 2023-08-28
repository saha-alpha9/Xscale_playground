require('dotenv').config();

const session = require('express-session');
const request = require('request');
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser'); // Add the bodyParser middleware
const jwt = require('jsonwebtoken'); // Add the jsonwebtoken library

const app = express();
const port = 3000;

// app.use(session({
//     secret: 'my_secret',
//     resave: false,
//     saveUninitialized: true
// }))
// app.use(bodyParser.urlencoded({ extended: true })); // Use bodyParser middleware


// Set up express routes
app.get('/', (req,res)=>{
    res.send("Hello Everyone!")
});

app.get('/login', (req, res) => {
    const codeUrl = 'https://accounts.zoho.in/oauth/v2/auth';

    const queryParams = new URLSearchParams({
        response_type: 'code',
        client_id: process.env.CLIENT_ID,
        scope: 'ZohoCampaigns.contact.ALL,email,profile',
        access_type: 'offline',
        redirect_uri: process.env.REDIRECT_URI,
    })

    const authUrl = `${codeUrl}?${queryParams}`

    res.redirect(authUrl)
})

app.get('/callback', async (req, res) => {
    const tokenEndPoint = 'https://accounts.zoho.in/oauth/v2/token';
    const { code } = req.query;

    // Construct the request body using URL-encoded format
    const reqBody = new URLSearchParams();
    reqBody.append('grant_type', 'authorization_code');
    reqBody.append('code', code);
    reqBody.append('client_id', process.env.CLIENT_ID);
    reqBody.append('client_secret', process.env.CLIENT_SECRET);
    reqBody.append('redirect_uri', process.env.REDIRECT_URI);

    // Define options for the POST request
    const options = {
        method: 'POST',
        url: tokenEndPoint,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        data: reqBody.toString(), // Convert the request body to a URL-encoded string
    };

    try {
        const response = await axios(options);
        console.log(response.data)
        res.status(200).send(jwt.decode(response.data.id_token))
    } catch (error) {
        res.status(500).send('Error retrieving access token');
    }
});
app.get("/user", (req, res)=>{
    res.status(200).send("hello")
})
// Start the Express server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});