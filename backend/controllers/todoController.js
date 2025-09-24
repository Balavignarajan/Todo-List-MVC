const Todo = require("../models/todoModel");

// GET all todos (only for logged-in user)
exports.getTodos = async (req, res) => {
  try {
    // find todos that belong to the logged-in user
    const todos = await Todo.find({ user: req.user.id });
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST (create) a todo
exports.createTodo = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    const todo = new Todo({
      title,
      description,
      priority,
      dueDate,
      user: req.user.id, // 🔹 link todo to logged-in user
    });

    await todo.save();
    res.json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT (update) a todo
exports.updateTodo = async (req, res) => {
  try {
    const { title, description, completed, priority, dueDate } = req.body;

    // 🔹 ensure the todo belongs to the logged-in user
    const todo = await Todo.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
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

    if (!todo) {
      return res.status(404).json({ error: "Todo not found or not yours" });
    }

    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// DELETE a todo
exports.deleteTodo = async (req, res) => {
  try {
    // 🔹 ensure the todo belongs to the logged-in user
    const todo = await Todo.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!todo) {
      return res.status(404).json({ error: "Todo not found or not yours" });
    }

    res.json({ message: "Todo deleted" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};
