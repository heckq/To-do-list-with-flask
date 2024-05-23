document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('.form form');
    console.log(form)
    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Зупиняємо стандартну поведінку форми
        
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirm_password = document.getElementById('confirm_password').value;
        
        // Ось тут можна використовувати ці дані для подальшої обробки, наприклад, відправки на сервер
        // Наприклад, використовуючи fetch або XMLHttpRequest
        
        // Приклад використання fetch для відправки даних на сервер:
        fetch('http://localhost:5000/sign_up', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password,
                confirm_password: confirm_password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (!data.user) {
                throw new Error('no user')
            }
            if (localStorage.getItem('user')) {
                localStorage.removeItem('user')
            }
            localStorage.setItem('user', JSON.stringify(data.user))
            window.location.assign('http://127.0.0.1:5500/client/home.html')
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
