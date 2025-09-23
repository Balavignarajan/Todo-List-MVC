const Todo = require("../models/todoModel");

// GET all todos
exports.getTodos = async (req, res) => {
  const todos = await Todo.find();
  res.json(todos);
};

// POST (create) a todo
exports.createTodo = async (req, res) => {
  const { title, description, priority, dueDate } = req.body;
  const todo = new Todo({
    title,
    description,
    priority,
    dueDate,
  });
  await todo.save();
  res.json(todo);
};

// PUT (update) a todo
exports.updateTodo = async (req, res) => {
  const { title, description, completed, priority, dueDate } = req.body;
  const todo = await Todo.findByIdAndUpdate(
    req.params.id,
    { title, description, completed, priority, dueDate, updatedAt: Date.now() },
    { new: true }
  );
  res.json(todo);
};

// DELETE a todo
exports.deleteTodo = async (req, res) => {
  await Todo.findByIdAndDelete(req.params.id);
  res.json({ message: "Todo deleted" });
};
