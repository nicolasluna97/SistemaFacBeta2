
export interface LoginResponse {
  id: string;
  email: string;
  fullName?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  roles?: string[];

  token: string;
  refreshToken: string;
}
