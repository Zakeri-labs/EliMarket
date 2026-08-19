export type UserRole = "customer" | "admin" | "rider";

export type ClientSession = {
  id: string;
  phone?: string;
  email?: string;
  fullName?: string;
  role?: UserRole;
};

export type AuthStatus = "authenticated" | "unauthenticated" | "loading";

export type SendOtpModel = { phone: string };
export type VerifyOtpModel = { phone: string; token: string };
export type AdminSignInModel = { username: string; password: string };
