export async function getTodos() {
  const res = await fetch("/src/data/todos.json");
  const data = await res.json();
  return data;
}

export async function addTodo(todo: string, category: string = "", dueBy: number | null = null) {
  const addTodoUrl = "";
  try {
      const response = await fetch(addTodoUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            todo: todo,
            completed: null,
            category: category,
            dueBy: dueBy,
            userId: 1,
          })
      });

      if (!response.ok) throw new Error("Failed to add new todo.");
      console.log("Added new todo.");

  } catch (error) {
      console.warn(error);
  }
}