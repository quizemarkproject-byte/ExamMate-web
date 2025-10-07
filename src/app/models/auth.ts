export interface SignupRequest {
    email: string
    username: string
    fullName: string
    password: string
    confirmPassword: string
}

export interface LoginRequest {
    username: string
    password: string
}

export interface EmailRequest {
    email: string
}

export interface ResetPasswordRequest {
    token: string
    newPassword: string
    confirmNewPassword: string
}

export interface LoginResponse {
    token: string
}

export interface TokenRequest {
    token: string
}