// src/pages/Home.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  apiCreateTodo,
  apiDeleteTodo,
  apiGetTodos,
  apiUpdateTodo,
} from "../services/api.service"; // API calls (backend)
import "../pages/Home.css"; // CSS styling
import { useNavigate } from "react-router-dom"; // for redirect

const Home = () => {
  // ✅ State to hold all todos + extra info (page, total, etc.)
  const [todos, setTodos] = useState([]);
  const [meta, setMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // ✅ State for creating/editing a todo
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    priority: "low",
  });
  const [editId, setEditId] = useState(null); // check if we are editing

  // ✅ Filters and sorting
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [priorityFilter, setPriorityFilter] = useState("");
  const [completedFilter, setCompletedFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [order, setOrder] = useState("desc");
  const [search, setSearch] = useState("");

  // ✅ Helpers for loading + error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // ✅ User info (from localStorage after login)
  const [user, setUser] = useState(null);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // ✅ Make request params based on filters
  const buildParams = () => {
    return {
      page,
      limit,
      priority: priorityFilter || undefined,
      completed: completedFilter !== "all" ? completedFilter : undefined,
      sortBy,
      order,
      search: search || undefined,
    };
  };

  // ✅ Fetch todos from backend
  const fetchTodos = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await apiGetTodos(buildParams());
      const data = res.data || {};

      // handle backend formats
      const finalTodos = Array.isArray(data.todos) ? data.todos : [];
      const returnedMeta = data.meta || {
        page: data.page || 1,
        limit: data.limit || 10,
        total: data.total || 0,
        totalPages: data.totalPages || 0,
      };

      setTodos(finalTodos);
      setMeta(returnedMeta);
    } catch (err) {
      setError(err.response?.data?.error || "Could not load todos.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, priorityFilter, completedFilter, sortBy, order, search]);

  // ✅ Run fetchTodos when page/filters change
  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  // ✅ Create new todo
  const handleCreate = async () => {
    if (!newTodo.title.trim()) {
      setError("Title is required.");
      return;
    }
    try {
      await apiCreateTodo(newTodo);
      setPage(1); // show newest
      setNewTodo({ title: "", description: "", priority: "low" });
      fetchTodos();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create todo.");
    }
  };

  // ✅ Update existing todo
  const handleUpdate = async () => {
    if (!newTodo.title.trim()) {
      setError("Title is required.");
      return;
    }
    try {
      await apiUpdateTodo(editId, newTodo);
      setEditId(null);
      setNewTodo({ title: "", description: "", priority: "low" });
      fetchTodos();
    } catch (err) {
      setError("Failed to update todo.");
    }
  };

  // ✅ Edit mode
  const startEdit = (todo) => {
    setEditId(todo._id);
    setNewTodo({
      title: todo.title,
      description: todo.description,
      priority: todo.priority,
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setNewTodo({ title: "", description: "", priority: "low" });
  };

  // ✅ Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this todo?")) return;
    try {
      await apiDeleteTodo(id);
      fetchTodos();
    } catch (err) {
      setError("Failed to delete todo.");
    }
  };

  // ✅ Page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      setPage(newPage);
    }
  };

  // ✅ Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("Logged out!");
    navigate("/");
  };

  return (
    <div className="container">
      <h1 className="app-title">📝 Todo App</h1>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>

      {/* Show user info */}
      <div className="user-box">
        {user ? (
          <>
            <p>
              <strong>Name:</strong> {user.name}
            </p>
            <p>
              <strong>Email:</strong> {user.email}
            </p>
          </>
        ) : (
          <p>You are not logged in.</p>
        )}
      </div>

      {/* Form */}
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

        {editId ? (
          <>
            <button onClick={handleUpdate}>Update</button>
            <button onClick={cancelEdit}>Cancel</button>
          </>
        ) : (
          <button onClick={handleCreate}>Add Todo</button>
        )}
      </div>

      {/* Filters */}
      <div className="filters">
        <label>
    Search:
    <input
      type="text"
      value={search}
      onChange={(e) => { setSearch(e.target.value); setPage(1); }}
      placeholder="Search title/desc"
      style={{ marginLeft: 6 }}
    />
  </label>
        <label>
          Priority:
          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </label>

        <label>
          Completed:
          <select
            value={completedFilter}
            onChange={(e) => {
              setCompletedFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">All</option>
            <option value="true">Done</option>
            <option value="false">Pending</option>
          </select>
        </label>

        <label>
          Sort:
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setPage(1);
            }}
          >
            <option value="createdAt">Created</option>
            <option value="dueDate">Due Date</option>
            <option value="priority">Priority</option>
            <option value="title">Title</option>
          </select>
        </label>

        <select
          value={order}
          onChange={(e) => {
            setOrder(e.target.value);
            setPage(1);
          }}
        >
          <option value="desc">Newest</option>
          <option value="asc">Oldest</option>
        </select>

        <label>
          Per page:
          <select
            value={limit}
            onChange={(e) => {
              setLimit(parseInt(e.target.value));
              setPage(1);
            }}
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </label>

        <button onClick={fetchTodos}>Apply</button>
      </div>

      {/* Status */}
      {error && <div className="error">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      {/* Todo List */}
      <ul className="todo-list">
        {todos.length === 0 && !loading && <li>No todos found</li>}
        {todos.map((todo) => (
          <li key={todo._id}>
            <div className="todo-item">
              <div>
                <strong>{todo.title}</strong> — {todo.description}
                <div className="todo-meta">
                  <small>Priority: {todo.priority}</small>
                  {" • "}
                  <small>
                    Due:{" "}
                    {todo.dueDate
                      ? new Date(todo.dueDate).toLocaleDateString()
                      : "—"}
                  </small>
                  {" • "}
                  <small>{todo.completed ? "Done" : "Pending"}</small>
                </div>
              </div>

              <div className="todo-actions">
                <button onClick={() => startEdit(todo)}>Edit</button>
                <button onClick={() => handleDelete(todo._id)}>Delete</button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Pagination */}
      <div className="pagination">
        <button onClick={() => handlePageChange(page - 1)} disabled={page <= 1}>
          Prev
        </button>
        <span>
          Page {meta.page} of {meta.totalPages}
        </span>
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page >= meta.totalPages}
        >
          Next
        </button>
        <span>Total: {meta.total}</span>
      </div>
    </div>
  );
};

export default Home;
