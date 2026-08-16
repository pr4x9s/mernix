import type { AuthResponse, ChannelProfile, PaginatedResponse, User, WatchHistoryVideoItem } from '../types/types.ts'
import type { ChangeCurrentPasswordFormData, LoginFormData, RegisterFormData, SingleAvatarFormData, SingleCoverFormData, UpdateAccountDetailsFormData } from '../validators/auth.validator.ts';
import api from './api.ts'



export const authService = {
    
    // ======= 1. Authentication & Session =======
    register: async (data: RegisterFormData): Promise<AuthResponse<User>> => {
        const formData = new FormData();

		formData.append('firstName', data.firstName.trim());
		formData.append('lastName', data.lastName.trim());
		formData.append('username', data.username.toLowerCase().trim());
		formData.append('email', data.email.toLowerCase().trim());
		formData.append('password', data.password);
		formData.append('confirmPassword', data.confirmPassword);

		if (data.avatar) formData.append('avatar', data.avatar);
		if (data.coverImage) formData.append('coverImage', data.coverImage);

        const response = await api.post<AuthResponse<User>>('/users/register', data, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    },

    login: async (data: LoginFormData): Promise<AuthResponse<{ user: User }>> => {
        const response = await api.post<AuthResponse<{ user: User }>>('/users/login', data);
        return response.data;
    },

    logout: async (): Promise<AuthResponse<null>> => {
        const response = await api.post<AuthResponse<null>>('/users/logout');
        return response.data;
    },

    refreshAccessToken: async (): Promise<AuthResponse<{ accessToken: string; refreshToken: string }>> => {
        const response = await api.post<AuthResponse<{ accessToken: string; refreshToken: string }>>('/users/refresh-token');
        return response.data;
    },
    // ======= 1. Authentication & Session =======


    // ======= 2. Profile management =======
    getCurrentUser: async (): Promise<AuthResponse<User>> => {
        const response = await api.get<AuthResponse<User>>('/users/get-current-user', {
            headers: {
                'X-Skip-Auth-Modal': 'true'
            }
        });
        return response.data;
    },

    changeCurrentPassword: async (data: ChangeCurrentPasswordFormData): Promise<AuthResponse<null>> => {
        const response = await api.post<AuthResponse<null>>('/users/change-current-password', data);
        return response.data;
    },

    updateAccountDetails: async (data: UpdateAccountDetailsFormData): Promise<AuthResponse<User>> => {
        const response = await api.patch<AuthResponse<User>>('/users/update-account-details', data);
        return response.data;
    },
    // ======= 2. Profile management =======


    // ======= 3. Media/Asset updates =======
    updateAvatar: async (data: SingleAvatarFormData): Promise<AuthResponse<User>> => {
        const formData = new FormData();
        if (data.avatar) formData.append('avatar', data.avatar);

        const response = await api.patch<AuthResponse<User>>('/users/update-user-avatar', formData);
        return response.data;
    },

    updateCoverImage: async (data: SingleCoverFormData): Promise<AuthResponse<User>> => {
        const formData = new FormData();
        if (data.coverImage) formData.append('coverImage', data.coverImage);

        const response = await api.patch<AuthResponse<User>>('/users/update-user-cover', formData);
        return response.data;
    },
    // ======= 3. Media/Asset updates =======


    // ======= 4. Channel & history =======
    getChannelProfile: async (username: string): Promise<AuthResponse<ChannelProfile>> => {
        const response = await api.get<AuthResponse<ChannelProfile>>(`/users/get-user-channel-profile/${username}`);
        return response.data;
    },
    
    // getWatchHistory: async (): Promise<AuthResponse<Video[]>> => {
    //     const response = await api.get<AuthResponse<Video[]>>('users/get-watch-history');
    //     return response.data;
    // },

    getWatchHistory: async (page = 1, limit = 10): Promise<PaginatedResponse<WatchHistoryVideoItem>> => {
        const response = await api.get<AuthResponse<PaginatedResponse<WatchHistoryVideoItem>>>(`/users/get-watch-history?page=${page}&limit=${limit}`);
        
        if (response.data.data) {
            response.data.data.message = response.data.message;
        }
        return response.data.data;
    }
    // ======= 4. Channel & history =======
};