import "iconify-icon";
import "@fontsource-variable/sofia-sans";
import "@fontsource-variable/playwrite-us-trad";
import "./styles/style.scss";

import { getTodos } from "./scripts/todos.ts";
import { supabase } from "./scripts/supabaseClient.ts";

const appContainer = document.querySelector("#app") as HTMLElement;

interface Todo {
  id: number;
  todo: string;
  category: string;
  completed: boolean;
  dueBy: number;
  userId: number;
}

export async function registerUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data.user;
}

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

async function renderTodos() {
  const todosContainer = document.querySelector(".todos-container") as HTMLElement;

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    console.error('User not logged in');
    return;
  }

  const todos = await getTodos(user.id);

  const todoList = todos.map(({id, todo, completed}: Todo) => {
    return `
      <div class="todo" data-todoId="${id}">
        <div class="todo__icon"><iconify-icon icon="solar:home-bold"></iconify-icon></div>
        <div class="todo__info">
          <div class="todo__title">${todo}</div>
          <div class="todo__due-date pill">24 dec, 1996</div>
        </div>
        <label class="todo__checkbox">
          <input type="checkbox" ${completed ? "checked" : ""}>
          <span class="checkmark"></span>
        </label>
      </div>`;
  }).join("");

  todosContainer.innerHTML = todoList;
}

function renderLoginPage() : void {
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
        <button id="loginBtn class="btn">Login</button>
      </div>
    </div>
  `;

  // Register new user
  document.getElementById("registerUserBtn")?.addEventListener("click", async () => {
    const email = (document.getElementById("emailInput") as HTMLInputElement).value;
    const password = (document.getElementById("passwordInput") as HTMLInputElement).value;
    await registerUser(email, password);
    renderListPage();
  });

  // Login existing user
  document.getElementById("loginBtn")?.addEventListener("click", async () => {
    const email = (document.getElementById("emailInput") as HTMLInputElement).value;
    const password = (document.getElementById("passwordInput") as HTMLInputElement).value;
    await loginUser(email, password);
    renderListPage();
  });
}

function renderListPage() : void {
  appContainer.innerHTML = `
    <header class="app-header">
      <h1>Todo List</h1>
      <iconify-icon icon="fa6-solid:pen-nib" class="app-header__icon"></iconify-icon>
    </header>

    <div class="new-todo">
      <form id="newTodoForm">
        <input type="text" class="new-todo__input" id="todoInput" placeholder="Take the dog for a walk...">
        <button class="new-todo__btn"><iconify-icon icon="solar:add-circle-bold"></iconify-icon></button>
      </form>
    </div>

    <div class="todos-container"></div>

    <div class="categories-container">
      <div class="categories">
        <iconify-icon icon="solar:home-bold" class="category-icon"></iconify-icon>
        <iconify-icon icon="solar:home-bold" class="category-icon"></iconify-icon>
        <iconify-icon icon="solar:home-bold" class="category-icon"></iconify-icon>
        <iconify-icon icon="solar:home-bold" class="category-icon"></iconify-icon>
        <iconify-icon icon="solar:home-bold" class="category-icon"></iconify-icon>
      </div>
      <button class="btn edit-categories-btn">Edit Categories</button>
    </div>
  `;

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

// Initialization code

renderLoginPage();
// renderListPage();
// renderTodos();