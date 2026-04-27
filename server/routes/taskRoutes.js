import express from "express";
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  toggleTaskStatus,
} from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createTask);
router.get("/", protect, getTasks);

router.put("/:id", protect, updateTask);
router.delete("/:id", protect, deleteTask);
router.patch("/:id/status", protect, toggleTaskStatus);

export default router;