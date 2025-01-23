// Styling
import "@fontsource-variable/sofia-sans";
import "@fontsource-variable/playwrite-us-trad";
import "./styles/style.scss";

// Libraries
import "iconify-icon";
import { supabase } from "./scripts/supabaseClient.ts";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";

// Pages / Components
import LoginPage from "./scripts/renderHTML/LoginPage.ts";
import ListPage from "./scripts/renderHTML/ListPage.ts";
import TodoElement from "./scripts/renderHTML/TodoElement.ts";

// Scripts
import {
  getTodos,
  addTodo,
  deleteTodo,
  updateTodo,
  updateTodoCompletedStatus,
  deleteAllTodos
} from "./scripts/todos.ts";

import { registerUser, loginUser, logoutUser } from "./scripts/userAuth.ts";
// import { formatDate } from "./scripts/utils.ts";

// Models
import Todo from "./models/Todo.ts";

// HTML elements
const appContainer = document.querySelector("#app") as HTMLElement;


/* ---------------------------------------------- */
// LOGIN PAGE
/* ---------------------------------------------- */

function renderLoginPage() {
  appContainer.classList.remove("todolist-page");
  appContainer.classList.add("login-page");

  appContainer.innerHTML = LoginPage;

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
    if (error instanceof Error && error.message.includes("User already registered")) {
      errorMessage.textContent = "User with that email already exists. Please try logging in or use another email.";
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
    console.error("Error occured while trying to logout:", error);
  }
}


/* ---------------------------------------------- */
// TODOLIST PAGE
/* ---------------------------------------------- */

// Render page with user's todo-list
async function renderListPage() {
  appContainer.classList.remove("login-page");
  appContainer.classList.add("todolist-page");

  appContainer.innerHTML = ListPage;

  setupSettingsMenu();
  setupNewTodoForm();
  setupEditTodoModal();

  // Fetch and render todos on page render
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const todos = await getTodos(user.id);
    renderTodos(todos);
  }
}

// Render todos in the todos-container
async function renderTodos(todos: Todo[] = []) {
  const todosContainer = document.querySelector(".todos-container") as HTMLElement;
  const todoList = todos.map((todo: Todo) => TodoElement(todo)).join("");

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
// NEW TODO FORM
/* ---------------------------------------------- */

function setupNewTodoForm() {
  const todoForm = document.getElementById("newTodoForm") as HTMLFormElement;
  const dueByBtn = document.getElementById("dueByBtn") as HTMLFormElement;
  const todoInput = document.getElementById("todoInput") as HTMLInputElement;
  const dueByInput = document.getElementById("dueByInput") as HTMLInputElement;

  // Apply flatpickr to due by input element
  mountFlatpickr(dueByInput, dueByBtn);

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
}


/* ---------------------------------------------- */
// EDIT TODO
/* ---------------------------------------------- */

function setupEditTodoModal() {
  const editDueByInput = document.getElementById("editDueByInput") as HTMLInputElement;
  const editDueByInputBtn = document.getElementById("editDueByInputBtn") as HTMLInputElement;
  const editTodoDialog = document.getElementById("editTodoDialog") as HTMLElement;

  // Apply flatpickr to due by input element in editing modal
  mountFlatpickr(editDueByInput, editDueByInputBtn, editTodoDialog);
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

/* ---------------------------------------------- */
// FLATPICKR
/* ---------------------------------------------- */

function mountFlatpickr(
  input: HTMLElement,
  button: HTMLElement,
  container: HTMLElement = document.body
) {
  const fp = flatpickr(input, {
    enableTime: true,
    dateFormat: "Y-m-d H:i",
    position: "auto",
    positionElement: button,
    appendTo: container,

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
        button.classList.add("has-value");
      } else {
        button.classList.remove("has-value");
      }
    }
  });

  // Open/close flatpickr calendar window
  button?.addEventListener("click", (e) => {
    e.preventDefault();
    if (fp.isOpen) fp.close();
    else fp.open();
  });

  return fp;
}


/* ---------------------------------------------- */
// SETTINGS MENU
/* ---------------------------------------------- */

function toggleSettingsMenu() {
  const settingsMenu = document.getElementById("settingsMenu") as HTMLElement;
  settingsMenu.classList.toggle("show");
}

function setupSettingsMenu() {
  const settingsBtn = document.getElementById("settingsBtn") as HTMLInputElement;
  const logoutBtn = document.getElementById("logoutBtn") as HTMLInputElement;
  const editCategoriesBtn = document.getElementById("editCategoriesBtn") as HTMLInputElement;
  const deleteAllTodosBtn = document.getElementById("deleteAllTodosBtn") as HTMLInputElement;

  settingsBtn?.addEventListener("click", toggleSettingsMenu);
  editCategoriesBtn?.addEventListener("click", editCategories);
  logoutBtn?.addEventListener("click", HandleUserLogout);
  deleteAllTodosBtn?.addEventListener("click", handleDeleteAllTodos);
}

function editCategories() {
  console.log("Edit Categories clicked");
}

async function handleDeleteAllTodos() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  try {
    await deleteAllTodos(user.id);
    renderTodos();
    toggleSettingsMenu();

  } catch (error) {
    console.error("Error deleting all todos:", error);
  }
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