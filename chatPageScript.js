import { ButtonManager }  from './someManagers.js';

let sendMessagebutton = document.getElementById('chat_submitMessBtn');
const socket = io('/publicchat');

const BtnMng = new ButtonManager();

async function correspondUpload() {
    const response = await fetch('/uploadCorrespond', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
    }});
    let nickAndMessContainer = await response.json();
    //console.log(nickAndMessContainer);
    console.log("Full correspond of public chat : ", nickAndMessContainer);
    console.log("First message of upload correspond : ", nickAndMessContainer[0])
    let i = 0;
    while (nickAndMessContainer[i] !== undefined) {
        //console.log(nickAndMessContainer[i]);
        if(nickAndMessContainer[i].login === null) {
            nickAndMessContainer[i].login = 'DELETED_USER';
        }
        let div = document.createElement('div');
        let nick = document.createElement('p');
        let mess = document.createElement('p');
        let date = document.createElement('p');
        // Place elements into right location
        document.getElementById('chat_showMessBox').appendChild(div);
        div.appendChild(nick);
        div.appendChild(mess);
        div.appendChild(date);
        div.setAttribute('class', 'oneMessageContainer');

        //nick.innerHTML = sessionStorage.getItem('login') + ":";
        //nick.innerHTML = packofMess.substring(packofMess.search('\\[') + 1, packofMess.search('\\]'));
        nick.innerHTML = nickAndMessContainer[i].login.toString();
        mess.innerHTML = nickAndMessContainer[i].message.toString();
        date.innerHTML = nickAndMessContainer[i].createdat.toString();
        document.getElementById('chat_message').value = '';
        i++;
    }
    document.getElementById('chat_showMessBox').scrollTop = document.getElementById('chat_showMessBox').scrollHeight;
}

async function setLoginAndEmailToSessionStorage() {
    let req = new XMLHttpRequest();
    req.open('POST', '/getLoginAndEmailFromCookies', true);
    req.responseType = 'json';
    req.onload = function () {
        let userData = req.response;
        sessionStorage.setItem('login', userData.login);
        sessionStorage.setItem('email', userData.email);
        console.log('Login ' + userData.login + ' had been written to session storage');
        console.log('Email ' + userData.email + ' had been written to session storage');
    }
    req.send();
}

function showReceivedMessage(res) {

}



sendMessagebutton.addEventListener('click', async function (e) {
    e.preventDefault();
    let req = new XMLHttpRequest();
    req.open('POST', '/chat_sendingMessage', true);
    req.responseType= "text/plain";
    req.setRequestHeader('Content-Type', 'text/plain');
    if(!sessionStorage.getItem("login")||!sessionStorage.getItem("email")) {
        await setLoginAndEmailToSessionStorage();
    }
    req.onload = function () {
        console.log('Server returns: ' + req.response);
        let packofMess = req.response;
        // Creating elements for one message
        let div = document.createElement('div');
        let nick = document.createElement('p');
        let mess = document.createElement('p');
        let mesdate = document.createElement('p');
        let dateiself = new Date();
        // Place elements into right location
        document.getElementById('chat_showMessBox').appendChild(div);
        div.appendChild(nick);
        div.appendChild(mess);
        div.appendChild(mesdate);
        div.setAttribute('class', 'oneMessageContainer');
        socket.emit('messageSent', {login : sessionStorage.getItem('login'), message : packofMess, date : `${dateiself.getFullYear()}\.${dateiself.getMonth()}\.${dateiself.getDay()}  ${dateiself.getHours()}:${dateiself.getMinutes()}:${dateiself.getSeconds()}`});

        //nick.innerHTML = sessionStorage.getItem('login') + ":";
        nick.innerHTML = sessionStorage.getItem('login') + ':';
        mess.innerHTML = packofMess;
        mesdate.innerHTML = `${dateiself.getFullYear()}\.${dateiself.getMonth()}\.${dateiself.getDay()}  ${dateiself.getHours()}:${dateiself.getMinutes()}:${dateiself.getSeconds()}`;
        document.getElementById('chat_message').value = '';
        document.getElementById('chat_showMessBox').scrollTop = document.getElementById('chat_showMessBox').scrollHeight;
    }
    let message = document.getElementById('chat_message').value;
    console.log('Text from input field. Public chat : ', message);
    req.send(message);
});

socket.on('messageReceived', (res) => {
    let div = document.createElement('div');
    let nick = document.createElement('p');
    let mess = document.createElement('p');
    let mesdate = document.createElement('p');
    // Place elements into right location
    document.getElementById('chat_showMessBox').appendChild(div);
    div.appendChild(nick);
    div.appendChild(mess);
    div.appendChild(mesdate);
    div.setAttribute('class', 'oneMessageContainer');

    //nick.innerHTML = sessionStorage.getItem('login') + ":";
    nick.innerHTML = res.login;
    mess.innerHTML = '<br>' + res.message;
    mesdate.innerHTML = '<br>' + res.date;
    document.getElementById('chat_showMessBox').scrollTop = document.getElementById('chat_showMessBox').scrollHeight;
});

async function main() {
    await correspondUpload();
}

main();