const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const todoController = require("../controllers/todoController");
const { validateTodoCreate, validateRequest } = require("../middleware/validators");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.get("/", todoController.getTodos);       // GET all
router.post("/", validateTodoCreate, validateRequest, todoController.createTodo);    // CREATE
router.put("/:id", validateTodoCreate, todoController.updateTodo);  // UPDATE
router.delete("/:id", todoController.deleteTodo); // DELETE

module.exports = router;
