import { supabase } from "./supabaseClient";

export async function getTodos(userId: string) {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data;
}

export async function addTodo(
  todo: string,
  userId: string,
  category: string = '',
  dueBy: number | null = null
){
  const { data, error } = await supabase
    .from('todos')
    .insert([{
      todo,
      user_id: userId,
      category,
      due_by: dueBy,
      completed: false
    }]);

  if (error) throw error;
  return data;
}