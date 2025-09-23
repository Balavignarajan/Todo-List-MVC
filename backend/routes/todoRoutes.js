const express = require("express");
const router = express.Router();
const todoController = require("../controllers/todoController");

router.get("/", todoController.getTodos);       // GET all
router.post("/", todoController.createTodo);    // CREATE
router.put("/:id", todoController.updateTodo);  // UPDATE
router.delete("/:id", todoController.deleteTodo); // DELETE

module.exports = router;
