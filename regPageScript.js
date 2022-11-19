$("#RegModule").hide();
$("#switchToRegModule").click(async (e)=> {
    e.preventDefault();
    if(e.target !== e.currentTarget) return;
    $('#LogModule').hide();
    $('#RegModule').show();
});
$("#switchToLogModule").click(async (e)=> {
    e.preventDefault();
    if(e.target !== e.currentTarget) return;
    $('#RegModule').hide();
    $('#LogModule').show();
});

$('#loginButton').click(async (e) => {
    e.preventDefault();
    if(e.target !== e.currentTarget) return;
    loginData = {
        login    : document.getElementById('loginToLog').value,
        password : document.getElementById('passwordToLog').value
    }
    document.getElementById('loginToLog').value = '';
    document.getElementById('passwordToLog').value = '';
    let req = await fetch('/login', {
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(loginData)
    });
    let res = await req.text();
    console.log(res);
    switch(res) {
        case 'wrong_login' :
            let loginToLog = document.getElementById('loginToLog');
            loginToLog.classList.add('error');
            let wronglogin = document.createElement('p');
            wronglogin.classList.add('error');
            (loginToLog.parentNode).insertBefore(wronglogin, loginToLog);
            wronglogin.innerText = 'Wrong login or Email :(';
            break;
        case 'wrong_password' :
            let passwordToLog = document.getElementById('passwordToLog');
            passwordToLog.classList.add('error');
            let wrongPassword = document.createElement('p');
            wrongPassword.classList.add('error');
            (passwordToLog.parentNode).insertBefore(wrongPassword, passwordToLog);
            wrongPassword.innerText = 'Wrong password :(';
            break;
        default :
        window.location.reload();
    }
});


document.getElementById('submitButton').addEventListener('click', (e) => {
    if(document.getElementById('passwordUpload').value != document.getElementById('repPassword').value) {
        e.preventDefault();
        console.log('passwordUpload value: ' + document.getElementById('passwordUpload').value);
        console.log('repPassword value: ' + document.getElementById('repPassword').value);
        document.getElementById('repPassword').classList.add('error');
        document.getElementById('passwordDoesntMatch').classList.add('error');
        document.getElementById('passwordDoesntMatch').innerText='Passwords does not match. Absolutely neutral and polite ask to check the password';
        console.log('Event listener heard you...');
    }

}, false);
