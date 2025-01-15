import "iconify-icon";
import "@fontsource-variable/sofia-sans";
import "@fontsource-variable/playwrite-us-trad";
import "./styles/style.scss";

import { getTodos, addTodo } from "./scripts/todos.ts";

const todosContainer = document.querySelector(".todos-container") as HTMLElement;
const todoForm = document.querySelector("#newTodoForm") as HTMLFormElement;
const todoInput = document.querySelector("#todoInput") as HTMLInputElement;

interface Todo {
  id: number;
  todo: string;
  category: string;
  completed: boolean;
  dueBy: number;
  userId: number;
}

async function renderTodos() {
  const todos = await getTodos();

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

  console.log(todos);
  todosContainer.innerHTML = todoList;
}

// Event listeners

todoForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // await addTodo(todoInput.value);
  await renderTodos();

  todoInput.value = "";
});

// Initialization code

renderTodos();