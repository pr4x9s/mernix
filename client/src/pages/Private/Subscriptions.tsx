import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'
import { Link } from 'react-router'
import { format, formatDistanceToNow } from 'date-fns'
import { BellRing, Loader2, Users, Video } from 'lucide-react'
import { useSubscribedChannels, useToggleSubscription } from '../../hooks/useSubscription.ts'
import { type SubscribedChannel, type SubscribedChannelItem } from '../../types/types.ts'
import { useAuthStore } from '../../store/authStore.ts'
import { Button, ConfirmationModal } from '../../components/common/index.ts'



const Subscriptions = () => {
    const { user } = useAuthStore();
    const subscriberId = user?._id;

    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, error } = useSubscribedChannels(subscriberId, 10);

    const { mutate: toggleSubscription, isPending: isToggling } = useToggleSubscription();

    const [selectedChannel, setSelectedChannel] = useState<SubscribedChannel | null>(null);

    const handleConfirmUnsubscribe = () => {
        if (!selectedChannel?._id) return;
    
        toggleSubscription(
            {
                channelId: selectedChannel._id,
                channelUsername: selectedChannel.username,
            },
            {
                onSuccess: () => {
                    setSelectedChannel(null);
                },
            }
        );
    };

    const { ref, inView } = useInView({
        threshold: 0.1,
    });

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const allSubscriptions = data?.pages.flatMap((page) => page.docs) || [];

    // SKELETON PLACEHOLDER
    if (isLoading) {
        return (
            <section className='w-full max-w-6xl mx-auto px-3 sm:px-4 py-6 md:py-10 animate-pulse'>
                <div className='h-9 w-56 bg-zinc-200 dark:bg-zinc-800 rounded-lg mb-8' />
                <div className='flex flex-col gap-4 sm:gap-5'>
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800/40'
                        >
                            <div className='flex items-center gap-3.5'>
                                <div className='size-14 rounded-full bg-zinc-200 dark:bg-zinc-800 shrink-0' />
                                <div className='space-y-2'>
                                    <div className='h-5 w-40 bg-zinc-200 dark:bg-zinc-800 rounded' />
                                    <div className='h-3.5 w-28 bg-zinc-200 dark:bg-zinc-800 rounded' />
                                </div>
                            </div>
                            <div className='h-9 w-28 bg-zinc-200 dark:bg-zinc-800 rounded-xl' />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    if (isError) {
        return (
            <div className='flex h-[70vh] w-full flex-col items-center justify-center gap-2 text-zinc-500 px-4 text-center'>
                <p className='text-lg font-medium text-zinc-800 dark:text-zinc-200'>
                    Failed to load subscriptions
                </p>
                <p className='text-sm text-zinc-400'>
                    {error?.response?.data?.message || error?.message || 'Something went wrong'}
                </p>
            </div>
        );
    }

    if (allSubscriptions.length === 0) {
        return (
            <div className='flex h-[70vh] w-full flex-col items-center justify-center gap-4 text-zinc-500 px-4'>
                <div className='rounded-full bg-zinc-100 p-4 dark:bg-zinc-900'>
                    <Users size={40} className='text-zinc-400' />
                </div>
                <div className='text-center'>
                    <p className='text-xl font-semibold text-zinc-800 dark:text-zinc-200'>
                        No subscriptions yet
                    </p>
                    <p className='text-sm text-zinc-400 mt-1'>
                        Channels you subscribe to will show up here.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <>
            <title>Subscriptions | Mernix</title>

            <section className='w-full max-w-6xl mx-auto px-3 sm:px-4 py-6 md:py-10 overflow-x-clip'>
                <div className='flex items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4 sm:pb-5 mb-6 sm:mb-8'>
                    <h1 className='text-xl sm:text-2xl md:text-3xl font-bold text-zinc-900 dark:text-zinc-50'>
                        Subscriptions
                    </h1>
                </div>

                {/* Subscribed Channels List */}
                <div className='flex flex-col gap-3.5 sm:gap-4'>
                    {allSubscriptions.map((item: SubscribedChannelItem, index) => {
                        const { channel, createdAt, _id } = item;
                        const channelId = channel._id;
                        const fullName = `${channel.firstName} ${channel.lastName}`.trim();

                        return (
                            <div
                                key={`${_id}-${index}`}
                                className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900/40 p-4 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/60 hover:shadow-md hover:border-purple-500/30 dark:hover:border-purple-500/20 transition-all duration-200 group'
                            >
                                {/* Channel Info */}
                                <div className='flex items-start sm:items-center gap-3.5 min-w-0 flex-1'>
                                    <Link
                                        to={`/c/${channel.username}`}
                                        className='shrink-0'
                                    >
                                        <img
                                            src={channel.avatar}
                                            alt={channel.username}
                                            className='size-12 sm:size-14 rounded-full object-cover border border-zinc-200 dark:border-zinc-700 group-hover:border-purple-500/50 transition-colors'
                                            loading='lazy'
                                        />
                                    </Link>

                                    <div className='min-w-0 flex-1'>
                                        <div className='flex flex-wrap items-center gap-2'>
                                            <Link
                                                to={`/c/${channel.username}`}
                                                title={fullName}
                                                className='text-base md:text-lg font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors truncate'
                                            >
                                                {fullName}
                                            </Link>
                                        </div>

                                        {/*<p className='text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 truncate'>
                                            @{channel.username}
                                        </p>*/}

                                        <Link
                                            to={`/c/${channel?.username}`}
                                            className='hover:underline text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors'
                                        >
                                            @{channel?.username}
                                        </Link>

                                        {/* Stats & Subscribed Date */}
                                        <div className='text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1'>
                                            <span className='inline-flex items-center gap-1 shrink-0'>
                                                <Video size={12} />
                                                <span>
                                                    {channel.totalVideos}{' '}
                                                    {channel.totalVideos === 1 ? 'video' : 'videos'}
                                                </span>
                                            </span>

                                            {createdAt && (
                                                <>
                                                    <span className='shrink-0'>•</span>
                                                    <span
                                                        className='wrap-break-word'
                                                        title={format(new Date(createdAt), 'PPpp')}
                                                    >
                                                        Subscribed{' '}
                                                        {formatDistanceToNow(new Date(createdAt), {
                                                            addSuffix: true,
                                                        })}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Unsubscribe Action */}
                                {channelId && (
                                    <div className='flex items-center justify-end shrink-0'>
                                        <Button
                                            as='button'
                                            variant='secondary'
                                            size='sm'
                                            type='button'
                                            disabled={isToggling}
                                            onClick={() => setSelectedChannel(channel)}
                                            className='hover:bg-red-500/10! hover:text-red-500 dark:hover:bg-red-500/15 dark:hover:text-red-400 transition-colors disabled:opacity-50 cursor-pointer'
                                            title='Unsubscribe'
                                            aria-label='Unsubscribe'
                                            role='button'
                                        >
                                            <BellRing size={14} />
                                            <span>Unsubscribe</span>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Infinite Scroll Target Element */}
                <div
                    ref={ref}
                    className='w-full flex justify-center items-center py-8 sm:py-10 mt-4 sm:mt-6 text-zinc-400 text-sm'
                >
                    {isFetchingNextPage ? (
                        <div className='flex items-center gap-2.5 text-purple-600 dark:text-purple-400 font-medium bg-purple-50 dark:bg-purple-950/30 px-4 py-2 rounded-full border border-purple-100 dark:border-purple-900/40'>
                            <Loader2 className='size-4 animate-spin' />
                            <span>Loading more subscriptions...</span>
                        </div>
                    ) : hasNextPage ? (
                        <span className='opacity-0'>Scroll down to load more</span>
                    ) : (
                        <div className='w-full text-center pt-8 border-t border-zinc-200 dark:border-zinc-800'>
                            <p className='text-xs font-medium text-zinc-500 dark:text-zinc-400'>
                                End of Subscriptions
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <ConfirmationModal
                isOpen={Boolean(selectedChannel)}
				onClose={() => !isToggling && setSelectedChannel(null)}
				onConfirm={handleConfirmUnsubscribe}
				isPending={isToggling}
				title='Confirm Unsubscribe?'
                description={
                    selectedChannel ? (
                        <>
                            Are you sure you want to unsubscribe from{' '}
                            <span className='font-semibold'>
                                {selectedChannel?.firstName} {selectedChannel?.lastName}(<Link
                                    to={`/c/${selectedChannel.username}`}
                                    className='hover:underline hover:text-purple-600 dark:hover:text-purple-400 transition-colors'
                                >
                                    @{selectedChannel?.username}
                                </Link>)
                            </span>
                        </>
                    ) : null
				}
				confirmText='Unsubscribe'
            />
        </>
    )
}

export default Subscriptions