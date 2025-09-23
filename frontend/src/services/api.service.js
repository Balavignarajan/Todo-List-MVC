import axiosInstance from "../utils/config/axios-instance-config";

export const apiGetTodos = () => {
  return axiosInstance.get("/api/todos");
};

export const apiCreateTodo = (todo) => {
  return axiosInstance.post("/api/todos", todo);
};

export const apiUpdateTodo = (id, todo) => {
  return axiosInstance.put(`/api/todos/${id}`, todo);
};

export const apiDeleteTodo = (id) => {
  return axiosInstance.delete(`/api/todos/${id}`);
};

//Auth
// Register a new user
export const apiRegisterUser = (userData) => {
  return axiosInstance.post("/api/auth/register", userData);
};

// Login user
export const apiLoginUser = (credentials) => {
  return axiosInstance.post("/api/auth/login", credentials);
};