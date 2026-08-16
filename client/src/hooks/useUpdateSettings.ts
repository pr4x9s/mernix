import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore.ts'
import type { ApiErrorResponse, AuthResponse, ToastId, UpdateAccountData, User } from '../types/types.ts'
import { authService } from '../api/auth.service.ts'
import { toast } from 'sonner'
import type { AxiosError } from 'axios'
import type { SingleAvatarFormData, SingleCoverFormData } from '../validators/auth.validator.ts'



export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    const setAuth = useAuthStore(state => state.setAuth);


    const updateDetailsMutation = useMutation<AuthResponse<User>, AxiosError<ApiErrorResponse>, UpdateAccountData, ToastId>({
        mutationFn: (data) => authService.updateAccountDetails(data),

        onMutate: () => {
            return {
                toastId: toast.loading('Updating account details...')
            }
        },

        onSuccess: (response, _, context) => {
            setAuth(response.data);
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            queryClient.invalidateQueries({ queryKey: ['channelProfile'] });
            toast.success(response.message || 'Profile details updated successfully!', {
                id: context?.toastId
            });
        },

        onError: (error, _, context) => {
            const serverErrorMessage = error?.response?.data?.message || 'Failed to update details';
            toast.error(serverErrorMessage || 'Failed to update details', {
                id: context?.toastId
            });
        }
    });


    const updateAvatarMutation = useMutation<AuthResponse<User>, AxiosError<ApiErrorResponse>, SingleAvatarFormData, ToastId>({
        mutationFn: (data: SingleAvatarFormData) => authService.updateAvatar(data),

        onMutate: () => {
            return {
                toastId: toast.loading('Uploading fresh avatar...')
            }
        },

        onSuccess: (response, _, context) => {
            setAuth(response.data);
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            queryClient.invalidateQueries({ queryKey: ['channelProfile'] });
            toast.success( response.message || 'Avatar updated successfully!', {
                id: context?.toastId
            });
        },

        onError: (error, _, context) => {
            const serverErrorMessage = error?.response?.data?.message || 'Failed to upload avatar';
            toast.error(serverErrorMessage, {
                id: context?.toastId
            })
        }
    });


    const updateCoverImageMutation = useMutation<AuthResponse<User>, AxiosError<ApiErrorResponse>, SingleCoverFormData, ToastId>({
        mutationFn: (data: SingleCoverFormData) => authService.updateCoverImage(data),

        onMutate: () => {
            return {
                toastId: toast.loading('Uploading channel banner...')
            }
        },

        onSuccess: (response, _, context) => {
            setAuth(response.data);
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
            queryClient.invalidateQueries({ queryKey: ['channelProfile'] });
            toast.success(response.message || 'Cover banner updated successfully!', {
                id: context?.toastId
            })
        },

        onError: (error, _, context) => {
            const serverErrorMessage = error?.response?.data?.message || 'Failed to upload cover banner';
            toast.error(serverErrorMessage, {
                id: context?.toastId
            })
        }
    });


    return {
        // updateDetails: updateDetailsMutation.mutateAsync,
        // updateAvatar: updateAvatarMutation.mutateAsync,
        // updateCoverImage: updateCoverImageMutation.mutateAsync,

        updateDetails: updateDetailsMutation.mutate,
        updateAvatar: updateAvatarMutation.mutate,
        updateCoverImage: updateCoverImageMutation.mutate,
        
        isUpdatingDetails: updateDetailsMutation.isPending,
        isUpdatingAvatar: updateAvatarMutation.isPending,
        isUpdatingCoverImage: updateCoverImageMutation.isPending,
        
        updateDetailsError: updateDetailsMutation.error,
        updateAvatarError: updateAvatarMutation.error,
        updateCoverImageError: updateCoverImageMutation.error,

    };
};








// NOTES:
// 1. Cache Control Invalidation: 
// When a user uploads a new banner file, queryClient.invalidateQueries tells TanStack Query that the old values are stale. The second the user navigates back to their dynamic channel view, it displays the updated graphics from Cloudinary automatically without forcing a manual browser reload.

// 2. mutate Execution Control(recommended):
// TanStack Query handles the asynchronous promise internally, safely feeding results directly into your hook’s lifecycle methods (onSuccess/onError) without any risk of crashing your component UI.

// 3. mutateAsync:
// Must manually handle the asynchronous promise chain using async/await and try/catch inside the component UI, or any unhandled server error will crash your entire React application runtime.