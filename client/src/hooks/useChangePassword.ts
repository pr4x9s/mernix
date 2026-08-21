import { useMutation } from '@tanstack/react-query'
import type { ApiErrorResponse, AuthResponse, ToastId } from '../types/types.ts'
import { authService } from '../api/auth.service.ts'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { ChangeCurrentPasswordFormData } from '../validators/auth.validator.ts'



export const useChangePassword = () => {

    const changePasswordMutation = useMutation<AuthResponse<null>, AxiosError<ApiErrorResponse>, ChangeCurrentPasswordFormData, ToastId>({
        mutationFn: (data) => authService.changeCurrentPassword(data),

        onMutate: () => {
            return {
                toastId: toast.loading('Securing your identity...')
            }
        },

        onSuccess: (response, _, context) => {
            toast.success(response.message || 'Password changed successfully!', {
                id: context?.toastId
            });
        },

        onError: (error, _, context) => {
            const serverErrorMessage = error?.response?.data?.message || 'Verification failure. Verify old password.';

            toast.error(serverErrorMessage, {
                id: context?.toastId
            })
        }
    });

    return {
        // changePassword: changePasswordMutation.mutateAsync,
        changePassword: changePasswordMutation.mutate,
        isChangingPassword: changePasswordMutation.isPending,
        isChangingPasswordError: changePasswordMutation.error,
        isChangingPasswordSuccess: changePasswordMutation.isSuccess,
        resetMutation: changePasswordMutation.reset
    };
};