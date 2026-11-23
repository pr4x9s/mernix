import type { AuthResponse, GetLikedVideosQueryParams, LikedVideosPaginatedResponse, ToggleLikeResponse, VideoIdStr } from '../types/types.ts';
import api from './api.ts';



export const likeService = {

    // ====== 1. Toggle Video Like ======
    toggleVideoLike: async (videoId: VideoIdStr): Promise<AuthResponse<ToggleLikeResponse>> => {
        const response = await api.post<AuthResponse<ToggleLikeResponse>>(`/likes/toggle-video-like/${videoId}`);
        
        return response.data;
    },
    // ====== 1. Toggle Video Like ======

    // ====== 2. Toggle Comment Like ======
    toggleCommentLike: async (commentId: VideoIdStr): Promise<AuthResponse<ToggleLikeResponse>> => {
        const response = await api.post<AuthResponse<ToggleLikeResponse>>(`/likes/toggle-comment-like/${commentId}`);
        
        return response.data;
    },
    // ====== 2. Toggle Comment Like ======

    // ====== 3. Toggle Tweet Like ======
    toggleTweetLike: async (tweetId: VideoIdStr): Promise<AuthResponse<ToggleLikeResponse>> => {
        const response = await api.post<AuthResponse<ToggleLikeResponse>>(`/likes/toggle-tweet-like/${tweetId}`);
        
        return response.data;
    },
    // ====== 3. Toggle Tweet Like ======

    // ====== 4. Get liked videos ======
    getLikedVideos: async (params: GetLikedVideosQueryParams = {}): Promise<AuthResponse<LikedVideosPaginatedResponse>> => {
        const response = await api.get<AuthResponse<LikedVideosPaginatedResponse>>('/likes/get-liked-videos', { params });

        return response.data;
    },
    // ====== 4. Get liked videos ======
};