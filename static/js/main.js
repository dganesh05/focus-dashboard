document.addEventListener('DOMContentLoaded', () => {
    // To-Do List
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    // No longer a single doneTasksList, handled per category
    const tabs = document.querySelectorAll('.tab-button');

    let currentCategory = 'inbox'; // Default category

    // Timer
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const resetBtn = document.getElementById('resetBtn');
    const timerSection = document.querySelector('.timer-section');
    const timeAdjustBtns = document.querySelectorAll('.time-adjust-btn');

    let timerInterval;
    let timeLeft = 0;
    let initialTime = 0;
    let isTimerActive = false;
    let isPaused = false;

    // --- To-Do List Functions ---
    async function fetchTasks(category) {
        const response = await fetch(`/tasks?category=${category}`);
        const tasks = await response.json();
        document.getElementById('inbox-tasks-list').innerHTML = '';
        document.getElementById('daily-tasks-list').innerHTML = '';
        document.getElementById('weekly-tasks-list').innerHTML = '';
        document.getElementById('monthly-tasks-list').innerHTML = '';
        document.getElementById('inbox-done-tasks-list').innerHTML = '';
        document.getElementById('daily-done-tasks-list').innerHTML = '';
        document.getElementById('weekly-done-tasks-list').innerHTML = '';
        document.getElementById('monthly-done-tasks-list').innerHTML = '';

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.classList.add('task-item');
            li.dataset.id = task.id;

            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = task.status;
            checkbox.addEventListener('change', () => toggleTask(task.id, checkbox.checked));

            const taskName = document.createElement('span');
            taskName.textContent = task.task_name;
            taskName.style.margin = '0 10px';
            taskName.style.flex = '1';

            const categoryDropdown = document.createElement('select');
            categoryDropdown.classList.add('category-dropdown');
            categoryDropdown.dataset.taskId = task.id;

            const categories = ['inbox', 'daily', 'weekly', 'monthly'];
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category;
                option.textContent = category.charAt(0).toUpperCase() + category.slice(1);
                if (task.category === category) {
                    option.selected = true;
                }
                categoryDropdown.appendChild(option);
            });

            categoryDropdown.addEventListener('change', (event) => updateTaskCategory(task.id, event.target.value));

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.addEventListener('click', () => editTask(li, task.id, taskName, editBtn));

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => deleteTask(task.id));

            li.appendChild(checkbox);
            li.appendChild(taskName);
            li.appendChild(categoryDropdown);
            li.appendChild(editBtn);
            li.appendChild(deleteBtn);

            if (task.status) {
                document.getElementById(`${task.category}-done-tasks-list`).appendChild(li);
            } else {
                document.getElementById(`${task.category}-tasks-list`).appendChild(li);
            }
        });
    }

    async function addTask() {
        const task = taskInput.value.trim();
        if (task) {
            await fetch('/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ task, category: currentCategory })
            });
            taskInput.value = '';
            fetchTasks(currentCategory);
        }
    }

    async function toggleTask(id, isDone) {
        await fetch(`/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: isDone })
        });
        fetchTasks(currentCategory);
    }

    function editTask(li, id, label, editBtn) {
        const currentText = label.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        li.replaceChild(input, label);
        editBtn.textContent = 'Done';

        const saveChanges = async () => {
            const newTask = input.value.trim();
            if (newTask && newTask !== currentText) {
                await fetch(`/tasks/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ task: newTask })
                });
            }
            fetchTasks(currentCategory);
        };

        editBtn.onclick = saveChanges;

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveChanges();
            }
        });

        input.addEventListener('blur', saveChanges);

        input.focus();
    }

    async function deleteTask(id) {
        await fetch(`/tasks/${id}`, {
            method: 'DELETE'
        });
        fetchTasks(currentCategory);
    }

    async function updateTaskCategory(id, newCategory) {
        await fetch(`/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ category: newCategory })
        });
        fetchTasks(currentCategory);
    }

    // --- Timer Functions ---
    function adjustTime(unit, change) {
        let hours = parseInt(hoursEl.textContent, 10);
        let minutes = parseInt(minutesEl.textContent, 10);
        let seconds = parseInt(secondsEl.textContent, 10);

        switch (unit) {
            case 'hours':
                hours = Math.max(0, hours + change);
                break;
            case 'minutes':
                minutes += change;
                if (minutes > 59) minutes = 0;
                if (minutes < 0) minutes = 59;
                break;
            case 'seconds':
                seconds += change;
                if (seconds > 59) seconds = 0;
                if (seconds < 0) seconds = 59;
                break;
        }

        hoursEl.textContent = hours.toString().padStart(2, '0');
        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');
    }

    function updateTimerDisplay() {
        const hours = Math.floor(timeLeft / 3600);
        const minutes = Math.floor((timeLeft % 3600) / 60);
        const seconds = timeLeft % 60;

        hoursEl.textContent = hours.toString().padStart(2, '0');
        minutesEl.textContent = minutes.toString().padStart(2, '0');
        secondsEl.textContent = seconds.toString().padStart(2, '0');
    }

    function startTimer() {
        if (isTimerActive) return;

        const hours = parseInt(hoursEl.textContent, 10);
        const minutes = parseInt(minutesEl.textContent, 10);
        const seconds = parseInt(secondsEl.textContent, 10);

        timeLeft = hours * 3600 + minutes * 60 + seconds;
        initialTime = timeLeft;

        if (timeLeft > 0) {
            isTimerActive = true;
            isPaused = false;
            timerSection.classList.add('timer-active');
            pauseBtn.textContent = 'Pause';

            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateTimerDisplay();
                } else {
                    clearInterval(timerInterval);
                    isTimerActive = false;
                    timerSection.classList.remove('timer-active');
                    pauseBtn.textContent = 'Pause';
                }
            }, 1000);
        }
    }

    function togglePause() {
        if (!isTimerActive || timeLeft === 0) return;

        if (isPaused) {
            isPaused = false;
            pauseBtn.textContent = 'Pause';
            timerInterval = setInterval(() => {
                if (timeLeft > 0) {
                    timeLeft--;
                    updateTimerDisplay();
                } else {
                    clearInterval(timerInterval);
                    isTimerActive = false;
                    timerSection.classList.remove('timer-active');
                    pauseBtn.textContent = 'Pause';
                }
            }, 1000);
        } else {
            isPaused = true;
            pauseBtn.textContent = 'Unpause';
            clearInterval(timerInterval);
        }
    }

    function stopTimer() {
        clearInterval(timerInterval);
        isTimerActive = false;
        isPaused = false;
        timeLeft = 0;
        initialTime = 0;
        updateTimerDisplay();
        timerSection.classList.remove('timer-active');
        pauseBtn.textContent = 'Pause';
    }

    function resetTimer() {
        if (!isTimerActive) return;
        timeLeft = initialTime;
        updateTimerDisplay();
    }

    // --- YouTube Player Functions ---
    const youtubeUrl = document.getElementById('youtubeUrl');
    const loadVideoBtn = document.getElementById('loadVideoBtn');
    const youtubeIframe = document.getElementById('youtubeIframe');
    const videoContainer = document.querySelector('.video-container');

    function loadVideo() {
        const url = youtubeUrl.value.trim();
        let videoId = '';

        if (url.includes('youtube.com/watch?v=')) {
            videoId = url.split('v=')[1].split('&')[0];
        } else if (url.includes('youtu.be/')) {
            videoId = url.split('youtu.be/')[1];
        } else if (url.includes('youtube.com/live/')) {
            videoId = url.split('youtube.com/live/')[1].split('/')[0];
        }

        if (videoId) {
            const embedUrl = `https://www.youtube.com/embed/${videoId}`;
            youtubeIframe.src = embedUrl;
            videoContainer.classList.remove('empty');
            youtubeIframe.style.display = 'block';
        } else {
            youtubeIframe.src = '';
            videoContainer.classList.add('empty');
            youtubeIframe.style.display = 'none';
        }
    }

    // --- Event Listeners ---
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentCategory = tab.textContent.toLowerCase();

            // Hide all task category sections
            document.querySelectorAll('.task-category-section').forEach(section => {
                section.style.display = 'none';
            });

            // Show the selected category's section
            document.getElementById(`${currentCategory}-tasks-section`).style.display = 'block';

            fetchTasks(currentCategory);
        });
    });

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTask();
        }
    });

    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', togglePause);
    stopBtn.addEventListener('click', stopTimer);
    resetBtn.addEventListener('click', resetTimer);
    loadVideoBtn.addEventListener('click', loadVideo);

    timeAdjustBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!isTimerActive) {
                const unit = btn.dataset.unit;
                const change = parseInt(btn.dataset.change, 10);
                adjustTime(unit, change);
            }
        });
    });

    // Initial Load
    fetchTasks(currentCategory);
    updateTimerDisplay();

    // Collapsible sections
    document.querySelectorAll('.collapsible-header').forEach(header => {
        header.addEventListener('click', () => {
            const targetId = header.dataset.target;
            const content = document.getElementById(targetId);
            const icon = header.querySelector('.collapse-icon');

            content.classList.toggle('collapsed');
            if (content.classList.contains('collapsed')) {
                icon.textContent = '►';
            } else {
                icon.textContent = '▼';
            }
        });
    });
});