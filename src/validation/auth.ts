//Zod Validation
import { z } from "zod";

/**
 * Login Schema Validation
 *
 * This creates an object with "email" and "password".
 *
 * Email must be a string and an email,
 * while the password has to be a string min of 6 and max of 30
 *
 */
export const signInSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, { message: "Password must at least 6 characters" })
    .max(30, { message: "Password must be no more than 30 characters" }),
});

/**
 * Sign Up Schema
 *
 * This extends the Login Schema and adds another string
 * which is username.
 */
export const signUpSchema = signInSchema.extend({
  department: z.string().nullable(),
  username: z
    .string()
    .min(4, { message: "Username must be at least 4 characters" })
    .max(30, { message: "Username must be no more than 30 characters" }),
});

/**
 * Lastly we need to export the types from the schemas we made for use with React Hook Forms
 *
 * This can be done with Zod by using its "infer" function and generate a type from the schema.
 * Then export the types which can be use by other files.
 */
export type ISignIn = z.infer<typeof signInSchema>;
export type ISignUp = z.infer<typeof signUpSchema>;
