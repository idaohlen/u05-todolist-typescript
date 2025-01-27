// Styling
import "@fontsource-variable/sofia-sans";
import "@fontsource-variable/playwrite-us-trad";
import "./styles/style.scss";

// Libraries
import "iconify-icon";
import { supabase } from "./scripts/supabaseClient.ts";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import tippy from "tippy.js";
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light-border.css";

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
import { allCategories } from "./scripts/categories.ts";
import { getCategoryColor, getCategoryIcon } from "./scripts/utils.ts";

// Models
import Todo from "./models/Todo.ts";
import { User } from "@supabase/supabase-js";

// HTML elements
const appContainer = document.querySelector("#app") as HTMLElement;

// Variables
let allTodos: Todo[] = [];
let updatedCategory: string | null = null;

// Todo filters
let categoryFilters: string[] = [];
let dueDateFilter: "today" | "this_week" | "this_month" | "overdue" | "all" = "all";


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
    if (error instanceof Error && error.message.includes("User already registered")) {
      errorMessage.textContent = "User with that email already exists. Please try logging in or use another email address.";
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
    if (error instanceof Error) {
      errorMessage.textContent = error.message;
    }
  }
}

// Log out user
async function handleUserLogout() {
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

  // Setup script logic for DOM-elements
  setupSettingsMenu();
  setupNewTodoForm();
  setupEditTodoModal();
  setupDueByFilters();

  // Fetch and render todos on page render
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    allTodos = await getTodos(user.id);
    renderTodos();
    renderCategories();
  }
}

// Render todos in the todos-container
async function renderTodos(todos: Todo[] = allTodos) {
  const todosContainer = document.querySelector(".todos-container") as HTMLElement;

  // Apply category filters
  let filteredTodos = todos.filter(todo => {
    if (categoryFilters.length === 0) return true;
    if (categoryFilters.includes(todo.category)) return true;
    if (categoryFilters.includes("none") && !todo.category) return true;
    return false;
  });

  // Apply due date filters
  const now = new Date();

  filteredTodos = filteredTodos.filter(todo => {
    if (dueDateFilter === "all") return true;
    const dueDate = todo.due_by ? new Date(todo.due_by) : null;

    if (!dueDate) return false;

    // Filter todos by due date
    if (dueDateFilter === "today") {
      return dueDate.toDateString() === now.toDateString();
    } else if (dueDateFilter === "this_week") {
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      return dueDate >= startOfWeek && dueDate <= endOfWeek;
    } else if (dueDateFilter === "this_month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      return dueDate >= startOfMonth && dueDate <= endOfMonth;
    } else if (dueDateFilter === "overdue" && !todo.completed) {
      return dueDate < now;
    }
    return false;
  });

  // Sort todos by due date and then by creation date
  filteredTodos.sort((a, b) => {
    const dueDateA = a.due_by ? new Date(a.due_by).getTime() : Infinity;
    const dueDateB = b.due_by ? new Date(b.due_by).getTime() : Infinity;
    if (dueDateA !== dueDateB) return dueDateA - dueDateB;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  const todoList = filteredTodos.map((todo: Todo) => TodoElement(todo)).join("");

  todosContainer.innerHTML = todoList;

  // Event delegator for todos-container
  todosContainer.addEventListener("click", async (e) => {
    const target = e.target as HTMLElement;

    // Handle checkbox change
    if (target.matches(".todo__checkbox input[type='checkbox']")) {
      const checkbox = target as HTMLInputElement;
      handleupdateTodoCompletedStatus(checkbox);
    }
    // Handle open todo edit modal
    if (target.closest(".todo") && !target.closest(".todo__checkbox")) {
      handleEditTodo(target.closest(".todo") as HTMLElement);
    }
  });
}

// Render category filter buttons
function renderCategories() {
  const categoriesContainer = document.querySelector(".category-filters") as HTMLElement;

  const html = `
    ${ allCategories.map(category => {
      return `
        <button class="choose-category-btn" data-category-id="${category.name}" data-tooltip="${category.name}">
          <iconify-icon icon="${category.icon}" class="category-icon text-${getCategoryColor(category.name)}"></iconify-icon>
        </button>
      `
    }).join("") }
    <button class="choose-category-btn" data-category-id="none" data-tooltip="No category">
      <iconify-icon icon="solar:menu-dots-bold" class="category-icon"></iconify-icon>
    </button>
  `;

  categoriesContainer.innerHTML = html;

  const buttons = Array.from(document.querySelectorAll(".choose-category-btn")) as HTMLElement[];

  buttons.forEach(btn => {
    mountTooltip(btn, btn.dataset.tooltip);

    btn.addEventListener("click", () => {
      const category = btn.dataset.categoryId || "";
      // Add/remove active-filter class to currently applied category filters
      if (categoryFilters.includes(category)) {
        categoryFilters = categoryFilters.filter(cat => cat !== category);
        btn.classList.remove("active-filter");
      } else {
        categoryFilters.push(category);
        btn.classList.add("active-filter");
      }
      
      renderTodos();
    });
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
    
    // Add/remove completed class for todo
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
// TODO FILTERS
/* ---------------------------------------------- */

// Set up logic for filtering todos by due date when clicking on a filter button
function setupDueByFilters() {
  const dueByFilters = document.querySelectorAll(".dueby-filters .filter-btn");
  dueByFilters.forEach(button => {
    button.addEventListener("click", () => {
      dueByFilters.forEach(btn => btn.classList.remove("active-filter"));
      button.classList.add("active-filter");

      const filter = button.textContent?.toLowerCase().replace(" ", "_") as "today" | "this_week" | "this_month" | "overdue" | "all";
      setDueDateFilter(filter);
    });
  });
}

// Apply due by filter and re-render todos
function setDueDateFilter(filter: "today" | "this_week" | "this_month" | "overdue" | "all") {
  dueDateFilter = filter;
  renderTodos();
}


/* ---------------------------------------------- */
// NEW TODO FORM
/* ---------------------------------------------- */

function setupNewTodoForm() {
  const todoForm = document.getElementById("newTodoForm") as HTMLFormElement;
  const dueByBtn = document.getElementById("dueByBtn") as HTMLFormElement;
  const todoInput = document.getElementById("todoInput") as HTMLInputElement;
  const dueByInput = document.getElementById("dueByInput") as HTMLInputElement;
  const chooseCategoryBtn = document.getElementById("chooseCategoryBtn") as HTMLElement;
  const addTodoBtn = document.getElementById("addTodoBtn") as HTMLElement;

  let newCategory = "";

  setupCategoryPopup(chooseCategoryBtn, (category) => {
    newCategory = category;
  });

  // Apply flatpickr to due by input element
  mountFlatpickr(dueByInput, dueByBtn);

  mountTooltip(chooseCategoryBtn, "Choose category");
  mountTooltip(dueByBtn, "Set a due date");
  mountTooltip(addTodoBtn, "Add new todo");

  // New todo form submission
  todoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const dueBy = dueByInput.value ? new Date(dueByInput.value).toISOString() : null;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      try {
        if (!todoInput.value.trim()) throw new Error("Todo cannot be empty.");

        await addTodo(todoInput.value, user.id, newCategory, dueBy);
        
        todoInput.value = "";
        dueByInput.value = "";
        dueByBtn.classList.remove("has-value");
        
        allTodos = await getTodos(user.id);
        renderTodos();
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
  const editCategoryBtn = document.getElementById("editTodoCategory") as HTMLButtonElement;

  // Apply flatpickr to due by input element in editing modal
  mountFlatpickr(editDueByInput, editDueByInputBtn, editTodoDialog);

  // Setup popup for picking todo category
  setupCategoryPopup(editCategoryBtn, (category) => {
    updatedCategory = category;
  });

  // Button tooltips
  mountTooltip(editCategoryBtn, "Edit category", editTodoDialog);
  mountTooltip(editDueByInputBtn, "Edit due date", editTodoDialog);
}

async function handleEditTodo(todoElement: HTMLElement) {
  const editTodoDialog = document.getElementById("editTodoDialog") as HTMLDialogElement;
  const editTodoInput = document.getElementById("editTodoInput") as HTMLInputElement;
  const editDueByInput = document.getElementById("editDueByInput") as HTMLInputElement;
  const editDueByInputBtn = document.getElementById("editDueByInputBtn") as HTMLInputElement;
  const saveTodoBtn = document.getElementById("saveTodoBtn") as HTMLButtonElement;
  const deleteTodoBtn = document.getElementById("deleteTodoBtn") as HTMLButtonElement;
  const cancelBtn = document.getElementById("cancelBtn") as HTMLButtonElement;

  // check that todo element has a todo-id correctly assigned
  const todoId = todoElement.dataset.todoId;
  if (!todoId) return;

  // Check that user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Find todo in stored todos array
  const todo = allTodos.find(t => t.id === todoId);
  if (!todo) return;

  // Insert todo data into input elements
  editTodoInput.value = todo.todo;
  editDueByInput.value = todo.due_by ? new Date(todo.due_by).toISOString().slice(0, 16) : "";

  // Add class depending on if todo has due by date or not
  if (todo.due_by) editDueByInputBtn.classList.add("has-value");
  else editDueByInputBtn.classList.remove("has-value");

  updatedCategory = todo.category;

  // Display todo's category
  let icon = document.getElementById("editCategoryIcon");
  const categoryIcon = getCategoryIcon(todo.category);
  icon?.setAttribute("icon", categoryIcon);

  // Open the edit todo modal
  editTodoDialog.showModal();

  // Close modal when clicking on the backdrop
  const closeModal = () => {
    editTodoDialog.close();
    updatedCategory = null;
  };

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === editTodoDialog) {
      closeModal();
    }
  };

  editTodoDialog.addEventListener("click", handleBackdropClick);

  // Save todo edits
  saveTodoBtn.onclick = async () => {
    const updatedTodo = editTodoInput.value.trim();
    const updatedDueBy = editDueByInput.value ? new Date(editDueByInput.value).toISOString() : null;

    try {
      // Update todo in the database
      await updateTodo(todoId, updatedTodo, updatedCategory, updatedDueBy);
      // Re-fetch todos and re-render them
      allTodos = await getTodos(user.id);
      renderTodos();
      // Close edit todo modal
      closeModal();
    } catch (error) {
      console.error("Error updating todo:", error);
    }
  };

  // Delete current todo in edit modal
  deleteTodoBtn.onclick = () => {
    showConfirmationDialog(
      "Delete Todo",
      "Are you sure you want to delete the todo?",
      () => { handleDeleteTodo(todoId, user) }
    );
  };

  // Cancel todo edit/close modal
  cancelBtn.onclick = () => {
    closeModal();
  };
}

async function handleDeleteTodo(todoId: string, user: User) {
  try {
    // Delete todo from the database
    await deleteTodo(todoId);
    // Re-fetch todos and re-render them
    allTodos = await getTodos(user.id);
    renderTodos();
  } catch (error) {
    console.error("Error deleting todo:", error);
  }
}


/* ---------------------------------------------- */
// CONFIMRATION DIALOG
/* ---------------------------------------------- */

function showConfirmationDialog(title: string, message: string, onConfirm: () => void) {
  const confirmationDialog = document.getElementById("confirmationDialog") as HTMLDialogElement;
  const confirmYesBtn = document.getElementById("confirmYesBtn") as HTMLButtonElement;
  const confirmNoBtn = document.getElementById("confirmNoBtn") as HTMLButtonElement;

  const headingElement = confirmationDialog.querySelector(".dialog__heading");
  if (headingElement) headingElement.textContent = title;

  const messageElement = confirmationDialog.querySelector(".dialog__message");
  if (messageElement) messageElement.textContent = message;

  confirmationDialog.showModal();

  confirmYesBtn.onclick = () => {
    onConfirm();
    confirmationDialog.close();
  };

  confirmNoBtn.onclick = () => {
    confirmationDialog.close();
  };
}


/* ---------------------------------------------- */
// CHOOSE CATEGORY
/* ---------------------------------------------- */

function setupCategoryPopup(button: HTMLElement, onSelectCategory: (category: string) => void) {
  const popupContent = document.createElement("div");
  popupContent.classList.add("menu-popup");
  popupContent.innerHTML = `
    ${allCategories.map(category => `
      <button class="choose-category-btn menu-popup__item" data-category-name="${category.name}">
        <iconify-icon icon="${category.icon}" class="menu-popup__item-icon"></iconify-icon>
        ${category.name}
      </button>
    `).join("")}
    <button class="choose-category-btn menu-popup__item" data-category-name="none">
      <iconify-icon icon="solar:menu-dots-bold" class="menu-popup__item-icon"></iconify-icon>
      No category
    </button>
  `;

  const buttons = popupContent.querySelectorAll(".choose-category-btn");

  buttons.forEach((btn) => btn.addEventListener("click", (e) => {
    e.preventDefault();
    const target = e.target as HTMLElement;
    const category = target.dataset.categoryName;
    if (target && category) {
      onSelectCategory(category);
      
      let icon = document.getElementById("newCategoryIcon");
      if (button.id === "editTodoCategory") icon = document.getElementById("editCategoryIcon");
      const categoryIcon = getCategoryIcon(category);
      icon?.setAttribute("icon", categoryIcon);

      instance.hide();
    }
  }));

  const instance = tippy(button, {
    content: popupContent,
    allowHTML: true,
    interactive: true,
    trigger: "click",
    placement: "bottom",
    theme: "light-border",
    onShow(instance) {
      instance.setContent(popupContent);
    }
  });

  // Prevent event propagation to keep the modal open
  button.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
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
    fp.toggle();
  });

  return fp;
}


/* ---------------------------------------------- */
// TIPPY
/* ---------------------------------------------- */

function mountTooltip(element: HTMLElement, label: string | undefined, appendTo: HTMLElement = document.body) {
  tippy(element, {
    content: label,
    placement: "top",
    arrow: true,
    theme: "light-border",
    appendTo: appendTo
  });
}


/* ---------------------------------------------- */
// SETTINGS MENU
/* ---------------------------------------------- */

function setupSettingsMenu() {
  const settingsBtn = document.getElementById("settingsBtn") as HTMLInputElement;

  const popupContent = document.createElement("div");
  popupContent.classList.add("menu-popup");
  popupContent.innerHTML = `
      <button id="deleteAllTodosBtn" class="menu-popup__item">
        <iconify-icon icon="solar:trash-bin-trash-bold" class="menu-popup__item-icon"></iconify-icon>
        Delete all todos
      </button>
      <button id="logoutBtn" class="menu-popup__item">
        <iconify-icon icon="solar:logout-2-bold" class="menu-popup__item-icon"></iconify-icon>
        Logout
      </button>
  `;

  tippy(settingsBtn, {
    content: popupContent,
    allowHTML: true,
    interactive: true,
    trigger: "click",
    placement: "bottom",
    theme: "light-border",
    onMount() {
      const deleteAllTodosBtn = document.getElementById("deleteAllTodosBtn") as HTMLElement;
      const logoutBtn = document.getElementById("logoutBtn") as HTMLElement;
    
      deleteAllTodosBtn?.addEventListener("click", () => {
        showConfirmationDialog(
          "Delete All Todos",
          "Are you sure you want to delete all todos?",
          () => { handleDeleteAllTodos() }
        );
      });
      logoutBtn?.addEventListener("click", handleUserLogout);
    }
  });
}

async function handleDeleteAllTodos() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;
  try {
    await deleteAllTodos(user.id);
    renderTodos([]);
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