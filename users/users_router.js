const express = require('express');
const path = require('path');
const user_router = express.Router();
 
module.exports = user_router; 

 
 user_router.get('/WeMetAgain/WeMetAgain_profilePic.jpg', (req, res) => {
                    res.sendFile(path.join(__dirname, "/WeMetAgain/WeMetAgain_profilePic.jpg"));
                    console.log('Hello');
                });
                user_router.get('/WeMetAgain/WeMetAgain.json', (req, res) => {
                    res.sendFile(path.join(__dirname, '/WeMetAgain/WeMetAgain.json'));
                }); 
