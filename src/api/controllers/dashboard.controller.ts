import { Request, Response } from "express";
import {
  getDashboardStats,
  getDashboardAnalytics,
} from "../services/dashboard.service";

/* =========================================
   LIVE DASHBOARD STATS
========================================= */

export const dashboardStats = async (
  req: Request,
  res: Response
) => {
  try {
    const stats = await getDashboardStats();

    return res.status(200).json({
      success: true,
      serverTime: new Date(),
      ...stats,
    });
  } catch (error) {
    console.error("Dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load dashboard",
    });
  }
};

/* =========================================
   ANALYTICS DATA (NEW)
========================================= */

export const dashboardAnalytics = async (
  req: Request,
  res: Response
) => {
  try {
    const analytics = await getDashboardAnalytics();

    return res.status(200).json({
      success: true,
      ...analytics,
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load analytics",
    });
  }
};