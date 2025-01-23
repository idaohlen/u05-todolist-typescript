export default interface Todo {
  id: string;
  todo: string;
  category: string;
  completed: boolean;
  due_by: string | null;
  userId: number;
}