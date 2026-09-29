export interface AuthUser {
  id: string;
  fullName: string;
  serviceNo: string;
  designation: string;
  role: string; // value comes from the backend; no role list in the frontend
}

export interface LoginPayload {
  username: string;
  serviceNo: string;
  password: string;
}

export interface LoginResult {
  token: string;
  user: AuthUser;
  homeScreen: string;
  allowedScreens: string[];
}

// Credentials from the Authority (sign-off) modal
export interface SignOffCredentials {
  officerUserName: string;
  authorizingServiceNo: string;
  officerPassword: string;
}
