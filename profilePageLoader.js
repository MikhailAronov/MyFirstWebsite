//const { response } = require("express");
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

class Profile {
    constructor(login, password, email) {
        this.login = login;
        this.password = password;
        this.email = email;
    }
}

let thisProfile = new Profile();

cookieId = getCookieValue('ID');
console.log('Cookie ID from document ' + cookieId);
if(cookieId == "") {
    window.location.replace("/regPage.html");
}
let userData = "";

// Getting user data by CookieId with XMLHttpRequest()
/*
var request = new XMLHttpRequest();
request.open('POST', `/getUserDataByCookieID/${cookieId}`);
request.responseType = "text";
request.onload = function() {
    console.log('Onload event was triggered. Request.response value = ' + request.response);
    userData = request.response;
};
request.send();
userData = request.response;
*/

async function makeRequestWithXMLHttp(method, url) {
    return new Promise(function (resolve, reject) {
        var request = new XMLHttpRequest();
        request.open(method, url);
        request.responseType = "json";
        request.onload = function() {
            console.log('Received data: ');
            console.log(request.response);
            resolve(request.response);
        };
        request.send();
    });
}

async function loadUserData(method, url) {
    let result = await makeRequestWithXMLHttp(method, url);
    console.log(result);
    // Getting profile pic
    fetch(`/users/${result[0].login}/${result[0].login}_profilePic.${result[0].profPicExt}`).then( (response) => {
        if(response.ok) {
            response.blob().then((blob) => {
                objectURL = URL.createObjectURL(blob);
                document.getElementById('profilePic').src = objectURL;
            })
        }
    });
    fetch(`/users/${result[0].login}/${result[0].login}.json`).then( (response) => {
        if(response.ok) {
            response.json().then((json) => {
                document.getElementById('login').innerHTML = json.login;
                document.getElementById('email').innerHTML = json.email;
            })
        }
    });
    fetch(`./non-existentURL`).then(()=>{console.log('fetch to non-existent url complited...')});
    console.log('js loader has been completed...');
}

loadUserData('POST', `/getUserDataByCookieID/${cookieId}`);

//document.getElementById('login').innerHTML = '<h1>Hello, I am from js page loader!</h1>';