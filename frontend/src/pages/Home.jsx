// src/pages/Home.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Container, Row, Col, Card, Form, Button, Alert, Badge,
  Navbar, Nav, InputGroup, Pagination, Modal, ListGroup
} from "react-bootstrap";
import {
  apiCreateTodo,
  apiDeleteTodo,
  apiGetTodos,
  apiUpdateTodo,
} from "../services/api.service"; // API calls (backend)
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

  const getPriorityVariant = (priority) => {
    switch (priority) {
      case 'high': return 'danger';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <>
      {/* Navigation Bar */}
      <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
        <Container>
          <Navbar.Brand>📝 Todo App</Navbar.Brand>
          <Navbar.Toggle />
          <Navbar.Collapse className="justify-content-end">
            <Nav>
              {user && (
                <Nav.Item className="me-3 text-light d-flex align-items-center">
                  Welcome, {user.name}!
                </Nav.Item>
              )}
              <Button variant="outline-light" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <Container>
        {/* User Info Card */}
        {user && (
          <Card className="mb-4">
            <Card.Body>
              <Row>
                <Col md={6}>
                  <strong>Name:</strong> {user.name}
                </Col>
                <Col md={6}>
                  <strong>Email:</strong> {user.email}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* Todo Form */}
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">{editId ? 'Edit Todo' : 'Add New Todo'}</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={4} className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Title"
                  value={newTodo.title}
                  onChange={(e) => setNewTodo({ ...newTodo, title: e.target.value })}
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Control
                  type="text"
                  placeholder="Description"
                  value={newTodo.description}
                  onChange={(e) => setNewTodo({ ...newTodo, description: e.target.value })}
                />
              </Col>
              <Col md={2} className="mb-3">
                <Form.Select
                  value={newTodo.priority}
                  onChange={(e) => setNewTodo({ ...newTodo, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Form.Select>
              </Col>
              <Col md={2} className="mb-3">
                {editId ? (
                  <div className="d-grid gap-2">
                    <Button variant="success" size="sm" onClick={handleUpdate}>
                      Update
                    </Button>
                    <Button variant="secondary" size="sm" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button variant="primary" className="w-100" onClick={handleCreate}>
                    Add Todo
                  </Button>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Filters */}
        <Card className="mb-4">
          <Card.Header>
            <h6 className="mb-0">Filters & Search</h6>
          </Card.Header>
          <Card.Body>
            <Row className="g-3">
              <Col md={3}>
                <Form.Label>Search</Form.Label>
                <Form.Control
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search title/description"
                />
              </Col>
              <Col md={2}>
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  value={priorityFilter}
                  onChange={(e) => { setPriorityFilter(e.target.value); setPage(1); }}
                >
                  <option value="">All</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Form.Select>
              </Col>
              {/* <Col md={2}>
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={completedFilter}
                  onChange={(e) => { setCompletedFilter(e.target.value); setPage(1); }}
                >
                  <option value="all">All</option>
                  <option value="true">Done</option>
                  <option value="false">Pending</option>
                </Form.Select>
              </Col> */}
              {/* <Col md={2}>
                <Form.Label>Sort By</Form.Label>
                <Form.Select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
                >
                  <option value="createdAt">Created</option>
                  <option value="dueDate">Due Date</option>
                  <option value="priority">Priority</option>
                  <option value="title">Title</option>
                </Form.Select>
              </Col> */}
              {/* <Col md={2}>
                <Form.Label>Order</Form.Label>
                <Form.Select
                  value={order}
                  onChange={(e) => { setOrder(e.target.value); setPage(1); }}
                >
                  <option value="desc">Newest</option>
                  <option value="asc">Oldest</option>
                </Form.Select>
              </Col> */}
              <Col md={1}>
                <Form.Label>Per Page</Form.Label>
                <Form.Select
                  value={limit}
                  onChange={(e) => { setLimit(parseInt(e.target.value)); setPage(1); }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Status Messages */}
        {error && <Alert variant="danger">{error}</Alert>}
        {loading && <Alert variant="info">Loading...</Alert>}

        {/* Todo List */}
        <Card>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Your Todos</h5>
            <Badge bg="secondary">{meta.total} total</Badge>
          </Card.Header>
          <Card.Body className="p-0">
            {todos.length === 0 && !loading ? (
              <div className="text-center p-4 text-muted">
                <h6>No todos found</h6>
                <p>Create your first todo above!</p>
              </div>
            ) : (
              <ListGroup variant="flush">
                {todos.map((todo) => (
                  <ListGroup.Item key={todo._id}>
                    <Row className="align-items-center">
                      <Col md={8}>
                        <div>
                          <h6 className="mb-1">{todo.title}</h6>
                          <p className="mb-2 text-muted">{todo.description}</p>
                          <div className="d-flex gap-2 flex-wrap">
                            <Badge bg={getPriorityVariant(todo.priority)}>
                              {todo.priority}
                            </Badge>
                            <Badge bg={todo.completed ? 'success' : 'warning'}>
                              {todo.completed ? 'Done' : 'Pending'}
                            </Badge>
                            {todo.dueDate && (
                              <Badge bg="info">
                                Due: {new Date(todo.dueDate).toLocaleDateString()}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </Col>
                      <Col md={4} className="text-end">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => startEdit(todo)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(todo._id)}
                        >
                          Delete
                        </Button>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            )}
          </Card.Body>
        </Card>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <Pagination>
              <Pagination.Prev 
                disabled={page <= 1}
                onClick={() => handlePageChange(page - 1)}
              />
              
              {[...Array(meta.totalPages)].map((_, index) => {
                const pageNum = index + 1;
                if (
                  pageNum === 1 || 
                  pageNum === meta.totalPages || 
                  (pageNum >= page - 1 && pageNum <= page + 1)
                ) {
                  return (
                    <Pagination.Item
                      key={pageNum}
                      active={pageNum === page}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Pagination.Item>
                  );
                } else if (pageNum === page - 2 || pageNum === page + 2) {
                  return <Pagination.Ellipsis key={pageNum} />;
                }
                return null;
              })}
              
              <Pagination.Next 
                disabled={page >= meta.totalPages}
                onClick={() => handlePageChange(page + 1)}
              />
            </Pagination>
          </div>
        )}
      </Container>
    </>
  );
};

export default Home;
