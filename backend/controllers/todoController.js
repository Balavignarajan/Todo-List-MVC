const Todo = require("../models/todoModel");
const { validationResult } = require("express-validator");

// GET all todos
exports.getTodos = async (req, res) => {
  try {
    const todos = await Todo.find();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST (create) a todo
exports.createTodo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { title, description, completed, priority, dueDate } = req.body;
    const todo = await Todo.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        completed,
        priority,
        dueDate,
        updatedAt: Date.now(),
      },
      { new: true }
    );

    if (!todo) return res.status(404).json({ error: "Todo not found" });

    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE a todo
exports.deleteTodo = async (req, res) => {
  try {
    const todo = await Todo.findByIdAndDelete(req.params.id);
    if (!todo) return res.status(404).json({ error: "Todo not found" });

    res.json({ message: "Todo deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
