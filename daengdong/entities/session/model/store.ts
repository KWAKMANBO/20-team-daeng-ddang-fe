import { create } from 'zustand';

interface AuthState {
    isLoggedIn: boolean;
    isAuthChecked: boolean;
    setLoggedIn: (value: boolean) => void;
    checkLoginStatus: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    isLoggedIn: false,
    isAuthChecked: false,
    setLoggedIn: (value) => set({ isLoggedIn: value, isAuthChecked: true }),
    checkLoginStatus: async () => {
        try {
            const response = await fetch('/api/auth/session', {
                method: 'GET',
                credentials: 'include',
                cache: 'no-store',
            });

            if (!response.ok) {
                set({ isLoggedIn: false, isAuthChecked: true });
                return;
            }

            const body = (await response.json()) as { authenticated?: boolean };
            set({ isLoggedIn: !!body.authenticated, isAuthChecked: true });
        } catch {
            set({ isLoggedIn: false, isAuthChecked: true });
        }
    }
}));
