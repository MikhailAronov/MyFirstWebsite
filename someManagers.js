export class ButtonManager {
    constructor() {
        console.log('ButtonManager: init');
    }
    deleteFriendBtn (divForNewFriend, user, socket = undefined) {
        let deleteFriendBtn = document.createElement('button');
        deleteFriendBtn.innerText = 'Delete Friend';
        deleteFriendBtn.classList.add('deleteFriendBtn');
        divForNewFriend.appendChild(deleteFriendBtn);
        deleteFriendBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if(e.target != e.currentTarget) return;/* 
            while (divForNewFriend.lastElementChild) {
                divForNewFriend.removeChild(divForNewFriend.lastElementChild);
            } */
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
            socket.emit("friendshipStopped", {
                receiver : user.login,
            });
        });
    }
    acceptInviteBtn(divForNewInvite, user, socket = undefined) {
        let acceptInviteBtn = document.createElement('button');
        acceptInviteBtn.innerText = 'Accept invite';
        acceptInviteBtn.classList.add('inviteBtn');
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
            if(socket) socket.emit('friendshipAccepted', {
                receiver : user.login                
            });
        });
        return acceptInviteBtn;
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
    deleteMessageBtn(messageBox, id, receiver = undefined, socket = undefined) {
        let deleteMessageBtn = document.createElement('button');
        deleteMessageBtn.innerText = 'Delete';
        deleteMessageBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if(e.target !== e.currentTarget) return;
            fetch('/prvtchtDeleteMessage', {
                method : "DELETE",
                headers : {
                    "Content-Type" : "application/json"
                },
                body : JSON.stringify({id : id})
            });
            if(socket) socket.emit('messageDeleted', {
                receiver : receiver,
                id : id
            });   
            messageBox.remove();
        });
        return deleteMessageBtn;
    }
    redactMessageBtn(messageBox, id, receiver = undefined, socket = undefined) {
        let redactMessageBtn = document.createElement('button');
        redactMessageBtn.innerText = "Redact";
        redactMessageBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            if(e.target !== e.currentTarget) return;
            let textField = messageBox.querySelector('p[name= "'+ id + '-mesText"]');
            let redactedText = document.createElement('INPUT');
            redactedText.setAttribute('name', 'redactedText');
            redactedText.setAttribute('type', 'text');
            redactedText.setAttribute('placeholder', 'Enter your message');
            redactedText.setAttribute('value', textField.innerText);
            let confirmChangesBtn = document.createElement('button');
            confirmChangesBtn.innerText = "Send";
            console.log(textField);
            messageBox.insertBefore(confirmChangesBtn, textField);
            textField.remove();
            messageBox.insertBefore(redactedText, confirmChangesBtn);
            redactedText.addEventListener('keydown', async (e) => {
                //if(e.target === e.currentTarget) return;
                if(e.key == 'Enter' && redactedText === document.activeElement) {
                    e.preventDefault();
                    confirmChangesBtn.click();
                }
                
            });
            confirmChangesBtn.addEventListener('click', async (e) => {
                let redVal = redactedText.value;
                e.preventDefault();
                if(e.target !== e.currentTarget) return;
                fetch('/prvtchtRedactMessage', {
                    method : "PUT",
                    headers : {
                        "Content-Type" : "application/json"
                    },
                    body : JSON.stringify({
                        text : redVal,
                        id : id
                    })
                });
                let newText = document.createElement('p');
                newText.setAttribute('name', `${id}-mesText`);
                messageBox.insertBefore(newText, redactedText);
                newText.innerText = redVal;
                messageBox.removeChild(redactedText);
                messageBox.removeChild(confirmChangesBtn); 
                if(socket) socket.emit('messageRedacted', {
                    receiver : receiver,
                    text : redVal,
                    id : id
                });             
            });
        });
        return redactMessageBtn;
    }
    testFunction(print){
        console.log(print);
    }

}


/* module.exports = {
    ButtonManager
} */

