import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { AuthCredentials, AuthState } from '../../types/auth';
import { checkConnection } from '../../services/woocommerce';

interface AuthContextType extends AuthState {
    login: (credentials: AuthCredentials) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = 'wc_bulk_editor_auth';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [auth, setAuth] = useState<AuthState>({
        storeUrl: '',
        consumerKey: '',
        consumerSecret: '',
        isAuthenticated: false,
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            try {
                const parsed: AuthCredentials = JSON.parse(stored);
                // Verify token is still valid on mount? Or just trust hydration?
                // For now, let's hydrate. Ideally we ping the server.
                setAuth({ ...parsed, isAuthenticated: true });
            } catch (e) {
                console.error('Failed to parse stored auth', e);
                localStorage.removeItem(STORAGE_KEY);
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (credentials: AuthCredentials): Promise<boolean> => {
        setIsLoading(true);
        const isValid = await checkConnection(credentials);
        if (isValid) {
            setAuth({ ...credentials, isAuthenticated: true });
            localStorage.setItem(STORAGE_KEY, JSON.stringify(credentials));
        }
        setIsLoading(false);
        return isValid;
    };

    const logout = () => {
        setAuth({
            storeUrl: '',
            consumerKey: '',
            consumerSecret: '',
            isAuthenticated: false,
        });
        localStorage.removeItem(STORAGE_KEY);
    };

    return (
        <AuthContext.Provider value={{ ...auth, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
