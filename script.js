let tasks = JSON.parse(localStorage.getItem("taskflowTasks")) || [];

// Elements
const addTaskBtn = document.getElementById("addTaskBtn");
const taskModal = document.getElementById("taskModal");
const closeModal = document.getElementById("closeModal");
const taskForm = document.getElementById("taskForm");

const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const sortSelect = document.getElementById("sortSelect");

const quickTask = document.getElementById("quickTask");
const quickAddBtn = document.getElementById("quickAddBtn");

// Dashboard statistics
const projectCount = document.getElementById("projectCount");
const taskCount = document.getElementById("taskCount");
const completedCount = document.getElementById("completedCount");
const pendingCount = document.getElementById("pendingCount");
const taskStatus = document.getElementById("taskStatus");


// Open modal
addTaskBtn.addEventListener("click", () => {
    taskModal.style.display = "flex";
});


// Close modal
closeModal.addEventListener("click", () => {
    taskModal.style.display = "none";
});


// Close modal by clicking outside
taskModal.addEventListener("click", (e) => {
    if (e.target === taskModal) {
        taskModal.style.display = "none";
    }
});


// Add Task
taskForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const title = document.getElementById("taskTitle").value.trim();
    const project = document.getElementById("taskProject").value.trim();
    const priority = document.getElementById("taskPriority").value;
    const dueDate = document.getElementById("taskDueDate").value;

    const task = {
        id: Date.now(),
        title,
        project,
        priority,
        dueDate,
        completed: false
    };

    tasks.push(task);

    saveTasks();
    taskForm.reset();
    taskModal.style.display = "none";

    renderTasks();
});


// Save tasks
function saveTasks() {
    localStorage.setItem("taskflowTasks", JSON.stringify(tasks));
}


// Render tasks
function renderTasks() {

    let filteredTasks = [...tasks];

    // Search
    const searchText = searchInput.value.toLowerCase().trim();

    if (searchText) {
        filteredTasks = filteredTasks.filter(task =>
            task.title.toLowerCase().includes(searchText) ||
            task.project.toLowerCase().includes(searchText)
        );
    }


    // Sort
    const sortType = sortSelect.value;

    if (sortType === "priority") {

        const order = {
            High: 1,
            Medium: 2,
            Low: 3
        };

        filteredTasks.sort(
            (a, b) => order[a.priority] - order[b.priority]
        );

    } else if (sortType === "date") {

        filteredTasks.sort((a, b) => {
            return (a.dueDate || "9999") > (b.dueDate || "9999") ? 1 : -1;
        });

    } else if (sortType === "status") {

        filteredTasks.sort(
            (a, b) => Number(a.completed) - Number(b.completed)
        );
    }


    // Empty state
    if (filteredTasks.length === 0) {

        taskList.innerHTML = `
            <div class="empty-state">
                <h3>No tasks found</h3>
                <p>Add a task or change your search.</p>
            </div>
        `;

    } else {

        taskList.innerHTML = filteredTasks.map(task => {

            return `
                <div class="task-card">

                    <div class="task-info">

                        <h3 class="${task.completed ? "completed" : ""}">
                            ${escapeHTML(task.title)}
                        </h3>

                        <p>
                            📁 ${escapeHTML(task.project)}
                            ${task.dueDate ? ` • 📅 ${task.dueDate}` : ""}
                        </p>

                        <span class="priority ${task.priority}">
                            ${task.priority} Priority
                        </span>

                    </div>

                    <div class="task-actions">

                        <button
                            class="complete-btn"
                            onclick="toggleComplete(${task.id})">
                            ${task.completed ? "Undo" : "Complete"}
                        </button>

                        <button
                            class="edit-btn"
                            onclick="editTask(${task.id})">
                            Edit
                        </button>

                        <button
                            class="delete-btn"
                            onclick="deleteTask(${task.id})">
                            Delete
                        </button>

                    </div>

                </div>
            `;
        }).join("");
    }

    updateStats();
}


// Complete / Undo
function toggleComplete(id) {

    const task = tasks.find(task => task.id === id);

    if (task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}


// Delete
function deleteTask(id) {

    const confirmDelete = confirm("Are you sure you want to delete this task?");

    if (!confirmDelete) return;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();
    renderTasks();
}


// Edit
function editTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    const newTitle = prompt("Enter new task title:", task.title);

    if (newTitle === null || newTitle.trim() === "") {
        return;
    }

    task.title = newTitle.trim();

    saveTasks();
    renderTasks();
}


// Quick Add
quickAddBtn.addEventListener("click", () => {

    const text = quickTask.value.trim();

    if (!text) {
        alert("Please enter a task.");
        return;
    }

    const lowerText = text.toLowerCase();

    let priority = "Medium";

    if (lowerText.includes("high")) {
        priority = "High";
    } else if (lowerText.includes("low")) {
        priority = "Low";
    }


    // Detect tomorrow
    let dueDate = "";

    if (lowerText.includes("tomorrow") || lowerText.includes("kal")) {

        const date = new Date();
        date.setDate(date.getDate() + 1);

        dueDate = date.toISOString().split("T")[0];
    }


    // Remove common priority words from title
    let title = text
        .replace(/high priority/gi, "")
        .replace(/medium priority/gi, "")
        .replace(/low priority/gi, "")
        .trim();


    const task = {
        id: Date.now(),
        title: title,
        project: "Quick Add",
        priority: priority,
        dueDate: dueDate,
        completed: false
    };

    tasks.push(task);

    saveTasks();

    quickTask.value = "";

    renderTasks();
});


// Search
searchInput.addEventListener("input", renderTasks);


// Sort
sortSelect.addEventListener("change", renderTasks);


// Dashboard statistics
function updateStats() {

    const completed = tasks.filter(task => task.completed).length;
    const pending = tasks.length - completed;

    const projects = new Set(
        tasks.map(task => task.project)
    ).size;

    projectCount.textContent = projects;
    taskCount.textContent = tasks.length;
    completedCount.textContent = completed;
    pendingCount.textContent = pending;

   taskStatus.textContent = 
   `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"}`;
}
// Prevent HTML injection
function escapeHTML(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// Initial display
renderTasks();