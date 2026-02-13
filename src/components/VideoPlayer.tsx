import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { AdSdkWeb } from '@dailymotion/ad-sdk-web';
import type { AppState, DevelopmentOptions } from '@dailymotion/ad-sdk-web';

interface VideoPlayerProps {
    src: string;
    useFakeAd: boolean;
    autoplay?: boolean;
    customVmapUrl?: string; // Optional custom VMAP URL for testing
    xid?: string; // Dailymotion video ID (e.g., 'x8iio7y')
}

type ConsentObject = {
    tcfConsent: string;
    tcf2HasConsentForGoogle: boolean;
    tcf2HasConsentForDailymotion: boolean;
    isGdprApplicable: boolean;
}

const DAILYMOTION_VENDOR_ID = 573;
const GOOGLE_VENDOR_ID = 755;

const defaultConsent: ConsentObject = {
    tcfConsent: '',
    tcf2HasConsentForGoogle: false,
    tcf2HasConsentForDailymotion: false,
    isGdprApplicable: false,
}

declare function __tcfapi(
    command: string,
    version: number,
    callback: (tcData: TcData, success: boolean) => void
): void;

type TcData = {
    tcString?: string; // The TCF consent string
    purpose?: {
        consents?: {
        [key: number]: boolean; // Purpose consents, indexed by purpose ID
        };
    };
    vendor?: {
        consents?: {
        [key: number]: boolean; // Vendor consents, indexed by vendor ID
        };
    };
    gdprApplies?: boolean; // Indicates if GDPR applies
};

function getConsentFromTcfApi(): Promise<ConsentObject> {
    return new Promise((resolve) => {
        if (typeof __tcfapi !== 'function') {
            return resolve(defaultConsent);
        }
        __tcfapi('getTCData', 2, function(tcData: TcData, success: boolean) {
            if (success && tcData && tcData.vendor && tcData.vendor.consents) {
                resolve({
                    tcfConsent: tcData.tcString || '',
                    tcf2HasConsentForGoogle: !!tcData.vendor.consents[GOOGLE_VENDOR_ID],
                    tcf2HasConsentForDailymotion: !!tcData.vendor.consents[DAILYMOTION_VENDOR_ID],
                    isGdprApplicable: tcData.gdprApplies || false,
                });
            } else {
                resolve(defaultConsent);
            }
        });
    });
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ src, useFakeAd, autoplay = false, customVmapUrl, xid = 'x8iio7y' }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const adSdkInitializedRef = useRef(false);
    const adsLoadedRef = useRef(false);
    const adSDKRef = useRef(new AdSdkWeb());
    const userInteractedRef = useRef(false);
    const isAdPlayingRef = useRef(false); // Track if ad is currently playing

    useEffect(() => {
        const adSDK = adSDKRef.current;
        let adPosition: string | null = null;

        const initializeAndLoadAds = async (): Promise<void> => {
            const container = containerRef.current;
            const videoTag = videoRef.current;

            if (!container || !videoTag || adSdkInitializedRef.current) { return }

            adSdkInitializedRef.current = true;

            // Initialize the ad SDK
            await adSDK.initialize(container);
            console.log('Ad SDK initialized');

            // Set up event handlers before loading ads
            const onContentPauseRequested = (): void => {
                console.log('Content pause requested');
                isAdPlayingRef.current = true;
                videoTag.pause();
            }

            const onContentResumeRequested = (): void => {
                console.log('Content resume requested');
                isAdPlayingRef.current = false;
                const adDetails = adSDK.getAdDetails();
                if (adDetails && adDetails.position !== 'postroll') {
                    videoTag.play().catch((error) => {
                        console.error('Error playing video after ad:', error);
                    });
                }
            }

            const onAdLoad = () => {
                console.log('Ad loaded');
            }

            const onAdStart = (): void => {
                const adDetails = adSDK.getAdDetails();
                adPosition = adDetails ? adDetails.position : null;
                isAdPlayingRef.current = true;
                console.log(`Ad Started at position: ${adPosition}`);
            }

            const onAdEnd = (): void => {
                console.log('Ad ended');
                isAdPlayingRef.current = false;
            }

            const onAdPlay = (): void => {
                console.log('Ad is playing');
            }

            const onAdPause = (): void => {
                console.log('Ad is paused');
            }

            const onAdBreakEnd = (): void => {
                console.log('Ad break ended');
                isAdPlayingRef.current = false;
            }

            const onAdBreakStart = (): void => {
                console.log('Ad break started');
                isAdPlayingRef.current = true;
            }

            const onAdError = (code?: number, message?: string): void => {
                console.error('Ad error:', code, message);
                isAdPlayingRef.current = false;
                // If ad fails, allow content to play
                if (!adsLoadedRef.current) {
                    adsLoadedRef.current = true;
                    if (autoplay && userInteractedRef.current) {
                        videoTag.play().catch((error) => {
                            console.error('Error playing video after ad error:', error);
                        });
                    }
                }
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
            adSDK.on(adSDK.Events.AD_ERROR, onAdError);

            // Get consent
            const consent: ConsentObject = await getConsentFromTcfApi();

            // Prepare app state
            const appState: AppState = {
                consent: consent,
                video: {
                    id: xid,
                    isAutoplay: autoplay,
                    type: 'STREAM',
                    isCurrentTimeDVR: false,
                    isSeekable: false,
                    viewId: '',
                    duration: 62,
                    publisherId: '',
                    publisherType: 'player',
                    publisherReference: 'x1alda',
                    streamTech: 'hls.js',
                    ownerId: '',
                    createdTime: Date.now(),
                    mimeType: 'application/x-mpegURL',
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
                    is3rdPartyCookiesAvailable: false,
                    osFamily: '',
                    osName: '',
                    uaFamily: '',
                    uaName: '',
                    uaVersion: '',
                },
                player: {
                    videoTag: videoTag,
                    isPlayerControlsEnabled: false,
                },
            }

            const developmentOptions: DevelopmentOptions = useFakeAd ? {
                useFakeAd: true,
                vmapUrl: ''
            } : customVmapUrl ? {
                useFakeAd: false,
                vmapUrl: customVmapUrl
            } : {
                useFakeAd: false,
                vmapUrl: ''
            }

            // Load ads sequence - this will trigger preroll ad automatically if available
            await adSDK.loadAdsSequence(appState, developmentOptions);
            adsLoadedRef.current = true;
            console.log('Ads sequence loaded');

            // If autoplay is enabled and we have user interaction, try to play
            if (autoplay && userInteractedRef.current) {
                // The ad SDK will handle playing the preroll ad if available
                // If no preroll, we need to manually start the content
                const currentAdDetails = adSDK.getAdDetails();
                const hasPreroll = currentAdDetails && currentAdDetails.position === 'preroll';
                if (!hasPreroll) {
                    videoTag.play().catch((error) => {
                        console.error('Autoplay blocked:', error);
                    });
                }
            }
        }

        const handleUserInteraction = async () => {
            if (userInteractedRef.current) return;

            userInteractedRef.current = true;
            console.log('User interaction detected');
        }

        const handleVideoPlay = async (event: Event) => {
            const video = videoRef.current;
            if (!video) return;

            // If ads are currently playing, prevent content from starting
            if (isAdPlayingRef.current) {
                console.log('Preventing video play - ad is currently playing');
                video.pause();
                event.preventDefault();
                event.stopPropagation();
                return;
            }

            // If ads haven't been loaded yet, load them first
            if (!adsLoadedRef.current) {
                // Pause the video immediately to load ads first
                video.pause();
                event.preventDefault();

                console.log('Video play triggered - loading ads');

                // Mark that user has interacted
                userInteractedRef.current = true;

                // Initialize and load ads before playing
                await initializeAndLoadAds();
            }
        }

        const handleVideoPlaying = () => {
            const video = videoRef.current;
            if (!video) return;

            // If an ad is playing, pause the content video immediately
            if (isAdPlayingRef.current) {
                console.log('Pausing content - ad is playing');
                video.pause();
            }
        }

        const video = videoRef.current;
        if (!video) return;

        // Listen for play event on the video element to trigger ads
        video.addEventListener('play', handleVideoPlay);
        // Listen for playing event to catch when video actually starts playing
        video.addEventListener('playing', handleVideoPlaying);

        // Track user interaction for autoplay policy
        const interactionEvents = ['click', 'touchstart', 'keydown'];
        const container = containerRef.current;

        if (container) {
            interactionEvents.forEach(event => {
                container.addEventListener(event, handleUserInteraction, { once: true });
            });
        }

        if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, async () => {
                console.log('HLS manifest parsed');

                // If autoplay is requested, initialize immediately and autoplay muted
                if (autoplay) {
                    // Mute the video to allow autoplay in most browsers
                    video.muted = true;
                    userInteractedRef.current = true;

                    try {
                        await initializeAndLoadAds();
                    } catch (error) {
                        console.error('Error during autoplay initialization:', error);
                    }
                }
                // For non-autoplay, ads will be loaded when user clicks play
            });
        }

        // Cleanup
        return () => {
            video.removeEventListener('play', handleVideoPlay);
            video.removeEventListener('playing', handleVideoPlaying);

            if (container) {
                interactionEvents.forEach(event => {
                    container.removeEventListener(event, handleUserInteraction);
                });
            }
        };
    }, [src, useFakeAd, autoplay, customVmapUrl, xid]);

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