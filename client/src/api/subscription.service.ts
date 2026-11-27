import type { AuthResponse, ChannelSubscribersPaginatedResponse, GetVideosQueryParams, SubscribedChannelsPaginatedResponse, ToggleSubscriptionResponse, VideoIdStr } from '../types/types.ts'
import api from './api.ts'



export const subscriptionService = {
    
    // ====== 1. Toggle Subscription ======
    toggleSubscription: async (channelId: VideoIdStr): Promise<AuthResponse<ToggleSubscriptionResponse>> => {
        const response = await api.post<AuthResponse<ToggleSubscriptionResponse>>(`/subscriptions/toggle-subscription/${channelId}`);

        return response.data;
    },
    // ====== 1. Toggle Subscription ======
    
    // ====== 2. Get Subscribed Channels ======
    getSubscribedChannels: async (subscriberId: VideoIdStr, params: Pick<GetVideosQueryParams, 'page' | 'limit'> = { page: 1, limit: 10 }): Promise<AuthResponse<SubscribedChannelsPaginatedResponse>> => {
        const response = await api.get<AuthResponse<SubscribedChannelsPaginatedResponse>>(`/subscriptions/get-subscribed-channels/${subscriberId}`, { params });

        return response.data;
    },
    // ====== 2. Get Subscribed Channels ======
    
    // ====== 3. Get User Channel Subscribers ======
    getUserChannelSubscribers: async (channelId: VideoIdStr, params: Pick<GetVideosQueryParams, 'page' | 'limit'> = { page: 1, limit: 10 }): Promise<AuthResponse<ChannelSubscribersPaginatedResponse>> => {
        const response = await api.get<AuthResponse<ChannelSubscribersPaginatedResponse>>(`/subscriptions/get-user-channel-subs/${channelId}`, { params });

        return response.data;
    },
    // ====== 3. Get User Channel Subscribers ======
};