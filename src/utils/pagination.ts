import { Request } from "express";

/**
 * Pagination utility
 * Extracts page, limit, skip, and sort options from request query
 */
export const getPaginationOptions = (req: Request) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.max(Number(req.query.limit) || 5, 1);
  const skip = (page - 1) * limit;

  // Sorting
  const sortBy = (req.query.sortBy as string) || "createdAt";
  const order = req.query.order === "asc" ? 1 : -1;

  const sort = { [sortBy]: order };

  return {
    page,
    limit,
    skip,
    sort,
  };
};
