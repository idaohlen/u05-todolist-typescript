import { supabase } from "./supabaseClient.ts";

export async function registerUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    if (error.message.includes("User already registered")) {
      throw new Error("User already registered");
    }
    throw error;
  }
  return data.user;
}

export async function loginUser(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      throw new Error("Invalid login credentials. Please check your email and password.");
    }
    throw new Error("An error occurred during login. Please try again.");
  }
  return data.user;
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}