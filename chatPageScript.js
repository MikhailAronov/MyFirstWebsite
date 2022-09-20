
let sendMessagebutton = document.getElementById('chat_submitMessBtn');

async function correspondUpload() {
    const response = await fetch('/uploadCorrespond', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
    }});
    let nickAndMessContainer = await response.json();
    //console.log(nickAndMessContainer);
    let packofMess = nickAndMessContainer.messages;
    console.log(packofMess);
    while (packofMess[0] !== undefined) {
        let div = document.createElement('div');
        let nick = document.createElement('p');
        let mess = document.createElement('p');
        // Place elements into right location
        document.getElementById('chat_showMessBox').appendChild(div);
        div.appendChild(nick);
        div.appendChild(mess);
        div.setAttribute('class', 'oneMessageContainer');

        //nick.innerHTML = sessionStorage.getItem('login') + ":";
        //nick.innerHTML = packofMess.substring(packofMess.search('\\[') + 1, packofMess.search('\\]'));
        nick.innerHTML = packofMess.substring(packofMess.search('\\[') + 1, packofMess.search('\\]')) + ': ';

        mess.innerHTML ='<br>' + packofMess.substring(packofMess.search(']:') + 4, packofMess.search('\n\n'));
        packofMess = packofMess.substring(packofMess.search('\n\n') + 2);
        console.log(packofMess);
        document.getElementById('chat_message').value = '';
    }
}
correspondUpload();
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

sendMessagebutton.addEventListener('click', async function (e) {
    e.preventDefault();
    let req = new XMLHttpRequest();
    req.open('POST', '/chat_sendingMessage', true);
    req.responseType= "text";
    req.setRequestHeader('Content-Type', 'text/plain');
    await setLoginAndEmailToSessionStorage();
    req.onload = async function () {
        console.log('Server returns: ' + req.response);
        let packofMess = req.response;
        // Creating elements for one message
        let div = document.createElement('div');
        let nick = document.createElement('p');
        let mess = document.createElement('p');
        // Place elements into right location
        document.getElementById('chat_showMessBox').appendChild(div);
        div.appendChild(nick);
        div.appendChild(mess);
        div.setAttribute('class', 'oneMessageContainer');

        //nick.innerHTML = sessionStorage.getItem('login') + ":";
        nick.innerHTML = sessionStorage.getItem('login') + ':';
        mess.innerHTML = '<br>' + packofMess;
        document.getElementById('chat_message').value = '';
    }
    let message = document.getElementById('chat_message').value;
    req.send(message);
});