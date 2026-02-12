import { Request } from "express";

export function assertAuthenticated(
  req: Request
): asserts req is Request & {
  user: {
    id: string;
    role: string;
  };
} {
  if (!req.user) {
    throw new Error("Unauthenticated");
  }
}
