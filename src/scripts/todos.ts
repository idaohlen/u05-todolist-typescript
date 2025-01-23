import { supabase } from "./supabaseClient.ts";

export async function getTodos(userId: string) {
  const { data, error } = await supabase
    .from("todos")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data;
}

export async function addTodo(
  todo: string,
  userId: string,
  category: string = "",
  dueBy: string | null = null
){
  const { error } = await supabase
    .from("todos")
    .insert([{
      todo,
      user_id: userId,
      category,
      due_by: dueBy,
      completed: false
    }]);

  if (error) throw error;
}

export async function updateTodoCompletedStatus(todoId: string, completed: boolean) {
  const { error } = await supabase
    .from("todos")
    .update({ completed })
    .eq("id", todoId);

  if (error) throw error;
}

export async function updateTodo(todoId: string, updatedTodo: string, updatedDueBy: string | null) {
  const { error } = await supabase
    .from("todos")
    .update({ todo: updatedTodo,  due_by: updatedDueBy })
    .eq("id", todoId);

  if (error) throw error;
}

export async function deleteTodo(todoId: string) {
  const { error } = await supabase
    .from("todos")
    .delete()
    .eq("id", todoId);

  if (error) throw error;
}