document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.form form');
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const identifier = document.getElementById('identifier').value;
        const password = document.getElementById('password').value;

        fetch('http://localhost:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                identifier: identifier,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (!data.user) {
                throw new Error('Invalid credentials');
            }
            if (localStorage.getItem('user')) {
                localStorage.removeItem('user');
            }
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.assign('http://127.0.0.1:5500/client/home.html');
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
