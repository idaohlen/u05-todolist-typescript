import "iconify-icon";
import "@fontsource-variable/sofia-sans";
import "@fontsource-variable/playwrite-us-trad";
import "./styles/style.scss";

import { getTodos, addTodo, deleteTodo, updateTodo, updateTodoCompletedStatus } from "./scripts/todos.ts";
import { supabase } from "./scripts/supabaseClient.ts";
import { registerUser, loginUser, logoutUser } from "./scripts/userAuth.ts";

import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";

const appContainer = document.querySelector("#app") as HTMLElement;

interface Todo {
  id: string;
  todo: string;
  category: string;
  completed: boolean;
  due_by: string | null;
  userId: number;
}


/* ---------------------------------------------- */
// LOGIN PAGE
/* ---------------------------------------------- */

function renderLoginPage() {
  appContainer.classList.remove("todolist-page");
  appContainer.classList.add("login-page");

  appContainer.innerHTML = `
    <header class="app-header">
      <h1>Todo List</h1>
      <iconify-icon icon="fa6-solid:pen-nib" class="app-header__icon"></iconify-icon>
    </header>
    <div class="login-form">
      <div class="login-form__row">
        <iconify-icon icon="solar:letter-outline" class="login-form__icon"></iconify-icon>
        <input type="email" placeholder="email" id="emailInput">
      </div>
      <div class="login-form__row">
        <iconify-icon icon="solar:lock-password-outline" class="login-form__icon"></iconify-icon>
        <input type="password" placeholder="password" id="passwordInput">
      </div>
      <div id="errorMessage" class="error-message"></div>
      <div class="login-form__buttons">
        <button id="registerUserBtn" class="btn btn--outline">Register</button>
        <button id="loginBtn" class="btn">Login</button>
      </div>
    </div>
  `;

  const registerUserBtn = document.getElementById("registerUserBtn") as HTMLElement;
  const loginBtn = document.getElementById("loginBtn") as HTMLElement;

  registerUserBtn?.addEventListener("click", handleRegisterUser); // register new user
  loginBtn?.addEventListener("click", handleUserLogin);           // log in existing user
}

// Register a new user
async function handleRegisterUser() {
  const email = (document.getElementById("emailInput") as HTMLInputElement).value;
  const password = (document.getElementById("passwordInput") as HTMLInputElement).value;
  const errorMessage = document.getElementById("errorMessage") as HTMLElement;
  
  errorMessage.textContent = "";

  try {
    await registerUser(email, password);
    renderListPage();
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message.includes("User already exists")) {
      errorMessage.textContent = "User already exists. Please try logging in.";
    } else {
      errorMessage.textContent = "An error occurred. Please try again.";
    }
  }
}

// Log in an existing user
async function handleUserLogin() {
  const email = (document.getElementById("emailInput") as HTMLInputElement).value;
  const password = (document.getElementById("passwordInput") as HTMLInputElement).value;
  const errorMessage = document.getElementById("errorMessage") as HTMLElement;

  errorMessage.textContent = "";

  try {
    await loginUser(email, password);
    renderListPage();
  } catch (error) {
    console.error(error);
    errorMessage.textContent = "Incorrect email or password. Please try again.";
  }
}

// Log out user
async function HandleUserLogout() {
  console.log("logging out...");
  try {
    await logoutUser();
    renderLoginPage();
  } catch (error) {
    console.error(error);
  }
}


/* ---------------------------------------------- */
// TODOLIST PAGE
/* ---------------------------------------------- */

// Render page with user's todo-list
async function renderListPage() {
  appContainer.classList.remove("login-page");
  appContainer.classList.add("todolist-page");

  appContainer.innerHTML = `
    <header class="app-header">
      <h1>Todo List</h1>
      <iconify-icon icon="fa6-solid:pen-nib" class="app-header__icon"></iconify-icon>
      <div class="settings-container">
        <button id="settingsBtn" class="settings-btn" title="Settings">
          <iconify-icon icon="solar:settings-outline"></iconify-icon>
        </button>
        <div id="settingsMenu" class="settings-menu">
          <button id="editCategoriesBtn" class="settings-menu__item">Edit categories</button>
          <button id="deleteUserBtn" class="settings-menu__item">Delete user</button>
          <button id="logoutBtn" class="settings-menu__item">Logout</button>
        </div>
      </div>
    </header>

    <div class="new-todo">
      <form id="newTodoForm" class="new-todo__form">
        <iconify-icon icon="solar:menu-dots-bold" id="chooseCategoryBtn" class="new-todo__icon"></iconify-icon>
        <input type="text" class="new-todo__input" id="todoInput" placeholder="Take the dog for a walk...">
        <input type="text" id="dueByInput" class="hidden-input">
        <button id="dueByBtn" class="new-todo__dueby-btn"><iconify-icon icon="solar:calendar-bold"></iconify-icon></button>
        <button id="addTodoBtn" class="new-todo__add-btn"><iconify-icon icon="solar:add-circle-bold"></iconify-icon></button>
      </form>
    </div>

    <div class="todos-container"></div>

    <div class="categories-container">
        <iconify-icon icon="solar:home-bold" class="category-icon"></iconify-icon>
        <iconify-icon icon="solar:home-bold" class="category-icon"></iconify-icon>
        <iconify-icon icon="solar:home-bold" class="category-icon"></iconify-icon>
        <iconify-icon icon="solar:home-bold" class="category-icon"></iconify-icon>
        <iconify-icon icon="solar:home-bold" class="category-icon"></iconify-icon>
    </div>

    <dialog id="editTodoDialog" class="todo-dialog">
    <button id="cancelBtn" value="cancel" class="todo-dialog__cancel-btn">
      <iconify-icon icon="icon-park-outline:close-one" class="icon"></iconify-icon>
    </button>
      <form method="dialog">
        <h2 class="todo-dialog__heading">Edit todo</h2>
        <div class="todo-dialog__form-inputs">
          <input type="text" id="editTodoInput" class="todo-dialog__todo-input">
          <input type="text" id="editDueByInput" class="hidden-input">
          <button id="editDueByInputBtn" class="new-todo__dueby-btn edit-todo__dueby-btn">
            <iconify-icon icon="solar:calendar-bold"></iconify-icon>
          </button>
        </div>
        <div class="todo-dialog__actions">
          <button id="deleteTodoBtn" value="delete" class="todo-dialog__delete-btn">Delete</button>
          <button id="saveTodoBtn" value="save" class="todo-dialog__save-btn">Save</button>
        </div>
      </form>
    </dialog>
  `;

  // SETTINGS MENU

  const settingsBtn = document.getElementById("settingsBtn") as HTMLInputElement;
  const logoutBtn = document.getElementById("logoutBtn") as HTMLInputElement;
  const editCategoriesBtn = document.getElementById("editCategoriesBtn") as HTMLInputElement;
  const deleteUserBtn = document.getElementById("deleteUserBtn") as HTMLInputElement;

  settingsBtn?.addEventListener("click", toggleSettingsMenu);
  editCategoriesBtn?.addEventListener("click", editCategories);
  deleteUserBtn?.addEventListener("click", deleteUser);
  logoutBtn?.addEventListener("click", HandleUserLogout);

  // NEW TODO FORM

  const todoForm = document.getElementById("newTodoForm") as HTMLFormElement;
  const dueByBtn = document.getElementById("dueByBtn") as HTMLFormElement;
  const todoInput = document.getElementById("todoInput") as HTMLInputElement;
  const dueByInput = document.getElementById("dueByInput") as HTMLInputElement;

  // Apply flatpickr to due-by input element
  const fp = flatpickr(dueByInput, {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    position: "auto",
    positionElement: dueByBtn,
    // Display a clear button in the calendar window
    onReady: (_selectedDates, _dateStr, instance) => {
      const clearButton = document.createElement("button");
      clearButton.type = "button";
      clearButton.className = "flatpickr-clear";
      clearButton.textContent = "Clear";
      clearButton.addEventListener("click", () => {
        instance.clear();
        instance.close();
      });
      instance.calendarContainer.appendChild(clearButton);
    },
    // Change color of the calendar icon depending on input value
    onChange: (_selectedDates, dateStr, _instance) => {
      if (dateStr) {
        dueByBtn.classList.add("has-value");
      } else {
        dueByBtn.classList.remove("has-value");
      }
    }
  });

  // Open/close flatpickr calendar window
  // TODO: not working properly
  dueByBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (fp.isOpen) fp.close();
    else fp.open();
  });

  // New todo form submission
  todoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const dueBy = dueByInput.value ? new Date(dueByInput.value).toISOString() : null;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      try {
        if (!todoInput.value.trim()) throw new Error("Todo cannot be empty.");

        await addTodo(todoInput.value, user.id, "", dueBy);
        const todos = await getTodos(user.id);

        todoInput.value = "";
        dueByInput.value = "";
        dueByBtn.classList.remove("has-value");

        renderTodos(todos);
      } catch (e) {
        console.log(e);
      }
    }
  });

  // EDIT TODO

  const editDueByInput = document.getElementById("editDueByInput") as HTMLInputElement;
  const editDueByInputBtn = document.getElementById("editDueByInputBtn") as HTMLInputElement;
  const editTodoDialog = document.getElementById("editTodoDialog") as HTMLElement;

  const fpEdit = flatpickr(editDueByInput, {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    position: "auto",
    positionElement: editDueByInputBtn,
    appendTo: editTodoDialog,

    // Display a clear button in the calendar window
    onReady: (_selectedDates, _dateStr, instance) => {
      const clearButton = document.createElement("button");
      clearButton.type = "button";
      clearButton.className = "flatpickr-clear";
      clearButton.textContent = "Clear";
      clearButton.addEventListener("click", () => {
        instance.clear();
        instance.close();
      });
      instance.calendarContainer.appendChild(clearButton);
      instance.calendarContainer.style.position = "fixed";
    },
    // Change color of the calendar icon depending on input value
    onChange: (_selectedDates, dateStr, _instance) => {
      if (dateStr) {
        editDueByInputBtn.classList.add("has-value");
      } else {
        editDueByInputBtn.classList.remove("has-value");
      }
    }
  });

  editDueByInputBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    if (fpEdit.isOpen) fpEdit.close();
    else fpEdit.open();
  });

  // RENDER TODOS
  // Fetch and render todos on page render
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const todos = await getTodos(user.id);
    renderTodos(todos);
  }
}

// Render todos in the todos-container
async function renderTodos(todos: Todo[]) {
  const todosContainer = document.querySelector(".todos-container") as HTMLElement;

  const todoList = todos.map(({ id, todo, completed, due_by }: Todo) => {
    // Format due-date to spec. formatting
    const formattedDueBy = due_by ? new Date(due_by).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }) + ", " + new Date(due_by).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }) : "";

    return `
      <div class="todo ${completed ? "completed" : ""}" data-todo-id="${id}">
        <div class="todo__icon"><iconify-icon icon="solar:menu-dots-bold"></iconify-icon></div>
        <div class="todo__info">
          <div class="todo__title">${todo}</div>
          ${formattedDueBy ? `<div class="todo__due-date pill">${formattedDueBy}</div>` : ''}
        </div>
        <label class="todo__checkbox">
          <input type="checkbox" ${completed ? "checked" : ""}>
          <span class="checkmark">
            <iconify-icon icon="fa:check" class="check-icon"></iconify-icon>
          </span>
        </label>
      </div>`;
  }).join("");

  todosContainer.innerHTML = todoList;

  // Event delegator for todos-container
  todosContainer.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;

    // Handle checkbox change
    if (target.matches(".todo__checkbox input[type='checkbox']")) {
      const checkbox = target as HTMLInputElement;
      handleupdateTodoCompletedStatus(checkbox);
    }

    if (target.closest(".todo") && !target.closest(".todo__checkbox")) {
      handleEditTodo(target.closest(".todo") as HTMLElement);
    }
  });
}

async function handleEditTodo(todoElement: HTMLElement) {
  const editTodoDialog = document.getElementById("editTodoDialog") as HTMLDialogElement;
  const editTodoInput = document.getElementById("editTodoInput") as HTMLInputElement;
  const editDueByInput = document.getElementById("editDueByInput") as HTMLInputElement;
  const editDueByInputBtn = document.getElementById("editDueByInputBtn") as HTMLInputElement;
  const saveTodoBtn = document.getElementById("saveTodoBtn") as HTMLButtonElement;
  const deleteTodoBtn = document.getElementById("deleteTodoBtn") as HTMLButtonElement;
  const cancelBtn = document.getElementById("cancelBtn") as HTMLButtonElement;

  const todoId = todoElement.dataset.todoId;
  if (!todoId) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const todos = await getTodos(user.id);
  const todo = todos.find(t => t.id === todoId);
  if (!todo) return;

  editTodoInput.value = todo.todo;
  editDueByInput.value = todo.due_by ? new Date(todo.due_by).toISOString().slice(0, 16) : "";

  // Add class depending on if todo has due by date or not
  if (todo.due_by) editDueByInputBtn.classList.add("has-value");
  else editDueByInputBtn.classList.remove("has-value");

  editTodoDialog.showModal();

  // Close dialog when clicking on the backdrop
  editTodoDialog.addEventListener("click", (e) => {
    if (e.target === editTodoDialog) {
      editTodoDialog.close();
    }
  });

  // Save todo edits
  saveTodoBtn.onclick = async () => {
    const updatedTodo = editTodoInput.value.trim();
    const updatedDueBy = editDueByInput.value ? new Date(editDueByInput.value).toISOString() : null;

    try {
      await updateTodo(todoId, updatedTodo, updatedDueBy);
      const todos = await getTodos(user.id);
      renderTodos(todos);
      editTodoDialog.close();
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  // Delete current todo in edit modal
  deleteTodoBtn.onclick = async () => {
    try {
      await deleteTodo(todoId);
      const todos = await getTodos(user.id);
      renderTodos(todos);
      editTodoDialog.close();
    } catch (error) {
      console.error("Error deleting todo:", error);
    }
  };

  // Cancel todo edit/close modal
  cancelBtn.onclick = () => {
    editTodoDialog.close();
  };
}

// Handler for checking/unchecking a todo checkbox
async function handleupdateTodoCompletedStatus(checkbox: HTMLInputElement) {
  const todoElement = checkbox.closest(".todo") as HTMLElement;
  if (!todoElement) return; // check that parent todo element exists

  const todoId = todoElement.dataset.todoId;
  if (!todoId) return; // check that data-todo-id attribute is defined

  const completed = checkbox.checked;

  try {
    await updateTodoCompletedStatus(todoId, completed);
    
    if (completed) {
      todoElement.classList.add("completed");
    } else {
      todoElement.classList.remove("completed");
    }
  } catch (error) {
    console.error("Error updating todo status:", error);
    checkbox.checked = !completed;
  }
}


/* ---------------------------------------------- */
// SETTINGS MENU
/* ---------------------------------------------- */

function toggleSettingsMenu() {
  const settingsMenu = document.getElementById("settingsMenu") as HTMLElement;
  settingsMenu.classList.toggle("show");
}

function editCategories() {
  console.log("Edit Categories clicked");
}

function deleteUser() {
  console.log("Delete User clicked");
}


/* ---------------------------------------------- */
// INIT CODE
/* ---------------------------------------------- */

// Check user status on page load and render relevant page content
// If true, render the todolist for the user.
// If false, render the login page.

async function checkUserStatus() {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) renderListPage();
  else renderLoginPage();
}

checkUserStatus();