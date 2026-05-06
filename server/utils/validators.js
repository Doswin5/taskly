export const isValidPriority = (priority) => {
  return ["low", "medium", "high"].includes(priority);
};

export const isValidStatus = (status) => {
  return ["pending", "completed"].includes(status);
};

export const isValidSort = (sort) => {
  return ["newest", "oldest", "dueDate", "priority"].includes(sort);
};

export const isValidDate = (date) => {
  if (!date) return true;

  const parsedDate = new Date(date);
  return !Number.isNaN(parsedDate.getTime());
};

export const sanitizeString = (value) => {
  if (typeof value !== "string") return value;
  return value.trim();
};