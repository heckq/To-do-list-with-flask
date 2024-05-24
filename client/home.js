document.addEventListener('DOMContentLoaded', function () {
    const taskTable = document.getElementById('task-table');
    const noTasksMessage = document.getElementById('no-tasks');
    const prevPageButton = document.getElementById('prev-page');
    const nextPageButton = document.getElementById('next-page');
    let currentPage = 1;

    const user = JSON.parse(localStorage.getItem('user')); // Assuming user info is stored in localStorage
    const userId = user.id;

    function fetchTasks(page) {
        fetch(`http://127.0.0.1:5000/tasks?user_id=${userId}&page=${page}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Data received:", data); // Debug statement
                taskTable.innerHTML = ''; 
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
                } else {
                    noTasksMessage.style.display = 'block';
                }

                prevPageButton.disabled = !data.has_prev;
                nextPageButton.disabled = !data.has_next;

                currentPage = page;
            })
            .catch(error => console.error('Error fetching tasks:', error));
    }

    fetchTasks(currentPage);

    prevPageButton.addEventListener('click', function () {
        if (!prevPageButton.disabled) {
            fetchTasks(currentPage - 1);
        }
    });

    nextPageButton.addEventListener('click', function () {
        if (!nextPageButton.disabled) {
            fetchTasks(currentPage + 1);
        }
    });

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
            fetchTasks(currentPage);
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
