import { type ReactNode } from 'react'
import '@videojs/react/video/skin.css'
import { VideoPlayer as BaseVideoPlayer, VideoSkin, Video } from '@videojs/react/video'


export interface VideoPlayerProps {
	src: string;
	poster?: string;
	autoPlay?: boolean;
	loop?: boolean;
	muted?: boolean;
	className?: string;
	children?: ReactNode;
}


const VideoPlayer = ({
	src,
	poster,
	autoPlay = false,
	loop = false,
	muted = false,
	className = '',
	children,
}: VideoPlayerProps) => {
	
	if (!src) return null;

	return (
		<div className={`relative w-full overflow-hidden aspect-video bg-black ${className}`}>
			<BaseVideoPlayer>
				<VideoSkin style={{ width: '100%', aspectRatio: '16 / 9' }}>
					<Video
						src={src}
                        controls={false}
						poster={poster}
						autoPlay={autoPlay}
						loop={loop}
						muted={muted}
						playsInline
						className='size-full object-contain'
					/>
					{children}
				</VideoSkin>
			</BaseVideoPlayer>
		</div>
	)
}

export default VideoPlayer