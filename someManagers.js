export class ButtonManager {
    constructor() {
        console.log('init');
    }
    deleteFriendBtn (divForNewFriend, user) {
        let deleteFriendBtn = document.createElement('button');
        deleteFriendBtn.innerText = 'Delete Friend';
        deleteFriendBtn.classList.add('deleteFriendBtn');
        divForNewFriend.appendChild(deleteFriendBtn);
        deleteFriendBtn.addEventListener('click', (e) => {
            e.preventDefault();
            while (divForNewFriend.lastElementChild) {
                divForNewFriend.removeChild(divForNewFriend.lastElementChild);
            }
            divForNewFriend.remove();
            let userToDelete = {
                login: user.login
            }
            fetch('/deleteFriend', {
                method: 'DELETE',
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify(userToDelete)
            }).then(()=>{
                console.log('friendDeleted...'); 
                return;
            });
        });
    }
    acceptInviteBtn(divForNewInvite, user) {
        let acceptInviteBtn = document.createElement('button');
        acceptInviteBtn.innerText = 'Accept invite';
        acceptInviteBtn.classList.add('inviteBtn');
        divForNewInvite.appendChild(acceptInviteBtn);
        acceptInviteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            while (divForNewInvite.lastElementChild) {
                divForNewInvite.removeChild(divForNewInvite.lastElementChild);
            }
            divForNewInvite.remove();
            let userToAcceptInvite = {
                login  : user.login,
                answer : 'accept'
            }
            fetch('/rejectOrAcceptInvite', {
                method: 'PUT',
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify(userToAcceptInvite)
            }).then(()=>{
                console.log('invite accepted...'); 
                return;
            });
        });
    }
    rejectInviteBtn(divForNewInvite, user) {
        let rejectInviteBtn = document.createElement('button');
        rejectInviteBtn.innerText = 'Reject invite';
        rejectInviteBtn.classList.add('inviteBtn');
        divForNewInvite.appendChild(rejectInviteBtn);
        rejectInviteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            while (divForNewInvite.lastElementChild) {
                divForNewInvite.removeChild(divForNewInvite.lastElementChild);
            }
            divForNewInvite.remove();
            let userToRejectInvite = {
                login  : user.login,
                answer : 'reject'
            }
            fetch('/rejectOrAcceptInvite', {
                method: 'PUT',
                headers: {
                    'Content-Type':'application/json'
                },
                body: JSON.stringify(userToRejectInvite)
            }).then(()=>{
                console.log('invite rejected...'); 
                return;
            });
        });
    }
    testFunction(print){
        console.log(print);
    }

}

const BtnMng = new ButtonManager();

/* module.exports = {
    ButtonManager
} */

