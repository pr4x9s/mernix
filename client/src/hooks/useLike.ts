import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ApiErrorResponse, AuthResponse, LikedVideosPaginatedResponse, ToastId, ToggleLikeResponse, VideoIdStr } from '../types/types.ts'
import type { AxiosError } from 'axios'
import { likeService } from '../api/like.service.ts'
import { toast } from 'sonner'



export const useLikedVideos = (limit = 10) => {
    return useInfiniteQuery<LikedVideosPaginatedResponse, AxiosError<ApiErrorResponse>>({
        queryKey: ['likes', 'liked-videos', limit],
        
        initialPageParam: 1,
        
        queryFn: async ({ pageParam = 1 }) => {
            const res = await likeService.getLikedVideos({
                page: pageParam as number,
                limit,
            });
            return res.data;
        },
        
        getNextPageParam: (lastPage) => {
            if (lastPage.hasNextPage && lastPage.nextPage) {
                return lastPage.nextPage;
            }
            return undefined;
        },
        
        refetchOnWindowFocus: false,
        
        staleTime: 5 * 60 * 1000
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