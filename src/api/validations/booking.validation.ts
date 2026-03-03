import { body, param } from "express-validator";

export const createBookingValidation = [
  body("room").isMongoId().withMessage("Invalid room ID"),

  body("date")
    .isISO8601()
    .withMessage("Invalid date format")
    .custom((value) => {
      if (new Date(value) < new Date()) {
        throw new Error("Booking date cannot be in the past");
      }
      return true;
    }),

  body("startTime").notEmpty(),
  body("endTime").custom((end, { req }) => {
    if (end <= req.body.startTime) {
      throw new Error("End time must be after start time");
    }
    return true;
  }),

  body("purpose").optional().isString(),
];

export const updateBookingValidation = [
  param("id").isMongoId(),
  body("room").optional().isMongoId(),
  body("date").optional().isISO8601(),
  body("startTime").optional(),
  body("endTime").optional(),
  body("purpose").optional().isString(),
];

export const deleteBookingValidation = [
  param("id").isMongoId(),
];
