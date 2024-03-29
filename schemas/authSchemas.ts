import { validatePassword } from "@utils/customValidation";
import { z } from "zod";

export const passwordSchema = z.string().refine((val) => { return validatePassword({ password: val }); });

export const signInDataSchema = z.object({
  email: z.string().email(),
  password: passwordSchema
});

export const signUpDataSchema = z.object({
  email: z.string().email(),
  passwordConfirm: passwordSchema,
  password: passwordSchema,
  alias: z.string().min(4)
}).refine( (val) => {  return val.password === val.passwordConfirm });