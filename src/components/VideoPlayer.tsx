import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { AdSdkWeb } from '@dailymotion/ad-sdk-web';
import type { AppState, DevelopmentOptions } from '@dailymotion/ad-sdk-web';

interface VideoPlayerProps {
  src: string;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    let adSdkInitialized = false

    const adSDK = new AdSdkWeb();

    useEffect(() => {

        const initAdSdk = async (): Promise<void> => {
            const container = containerRef.current;
            const videoTag = videoRef.current;

            if(!container || !videoTag || adSdkInitialized ) { return }

            adSdkInitialized = true;
            await adSDK.initialize(container);

            videoTag.addEventListener('play', loadAdsSequence);
        }

        const loadAdsSequence = async (): Promise<void> => {
            console.log('loadAdsSequence');
            const container = containerRef.current;
            const videoTag = videoRef.current;

            if (!container || !videoTag) return;

            videoTag.removeEventListener('play', loadAdsSequence);
            videoTag.pause();

            let adPosition: string | null = null;

            const onContentPauseRequested = (): void => {
                videoTag.pause();
            }

            const onContentResumeRequested = (): void => {
                console.log('Content resume requested');
                if (adSDK.getAdDetails().position !== 'postroll') {
                    videoTag.play();
                }
            }

            const onAdLoad = () => {
                console.log('Ad loaded');
            }

            const onAdStart = (): void => {
                adPosition = adSDK.getAdDetails().position;
                console.log(`Ad Started at position: ${adPosition}`);
            }

            const onAdEnd = (): void => {
                console.log('Ad ended');
            }

            const onAdPlay = (): void => {
                console.log('Ad is playing');
            }

            const onAdPause = (): void => {
                console.log('Ad is paused');
            }

            const onAdBreakEnd = (): void => {
                console.log('Ad break ended');
            }

            const onAdBreakStart = (): void => {
                console.log('Ad break started');
            }

            adSDK.on(adSDK.Events.CONTENT_PAUSE_REQUESTED, onContentPauseRequested);
            adSDK.on(adSDK.Events.CONTENT_RESUME_REQUESTED, onContentResumeRequested);

            adSDK.on(adSDK.Events.AD_LOAD, onAdLoad);
            adSDK.on(adSDK.Events.AD_START, onAdStart);
            adSDK.on(adSDK.Events.AD_END, onAdEnd);
            adSDK.on(adSDK.Events.AD_BREAK_END, onAdBreakEnd);
            adSDK.on(adSDK.Events.AD_BREAK_START, onAdBreakStart);
            adSDK.on(adSDK.Events.AD_PLAY, onAdPlay);
            adSDK.on(adSDK.Events.AD_PAUSE, onAdPause);

            const appState: AppState = {
                consent: {
                    ccpaConsent: '',
                    tcfConsent: '',
                    isEnabledForTcf: false,
                    tcf2HasConsentForGoogle: false,
                    tcf2HasConsentForDailymotion: false,
                    isGdprApplicable: false,
                },
                video: {
                    id: 'x123',
                    isAutoplay: false,
                    type: 'STREAM',
                    isCurrentTimeDVR: false,
                    isSeekable: false,
                    viewId: '',
                    duration: 62,
                },
                environment: {
                    appName: '',
                    locale: '',
                    topDomain: '',
                    embedder: '',
                    clientType: '',
                    deviceId: '',
                    trafficSegment: 0,
                    v1st: '',
                },
                player: {
                    videoTag: videoTag,
                    isPlayerControlsEnabled: false,
                    is3rdPartyCookiesAvailable: false,
                    playedVideosCounter: 0,
                },
            }

            const developmentOptions: DevelopmentOptions = {
                useFakeAd: true
            }

            await adSDK.loadAdsSequence(appState, developmentOptions);
            console.log('Ad SDK initialized');
        }

        const video = videoRef.current;
        if (!video) return;

        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(src);
            initAdSdk();
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                video.play().catch((error) => {
                    console.error('Error playing video:', error);
                });
            });
        }
        // For browsers that natively support HLS (like Safari)
        // else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        //     video.src = src;
        //     video.addEventListener('loadedmetadata', () => {
        //         video.play().catch((error) => {
        //             console.error('Error playing video:', error);
        //         });
        //     });
        // }
    }, [src]);

  return (
    <div
    className="videoPlayerContainer"
    ref={containerRef}
    >
        <video
        id="videoPlayer"
        ref={videoRef}
        controls
        style={{ width: '100%', maxWidth: '800px' }}
        />
    </div>
  );
};

export default VideoPlayer;