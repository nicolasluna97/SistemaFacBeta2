

export interface RegisterDto {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  ok: boolean;
  message: string;
}

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

export interface VerifyEmailResponse {
  id: string;
  email: string;
  fullName?: string;
  isActive?: boolean;
  roles?: string[];

  token: string;
  refreshToken: string;
}

export interface ResendCodeResponse {
  ok: boolean;
  message: string;
}

export interface RefreshResponse {
  token: string;
  refreshToken: string;
}
