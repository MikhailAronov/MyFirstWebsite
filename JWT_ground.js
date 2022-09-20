const crypto = require('crypto');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');

// Okay, this file is ground for writing JWT, just for not irritating my eyes with all stuff from index

/*
So, structure of the JWT(JSON Web Token) looks like this:
{header}.{payload}.{signature}

header contains type of token and method for token encryption
payload - user data
signature - for validation

In payload I will put only uuid of user 
*/

/* I will place "manual" method of token creation by crypto lib in this comment:
let tokenHeader = Buffer.from(JSON.stringify({
    alg : 'HS256',
    typ: 'JWT'
})).toString('base64url');
let tokenPayload = Buffer.from(JSON.stringify({
    ID : uniq_id
})).toString('base64url');
let signature = crypto
.createHmac('sha256', secret)
.update(`${tokenHeader}.${tokenPayload}`)
.digest('base64url');
console.log('Token made by crypto mod: ', `${tokenHeader}.${tokenPayload}.${signature}`);
*/
// signature made by crypto is wrong on jwt.io. Maybe there is such problem because my secret(tokensign) already 256 bits long and update with token header and token payload 
// somehow disturb it
//
// Yeah, i dealt with it, problem was in header. I wrote sha256 instead hs256

async function accessTokenAsync (uniq_id, access_secret) {
    console.log('uniq_id: ', uniq_id);
    let accessToken = jwt.sign({ID : uniq_id}, access_secret);
    console.log('Access secret ket: ', access_secret.toString('base64url'));
    console.log('Access token made by JWT module: ', accessToken);
    console.log('accessToken (jwt.sign) type of: ', typeof accessToken);
    return 'Bearer ' + accessToken;
}

async function refreshTokenAsync (refresh_secret) {
    let refreshToken = jwt.sign({hm : 'skibidi vapa dub'}, refresh_secret);
    console.log('Refresh secret ket: ', refresh_secret.toString('base64url'));
    console.log('Refresh token made by JWT module: ', refreshToken);
    console.log('refreshToken (jwt.sign) type of: ', typeof refreshToken);
    return 'Bearer ' + refreshToken;
}

async function tokenValidation(token, access_secret) {
    try{
        token = token.split(' ')[1];
        let payload = jwt.verify(token, access_secret);
        console.log('cookieID from token: ', payload.ID);
        return true;
        
    } catch(err) {
        console.log('token invalid or error');
        return false;
    }
}

async function newAccessTokenByRefresh(accessToken, refreshToken, access_secret, refresh_secret) {
    try {
        accessToken = accessToken.split(' ')[1];
        refreshToken = refreshToken.split(' ')[1];
        jwt.verify(refreshToken, refresh_secret);
        let payload = jwt.verify(accessToken, access_secret, { ignoreExpiration : true });
        let newAccessToken = await accessTokenAsync(payload.ID, access_secret);
        let new_refresh_secret = crypto.randomBytes(32);
        let newRefreshToken = await refreshTokenAsync (refresh_secret);
        let newTokensAndRefreshSecret = {
            newAccessToken     : 'Bearer ' + newAccessToken,
            newRefreshToken    : 'Bearer ' + newRefreshToken,
            new_refresh_secret : new_refresh_secret.toString('base64url')
        }
        return newTokensAndRefreshSecret;

    } catch(err) {
        throw err;
    }
}

async function mainTokenStuff() {
    let access_secret = crypto.randomBytes(32);
    let refresh_secret = crypto.randomBytes(32);
    let uniq_id = uuid.v4();
    // Creating new refresh and access token. Registration situation
    let accessToken = await accessTokenAsync(uniq_id, access_secret);
    let refreshToken = await refreshTokenAsync(refresh_secret);
    console.log('AccessToken: ', accessToken);
    //console.log(JSON.stringify(accessToken.split(' ')[1].split('.')[1].toString('ascii')).ID);
    // Access token validation
    tokenValidation(accessToken, access_secret);
    // Making new access token by refresh token and new refresh token with new secret and rewriting tokens
    let newTokensAndNewRefreshSecret = await newAccessTokenByRefresh(accessToken, refreshToken, access_secret, refresh_secret)
    console.log('Result of the function \'newAccessTokenByRefresh\': ', newTokensAndNewRefreshSecret);
    refresh_secret = newTokensAndNewRefreshSecret.new_refresh_secret;
    accessToken = newTokensAndNewRefreshSecret.newAccessToken;
    refreshToken = newTokensAndNewRefreshSecret.newRefreshToken;
}

/* 
Now let's write class responsible for all jwt operations
*/

class JWT_Manager {
    write_to_db;
    constructor(write_to_db) {
        this.write_to_db = write_to_db;
    }

    async accessTokenAsync (uniq_id, access_secret) {
        console.log('uniq_id: ', uniq_id);
        let accessToken = jwt.sign({ID : uniq_id}, access_secret);
        console.log('Access secret ket: ', access_secret.toString('base64url'));
        console.log('Access token made by JWT module: ', accessToken);
        console.log('accessToken (jwt.sign) type of: ', typeof accessToken);
        return 'Bearer ' + accessToken;
    }
    
    async refreshTokenAsync (refresh_secret) {
        let refreshToken = jwt.sign({hm : 'skibidi vapa dub'}, refresh_secret);
        console.log('Refresh secret ket: ', refresh_secret.toString('base64url'));
        console.log('Refresh token made by JWT module: ', refreshToken);
        console.log('refreshToken (jwt.sign) type of: ', typeof refreshToken);
        return 'Bearer ' + refreshToken;
    }

    async tokenValidation(token, access_secret) {
        try{
            token = token.split(' ')[1];
            let payload = jwt.verify(token, access_secret);
            return true;
            
        } catch(err) {
            console.log('token invalid or error');
            return false;
        }
    }
    
    async newAccessTokenByRefresh(accessToken, refreshToken, access_secret, refresh_secret) {
        try {
            accessToken = accessToken.split(' ')[1];
            refreshToken = refreshToken.split(' ')[1];
            jwt.verify(refreshToken, refresh_secret);
            let payload = jwt.verify(accessToken, access_secret, { ignoreExpiration : true });
            let newAccessToken = await accessTokenAsync(payload.ID, access_secret);
            let new_refresh_secret = crypto.randomBytes(32);
            let newRefreshToken = await refreshTokenAsync (refresh_secret);
            let newTokensAndRefreshSecret = {
                newAccessToken     : 'Bearer ' + newAccessToken,
                newRefreshToken    : 'Bearer ' + newRefreshToken,
                new_refresh_secret : new_refresh_secret.toString('base64url')
            }
            return newTokensAndRefreshSecret;
    
        } catch(err) {
            console.log('Hacker, please, go touch the grass outside');
            throw err;
        }
    }
}

mainTokenStuff();




