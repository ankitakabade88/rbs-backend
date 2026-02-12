import { body } from "express-validator";

export const createUserValidation = [
  body("name")
    .notEmpty()
    .withMessage("Name is required"),
  body("email")
    .isEmail()
    .withMessage("Invalid email address"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("role")
    .optional()
    .toLowerCase()
    .isIn(["admin", "employee"])
    .withMessage("Invalid role"),
];
