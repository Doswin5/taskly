import mongoose from "mongoose";
import Task from "../models/Task.js";
import {
  isValidPriority,
  isValidStatus,
  isValidSort,
  isValidDate,
  sanitizeString,
} from "../utils/validators.js";

// ================= CREATE =================
export const createTask = async (req, res) => {
  try {
    let { title, description, priority, category, dueDate } = req.body;

    title = sanitizeString(title);
    description = sanitizeString(description);
    category = sanitizeString(category);

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    if (priority && !isValidPriority(priority)) {
      return res.status(400).json({
        message: "Priority must be low, medium, or high",
      });
    }

    if (!isValidDate(dueDate)) {
      return res.status(400).json({
        message: "Due date must be a valid date",
      });
    }

    const task = await Task.create({
      title,
      description,
      priority: priority || "medium",
      category: category || "General",
      dueDate: dueDate || null,
      user: req.user._id,
    });

    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ================= GET TASKS =================
export const getTasks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      category,
      search,
      sort = "newest",
      overdue,
    } = req.query;

    // ✅ VALIDATE FIRST
    if (status && status !== "all" && !isValidStatus(status)) {
      return res.status(400).json({
        message: "Status must be pending or completed",
      });
    }

    if (priority && priority !== "all" && !isValidPriority(priority)) {
      return res.status(400).json({
        message: "Priority must be low, medium, or high",
      });
    }

    if (sort && !isValidSort(sort)) {
      return res.status(400).json({
        message: "Invalid sort option",
      });
    }

    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 10, 1), 50);
    const skip = (pageNumber - 1) * limitNumber;

    // ✅ BUILD QUERY CLEANLY
    const query = {
      user: req.user._id,
    };

    // Overdue takes priority
    if (overdue === "true") {
      query.status = "pending";
      query.dueDate = { $lt: new Date() };
    } else {
      if (status && status !== "all") {
        query.status = status;
      }
    }

    if (priority && priority !== "all") {
      query.priority = priority;
    }

    if (category && typeof category === "string" && category !== "all") {
      query.category = sanitizeString(category);
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // ✅ SORTING
    let sortOption = { createdAt: -1 };

    if (sort === "oldest") {
      sortOption = { createdAt: 1 };
    }

    if (sort === "dueDate") {
      sortOption = { dueDate: 1 };
    }

    if (sort === "priority") {
      sortOption = { priority: 1 }; // basic sort (not perfect but acceptable for now)
    }

    // ✅ FETCH DATA
    const totalTasks = await Task.countDocuments(query);

    const tasks = await Task.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNumber);

    // ✅ GLOBAL STATS (not paginated)
    const stats = {
      total: await Task.countDocuments({ user: req.user._id }),
      pending: await Task.countDocuments({
        user: req.user._id,
        status: "pending",
      }),
      completed: await Task.countDocuments({
        user: req.user._id,
        status: "completed",
      }),
      highPriority: await Task.countDocuments({
        user: req.user._id,
        priority: "high",
      }),
      overdue: await Task.countDocuments({
        user: req.user._id,
        status: "pending",
        dueDate: { $lt: new Date() },
      }),
    };

    return res.status(200).json({
      tasks,
      pagination: {
        totalTasks,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalTasks / limitNumber),
        limit: limitNumber,
        hasNextPage: pageNumber < Math.ceil(totalTasks / limitNumber),
        hasPrevPage: pageNumber > 1,
      },
      stats,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ================= UPDATE =================
export const updateTask = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    let { title, description, priority, category, dueDate } = req.body;

    title = sanitizeString(title);
    description = sanitizeString(description);
    category = sanitizeString(category);

    if (title !== undefined && !title) {
      return res.status(400).json({ message: "Title cannot be empty" });
    }

    if (priority !== undefined && !isValidPriority(priority)) {
      return res.status(400).json({
        message: "Priority must be low, medium, or high",
      });
    }

    if (dueDate !== undefined && !isValidDate(dueDate)) {
      return res.status(400).json({
        message: "Due date must be a valid date",
      });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    task.title = title ?? task.title;
    task.description = description ?? task.description;
    task.priority = priority ?? task.priority;
    task.category = category || task.category;
    task.dueDate = dueDate === "" ? null : dueDate ?? task.dueDate;

    const updatedTask = await task.save();

    return res.status(200).json(updatedTask);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ================= DELETE =================
export const deleteTask = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await task.deleteOne();

    return res.status(200).json({ message: "Task removed" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ================= TOGGLE =================
export const toggleTaskStatus = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: "Not authorized" });
    }

    task.status = task.status === "pending" ? "completed" : "pending";

    const updatedTask = await task.save();

    return res.status(200).json(updatedTask);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};