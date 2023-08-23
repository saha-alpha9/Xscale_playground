const axios = require('axios');
const http = require('http');

const port = 3000;

// Client-specific parameters
const clientId = 'clientId';
const clientSecret = 'clientSecret';
const redirectUri = 'http://localhost:3000/callback';

// Step 1: Code Retrieval
async function retrieveCode() {
    const codeUrl = `https://accounts.zoho.com/oauth/v2/auth?scope=ZohoCampaigns.campaign.ALL&client_id=${clientId}&response_type=code&access_type=offline&redirect_uri=${redirectUri}`;
    const response = await axios.get(codeUrl);
    const redirectedUrl = response.request.res.responseUrl;
    // const { code } = redirectedUrl.query;
    const code = redirectedUrl.split('?code=')[1].split(location)[0];
    return code;
}

// Step 2: Access Token Retrieval
async function getAccessTokens(code) {
    const accessTokenUrl = 'https://accounts.zoho.in/oauth/v2/token';
    const data = {
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        redirected_uri: redirectUri,
        code: code,
    };
    const response = await axios.post(accessTokenUrl, data);
    const accessTokenInfo = response.data;
    const accessToken = accessTokenInfo.access_token;
    const refreshToken = accessTokenInfo.refresh_token;
    return { accessToken, refreshToken };
}

// Step 3: Refreshing Access Tokens
async function refreshAccessToken(refreshToken) {
    const refreshUrl = `https://accounts.zoho.in/oauth/v2/token?refresh_token=${refreshToken}&client_id=${client_id}&client_secret=${client_secret}&grant_type=refresh_token`;
    const response = await axios.post(refreshUrl, data);
    const newAccessTokenInfo = response.data;
    const newAccessToken = newAccessTokenInfo.access_token;
    return newAccessToken;
}

// Step 4: Data Access Using Access Token
async function accessData(newAccessToken) {
    const dataUrl = 'https://accounts.zoho.in/oauth/v2/token?data';
    const headers = {
        Authorization: `Bearer ${newAccessToken}`
    };
    const response = await axios.get(dataUrl, { headers });
    const data = response.data;
    return data;
}

// Create an http server
const server = http.createServer(async(req,res)=>{
    if(req.url === '/callback') {
        try {
            // Step 1: Code Retrieval
            const code = await retrieveCode();

            // Step 2: Access Token Retrieval
            const { accessToken, refreshToken } = await getAccessTokens(code);

            // Step 3: Refreshing Access Token
            const { newAccessToken } = await refreshAccessToken(refreshToken);
            
            // Step 3: Data Access Using Access Token
            const data = await accessData(newAccessToken);

            // Display data in the browser response
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`Accessed Data: ${JSON.stringify(data)}<br>New Access Token: ${newAccessToken}`);
        } catch(error) {
            res.writeHead(500, { 'Content-Type': 'text/html' });
            res.end('Error occurred. Please check the server logs.');
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('Page not found.');
    }
});

server.listen(port,() =>{
    console.log(`Server running on port ${port}`);
});
