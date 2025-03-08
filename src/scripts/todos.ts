import Todo from "../models/Todo";
import { generateUUID } from "./utils";

export let allTodos: Todo[] = [];

export async function getTodos() {
  const todos = localStorage.getItem("todos");
  if (todos) allTodos = JSON.parse(todos);
}

function saveTodos() {
  localStorage.setItem("todos", JSON.stringify(allTodos));
}

export async function addTodo(
  todo: string,
  category: string | null = null,
  dueBy: string | null = null
){
  if (category === "none") category = null;

  let newId = '';

  do {
    newId = generateUUID();
  }
  while (allTodos.find(todo => todo.id === newId));

  const createdDate = Date.now().toString();

  allTodos.push({
    id: newId,
    todo,
    category: category,
    due_by: dueBy,
    completed: false,
    created_at: createdDate
  });
  saveTodos();
}

export async function updateTodoCompletedStatus(todoId: string, completed: boolean) {
  const index = allTodos.findIndex(todo => todo.id === todoId);
  allTodos[index] = { ...allTodos[index], completed };
  saveTodos();
}

export async function updateTodo(
  todoId: string,
  updatedTodo: string,
  updatedCategory: string | null,
  updatedDueBy: string | null
){
  if (updatedCategory === "none") updatedCategory = null;

  const index = allTodos.findIndex(todo => todo.id === todoId);
  allTodos[index] = {
    ...allTodos[index],
    todo: updatedTodo,
    category: updatedCategory,
    due_by: updatedDueBy
  }
  saveTodos();
}

export async function deleteTodo(todoId: string) {
  allTodos = allTodos.filter(todo => todo.id !== todoId);
  saveTodos();
}

export async function deleteAllTodos() {
  allTodos = [];
  saveTodos();
}