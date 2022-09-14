const express = require('express');
const path = require('path');
const images_router = express.Router();
module.exports = images_router;

images_router.get('/background-image.jpg', (req, res) => {
    res.sendFile(path.join(__dirname, 'background-image.jpg'));
});


