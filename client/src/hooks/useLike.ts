import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { ApiErrorResponse, AuthResponse, GetLikedVideosQueryParams, LikedVideosPaginatedResponse, ToastId, ToggleLikeResponse, VideoIdStr } from '../types/types.ts'
import type { AxiosError } from 'axios'
import { likeService } from '../api/like.service.ts'
import { toast } from 'sonner'



export const useLikedVideos = (params: GetLikedVideosQueryParams = { page: 1, limit: 10 }) => {
    return useQuery<AuthResponse<LikedVideosPaginatedResponse>, AxiosError<ApiErrorResponse>>({
        queryKey: ['likes', 'liked-videos', params],
        queryFn: () => likeService.getLikedVideos(params),
    });
};

export const useToggleVideoLike = () => {
    const queryClient = useQueryClient();

    return useMutation<AuthResponse<ToggleLikeResponse>, AxiosError<ApiErrorResponse>, VideoIdStr, ToastId>({
        mutationFn: (videoId) => likeService.toggleVideoLike(videoId),
        onMutate: () => ({
            toastId: toast.loading('Updating like...'),
        }),
        onSuccess: (response, videoId, context) => {
            queryClient.invalidateQueries({ queryKey: ['likes', 'liked-videos'] });
            queryClient.invalidateQueries({ queryKey: ['videos', videoId] });
            toast.success(response.message || 'Updated video like', {
                id: context?.toastId
            });
        },
        onError: (error, _, context) => {
            toast.error(error.response?.data.message || 'Failed to update video like', {
                id: context?.toastId
            });
        },
    });
};

export const useToggleCommentLike = () => {
    const queryClient = useQueryClient();

    return useMutation<AuthResponse<ToggleLikeResponse>, AxiosError<ApiErrorResponse>, VideoIdStr, ToastId>({
        mutationFn: (commentId) => likeService.toggleVideoLike(commentId),
        onMutate: () => ({
            toastId: toast.loading('Updating like...'),
        }),
        onSuccess: (response, _, context) => {
            queryClient.invalidateQueries({ queryKey: ['comments'] });
            toast.success(response.message || 'Updated comment like', {
                id: context?.toastId
            });
        },
        onError: (error, _, context) => {
            toast.error(error.response?.data.message || 'Failed to update comment like', {
                id: context?.toastId
            });
        },
    });
};

export const useToggleTweetLike = () => {
    const queryClient = useQueryClient();

    return useMutation<AuthResponse<ToggleLikeResponse>, AxiosError<ApiErrorResponse>, VideoIdStr, ToastId>({
        mutationFn: (tweetId) => likeService.toggleVideoLike(tweetId),
        onMutate: () => ({
            toastId: toast.loading('Updating like...'),
        }),
        onSuccess: (response, _, context) => {
            queryClient.invalidateQueries({ queryKey: ['tweets'] });
            toast.success(response.message || 'Updated tweet like', {
                id: context?.toastId
            });
        },
        onError: (error, _, context) => {
            toast.error(error.response?.data.message || 'Failed to update tweet like', {
                id: context?.toastId
            });
        },
    });
};