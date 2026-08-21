import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ToastId, VideoIdStr } from '../types/types.ts'
import { videoService } from '../api/video.service.ts'
import { toast } from 'sonner'



export const useBulkActionsVideoMutations = () => {
    const queryClient = useQueryClient();

    const invalidateStudioCache = () => {
        queryClient.invalidateQueries({ queryKey: ['videos'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'videos'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    };

    const bulkTogglePublishMutation = useMutation<void, Error, VideoIdStr[], ToastId>({
        mutationFn: async (videoIds) => {
            await Promise.all(videoIds.map(vid => videoService.togglePublishStatus(vid)));
        },
        onMutate: (videoIds) => {
            return {
                toastId: toast.loading(`Toggling visibility status for ${videoIds.length} videos...`)
            };
        },
        onSuccess: (_, videoIds, context) => {
            invalidateStudioCache();
            toast.success(`Toggled visibility for ${videoIds.length} videos`, {
                id: context?.toastId
            });
        },
        onError: (error, _, context) => {
            toast.error(error.message || 'Bulk toggle operation failed', {
                id: context?.toastId
            })
        }
    });

    const bulkDeleteMutation = useMutation<void, Error, VideoIdStr[], ToastId>({
        mutationFn: async (videoIds) => {
            await Promise.all(videoIds.map(vid => videoService.deleteVideo(vid)));
        },
        onMutate: (videoIds) => {
            return {
                toastId: toast.loading(`Deleting ${videoIds.length} videos from your channel...`)
            };
        },
        onSuccess: (_, videoIds, context) => {
            invalidateStudioCache();
            toast.success(`Deleted ${videoIds.length} videos from your channel`, {
                id: context?.toastId
            });
        },
        onError: (error, _, context) => {
            toast.error(error.message || 'Bulk delete operation failed', {
                id: context?.toastId
            })
        }
    });

    return {
        bulkTogglePublish: bulkTogglePublishMutation.mutate,
        bulkDelete: bulkDeleteMutation.mutate,

        isBulkToggling: bulkTogglePublishMutation.isPending,
        isBulkDeleting: bulkDeleteMutation.isPending,
    };
};