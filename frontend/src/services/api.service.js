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