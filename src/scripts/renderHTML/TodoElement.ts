import Todo from "../../models/Todo.ts";
import { allCategories } from "../categories.ts";
import { formatDate } from "../utils.ts";

export default function TodoElement({ id, todo, category, completed, due_by }: Todo) {
  // Format due date to spec. date formatting
  const formattedDueBy = due_by ? formatDate(due_by) : "";

  // Find icon for the category
  const categoryIcon = category
    ? allCategories.find(cat => cat.name === category)?.icon || "solar:menu-dots-bold"
    : "solar:menu-dots-bold";

  return `
    <div class="todo ${completed ? "completed" : ""}" data-todo-id="${id}">
      <div class="todo__icon"><iconify-icon icon="${categoryIcon}"></iconify-icon></div>
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
    </div>
  `;
}