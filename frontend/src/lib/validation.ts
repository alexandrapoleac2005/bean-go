// Client-side copies of the backend bean-validation rules, with the same messages,
// so users see errors before a round trip. The server stays the authority.

export type Rule = (value: string) => string | null

export const rules = {
  required:
    (message: string): Rule =>
    (v) =>
      v.trim() ? null : message,

  maxLength:
    (max: number, message = `Must be at most ${max} characters`): Rule =>
    (v) =>
      v.length > max ? message : null,

  length:
    (min: number, max: number, message: string): Rule =>
    (v) =>
      v.length < min || v.length > max ? message : null,

  // Close to Hibernate's @Email: local@domain, no spaces. Empty passes (pair with required).
  email:
    (message = 'The email format is not valid'): Rule =>
    (v) =>
      !v.trim() || /^[^\s@]+@[^\s@]+$/.test(v.trim()) ? null : message,
}

export function validate<T extends Record<string, string>>(
  values: T,
  schema: { [K in keyof T]?: Rule[] },
): Partial<Record<keyof T, string>> {
  const errors: Partial<Record<keyof T, string>> = {}
  for (const key of Object.keys(schema) as Array<keyof T>) {
    for (const rule of schema[key] ?? []) {
      const error = rule(values[key] ?? '')
      if (error) {
        errors[key] = error
        break
      }
    }
  }
  return errors
}

// dtos/auth/LoginRequestDTO
export const loginSchema = {
  email: [rules.required('The email is mandatory'), rules.email()],
  password: [rules.required('The password is mandatory')],
}

// dtos/auth/RegisterRequestDTO
export const registerSchema = {
  firstName: [rules.required('The first name is mandatory'), rules.maxLength(255)],
  lastName: [rules.required('The last name is mandatory'), rules.maxLength(255)],
  email: [rules.required('The email is mandatory'), rules.maxLength(255), rules.email()],
  password: [
    rules.required('The password is mandatory'),
    rules.length(6, 72, 'The password must be between 6 and 72 characters long'),
  ],
}

// dtos/review/ReviewRequestDTO (rating is checked separately: integer 1..5)
export const reviewSchema = {
  comment: [rules.maxLength(1000, "The comment can't be longer than 1000 characters")],
}
