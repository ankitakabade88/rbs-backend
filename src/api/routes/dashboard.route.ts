import { Router } from "express";
import {
  dashboardStats,
  dashboardAnalytics,
} from "../controllers/dashboard.controller";

const router = Router();

/*
  Dashboard LIVE stats
  GET /api/dashboard
*/
router.get("/", dashboardStats);

/*
  Dashboard Analytics (NEW)
  GET /api/dashboard/analytics
*/
router.get("/analytics", dashboardAnalytics);

export default router;