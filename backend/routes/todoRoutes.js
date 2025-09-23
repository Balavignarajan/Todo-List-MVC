const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const todoController = require("../controllers/todoController");

// Validation rules for creating todo
const validateTodo = [
  body("title")
    .notEmpty().withMessage("Title is required")
    .isLength({ min: 3 }).withMessage("Title must be at least 3 characters"),
  body("priority")
    .optional()
    .isIn(["low", "medium", "high"]).withMessage("Priority must be low, medium, or high"),
  body("dueDate")
    .optional()
    .isISO8601().toDate().withMessage("Due date must be a valid date")
];

router.get("/", todoController.getTodos);       // GET all
router.post("/", validateTodo, todoController.createTodo);    // CREATE
router.put("/:id", validateTodo, todoController.updateTodo);  // UPDATE
router.delete("/:id", todoController.deleteTodo); // DELETE

module.exports = router;
