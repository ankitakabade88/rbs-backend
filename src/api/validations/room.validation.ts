import { body, param } from "express-validator";

export const createRoomValidation = [
  body("name")
    .notEmpty()
    .isString()
    .withMessage("Room name must be a string"),
  body("location")
    .notEmpty()
    .withMessage("Location is required"),
  body("capacity")
    .isInt({ min: 1 })
    .withMessage("Capacity must be positive"),
  body("type")
    .notEmpty()
    .toLowerCase()
    .isIn(["meeting", "training", "conference"])
];

export const updateRoomValidation = [
  param("id") 
    .isMongoId()
    .withMessage("Invalid room ID"),
  body("capacity") 
    .optional()
    .isInt({ min: 1 })
    .withMessage("Capacity must be positive"),
  body("type")
    .optional()
    .notEmpty()
    .isIn(["meeting", "training", "conference"])
];

export const deleteRoomValidation = [
  param("id")
  .isMongoId()
  .withMessage("Invalid room ID")
];
