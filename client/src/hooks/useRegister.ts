import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router';
import { authService } from '../api/auth.service.ts';
import type { AuthResponse } from '../types/types.ts';
import { toast } from 'sonner';
import type { RegisterFormData } from '../validators/auth.validator.ts';



export const useRegister = () => {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: (data: RegisterFormData) => authService.register(data),
        onSuccess: () => {
            toast.success('Registration successful! Please sign in.');
            navigate('/login');
        },
        onError: (error: AxiosError<AuthResponse<null>>) => {
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(message);
        },
    });
};