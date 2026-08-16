import { useMutation } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { authService } from '../api/auth.service.ts'
import { useAuthStore } from '../store/authStore'
import type { AuthResponse } from '../types/types.ts'
import { toast } from 'sonner'
import type { LoginFormData } from '../validators/auth.validator.ts'



export const useLogin = () => {
    const setAuth = useAuthStore((state) => state.setAuth);
    const setLoginModalOpen = useAuthStore((state) => state.setLoginModalOpen);

    return useMutation({
        mutationFn: (data: LoginFormData) => authService.login(data),

        onSuccess: (response) => {
            setAuth(response.data.user);
            setLoginModalOpen(false);
            toast.success(`Welcome back ${response.data.user.firstName}!`);
        },
        
        onError: (error: AxiosError<AuthResponse<null>>) => {
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(message);
        },
    });
};