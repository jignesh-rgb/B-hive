import { z } from "zod";
import { commonValidations } from "./validation";

// Registration schema with comprehensive validation
export const registrationSchema = z.object({
  email: commonValidations.email,
  password: commonValidations.password,
  name: z.string().min(1, "Name is required").max(50, "Name must be less than 50 characters"),
  lastname: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
});

// Login schema (for future use)
export const loginSchema = z.object({
  email: commonValidations.email,
  password: z.string().min(1, "Password is required"),
});

// Generic validation schema (keeping existing for backward compatibility)
const schema = z.object({
  name: z.string().min(3),
  email: z.string().email()
});

export default schema;