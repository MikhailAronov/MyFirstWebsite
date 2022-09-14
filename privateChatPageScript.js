const addFriendBtn = document.getElementById('addFriendBtn');
import { ButtonManager }  from './someManagers.js';
const BtnMng = new ButtonManager();

async function createFriendElement(user) {
    let divForNewFriend = document.createElement('div');
    divForNewFriend.classList.add('writeToFriend');
    document.getElementById('friendList').appendChild(divForNewFriend);
    let newFriendLogin = document.createElement('p');
    newFriendLogin.innerText = user.login;
    let newFriendEmail = document.createElement('p');
    newFriendEmail.innerText = user.email;
    BtnMng.deleteFriendBtn(divForNewFriend, user);
    divForNewFriend.appendChild(newFriendLogin);
    divForNewFriend.appendChild(newFriendEmail);
    return;    
}

function createInviteElement(user) {
    let divForNewInvite = document.createElement('div');
    divForNewInvite.classList.add('invite');
    document.getElementById('inviteList').appendChild(divForNewInvite);
    let newInviteLogin = document.createElement('p');

    newInviteLogin.innerText = user.login;
    let newInviteEmail = document.createElement('p');
    newInviteEmail.innerText = user.email;
    BtnMng.acceptInviteBtn(divForNewInvite, user);
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
    if (document.getElementById('profileToAdd').value == '') {    
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
                console.log(res);
                console.log(res.login);
                createFriendElement(res);
            }
        }
        addNewFriend();
    }
});