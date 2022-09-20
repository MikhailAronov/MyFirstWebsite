const express = require('express');
const fs = require('fs');
const path = require('path');
const formidable = require('formidable');
const mysql = require('mysql');
const uuid = require('uuid');
const util = require('util');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');
const bp = require('body-parser');
const  {  Mysql_database_manager } = require('./mysql_database_manager.js');

const db = new Mysql_database_manager;


function setCookie(cname, cvalue, exdays) {
    let d = new Date;
    d.setTime(d.getTime() + exdays*1000*60*60*24);
    let expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';'+ expires + ';path=/';
}

function getCookieValue(cname) {
    let name = cname + '=';
    let c_pairs = document.cookie.split(';');
    for(let i = 0; i < c_pairs.length; i++ ) {
        let pair = c_pairs[i];
        if(pair.indexOf(name) == 0) {
            return pair.substring(name.length);
        }
    }
    return '';
}


module.exports = setCookie;
module.exports = getCookieValue;
// Express using
const app = express();


// Favicon serve
app.use(favicon(path.join(__dirname, 'resources/images/sword_icon.png')));

// Create connection to MySQL
db.connectToDatabase();
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
app.use(bp.json());
app.use(bp.text());
app.use(bp.urlencoded({ extended: true }));


// Using user router
app.use('/users', require('./users/users_router'));
app.use('/resources/images', require('./resources/images/images_router'));

// Check cookie
app.use((req, res, next) => {
    if (req.path == '/regPage.html') {
        return next();
    } else if(req.path == '/*.html') {
        let userToken = req.cookies.ID;
        if (userToken === undefined) {
            next();
        } else {
            return next();
        }
    }
    next();
}); 

const hello = 'Hello, console!';
//app.get('/*', (req,res) =>)

app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, "profilePage.html"));
}); 

app.get('/homePage.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'homePage.html'));
    console.log('HomePage visited...');
});

app.get('/regPage.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'regPage.html'));
    console.log('regPage.html was sent...');
});

app.get('/privateChatPage.html', (req, res) => {
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
app.get('/profilePage.html', (req, res) => {
    res.sendFile(path.join(__dirname, "profilePage.html"));
});
app.get('/chatPage.html', (req, res) => {
    console.log(req.cookies.ID);
    if(req.cookies.ID === undefined) {
        res.sendFile(path.join(__dirname, "regPage.html"));
        console.log('Hello');
    } else {
        res.sendFile(path.join(__dirname, "chatPage.html"));
    }
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
    let userCookieId = req.cookies.ID;
    /* let sql = `SELECT sourceId AS id FROM friendship WHERE status= \'active\' AND targetId = \'${userCookieId}\'; SELECT targetId AS id FROM friendship WHERE status= \'active\' AND sourceId = \'${userCookieId}\';`;
    let promiseOfIdsList = new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if(err) throw err;
            let fullArrayOfFriends = [].concat(...result);
            let setForFriendsIds = new Set;
            for(let k in fullArrayOfFriends) {
                setForFriendsIds.add('\'' + fullArrayOfFriends[k].id + '\'');
            }
            resolve(setForFriendsIds);
        })
    }); */
    let fullArrayOfFriends = [].concat(...await db.customQuery(`SELECT sourceId AS id FROM friendship WHERE status= \'active\' AND targetId = \'${userCookieId}\'; SELECT targetId AS id FROM friendship WHERE status= \'active\' AND sourceId = \'${userCookieId}\';`));
    console.log('fullArrayOfFriends = [].concat(await db.customQuery : ', fullArrayOfFriends);
    let fullSetFriendsIds = new Set;
    for(let k in fullArrayOfFriends) {
        fullSetFriendsIds.add('\'' + fullArrayOfFriends[k].id + '\'');
    }
    let inviteIdsToSql = Array.from(fullSetFriendsIds).join(', ');
    console.log('fullSetOfFriendsIds = ', fullSetFriendsIds);
    if (fullSetFriendsIds.size != 0) {
        /* let sql_friendsLoginAndEmail = `SELECT login, email FROM profiles WHERE cookieId IN (${inviteIdsToSql});`;
        db.query(sql_friendsLoginAndEmail, (err,result) => {
            if(err) throw err;
            res.send(JSON.stringify(result));
        }); */
        res.send(JSON.stringify(await db.readRow('profiles', 'login, email', `cookieId IN (${inviteIdsToSql})`)));
    } else {
        let emptyList = {};
        res.send(JSON.stringify(emptyList));
    }
});
app.get('/invitesList', async (req, res) => {
    let userCookieId = req.cookies.ID;
    /* let sql = `SELECT sourceId AS id FROM friendship WHERE status= \'new\' AND targetId = \'${userCookieId}\'; SELECT targetId AS id FROM friendship WHERE status= \'new\' AND sourceId = \'${userCookieId}\';`;
    let promiseOfIdsList = new Promise((resolve, reject) => {
        db.query(sql, (err, result) => {
            if(err) throw err;
            let fullArrayOfFriends = [].concat(...result);
            let setForFriendsIds = new Set;
            for(let k in fullArrayOfFriends) {
                setForFriendsIds.add('\'' + fullArrayOfFriends[k].id + '\'');
            }
            resolve(setForFriendsIds);
        })
    });
    let fullSetFriendsIds = await promiseOfIdsList.then((readySet) => {return readySet}); */
    let fullArrayOfFriends = [].concat(...await db.readRow('friendship','sourceId AS id',`status= \'new\' AND targetId = \'${userCookieId}\'`));
    let fullSetFriendsIds = new Set;
    for(let k in fullArrayOfFriends) {
        fullSetFriendsIds.add('\'' + fullArrayOfFriends[k].id + '\'');
    }
    let inviteIdsToSql = Array.from(fullSetFriendsIds).join(', ');
    console.log(inviteIdsToSql);
    if (fullSetFriendsIds.size != 0) {
        /* let sql_friendsLoginAndEmail = `SELECT login, email FROM profiles WHERE cookieId IN (${inviteIdsToSql});`;
        db.query(sql_friendsLoginAndEmail, (err,result) => {
            if(err) throw err;
            console.log(result);
            res.send(JSON.stringify(result));
        }); */
        res.send(JSON.stringify(await db.readRow('profiles', 'login, email', `cookieId IN (${inviteIdsToSql})`)));
    } else {
        let emptyList = {};
        res.send(JSON.stringify(emptyList));
    }
});

app.post('/uploadCorrespond', async (req, res) => {
    //const fsreadFile = util.promisify(fs.readFile);
    let cookieId = req.cookies.ID;
    /* let sql = `SELECT login FROM profiles WHERE cookieId = \'${cookieId}\';`;
    db.query(sql, async function (err, result) {
        if(err) throw err;
        fs.readFile(path.join(__dirname, 'public', 'PublicChat.txt'), 'utf8', (err, data) => {
                if (err) throw err;
                let packtoSend = {
                    login: result[0].login,
                    messages: data
                }
                console.log(JSON.stringify(packtoSend));
                res.send(JSON.stringify(packtoSend));
            }
        );
        
    }); */
    let userlogin = await db.readRow('profiles', 'login', `cookieId = \'${cookieId}\'`);
    fs.readFile(path.join(__dirname, 'public', 'PublicChat.txt'), 'utf8', (err, data) => {
        if (err) throw err;
        let packtoSend = {
            login: userlogin[0].login,
            messages: data
        }
        res.send(JSON.stringify(packtoSend));        
    });

});
app.post('/getLoginAndEmailFromCookies', async (req, res) => {
    let cookieId = req.cookies.ID;
    /* let sql = `SELECT login, email FROM profiles WHERE cookieId = \'${cookieId}\';`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(JSON.stringify(result));
        res.send(JSON.stringify(result));
    }); */
    let userData = await db.readRow('profiles', 'login, email', `cookieId = \'${cookieId}\'`);
    res.send(JSON.stringify(userData[0]));
});
app.post('/chat_sendingMessage', async (req, res) => {
    let cookieId = req.cookies.ID;
    let mes = req.body;
    let mesDate = new Date();
    /* let sql = `SELECT login FROM profiles WHERE cookieId = \'${cookieId}\';`;
    db.query(sql, (err, result) => {
        if(err) throw err;
        let writtingMessage = `[${result[0].login}][${mesDate}]: \n ${mes} \n\n`;
        fs.appendFile(path.join(__dirname, 'public/publicChat.txt'), writtingMessage, (err) => {
            if(err) throw err;
        });
    }); */
    let userLogin = await db.readRow('profiles', 'login', `cookieId = \'${cookieId}\'`);
    let writtingMessage = `[${userLogin[0].login}][${mesDate}]: \n ${mes} \n\n`;
    fs.appendFile(path.join(__dirname, 'public/publicChat.txt'), writtingMessage, (err) => {
        if(err) throw err;
        res.send(mes);
        res.end();
    });
});
app.post('/getUserDataByCookieID/:ID', async (req, res) => {
    let cookieId = req.params.ID.toString();
    /* let sql = `SELECT login, email, profPicExt FROM profiles WHERE cookieId = \'${cookieId}\';`;
    db.query(sql, (err, results) => {
        if(err) throw err;
        console.log(JSON.stringify(results));
        res.send(JSON.stringify(results));
    }); */
    let userData = await db.readRow('profiles', 'login, email, profPicExt', `cookieId = \'${cookieId}\'`);
    //res.send(userData);
    console.log(JSON.stringify(userData));
    res.send(JSON.stringify(userData));
    console.log('Request to getuserdatabyid:id');
    console.log('cookieId value from index.js ' + cookieId);
});
app.post('/uploadUserAvatarImage', async (req, res) => {
    let cookieId = req.cookies.ID;
    //console.log(cookieId);
    let userData = await db.readRow('profiles', 'login, profPicExt', `cookieId = \'${cookieId}\'`);
    //console.log(userData);
    res.sendFile(path.join(__dirname, 'users', `${userData[0].login}`, `${userData[0].login}_profilePic.${userData[0].profPicExt}`));
    console.log('Profile\'s avatar image was sent...');
})
app.post('/addNewFriend', async (req, res) => {
    console.log('The request has reached the server (endpoint \"addNewFriend\")');
    let cookieId = req.cookies.ID;
    /* let userNicknamePromise = new Promise ((res, rej) => {
        let sql = `SELECT login, email FROM profiles WHERE cookieId = \'${cookieId}\';`;
        db.query(sql, (err, result) => {
            if (err) throw err;
            res(result[0].login);
        });
    }).then((value) => {
        return value;
    }); 
    let userNickname = await userNicknamePromise;*/

    let userNickname = await db.readRow('profiles','login, email',`cookieId = \'${cookieId}\'`);
    let profileToAdd = await db.readRow('profiles', 'login, email, cookieId', `login = \'${req.body.profileToAdd}\'`);
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
        await db.createRow('friendship', 'sourceId, targetId, status, createdAt, lastUpdatedAt', `\'${cookieId}\', \'${profileToAdd[0].cookieId}\', 'new', \'${new Date()}\', \'${new Date()}\'`);
        console.log('New friendship added...');
        res.send(JSON.stringify(newFriendObject));
    }


    /* async function addNewFriend(userNickname) {
        

        let sql = `SELECT login, email, cookieId FROM profiles WHERE login = \'${req.body.profileToAdd}\';`;
        db.query(sql, (err, result) => {
            if (err) throw err;
            if (result[0] === undefined){
                console.log('Not found login to add condition triggered...');
                let profileNotFound = {
                    profileNotFound: 'profileNotFound'
                }
                res.send(JSON.stringify(profileNotFound));
            } else {
                let newFriendObject = {
                    login: result[0].login,
                    email: result[0].email,
                    fromUser: userNickname
                }
                console.log(JSON.stringify(newFriendObject));
                let sql_newFriendship = `INSERT INTO friendship (sourceId, targetId, status, createdAt, lastUpdatedAt) VALUES (${cookieId}, \'${result[0].cookieId}\', 'new', \'${new Date()}\', \'${new Date()}\');`;
                db.query(sql_newFriendship, (err, result) => {
                    if (err) throw err;
                    console.log('New friendship added...');
                    res.send(JSON.stringify(newFriendObject));
                });
            }
        });
    }
    addNewFriend(); */

});
app.post('/regPage.html', (req, res) => {
    var form = new formidable.IncomingForm({
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
                let IdChecking = await db.readRow('profiles', 'cookieId', `cookieId=\'${cookieId}\'`);
                if(IdChecking[0] === undefined) {
                    console.log('No such CookieId in database!... CookieId: ', cookieId, ' will be sign!');
                    const profileObjForMysql = {
                        login : '\'' + fields.login + '\'',
                        email : '\'' + fields.email + '\'',
                        password : '\'' + fields.password + '\'',
                        cookieId : '\'' + cookieId + '\'',
                        profPicExt : '\'' + files.profilePic.originalFilename.split('.').pop() + '\''
                    }

                    await db.createRow('profiles', `${Object.keys(profileObjForMysql)}`, `${Object.values(profileObjForMysql)}`);
                    return;                    
                } else {
                    cookieId = uuid.v4();
                    return writingDataToDatabase(cookieId);
                }
            }

            res.cookie('ID', cookieId, {httpOnly: false, maxAge : 999999999});

            
            await writingDataToFolders();
            console.log("Data was written to foldres...");
            await writingDataToDatabase(cookieId);
            console.log("Data was written to Database...");
            res.redirect(301, '/profilePage.html');            
    });
});


app.put('/rejectOrAcceptInvite', async (req, res) => {
    let cookieId = req.cookies.ID;
    /* let reqTargetIdByLogin = new Promise ((resolve, reject) => {
        let sql_TargetIdByLogin = `SELECT cookieId AS cookieId FROM profiles WHERE login=\'${req.body.login}\';`;
        db.query(sql_TargetIdByLogin, (err, result) => {
            if(err) throw err;
            resolve(result[0].cookieId);
        })
    });
    let targetId = await reqTargetIdByLogin.then((result)=>{return result});
    if(req.body.answer === 'reject') {
        let sql_delFriendship = `DELETE FROM friendship WHERE (sourceId = \'${cookieId}\' AND targetId = \'${targetId}\') OR (sourceId = \'${targetId}\' AND targetId = \'${cookieId}\');`;
        //let sql_setFriendshipStat = 'UPDATE friendship SET status=\'aparted\' WHERE (sourceId = \'${cookieId}\' AND targetId = \'${req.body.target}\') OR (sourceId = \'${req.body.target}\' AND targetId = \'${cookieId}\');`; 
        db.query(sql_delFriendship, (err)=>{
            if(err) throw err;
            console.log('friendship was deleted...');
            res.end();
        });
    }
    if(req.body.answer === 'accept') {
        let sql_friendshipAccept = `UPDATE friendship SET status=\'active\' WHERE (sourceId = \'${cookieId}\' AND targetId = \'${targetId}\') OR (sourceId = \'${targetId}\' AND targetId = \'${cookieId}\');`;
        db.query(sql_friendshipAccept, (err) => {
            if(err) throw err;
            console.log('Friendship was accepted...');
            res.end();
        })
    }*/

    //with db manager
    let rawReqTargetIdByLogin = await db.readRow('profiles', 'cookieId', `login=\'${req.body.login}\'`);
    let targetId = rawReqTargetIdByLogin[0].cookieId;
    if(req.body.answer === 'reject') {
        db.deleteRow('friendship', `(sourceId = \'${cookieId}\' AND targetId = \'${targetId}\') OR (sourceId = \'${targetId}\' AND targetId = \'${cookieId}\')`);
        console.log('friendship was deleted...');
        res.end();
    }
    if(req.body.answer === 'accept') {
        db.updateRow('friendship', 'status', '\'active\'', `(sourceId = \'${cookieId}\' AND targetId = \'${targetId}\') OR (sourceId = \'${targetId}\' AND targetId = \'${cookieId}\')`);
        console.log('Friendship was accepted...');
        res.end();
    }

});
app.delete('/deleteFriend', async (req, res) => {
    /* let reqTargetIdByLogin = new Promise ((resolve, reject) => {
        let sql_TargetIdByLogin = `SELECT cookieId AS cookieId FROM profiles WHERE login=\'${req.body.login}\';`;
        db.query(sql_TargetIdByLogin, (err, result) => {
            if(err) throw err;
            resolve(result[0].cookieId);
        })
    });
    let targetId = await reqTargetIdByLogin.then((result)=>{return result}); */
    let rawReqTargetIdByLogin = await db.readRow('profiles', 'cookieId', `login=\'${req.body.login}\'`);
    let targetId = rawReqTargetIdByLogin[0].cookieId;
    let cookieId = req.cookies.ID;
    /* let sql_delFriendship = `DELETE FROM friendship WHERE (sourceId = \'${cookieId}\' AND targetId = \'${targetId}\') OR (sourceId = \'${targetId}\' AND targetId = \'${cookieId}\');`;
    //let sql_setFriendshipStat = 'UPDATE friendship SET status=\'aparted\' WHERE (sourceId = \'${cookieId}\' AND targetId = \'${req.body.target}\') OR (sourceId = \'${req.body.target}\' AND targetId = \'${cookieId}\');`; 
    db.query(sql_delFriendship, (err)=>{
        if(err) throw err;
        console.log('friendship deleted');
        res.end();
    }) */
    await db.deleteRow('friendship', `(sourceId = \'${cookieId}\' AND targetId = \'${targetId}\') OR (sourceId = \'${targetId}\' AND targetId = \'${cookieId}\')`);
    console.log('friendship deleted');
    res.end();
});


console.log(hello);

// Starting server with express

//PORT number
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});