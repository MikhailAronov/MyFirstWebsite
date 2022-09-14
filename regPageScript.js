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