export default interface Todo {
  id: string;
  todo: string;
  category: string | null;
  completed: boolean;
  due_by: string | null;
  created_at: string;
}