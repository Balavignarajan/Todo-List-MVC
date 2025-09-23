import React, { useEffect, useState } from "react";
import {
  apiCreateTodo,
  apiDeleteTodo,
  apiGetTodos,
  apiUpdateTodo,
} from "../services/api.service";
import "../pages/Home.css"; // optional, simple styles

// Home component: shows a form to add/edit todos and a list of todos
const Home = () => {
  // 1) State for the list of todos (starts empty)
  const [todos, setTodos] = useState([]);

  // 2) State for the form (controlled inputs)
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    priority: "low",
  });

  // 3) If editId is null => create mode. Otherwise edit mode for that id.
  const [editId, setEditId] = useState(null);

  // (Optional) small UI helpers
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load todos once when component mounts
  useEffect(() => {
    fetchTodos();
  }, []); // empty array => run once

  // Fetch list from server
  const fetchTodos = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await apiGetTodos(); // api service returns axios response
      // common pattern: server returns array in response.data
      setTodos(response.data || []); // safety: default to empty array
    } catch (err) {
      console.error("Failed to fetch todos:", err);
      setError("Could not load todos. See console.");
    } finally {
      setLoading(false);
    }
  };

  // Create a new todo on server
  const handleCreate = async () => {
    // basic validation
    if (!newTodo.title.trim()) {
      setError("Title is required.");
      return;
    }
    setError("");
    try {
      await apiCreateTodo(newTodo); // POST to server
      // reset the form to defaults
      setNewTodo({ title: "", description: "", priority: "low" });
      // reload list
      fetchTodos();
    } catch (err) {
      console.error("Failed to create todo:", err);

      // Check for validation error from server showing backend message in ui
      if (err.response && err.response.data && err.response.data.errors) {
        const serverErrors = err.response.data.errors;
        const titleError = serverErrors.find((e) => e.path === "title");
        if (titleError) {
          setError(titleError.msg); // Show "Title must be at least 3 characters"
          return;
        }
      }

      setError("Failed to create todo. See console.");
    }
  };

  // Update an existing todo on server
  const handleUpdate = async () => {
    if (!newTodo.title.trim()) {
      setError("Title is required.");
      return;
    }
    setError("");
    try {
      await apiUpdateTodo(editId, newTodo); // PUT to server
      // exit edit mode and clear form
      setEditId(null);
      setNewTodo({ title: "", description: "", priority: "low" }); // <-- fixed to "low"
      fetchTodos();
    } catch (err) {
      console.error("Failed to update todo:", err);
      setError("Failed to update todo. See console.");
    }
  };

  // Prepare form for editing a todo
  const startEdit = (todo) => {
    setEditId(todo._id); // use the unique id from DB
    setNewTodo({
      title: todo.title || "",
      description: todo.description || "",
      priority: todo.priority || "low",
    });
    setError("");
  };

  // Cancel editing and reset form
  const cancelEdit = () => {
    setEditId(null);
    setNewTodo({ title: "", description: "", priority: "low" });
    setError("");
  };

  // Delete a todo
  const handleDelete = async (id) => {
    // small confirmation to avoid accidental deletes
    if (!window.confirm("Delete this todo?")) return;
    try {
      await apiDeleteTodo(id);
      fetchTodos();
    } catch (err) {
      console.error("Failed to delete todo:", err);
      setError("Failed to delete todo. See console.");
    }
  };

  return (
    <>
      <h1 className="app-title">📝 Todo App (Beginner friendly)</h1>

      {/* Form Section */}
      <div className="todo-form">
        <input
          type="text"
          placeholder="Title"
          value={newTodo.title}
          onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
        />
        <input
          type="text"
          placeholder="Description"
          value={newTodo.description}
          onChange={(e) =>
            setNewTodo({ ...newTodo, description: e.target.value })
          }
        />
        <select
          value={newTodo.priority}
          onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* Show Update or Create based on editId */}
        {editId ? (
          <>
            <button onClick={handleUpdate}>Update Todo</button>
            <button onClick={cancelEdit}>Cancel</button>
          </>
        ) : (
          <button onClick={handleCreate}>Add Todo</button>
        )}
      </div>

      {/* show error or loading */}
      {error && <div className="error">{error}</div>}
      {loading && <div>Loading todos...</div>}

      {/* List of Todos */}
      <ul className="todo-list">
        {todos.map((todo) => (
          <li key={todo._id}>
            <strong>{todo.title}</strong> - {todo.description} ({todo.priority})
            <button onClick={() => startEdit(todo)}>Edit</button>
            <button onClick={() => handleDelete(todo._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default Home;
