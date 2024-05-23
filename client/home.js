document.addEventListener('DOMContentLoaded', function () {
    const taskTable = document.getElementById('task-table');
    const noTasksMessage = document.getElementById('no-tasks');

    if (!localStorage.getItem('user')) {
        window.location.assign('http://127.0.0.1:5500/client/sign_up.html');
    }

    fetch('/tasks')
        .then(response => response.json())
        .then(data => {
            if (data.tasks.length > 0) {
                noTasksMessage.style.display = 'none';
                data.tasks.forEach(task => {
                    const row = taskTable.insertRow(-1);
                    row.insertCell(0).textContent = task.content;
                    row.insertCell(1).textContent = new Date(task.date_created).toLocaleDateString();
                    row.insertCell(2).textContent = task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No due date';
                    const actionsCell = row.insertCell(3);
                    const deleteButton = document.createElement('a');
                    deleteButton.href = `/delete/${task.id}`;
                    deleteButton.textContent = 'Delete';
                    deleteButton.classList.add('button', 'delete');
                    const updateButton = document.createElement('a');
                    updateButton.href = `/update/${task.id}`;
                    updateButton.textContent = 'Update';
                    updateButton.classList.add('button', 'update');
                    actionsCell.appendChild(deleteButton);
                    actionsCell.appendChild(updateButton);
                });
            }
        })
        .catch(error => console.error('Error fetching tasks:', error));

    const taskForm = document.getElementById('task-form');
    taskForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(taskForm);
        const user = JSON.parse(localStorage.getItem('user'));
        
        fetch('/tasks', {
            method: 'POST',
            body: JSON.stringify({
                content: formData.get('content'),
                due_date: formData.get('due_date'),
                user_id: user.id
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            throw new Error('Error adding task');
        })
        .then(data => {
            const newRow = taskTable.insertRow(-1);
            newRow.insertCell(0).textContent = formData.get('content');
            newRow.insertCell(1).textContent = new Date().toLocaleDateString();
            newRow.insertCell(2).textContent = formData.get('due_date') ? new Date(formData.get('due_date')).toLocaleDateString() : 'No due date';
            const actionsCell = newRow.insertCell(3);
            const deleteButton = document.createElement('a');
            deleteButton.href = `/delete/${data.task.id}`;
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('button', 'delete');
            const updateButton = document.createElement('a');
            updateButton.href = `/update/${data.task.id}`;
            updateButton.textContent = 'Update';
            updateButton.classList.add('button', 'update');
            actionsCell.appendChild(deleteButton);
            actionsCell.appendChild(updateButton);
            noTasksMessage.style.display = 'none';
            taskForm.reset();
        })
        .catch(error => console.error('Error adding task:', error));
    });
});