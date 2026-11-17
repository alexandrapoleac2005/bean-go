import { http } from '../client'
import type { AuthResponse, LoginRequest, RegisterRequest } from '../types'

// AuthController — /api/auth/** is public (permitAll).
export const authApi = {
  // 200 { token } | 400 validation | 409 "The email is already used"
  register: (body: RegisterRequest) => http.post<AuthResponse>('/api/auth/register', body, { auth: false }),

  // 200 { token } | 401 "Invalid email or password."
  login: (body: LoginRequest) => http.post<AuthResponse>('/api/auth/login', body, { auth: false }),
}
