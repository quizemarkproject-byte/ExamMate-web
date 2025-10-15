export interface EmailRequest {
    email: string
}

export interface VerityOtpRequest {
    email: string
    otp: string
}

export interface TokenResponse {
    token: string
}

export interface TokenRequest {
    token: string
}