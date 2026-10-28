export interface AuthCredentials {
    storeUrl: string;
    consumerKey: string;
    consumerSecret: string;
}

export interface UserProfile {
    username: string; // From /system_status or similar
}

export interface AuthState extends AuthCredentials {
    isAuthenticated: boolean;
    user?: UserProfile;
}
