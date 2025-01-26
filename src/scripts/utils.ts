import { allCategories } from "./categories.ts";

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