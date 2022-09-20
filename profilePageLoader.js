//const { response } = require("express");



/* async function loadUserData() {
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
} */

async function loadUserData() {
    fetch(`/uploadUserAvatarImage`, {
        method  : 'POST'
    }).then( (response) => {
        if(response.ok) {
            response.blob().then((blob) => {
                objectURL = URL.createObjectURL(blob);
                document.getElementById('profilePic').src = objectURL;
            })
        }
    });
    fetch(`/getLoginAndEmailFromCookies`, {
        method  : 'POST',
        headers : {
            'Content-Type' : 'application/json'
        }
    }).then( (response) => {
        if(response.ok) {
            response.json().then((json) => {
                document.getElementById('login').innerHTML = json.login;
                document.getElementById('email').innerHTML = json.email;
            })
        }
    });
    console.log('js loader has been completed...');
}

loadUserData();

//document.getElementById('login').innerHTML = '<h1>Hello, I am from js page loader!</h1>';