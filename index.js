const express = require('express');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const uuid = require('uuid');
const util = require('util');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');
const bp = require('body-parser');
const cookie = require('cookie');
const bcrypt = require('bcrypt');
const cors = require('cors');

const jwt_mngr = require('./jwt_mngr.js').JWT_token_manager;
const jwt = new jwt_mngr();

// Express using
const app = express();

app.use(cors());
app.options('*', cors());

//const  {  Mysql_database_manager } = require('./mysql_database_manager.js');
const {PostgreSQL_db_manager} = require('./PostgreSQL_Manager.js');

//const db = new Mysql_database_manager;
const db = new PostgreSQL_db_manager();



const http = require('http').Server(app);
const io = require('socket.io')(http);

// Favicon serve
app.use(favicon(path.join(__dirname, 'resources/images/sword_icon.png')));

//PostgreSQL
db.connectTodb_pool('admin', 'postgresdb', 'chatwebsite', '1111', 5432);
// Create connection to MySQL
//db.connectToDatabase();
/* const db = mysql.createConnection({
    host: '127.0.0.1',
    port: '3306',
    user: 'root',
    password: 'BjV13LcgY%7;u',
    database: 'AnonPF2EChat',
    multipleStatements: true
});
// Conncet to MySQL
db.connect((err) => {
    if(err) throw err;
    console.log('MySQL server connected...');
}); */

// Using cookie-parser
app.use(cookieParser());

// Body-parser settings (USE NEW bp.*content-type* FOR EVERY NEW CONTENT-TYPE OR IT WILL NOT WORK)
app.use(express.json());
app.use(bp.json());
app.use(bp.text());
app.use(bp.urlencoded({ extended: true }));


// Using user router
app.use('/users', require('./users/users_router'));
app.use('/resources/images', require('./resources/images/images_router'));

// Check cookie
/* app.use((req, res, next) => {
    console.log('app.use reached');
    if (req.path == '/regPage.html') {
        console.log('app.use regPage.html reached');
        return next();
    } else if((req.path).match(/^\/[\w]+\.html$/)) {
        console.log('app.use else if reached');
        let userToken = req.cookies.ID;
        if (userToken === undefined) {
            req.url = '/regPage.html';
            req.method = 'GET';
            return next();
        } else {
            return next();
        }
    }
    return next();
});  */

async function authCheck (req, res, next) {
    console.log('f: authCheck req.user : ', req.user);
    if(req.user === undefined) {
        console.log('f:authCheck in if(req.user === undefined) reached');
        //res.status(401).send('You are not authorized!');
        //res.end();
        //return false;
        res.redirect(302, '/regPage.html');
        res.end();
        return false;
    }
    return true;
}

async function useridFromAccessToken(req) {
    let accessToken = req.cookies.Authorization;
    let payload = JSON.parse(Buffer.from(accessToken.split(' ')[1].split('.')[1], 'base64url').toString('utf8'));
    let ID = payload.ID;
    return ID;
}

function shortDate(mesDate) {
    return `${mesDate.getFullYear()}\.${mesDate.getMonth() + 1}\.${mesDate.getUTCDate()}  ${mesDate.getHours()}:${mesDate.getMinutes()}:${mesDate.getSeconds()}:${mesDate.getMilliseconds()}`;
}


app.use(async function(req, res, next) {
    try {
        //token validation
        console.log('app.use-req.cookies.Authorization: ', req.cookies.Authorization);
        if (req.cookies.Authorization) {
            let accessToken = req.cookies.Authorization;
            //console.log('app.use-accessToken: ', accessToken);
            //console.log('app.use-refreshToken: ', refreshToken);
            let payload = JSON.parse(Buffer.from(accessToken.split(' ')[1].split('.')[1], 'base64url').toString('utf8'));
            let keys = await db.readRows('keys', 'accesssecret, refreshsecret', `cookieId =\'${payload.ID}\'`);
            try {
                if(await jwt.tokenValidation(accessToken, keys[0].accesssecret)) {
                    let nickQuery = await db.readRows('profiles','login',`cookieId = \'${payload.ID}\'`);
                    req.user = nickQuery[0].login;
                    console.log('app.use-req.user : ', req.user);
                    return next();
                } else  {
                    console.log('app.use if(accessToken validation = false) now goes to redirect');
                    req.originalurl = req.path;
                    req.originalmethod = req.method;
                    req.url = '/newAccessTokenByRefresh';
                    req.method = 'GET';
                    console.log(req.path);
                    return next();
                    //next();
                }
            } catch {
                req.user = undefined;
                console.log('app.use- try catch block req.user: ', req.user);
                return next();
            }
        } else {
            console.log('app.use auth else(I mean cookie undefined) triggered!');
            req.user = undefined;
            return next();
        }
    } 
    catch {
        res.status(500).send('OOPS! Something went wrong!');
        res.end();
        return next();
    }
});


const privateChatSocket = io.of('/privateChat');
const publicChatSocket = io.of('/publicchat');

const hello = 'Hello, console!';
//app.get('/*', (req,res) =>)

app.get('/newAccessTokenByRefresh', async (req, res, next) => {
    try {
        let accessToken = req.cookies.Authorization;
        let refreshToken = req.cookies.Refresh;
        let payload = JSON.parse(Buffer.from(accessToken.split(' ')[1].split('.')[1], 'base64url').toString('utf8'));
        let keys = await db.readRows('keys', 'accesssecret, refreshsecret', `cookieId =\'${payload.ID}\'`);
        if (await jwt.tokenValidation(refreshToken, keys[0].refreshsecret)) {
            console.log('app.get /newAccessTokenByRefresh Refresh token is valid!');
            let accessSecret = (await jwt.newSecret()).toString('base64url');
            let refreshSecret = (await jwt.newSecret()).toString('base64url');
            let newAccessToken = await jwt.accessTokenAsync(payload.ID, accessSecret, 1800);
            let newRefreshToken = await jwt.refreshTokenAsync(refreshSecret);
            await db.updateRows('keys', '(accesssecret, refreshsecret)', `(\'${accessSecret}\',\'${refreshSecret}\')`, `cookieId =\'${payload.ID}\'`);
            
            res.cookie('Authorization', newAccessToken, {httpOnly: true, SameSite: true, maxAge : 999999999});
            res.cookie('Refresh', newRefreshToken, {httpOnly: true, SameSite: true, maxAge : 999999999});
            let nickQuery = await db.readRows('profiles','login',`cookieId = \'${payload.ID}\'`);
            req.user = nickQuery[0].nickname;
            req.url = req.originalurl;
            req.method = req.originalmethod;
            return next();
        } else {
            console.log('app.get /newAccessTokenByRefresh Refresh token is invalid!');
            req.user = undefined;
            req.url = req.originalurl;
            req.method = req.originalmethod;
            next();
        }
    } 
    catch {
        res.status(500).send('OOPS! Something went wrong! ()');
        res.end();
        return next();
    }
});

app.get('/', (req, res) => {
    if((req.path).match(/^\/$/)) {
        console.log("app.get '/' : (req.path).match(/^\/$/) true");
            if(req.user) {
            res.sendFile(path.join(__dirname, "profilePage.html"));
        } else {
            res.sendFile(path.join(__dirname, 'regPage.html'));
        }
    }
        
}); 
app.get('/homePage.html', async (req, res) => {
    res.sendFile(path.join(__dirname, 'homePage.html'));
    console.log('HomePage visited...');
});

app.get('/regPage.html', (req, res, next) => {
    if(req.user) {
        console.log("app.get '/regPage.html' started and req.user true");
        res.sendFile(path.join(__dirname, "profilePage.html"));
        res.end();
    } else {
        res.sendFile(path.join(__dirname, 'regPage.html'));
        console.log('regPage.html was sent...');
        res.end();
        return next();
    }
    
});

app.get('/privateChatPage.html', async (req, res, next) => {
    if (await authCheck (req, res, next) === false) return next();
    res.sendFile(path.join(__dirname, 'privateChatPage.html'));
    console.log('privateChatPage was sent...');
});
app.get('/profilePageLoader.js', (req, res) => {
    res.sendFile(path.join(__dirname, "profilePageLoader.js"));
});
app.get('/regPageScript.js', (req, res) => {
    res.sendFile(path.join(__dirname, "regPageScript.js"));
});
app.get('/cookieGetter.js', (req, res) => {
    res.sendFile(path.join(__dirname, "cookieGetter.js"));
});
app.get('/chatPageScript.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'chatPageScript.js'));
});
app.get('/privateChatPageScript.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'privateChatPageScript.js'));
});
app.get('/someManagers.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'someManagers.js'));
});
app.get('/socket.io/socket.io.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'node_modules/socket.io/client-dist/socket.io.js'));
});
app.get('/profilePage.html', async (req, res, next) => {
    if (await authCheck (req, res, next) === false) return next();
    console.log('app.get /profilePage.html prodile page was sent...');
    res.sendFile(path.join(__dirname, "profilePage.html"));
});
app.get('/chatPage.html', async (req, res, next) => {
    if (await authCheck (req, res, next) === false) return next();
    res.sendFile(path.join(__dirname, "chatPage.html"));
});
app.get('/stylesheet.css', (req, res) => {
    res.sendFile(path.join(__dirname, "stylesheet.css"));
});
app.get('/resources/images/sword_icon.png', (req, res) => {
    res.sendFile(path.join(__dirname,"resources", "images", "sword_icon.png"));
});
app.get('/demon', (req,res) => {
    res.send('Request getting succesful...');
});
app.get('/friendsList', async (req, res) => {
    let userCookieId = await useridFromAccessToken(req);
    console.log('app.get /friendsList userCookieId : ', userCookieId);
    /* let fullArrayOfFriends = [].concat(...await db.customQuery(`
    BEGIN;
    SELECT sourceId AS id FROM friendship WHERE status= \'active\' AND targetId = \'${userCookieId}\'; 
    SELECT targetId AS id FROM friendship WHERE status= \'active\' AND sourceId = \'${userCookieId}\';
    COMMIT;`)); */
    let fullArrayOfFriends = [].concat(...await db.customQuery(`
    SELECT sourceId AS id FROM friendship WHERE status= \'active\' AND targetId = \'${userCookieId}\'
    UNION
    SELECT targetId AS id FROM friendship WHERE status= \'active\' AND sourceId = \'${userCookieId}\';`));
    
    //await db.queryQuery(`SELECT id FROM (SELECT sourceId AS id FROM friendship JOIN (SELECT targetId AS sourceId FROM friendship WHERE status= \'active\' AND sourceId = \'${userCookieId}\') AS target WHERE status= \'active\' AND targetId = \'${userCookieId}\') AS friends WHERE TRUE;`);
    console.log('fullArrayOfFriends = [].concat(await db.customQuery : ', fullArrayOfFriends);
    let fullSetFriendsIds = new Set;
    for(let k in fullArrayOfFriends) {
        fullSetFriendsIds.add('\'' + fullArrayOfFriends[k].id + '\'');
    }
    let inviteIdsToSql = Array.from(fullSetFriendsIds).join(', ');
    console.log('fullSetOfFriendsIds = ', fullSetFriendsIds);
    if (fullSetFriendsIds.size != 0) {
        res.send(JSON.stringify(await db.readRows('profiles', 'cookieId, login, email', `cookieId IN (${inviteIdsToSql})`)));
    } else {
        console.log('app.get /friendsList Empty list!');
        let emptyList = {};
        res.send(JSON.stringify(emptyList));
    }
});
app.get('/invitesList', async (req, res) => {
    let userCookieId = await useridFromAccessToken(req);
    console.log('app.get /inviteList userCookieId : ', userCookieId);
    let fullArrayOfFriends = [].concat(...await db.readRows('friendship','sourceId AS id',`status= \'new\' AND targetId = \'${userCookieId}\'`));
    let fullSetFriendsIds = new Set;
    for(let k in fullArrayOfFriends) {
        fullSetFriendsIds.add('\'' + fullArrayOfFriends[k].id + '\'');
    }
    let inviteIdsToSql = Array.from(fullSetFriendsIds).join(', ');
    console.log(inviteIdsToSql);
    if (fullSetFriendsIds.size != 0) {
        res.send(JSON.stringify(await db.readRows('profiles', 'login, email', `cookieId IN (${inviteIdsToSql})`)));
    } else {
        console.log('app.get /friendsList Empty list!');
        let emptyList = {};
        res.send(JSON.stringify(emptyList));
    }
});
app.get('/logout', async (req, res) => {
    res.clearCookie("Authorization");
    res.clearCookie("Refresh");
    res.redirect(302, '/regPage.html');
    res.end();
});

app.post('/login', async (req, res) => {
    let userData = await db.readRows('profiles', 'cookieId, password', `(login = \'${req.body.login}\' OR email = \'${req.body.login}\')`);
    console.log('app.post /login STARTED!');
    console.log('app.post /login userData : ', userData);
    if(userData[0] === undefined) {
        res.send('wrong_login');
        res.end();
    } else if(await bcrypt.compare(req.body.password, userData[0].password)) {
        let accessSecret = (await jwt.newSecret()).toString('base64url');
        let refreshSecret = (await jwt.newSecret()).toString('base64url');
        let newAccessToken = await jwt.accessTokenAsync(userData[0].cookieid, accessSecret, 1800);
        let newRefreshToken = await jwt.refreshTokenAsync(refreshSecret);
        
        console.log('app.post /login Authorization token : ', newAccessToken);
        console.log('app.post /login Refresh token : ', newRefreshToken);
        await db.customQuery(`
        BEGIN;
        INSERT INTO keys (cookieId, accesssecret, refreshsecret) VALUES (\'${userData[0].cookieid}\', \'${accessSecret}\',\'${refreshSecret}\')
        ON CONFLICT ON CONSTRAINT uniq_cookieId  DO
        UPDATE SET (accesssecret, refreshsecret) = (\'${accessSecret}\',\'${refreshSecret}\') WHERE keys.cookieId = \'${userData[0].cookieid}\';
        END;
        `);
        res.clearCookie('Authorization');
        res.clearCookie('Refresh');
        res.cookie('Authorization', newAccessToken, {httpOnly: true, SameSite: true, maxAge : 999999999});
        res.cookie('Refresh', newRefreshToken, {httpOnly: true, SameSite: true, maxAge : 999999999});
        res.redirect(302, '/profilePage.html');
        res.end();
    } else {
        console.log('app.post /login sending \"wrong_password\"');
        res.send('wrong_password');
        res.end();
    };
});

app.post('/uploadCorrespond', async (req, res) => {
    console.log(await db.customQuery(`SELECT profiles.login, publicchat.creator, publicchat.id AS id, publicchat.message, publicchat.createdAt FROM publicchat LEFT JOIN profiles ON publicchat.creator = profiles.cookieId;`));
    res.send(JSON.stringify(await db.customQuery(`SELECT profiles.login, publicchat.creator, publicchat.id AS id, publicchat.message, publicchat.createdAt FROM publicchat LEFT JOIN profiles ON publicchat.creator = profiles.cookieId;`)));

});
app.post('/uploadFriendCorrespond', async (req, res) => {
    console.log('app POST /uploadFriendCorrespond invoked!');
    let cookieId = await useridFromAccessToken(req);
    console.log(await db.customQuery(`
    SELECT creatorLogins.clogin AS creator, receiverLogins.rlogin AS receiver, privatechat.id AS id, message, createdAt
    FROM privatechat
    INNER JOIN (SELECT DISTINCT profiles.login AS clogin, privatechat.creator AS cookieId
        FROM profiles
        INNER JOIN privatechat
        ON profiles.cookieId = privatechat.creator) AS creatorLogins
    ON privatechat.creator = creatorLogins.cookieId
    INNER JOIN (SELECT DISTINCT profiles.login AS rlogin, privatechat.receiver AS cookieId
        FROM profiles
        INNER JOIN privatechat
        ON profiles.cookieId = privatechat.receiver) AS receiverLogins
    ON privatechat.receiver = receiverLogins.cookieId
    WHERE (creator = \'${cookieId}\' AND receiver = (SELECT cookieId FROM profiles WHERE login = \'${req.body.login}\')) 
    OR (creator = (SELECT cookieId FROM profiles WHERE login = \'${req.body.login}\') AND receiver = \'${cookieId}\')
    ORDER BY createdAt ASC;`));
    res.send(JSON.stringify(await db.customQuery(`
    SELECT creatorLogins.clogin AS creator, receiverLogins.rlogin AS receiver, privatechat.id AS id, message, createdAt
    FROM privatechat
    INNER JOIN (SELECT DISTINCT profiles.login AS clogin, privatechat.creator AS cookieId
        FROM profiles
        INNER JOIN privatechat
        ON profiles.cookieId = privatechat.creator) AS creatorLogins
    ON privatechat.creator = creatorLogins.cookieId
    INNER JOIN (SELECT DISTINCT profiles.login AS rlogin, privatechat.receiver AS cookieId
        FROM profiles
        INNER JOIN privatechat
        ON profiles.cookieId = privatechat.receiver) AS receiverLogins
    ON privatechat.receiver = receiverLogins.cookieId
    WHERE (creator = \'${cookieId}\' AND receiver = (SELECT cookieId FROM profiles WHERE login = \'${req.body.login}\')) 
    OR (creator = (SELECT cookieId FROM profiles WHERE login = \'${req.body.login}\') AND receiver = \'${cookieId}\')
    ORDER BY createdAt ASC;`)));
    res.end();
});
app.post('/getLoginAndEmailFromCookies', async (req, res) => {
    let cookieId = await useridFromAccessToken(req);
    let userData = await db.readRows('profiles', 'login, email', `cookieId = \'${cookieId}\'`);
    res.send(JSON.stringify(userData[0]));
});
app.post('/chat_sendingMessage', async (req, res) => {
    let cookieId = await useridFromAccessToken(req);
    let mes = req.body;
    let mesDate = new Date();
    res.send(mes);
    res.end();
    let date = shortDate(mesDate);
    await db.createRows('publicchat', '(creator, message, createdAt, updatedAt)', `(\'${cookieId}\', \'${mes}\', \'${date}\', \'${date}\')`);
});
app.post('/getUserDataByCookieID/:ID', async (req, res) => {
    let cookieId = req.params.ID.toString();
    let userData = await db.readRows('profiles', 'login, email, profPicExt', `cookieId = \'${cookieId}\'`);
    //res.send(userData);
    console.log(JSON.stringify(userData));
    res.send(JSON.stringify(userData));
    console.log('Request to getuserdatabyid:id');
    console.log('cookieId value from index.js ' + cookieId);
});
app.post('/uploadUserAvatarImage', async (req, res) => {
    let cookieId = await useridFromAccessToken(req);
    //console.log(cookieId);
    let userData = await db.readRows('profiles', 'login, profPicExt', `cookieId = \'${cookieId}\'`);
    console.log(userData);
    res.sendFile(path.join(__dirname, 'users', `${userData[0].login}`, `${userData[0].login}_profilePic.${userData[0].profpicext}`));
    console.log('Profile\'s avatar image was sent...');
})
app.post('/addNewFriend', async (req, res) => {
    console.log('The request has reached the server (endpoint \"addNewFriend\")');
    let cookieId = await useridFromAccessToken(req);

    let userNickname = await db.readRows('profiles','login, email',`cookieId = \'${cookieId}\'`);
    let profileToAdd = await db.readRows('profiles', 'login, email, cookieId', `login = \'${req.body.profileToAdd}\'`);
    if (profileToAdd[0] === undefined) {
        console.log('Not found login to add condition triggered...');
        let profileNotFound = {
            profileNotFound: 'profileNotFound'
        }
        res.send(JSON.stringify(profileNotFound));
    } else {
        let newFriendObject = {
            login: profileToAdd[0].login,
            email: profileToAdd[0].email,
            fromUser: userNickname
        }
        console.log(JSON.stringify(newFriendObject));
        await db.createRows('friendship', '(sourceId, targetId, status, createdAt, updatedAt)', `(\'${cookieId}\', \'${profileToAdd[0].cookieid}\', 'new', \'${shortDate(new Date())}\', \'${shortDate(new Date())}\')`);
        console.log('New friendship added...');
        res.send(JSON.stringify(newFriendObject));
    }
});
app.post('/regPage.html', (req, res) => {
    let form = new formidable.IncomingForm({
        uploadDir: __dirname + '/uploads',
        keepExtensions : true,
        maxFileSize : 10*1024*1024,
        multiples : true,
    });
    form.parse(req, async (err, fields, files) => {
            if(err) console.error(err);
            let userData = fields;
            const fsmkdir = util.promisify(fs.mkdir);
            const fsrename = util.promisify(fs.rename);
            const fsunlink = util.promisify(fs.unlink);
            const fswriteFile = util.promisify(fs.writeFile);
            const fsappendFile = util.promisify(fs.appendFile);
            async function createUserFolder() {
                    fsmkdir(path.join(__dirname, `/users/${fields.login}`),{ recursive: true }).then(()=>{
                        console.log('User folder created...');
                    });
            }
            
            await createUserFolder();
            async function writingDataToFolders() {
                    userData.profPicExt = files.profilePic.originalFilename.split('.').pop();
                    fswriteFile(path.join(__dirname, `/users/${fields.login}`, `${fields.login}.json`), JSON.stringify(userData)).then(()=>{
                        console.log('JSON user file created...');
                    });
                    fsrename(files.profilePic.filepath, path.join(__dirname, `/users/${fields.login}`, `${fields.login}_profilePic.${files.profilePic.originalFilename.split('.').pop()}`)).then(()=> {
                    fsunlink(path.join(__dirname, `/users/${fields.login}`, `${fields.login}_profilePic.`)).then(()=>{
                        console.log('Pic is done...');
                    }).catch(()=>{
                        return;
                    });
                });
            }  
            async function cookieIdInit() {
                return uuid.v4();
            }
            let cookieId = await cookieIdInit();
            async function writingDataToDatabase(cookieId) {
                let IdChecking = await db.readRows('profiles', 'cookieId', `cookieId=\'${cookieId}\'`);
                if(IdChecking[0] === undefined) {
                    console.log('No such CookieId in database!... CookieId: ', cookieId, ' will be sign!');
                    let hashSalt = await bcrypt.genSalt(10);
                    const profileObjForMysql = {
                        login : '\'' + fields.login + '\'',
                        email : '\'' + fields.email + '\'',
                        password : '\'' + await bcrypt.hash(fields.password, hashSalt) + '\'',
                        cookieId : '\'' + cookieId + '\'',
                        profPicExt : '\'' + files.profilePic.originalFilename.split('.').pop() + '\''
                    }

                    await db.createRows('profiles', `(${Object.keys(profileObjForMysql)})`, `(${Object.values(profileObjForMysql)})`);
                    return;                    
                } else {
                    cookieId = uuid.v4();
                    return writingDataToDatabase(cookieId);
                }
            }
            let accessSecret = (await jwt.newSecret()).toString('base64url');
            let refreshSecret = (await jwt.newSecret()).toString('base64url');
            let newAccessToken = await jwt.accessTokenAsync(cookieId, accessSecret, 1800);
            let newRefreshToken = await jwt.refreshTokenAsync(refreshSecret);
            await db.createRows('keys', '(cookieId, accesssecret, refreshsecret)', `(\'${cookieId}\', \'${accessSecret}\',\'${refreshSecret}\')`);
            
            res.cookie('Authorization', newAccessToken, {httpOnly: true, SameSite: true, maxAge : 999999999});
            res.cookie('Refresh', newRefreshToken, {httpOnly: true, SameSite: true, maxAge : 999999999});

            
            await writingDataToFolders();
            console.log("Data was written to foldres...");
            await writingDataToDatabase(cookieId);
            console.log("Data was written to Database...");
            res.redirect(301, '/profilePage.html');            
    });
});
app.post('/sendFriendMessage', async (req, res) => {
    let cookieId = await useridFromAccessToken(req);
    let date = shortDate(new Date());
    let mesId = await db.customQuery(`
    INSERT INTO privatechat (creator, receiver, message, createdAt, updatedAt) VALUES (\'${cookieId}\', (SELECT cookieId FROM profiles WHERE login = \'${req.body.user.login}\'), \'${req.body.message}\', \'${date}\', \'${date}\') RETURNING id;
    `);
    let creator = await db.customQuery(`SELECT login FROM profiles WHERE cookieId = \'${cookieId}\';`);
    console.log("Creator value: ", creator);
    res.send(JSON.stringify({
        creator   : creator[0].login,
        message   : req.body.message,
        id : mesId[0].id,
        createdat : date 
    }));
    res.end();

});

app.put('/rejectOrAcceptInvite', async (req, res) => {
    let cookieId = await useridFromAccessToken(req);

    //with db manager
    let rawReqTargetIdByLogin = await db.readRows('profiles', 'cookieId', `login=\'${req.body.login}\'`);
    let targetId = rawReqTargetIdByLogin[0].cookieid;
    if(req.body.answer === 'reject') {
        db.deleteRows('friendship', `(sourceId = \'${cookieId}\' AND targetId = \'${targetId}\') OR (sourceId = \'${targetId}\' AND targetId = \'${cookieId}\')`);
        console.log('friendship was deleted...');
        res.end();
    }
    if(req.body.answer === 'accept') {
        db.updateRows('friendship', 'status', '\'active\'', `(sourceId = \'${cookieId}\' AND targetId = \'${targetId}\') OR (sourceId = \'${targetId}\' AND targetId = \'${cookieId}\')`);
        console.log('Friendship was accepted...');
        res.end();
    }

});
app.delete('/deleteFriend', async (req, res) => {
    console.log('app.delete /deteteFriend : req.body.login : ', req.body.login);
    let rawReqTargetIdByLogin = await db.readRows('profiles', 'cookieId', `login=\'${req.body.login}\'`);
    let targetId = rawReqTargetIdByLogin[0].cookieid;
    let cookieId = await useridFromAccessToken(req);
    await db.deleteRows('friendship', `(sourceId = \'${cookieId}\' AND targetId = \'${targetId}\') OR (sourceId = \'${targetId}\' AND targetId = \'${cookieId}\')`);
    console.log('friendship deleted');
    res.end();
});
app.delete("/prvtchtDeleteMessage", async (req, res) => {
    console.log('app.delete /prvtchtDeleteMessage : ', req.body.id);
    db.deleteRows('privatechat', `id = ${req.body.id}`);
});

app.put('/prvtchtRedactMessage', async (req, res) => {
    db.updateRows('privatechat', 'message', `\'${req.body.text}\'`, `id = \'${req.body.id}\'`);
});


let prvtChtConnectedUsers = {};
async function idByAccessTokenForSocket (accessToken) {
    let payload = JSON.parse(Buffer.from(accessToken.split(' ')[1].split('.')[1], 'base64url').toString('utf8'));
    return payload;
}
privateChatSocket.on('connection', async (socket) => {
    
    let cookies = cookie.parse(socket.handshake.headers.cookie);
    let userCookie = await idByAccessTokenForSocket (cookies.Authorization);
    let userLogin = await db.readRows('profiles', 'login', `cookieId = \'${userCookie.ID}\'`);
    prvtChtConnectedUsers[userLogin[0].login] = socket.id;
    console.log("Full prvtChtConnectedUsers on connect : ", prvtChtConnectedUsers);

    console.log('User connected to private chat!');
    socket.on('messageSent', async function(res) {
        if(prvtChtConnectedUsers[res.receiver]) privateChatSocket.to(prvtChtConnectedUsers[res.receiver]).emit('messageReceived', res);
    });
    socket.on('friendshipInvited', async function (res) {
        if(prvtChtConnectedUsers[res.receiver]) {
            let Uscookies = cookie.parse(socket.handshake.headers.cookie);
            let cookieId = await idByAccessTokenForSocket(Uscookies.Authorization);
            let userData = await db.readRows('profiles', 'login, email', `cookieId = \'${cookieId.ID}\'`);
            privateChatSocket.to(prvtChtConnectedUsers[res.receiver]).emit('newInvite', userData[0]);
        }
    });
    socket.on('friendshipAccepted', async function (res) {
        if(prvtChtConnectedUsers[res.receiver]) {
            let Uscookies = cookie.parse(socket.handshake.headers.cookie);
            let cookieId = await idByAccessTokenForSocket(Uscookies.Authorization);            
            let userData = await db.readRows('profiles', 'login, email', `cookieId = \'${cookieId.ID}\'`);
            privateChatSocket.to(prvtChtConnectedUsers[res.receiver]).emit('newFriend', userData[0]);
        }
    });
    socket.on('friendshipStopped', async function (res) {
        if(prvtChtConnectedUsers[res.receiver]) {
            let Uscookies = cookie.parse(socket.handshake.headers.cookie);
            let cookieId = await idByAccessTokenForSocket(Uscookies.Authorization);
            let userData = await db.readRows('profiles', 'login', `cookieId = \'${cookieId.ID}\'`);
            console.log('privatechat socket.on(friendshipStopped) userData[0] : ', userData[0]);
            privateChatSocket.to(prvtChtConnectedUsers[res.receiver]).emit(`${userData[0].login}-delete`);
        }
    });
    socket.on('messageRedacted', async function (res) {
        if(prvtChtConnectedUsers[res.receiver]) privateChatSocket.to(prvtChtConnectedUsers[res.receiver]).emit(`${res.id}-mesRedacted`, res);
    });
    socket.on('messageDeleted', async function (res) {
        if(prvtChtConnectedUsers[res.receiver]) privateChatSocket.to(prvtChtConnectedUsers[res.receiver]).emit(`${res.id}-mesDeleted`);
    });
    socket.on('disconnect', () => {
        console.log("disconnect: socket.id : ", socket.id);
        console.log("disconnect: prvtChtConnectedUsers[userLogin] : ", prvtChtConnectedUsers[userLogin]);
        for(let key in prvtChtConnectedUsers) {
            if(prvtChtConnectedUsers[key] == socket.id) {
                console.log(`socket.on:disconnect : prvtChtConnectedUsers[${key}] : ${prvtChtConnectedUsers[key]} deleting...`);
                delete prvtChtConnectedUsers[key];
            }
        }
    })
});

publicChatSocket.on('connection', (socket) => {
    console.log('User connected to public chat!');
    socket.on('messageSent', async function(res) {
        socket.broadcast.emit('messageReceived', res);
    });
});

console.log(hello);

// Starting server with express

//PORT number
const PORT = process.env.PORT || 5000;

http.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});