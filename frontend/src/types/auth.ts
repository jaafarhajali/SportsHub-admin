export interface LoginFormData {
    email: string;
    password: string;
}

export interface RegisterFormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    phoneNumber: string;
    termsAccepted: boolean;
}