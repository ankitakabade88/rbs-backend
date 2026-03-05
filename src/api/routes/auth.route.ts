import { Router } from "express";
import { login } from "../controllers/auth.controller";
import { setPassword } from "../controllers/auth.controller";
import { changePassword } from "../controllers/auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/login", login);

router.post("/set-password", setPassword);

router.post(
  "/change-password",
  authMiddleware,
  changePassword
);

export default router;