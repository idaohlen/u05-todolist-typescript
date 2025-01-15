import "iconify-icon";
import "@fontsource-variable/sofia-sans";
import "@fontsource-variable/playwrite-us-trad";
import "./styles/style.scss";

import { getTodos } from "./scripts/todos.ts";
import { supabase } from "./scripts/supabaseClient.ts";
import { registerUser, loginUser, logoutUser } from "./scripts/userAuth.ts";

const appContainer = document.querySelector("#app") as HTMLElement;

interface Todo {
  id: number;
  todo: string;
  category: string;
  completed: boolean;
  dueBy: number;
  userId: number;
}

function renderLoginPage() : void {
  appContainer.classList.remove("todolist-page");
  appContainer.classList.add("login-page");

  appContainer.innerHTML = `
    <header class="app-header">
      <h1>Todo List</h1>
      <iconify-icon icon="fa6-solid:pen-nib" class="app-header__icon"></iconify-icon>
    </header>
    <div class="login-form">
      <input type="email" placeholder="email" id="emailInput">
      <input type="password" placeholder="password" id="passwordInput">
      <div class="login-form__buttons">
        <button id="registerUserBtn" class="btn btn--outline">Register</button>
        <button id="loginBtn" class="btn">Login</button>
      </div>
    </div>
  `;

  // Register new user
  document.getElementById("registerUserBtn")?.addEventListener("click", async () => {
    const email = (document.getElementById("emailInput") as HTMLInputElement).value;
    const password = (document.getElementById("passwordInput") as HTMLInputElement).value;
    try {
      await registerUser(email, password);
      renderListPage();
    } catch (error) {
      console.error(error);
    }
  });

  // Login existing user
  document.getElementById("loginBtn")?.addEventListener("click", async () => {
    const email = (document.getElementById("emailInput") as HTMLInputElement).value;
    const password = (document.getElementById("passwordInput") as HTMLInputElement).value;
    try {
      await loginUser(email, password);
      renderListPage();
    } catch (error) {
      console.error(error);
    }
  });
}

function renderListPage() : void {
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
      <form id="newTodoForm">
        <input type="text" class="new-todo__input" id="todoInput" placeholder="Take the dog for a walk...">
        <button class="new-todo__btn"><iconify-icon icon="solar:add-circle-bold"></iconify-icon></button>
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
  `;

  document.getElementById("settingsBtn")?.addEventListener("click", () => {
    const settingsMenu = document.getElementById("settingsMenu") as HTMLElement;
    settingsMenu.classList.toggle("show");
  });

  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    console.log("logging out...");
    try {
      await logoutUser();
      renderLoginPage();
    } catch (error) {
      console.error(error);
    }
  });

  document.getElementById("editCategoriesBtn")?.addEventListener("click", () => {
    console.log("Edit Categories clicked");
  });

  document.getElementById("deleteUserBtn")?.addEventListener("click", () => {
    console.log("Delete User clicked");
  });

  renderTodos();

  const todoForm = document.querySelector("#newTodoForm") as HTMLFormElement;
  const todoInput = document.querySelector("#todoInput") as HTMLInputElement;

  // Event listeners

  todoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    // await addTodo(todoInput.value);
    await renderTodos();
    todoInput.value = "";
  });
}

async function renderTodos() {
  const todosContainer = document.querySelector(".todos-container") as HTMLElement;

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error("User not logged in");
    return;
  }

  const todos = await getTodos(user.id);

  const todoList = todos.map(({id, todo, completed, dueBy}: Todo) => {
    return `
      <div class="todo" data-todoId="${id}">
        <div class="todo__icon"><iconify-icon icon="solar:home-bold"></iconify-icon></div>
        <div class="todo__info">
          <div class="todo__title">${todo}</div>
          <div class="todo__due-date pill">${dueBy}</div>
        </div>
        <label class="todo__checkbox">
          <input type="checkbox" ${completed ? "checked" : ""}>
          <span class="checkmark"></span>
        </label>
      </div>`;
  }).join("");

  todosContainer.innerHTML = todoList;
}

// Initialization code

// renderListPage();
renderLoginPage();