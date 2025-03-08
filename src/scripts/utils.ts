import { allCategories } from "./categories.ts";
import todoSuggestions from "../data/random-todos.json";

import { v4 as uuidv4 } from 'uuid';

export function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }) + ", " + new Date(date).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getCategoryColor(category: string) {
  return category
  ? allCategories.find(cat => cat.name === category)?.color || "red"
  : "red";
}
export function getCategoryIcon(category: string) {
  return category
  ? allCategories.find(cat => cat.name === category)?.icon || "solar:menu-dots-bold"
  : "solar:menu-dots-bold";
}

export function getRandomTodoSuggestion(): string {
  const randomIndex = Math.floor(Math.random() * todoSuggestions.length);
  return todoSuggestions[randomIndex];
}

export function generateUUID() {
  return uuidv4();
}