const addFriendBtn = document.getElementById('addFriendBtn');
import { ButtonManager }  from './someManagers.js';
const BtnMng = new ButtonManager();
var socket = io('/privateChat');

async function uploadFriendCorrespond (chat, friend) {
    console.log('uploadFriendCorrespond fuction started!');
    let req = await fetch('/uploadFriendCorrespond', {
        method: 'POST',
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify({
            login : friend.login
        })
    });
    let res = await req.json();
    console.log(res);
    for(let i = 0; res[i] !== undefined; i++) {
        if (res[i].creator == friend.login) {
            let messageBox = await messageBuilder(friend.login, res[i].message, res[i].createdat, res[i].id);
            chat.appendChild(messageBox);
            $(messageBox).attr('class', 'foreignMessage');

        } else if (res[i].receiver == friend.login) {
            let messageBox = await messageBuilder(res[i].creator, res[i].message, res[i].createdat, res[i].id);
            chat.appendChild(messageBox);
            messageBox.insertBefore(BtnMng.deleteMessageBtn(messageBox, res[i].id, res[i].receiver, socket), messageBox.firstChild);
            messageBox.insertBefore(BtnMng.redactMessageBtn(messageBox, res[i].id, res[i].receiver, socket), messageBox.firstChild);
            $(messageBox).attr('class', 'ownUserMessage');
        }
    }
    chat.scrollTop = chat.scrollHeight;
}

async function messageBuilder(login, message, date, id) {
    console.log("message builder id : ", id);
    let messageBox = document.createElement('div');
    let loginField = document.createElement('p');
    loginField.innerText = login;
    loginField.setAttribute('name', `${id}-meslogin`);
    let textField = document.createElement('p');
    textField.innerText = message;
    textField.setAttribute('name', `${id}-mesText`);
    let dateField = document.createElement('p');
    dateField.innerText = date;
    dateField.setAttribute('name', `${id}-mesDate`);
    messageBox.appendChild(loginField);
    messageBox.appendChild(textField);
    messageBox.appendChild(dateField);
    socket.on(`${id}-mesRedacted`, async function(res) {
        textField.innerText = res.text;
    });
    socket.on(`${id}-mesDeleted`, async function () {
        messageBox.remove();
    });
    return messageBox;
}

async function createFriendElement(user) {
    let divForNewFriend = document.createElement('div');
    divForNewFriend.classList.add('writeToFriend');
    document.getElementById('friendList').appendChild(divForNewFriend);
    let newFriendLogin = document.createElement('p');
    newFriendLogin.innerText = user.login;
    let newFriendEmail = document.createElement('p');
    newFriendEmail.innerText = user.email;
    BtnMng.deleteFriendBtn(divForNewFriend, user, socket);
    divForNewFriend.appendChild(newFriendLogin);
    divForNewFriend.appendChild(newFriendEmail);
    divForNewFriend.addEventListener('click', async (e) => {
        if(e.target.tagName === 'BUTTON') return;
        if(document.getElementById(`${user.login}`)) {
            $('.friendChat').hide();
            $(`#${user.login}`).show();
        } else {
            let friendChat = document.createElement(`div`);
            let messageShowFrame = document.createElement('div');
            document.getElementById('chatWithFriend').appendChild(friendChat);
            friendChat.appendChild(messageShowFrame);
            friendChat.setAttribute('class', 'friendChat');
            friendChat.setAttribute('id', `${user.login}`);
            messageShowFrame.setAttribute('id', `${user.login}-chatframe`);
            messageShowFrame.setAttribute('class', 'friendChat_showframe');
            await uploadFriendCorrespond(messageShowFrame, user);
            $('.friendChat').hide();
            $(`#${user.login}`).show();
            let friendMsgBtn = document.createElement('button');
            let friendMsgField = document.createElement('textarea');
            friendMsgField.setAttribute('class', 'messageInputField');
            friendChat.appendChild(friendMsgField);
            friendChat.appendChild(friendMsgBtn);
            $(friendMsgBtn).text('Send');
            $(friendMsgField).attr({
                "type"        : "text",
                "placeholder" : "Enter your message",
                "name"        : "sendMessageField"
            });
            $(friendMsgBtn).click( async (e) => {
                if(e.target !== e.currentTarget) return;
                await sendFriendMessage(messageShowFrame, friendMsgField, user);
            });
            friendMsgField.addEventListener('keydown', async (e) => {
                //if(e.target === e.currentTarget) return;
                if(e.key == 'Enter' && friendMsgField === document.activeElement) {
                    e.preventDefault();
                    await sendFriendMessage(messageShowFrame, friendMsgField, user);
                }
                
            });
        }
    });
    socket.on(`${user.login}-delete`, async () => {
        console.log("socket.on(${user.login}-delete) triggered!");
        divForNewFriend.remove();
    });
}

async function receiveFriendMessage(chat, res) {
    let messageBox = await messageBuilder(res.creator, res.message, res.createdat, res.id);
    chat.appendChild(messageBox);
    $(messageBox).attr('class', 'foreignMessage');
    chat.scrollTop = chat.scrollHeight;

}

socket.on('messageReceived', (res) => {
    if(document.getElementById(`${res.creator}-chatframe`)) {
        receiveFriendMessage(document.getElementById(`${res.creator}-chatframe`), res);
    }
});

socket.on('newFriend', (res) => {
    createFriendElement(res);
});

socket.on('newInvite', (res) => {
    createInviteElement(res);
});

async function sendFriendMessage (chat, messageField, friend) {
    console.log('sendFriendMessage function started');
    let message = messageField.value;
    console.log('message value: ', message);
    if (!message) {
        return;
    }
    let messagePack = {
        message : message,
        user    : friend
    }
    let req = await fetch('/sendFriendMessage', {
        method: 'POST',
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(messagePack)
    });
    let res = await req.json();
    res.receiver = friend.login;
    let messageBox = await messageBuilder(res.creator, res.message, res.createdat, res.id);
    chat.appendChild(messageBox);
    messageBox.insertBefore(BtnMng.deleteMessageBtn(messageBox, res.id, res.receiver, socket), messageBox.firstChild);
    messageBox.insertBefore(BtnMng.redactMessageBtn(messageBox, res.id, res.receiver, socket), messageBox.firstChild);
    $(messageBox).attr('class', 'ownUserMessage');
    messageField.value = '';
    chat.scrollTop = chat.scrollHeight;
    socket.emit('messageSent', res);
}


function createInviteElement(user) {
    let divForNewInvite = document.createElement('div');
    divForNewInvite.classList.add('invite');
    document.getElementById('inviteList').appendChild(divForNewInvite);
    let newInviteLogin = document.createElement('p');

    newInviteLogin.innerText = user.login;
    let newInviteEmail = document.createElement('p');
    newInviteEmail.innerText = user.email;
    let acceptInviteBtn = BtnMng.acceptInviteBtn(divForNewInvite, user, socket);
    divForNewInvite.appendChild(acceptInviteBtn);
    acceptInviteBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        if(e.target !== e.currentTarget) return;
        await createFriendElement(user);
    });
    BtnMng.rejectInviteBtn(divForNewInvite, user);
    divForNewInvite.appendChild(newInviteLogin);
    divForNewInvite.appendChild(newInviteEmail);

    return;    

}

async function pageFriendsOnload() {
    let req = await fetch('/friendsList', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        },
    });
    let res = await req.json();
    console.log(res);
    for(let k in res) {
        createFriendElement(res[k]);
    }
}

async function pageInvitesOnload() {
    let req = await fetch('/invitesList', {
        method: 'GET',
        headers: {
            "Content-Type": "application/json"
        },
    });
    let res = await req.json();
    console.log(res);
    for(let k in res) {
        createInviteElement(res[k]);
    }
}

pageFriendsOnload();
pageInvitesOnload();


addFriendBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if(e.target !== e.currentTarget) return;
    if (!document.getElementById('profileToAdd').value) {    
        console.log('if for empty login was triggered...');
        document.getElementById('profileToAdd').classList.add('error');
        let p = document.createElement('p');
        p.innerText = 'Please, enter the profile login you want to add to friend list';
        p.classList.add('error');
        document.getElementById('addselectFriendsField').appendChild(p);
        setTimeout(() => {
            document.getElementById('profileToAdd').classList.remove('error');
            p.remove();
        }, 5000);
    } else {
        async function addNewFriend() {
            let profileToAdd = document.getElementById('profileToAdd').value;
            let data = {
                profileToAdd: profileToAdd
            };
            console.log(data);
            let req = await fetch('/addNewFriend', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            })
            console.log(req);
            let res = await req.json();
            if (res.profileNotFound === 'profileNotFound') {
                console.log('Profile with this login not found...');
                document.getElementById('profileToAdd').classList.add('error');
                let p = document.createElement('p');
                p.innerText = 'Profile with this login is not found';
                p.classList.add('error');
                document.getElementById('addselectFriendsField').appendChild(p);
                setTimeout(() => {
                    document.getElementById('profileToAdd').classList.remove('error');
                    p.remove();
                }, 5000);
            } else {
                socket.emit('friendshipInvited', {
                    receiver : res.login
                });
                console.log(res);
                console.log(res.login);
            }
        }
        addNewFriend();
    }
});