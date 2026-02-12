if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

export const JWT_SECRET = process.env.JWT_SECRET as string;
export const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "20m") as string;

