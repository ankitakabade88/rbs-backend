import { Router } from "express";
import { login } from "../controllers/auth.controller";
import { setPassword } from "../controllers/auth.controller";

const router = Router();

router.post("/login", login);
router.post("/set-password", setPassword);

export default router;
