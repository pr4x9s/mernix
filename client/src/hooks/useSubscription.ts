import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { ApiErrorResponse, AuthResponse, ChannelSubscribersPaginatedResponse, SubscribedChannelsPaginatedResponse, ToastId, ToggleSubscriptionResponse } from '../types/types.ts'
import type { AxiosError } from 'axios'
import { subscriptionService } from '../api/subscription.service.ts'
import { toast } from 'sonner'



export const useSubscribedChannels = (subscriberId?: string, limit = 10) => {
    return useInfiniteQuery<SubscribedChannelsPaginatedResponse, AxiosError<ApiErrorResponse>>({
        queryKey: ['subscriptions', 'subscribed-channels', subscriberId, limit],
        
        enabled: Boolean(subscriberId),
        
        initialPageParam: 1,
        
        queryFn: async ({ pageParam = 1 }) => {
            const res = await subscriptionService.getSubscribedChannels(subscriberId!, {
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

export const useChannelSubscribers = (channelId?: string, limit = 10) => {
    return useInfiniteQuery<ChannelSubscribersPaginatedResponse, AxiosError<ApiErrorResponse>>({
        queryKey: ['subscriptions', 'channel-subscribers', channelId, limit],

        enabled: Boolean(channelId),

        initialPageParam: 1,

        queryFn: async ({ pageParam = 1 }) => {
            const res = await subscriptionService.getUserChannelSubscribers(channelId!, {
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

export const useToggleSubscription = () => {
    const queryClient = useQueryClient();

    return useMutation<AuthResponse<ToggleSubscriptionResponse>, AxiosError<ApiErrorResponse>, { channelId: string; channelUsername?: string }, ToastId>({
        mutationFn: ({ channelId }) => subscriptionService.toggleSubscription(channelId),

        onMutate: () => ({
            toastId: toast.loading('Updating subscription...'),
        }),

        onSuccess: (response, { channelUsername }, context) => {
            queryClient.invalidateQueries({ queryKey: ['subscriptions', 'subscribed-channels'] });
            queryClient.invalidateQueries({ queryKey: ['subscriptions', 'channel-subscribers'] });
            if (channelUsername) {
                queryClient.invalidateQueries({ queryKey: ['channelProfile', channelUsername] });
            }
            toast.success(response.message || 'Subscription updated', {
                id: context?.toastId,
            });
        },

        onError: (error, _, context) => {
            toast.error(error.response?.data.message || 'Failed to update subscription', {
                id: context?.toastId,
            })
        }
    });
};