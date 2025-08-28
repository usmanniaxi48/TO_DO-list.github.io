document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    loadTasks();
    loadThemePreference();
    
    // Event listeners
    document.getElementById('addTaskBtn').addEventListener('click', addTask);
    document.getElementById('taskInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
    document.getElementById('toggleThemeBtn').addEventListener('click', toggleTheme);
}

function addTask() {
    const taskInput = document.getElementById('taskInput');
    const taskText = taskInput.value.trim();
    
    if (!taskText) {
        showError('Please enter a task!');
        taskInput.focus();
        return;
    }
    
    const taskList = document.getElementById('taskList');
    const li = createTaskElement(taskText);
    taskList.appendChild(li);
    
    taskInput.value = '';
    taskInput.focus();
    saveTasks();
    
    hideError();
}

function createTaskElement(taskText, isCompleted = false) {
    const li = document.createElement('li');
    
    const taskContent = document.createElement('div');
    taskContent.className = 'task-content';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isCompleted;
    checkbox.addEventListener('change', function() {
        toggleTaskCompletion(li, checkbox.checked);
    });
    
    const taskSpan = document.createElement('span');
    taskSpan.className = 'task-text';
    taskSpan.textContent = taskText;
    if (isCompleted) {
        taskSpan.classList.add('completed');
    }
    
    const taskActions = document.createElement('div');
    taskActions.className = 'task-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'edit-btn';
    editBtn.textContent = '✏️ Edit';
    editBtn.addEventListener('click', function() {
        editTask(li, taskSpan);
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '🗑️ Delete';
    deleteBtn.addEventListener('click', function() {
        li.remove();
        saveTasks();
    });
    
    taskContent.appendChild(checkbox);
    taskContent.appendChild(taskSpan);
    taskActions.appendChild(editBtn);
    taskActions.appendChild(deleteBtn);
    li.appendChild(taskContent);
    li.appendChild(taskActions);
    
    return li;
}

function toggleTaskCompletion(li, isCompleted) {
    const taskSpan = li.querySelector('.task-text');
    if (isCompleted) {
        taskSpan.classList.add('completed');
    } else {
        taskSpan.classList.remove('completed');
    }
    saveTasks();
}

function editTask(li, taskSpan) {
    const currentText = taskSpan.textContent;
    const input = document.createElement('input');
    input.type = 'text';
    input.value = currentText;
    input.className = 'edit-input';
    
    const taskContent = li.querySelector('.task-content');
    taskContent.replaceChild(input, taskSpan);
    input.focus();
    input.select();
    
    const saveEditHandler = function() {
        saveEdit(li, input);
        input.removeEventListener('keypress', keypressHandler);
        input.removeEventListener('blur', blurHandler);
    };
    
    const keypressHandler = function(e) {
        if (e.key === 'Enter') {
            saveEditHandler();
        }
    };
    
    const blurHandler = function() {
        saveEditHandler();
    };
    
    input.addEventListener('keypress', keypressHandler);
    input.addEventListener('blur', blurHandler);
}

function saveEdit(li, input) {
    const newText = input.value.trim();
    if (newText) {
        const taskSpan = document.createElement('span');
        taskSpan.className = 'task-text';
        taskSpan.textContent = newText;
        
        const checkbox = li.querySelector('input[type="checkbox"]');
        if (checkbox.checked) {
            taskSpan.classList.add('completed');
        }
        
        const taskContent = li.querySelector('.task-content');
        taskContent.replaceChild(taskSpan, input);
        
        taskSpan.addEventListener('click', function() {
            editTask(li, taskSpan);
        });
        
        saveTasks();
    } else {
        li.remove();
        saveTasks();
    }
}

function saveTasks() {
    const tasks = [];
    const taskItems = document.querySelectorAll('#taskList li');
    
    taskItems.forEach(li => {
        const taskText = li.querySelector('.task-text').textContent;
        const isCompleted = li.querySelector('input[type="checkbox"]').checked;
        tasks.push({
            text: taskText,
            completed: isCompleted
        });
    });
    
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
        try {
            const tasks = JSON.parse(savedTasks);
            const taskList = document.getElementById('taskList');
            taskList.innerHTML = '';
            
            tasks.forEach(task => {
                const li = createTaskElement(task.text, task.completed);
                taskList.appendChild(li);
            });
        } catch (error) {
            console.error('Error loading tasks:', error);
            showError('Error loading saved tasks');
        }
    }
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDarkMode = document.body.classList.contains('dark-mode');
    localStorage.setItem('darkMode', isDarkMode);
    
    const themeBtn = document.getElementById('toggleThemeBtn');
    themeBtn.textContent = isDarkMode ? '☀️ Toggle Light Mode' : '🌙 Toggle Dark Mode';
}

function loadThemePreference() {
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        document.getElementById('toggleThemeBtn').textContent = '☀️ Toggle Light Mode';
    }
}

function showError(message) {
    hideError();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const container = document.querySelector('.container');
    const inputGroup = document.querySelector('.input-group');
    container.insertBefore(errorDiv, inputGroup.nextSibling);
    
    setTimeout(hideError, 3000);
}

function hideError() {
    const errorDiv = document.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}
