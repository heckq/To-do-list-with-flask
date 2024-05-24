document.addEventListener('DOMContentLoaded', function () {
    const taskTable = document.getElementById('task-table');
    const noTasksMessage = document.getElementById('no-tasks');

    const user = JSON.parse(localStorage.getItem('user')); // Assuming user info is stored in localStorage
    const userId = user.id;

    fetch(`http://127.0.0.1:5000/tasks?user_id=${userId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
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
                    deleteButton.href = '#';
                    deleteButton.textContent = 'Delete';
                    deleteButton.classList.add('button', 'delete');
                    deleteButton.addEventListener('click', function (event) {
                        event.preventDefault();
                        deleteTask(task.id, row);
                    });
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

        fetch('http://127.0.0.1:5000/tasks', {
            method: 'POST',
            body: JSON.stringify({
                content: formData.get('content'),
                due_date: formData.get('due_date'),
                user_id: userId
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error) });
            }
            return response.json();
        })
        .then(data => {
            const newRow = taskTable.insertRow(-1);
            newRow.insertCell(0).textContent = formData.get('content');
            newRow.insertCell(1).textContent = new Date().toLocaleDateString();
            newRow.insertCell(2).textContent = formData.get('due_date') ? new Date(formData.get('due_date')).toLocaleDateString() : 'No due date';
            const actionsCell = newRow.insertCell(3);
            const deleteButton = document.createElement('a');
            deleteButton.href = '#';
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('button', 'delete');
            deleteButton.addEventListener('click', function (event) {
                event.preventDefault();
                deleteTask(data.task.id, newRow);
            });
            const updateButton = document.createElement('a');
            updateButton.href = `/update/${data.task.id}`;
            updateButton.textContent = 'Update';
            updateButton.classList.add('button', 'update');
            actionsCell.appendChild(deleteButton);
            actionsCell.appendChild(updateButton);
            noTasksMessage.style.display = 'none';
            taskForm.reset();
        })
        .catch(error => {
            console.error('Error adding task:', error);
            alert(`Error: ${error.message}`);
        });
    });

    function deleteTask(taskId, row) {
        fetch(`http://127.0.0.1:5000/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.error) });
            }
            return response.json();
        })
        .then(data => {
            taskTable.deleteRow(row.rowIndex);
            if (taskTable.rows.length === 1) {  
                noTasksMessage.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error deleting task:', error);
            alert(`Error: ${error.message}`);
        });
    }
});