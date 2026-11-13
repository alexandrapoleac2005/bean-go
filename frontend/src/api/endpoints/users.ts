import { http } from '../client'
import type { UserProfile } from '../types'

// UserController
export const usersApi = {
  // Self or ADMIN
  profile: (userId: number, signal?: AbortSignal) =>
    http.get<UserProfile>(`/api/v1/users/${userId}/profile`, { signal }),
}
