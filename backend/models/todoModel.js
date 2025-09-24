const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // task name
    description: { type: String }, // extra details about task
    completed: { type: Boolean, default: false }, // done or not
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    }, // importance
    dueDate: { type: Date }, // deadline
    createdAt: { type: Date, default: Date.now }, // when task was created
    updatedAt: { type: Date, default: Date.now },
    // last updated time

    // Link todo to user
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

// auto-update `updatedAt` whenever we change the task
todoSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Todo", todoSchema);
