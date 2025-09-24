const Todo = require("../models/todoModel");

// GET all todos (with pagination, filtering, sorting)
exports.getTodos = async (req, res) => {
  try {
    // 🔹 1. Extract query params (from frontend URL like /todos?page=2&limit=5&priority=high)
    const { page = 1, limit = 10, priority, completed, sortBy = "createdAt", order = "desc", search } = req.query;

    // 🔹 2. Build filter object
    let filter = { user: req.user.id }; // always filter by user
    if (priority) filter.priority = priority; // e.g., "high"
    if (completed !== undefined) filter.completed = completed === "true"; // e.g., "true" or "false"

  // ✅ NEW: search filter (title or description contains keyword, case-insensitive)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // 🔹 3. Calculate pagination
    const skip = (page - 1) * limit;

    // 🔹 4. Build sort object
    const sortOrder = order === "asc" ? 1 : -1;
    let sort = {};
    sort[sortBy] = sortOrder; // e.g., { createdAt: -1 }

    // 🔹 5. Fetch todos from DB
    const todos = await Todo.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    // 🔹 6. Count total todos (for frontend pagination UI)
    const total = await Todo.countDocuments(filter);

    res.json({
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit),
      todos,
    });
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
