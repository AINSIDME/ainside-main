import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, VolumeX, Copy, Maximize, Minimize } from "lucide-react";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { useTranslation } from "react-i18next";

const LiveDemoMini = () => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [status, setStatus] = useState(t('common.loading'));
  const [statusKind, setStatusKind] = useState<"default" | "ok" | "err">("default");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const updateStatus = (kind: "default" | "ok" | "err", text: string) => {
    setStatusKind(kind);
    setStatus(text);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const streamUrl = 'https://stream.ainside.me/live/streamkey/index.m3u8';
    
    // Safari/iOS native HLS support
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.addEventListener('loadedmetadata', () => updateStatus('ok', t('demo.ready')));
      video.addEventListener('error', () => updateStatus('err', t('common.error')));
    } else if (Hls.isSupported()) {
      const hls = new Hls({
        lowLatencyMode: true,
        backBufferLength: 90,
        liveDurationInfinity: true,
        fragLoadingRetryDelay: 1500,
        manifestLoadingRetryDelay: 1500,
        enableWorker: true
      });
      
      hlsRef.current = hls;
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => updateStatus('ok', t('demo.manifestLoaded')));
      hls.on(Hls.Events.FRAG_LOADED, () => updateStatus('ok', t('demo.receiving')));
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data && data.fatal) {
          updateStatus('err', t('demo.fatalError'));
          hls.stopLoad();
          setTimeout(() => { 
            hls.startLoad(); 
          }, 1500);
        } else {
          updateStatus('err', t('demo.reconnecting'));
        }
      });
      
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      
      return () => {
        hls.destroy();
      };
    } else {
      updateStatus('err', t('demo.notSupported'));
    }
    
    // Autoplay attempt
    const tryAutoplay = async () => {
      try {
        await video.play();
        setIsPlaying(true);
      } catch (error) {
        console.log('Autoplay requires user interaction');
        setIsPlaying(false);
      }
    };
    
    tryAutoplay();
  }, []);

  const handlePlayPause = async () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      await video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText('https://stream.ainside.me/live/streamkey/index.m3u8');
      updateStatus('ok', t('demo.urlCopied'));
      setTimeout(() => updateStatus('ok', t('demo.connected')), 1800);
    } catch {
      updateStatus('err', t('demo.copyError'));
    }
  };

  const handleFullscreen = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      if (!document.fullscreenElement) {
        await video.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (error) {
      console.log('Fullscreen not supported');
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900/95 to-slate-950/98 backdrop-blur-sm fixed inset-0 z-10">
      {/* Skip to content link for accessibility */}
      <a href="#main" className="skip-link">
        {t('accessibility.skipToContent')}
      </a>

      {/* Minimal Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-slate-900/95 to-slate-800/90 backdrop-blur-sm border-b border-slate-700/30">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 font-light text-lg">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-medium text-sm shadow-lg">
                A
              </div>
              <span className="text-slate-100">{t('nav.liveDemoMini')}</span>
            </div>
            <div className="flex items-center gap-2" aria-live="polite">
              <div className={`w-2 h-2 rounded-full ${
                statusKind === 'ok' ? 'bg-emerald-400' : 
                statusKind === 'err' ? 'bg-red-400' : 
                'bg-amber-400'
              }`} />
              <span className="text-sm text-slate-300 font-light">{status}</span>
            </div>
          </div>
        </div>
      </header>

      <main id="main" className="flex flex-col md:flex-row h-[calc(100vh-60px)]">
        {/* Video Section - Responsive layout */}
        <section className="flex-1 flex flex-col bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-2 md:p-4 basis-[60%] md:h-full min-h-0">
          {/* Video Player - Takes remaining height */}
          <div className="flex-1 relative w-full flex items-center justify-center min-h-0">
            <div className="w-full max-w-full h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-700/40 shadow-2xl backdrop-blur-sm">
              <video
                ref={videoRef}
                className="w-full h-full object-contain bg-slate-950"
                controls={false}
                autoPlay
                muted
                playsInline
                aria-label={`${t('header.brand')} ${t('nav.liveDemoMini')}`}
              />
            </div>
          </div>

          {/* Minimal Controls - Fixed at bottom */}
          <div className="bg-slate-800/60 border border-slate-700/40 backdrop-blur-sm rounded-xl p-2 md:p-3 shrink-0 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 md:gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayPause}
                  className="h-8 w-8 md:h-9 md:w-9 p-0 hover:bg-slate-700/50 text-slate-200"
                  aria-label={isPlaying ? t('demo.pause') : t('demo.play')}
                >
                  {isPlaying ? <Pause className="h-3 w-3 md:h-4 md:w-4" /> : <Play className="h-3 w-3 md:h-4 md:w-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMute}
                  className="h-8 w-8 md:h-9 md:w-9 p-0 hover:bg-slate-700/50 text-slate-200"
                  aria-label={isMuted ? t('demo.unmute') : t('demo.mute')}
                >
                  {isMuted ? <VolumeX className="h-3 w-3 md:h-4 md:w-4" /> : <Volume2 className="h-3 w-3 md:h-4 md:w-4" />}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="h-8 w-8 md:h-9 md:w-9 p-0 hover:bg-slate-700/50 text-slate-200"
                  title={t('demo.copyUrl')}
                >
                  <Copy className="h-3 w-3 md:h-4 md:w-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleFullscreen}
                  className="h-8 w-8 md:h-9 md:w-9 p-0 hover:bg-slate-700/50 text-slate-200"
                  aria-label={isFullscreen ? t('demo.exitFullscreen') : t('demo.fullscreen')}
                >
                  {isFullscreen ? <Minimize className="h-3 w-3 md:h-4 md:w-4" /> : <Maximize className="h-3 w-3 md:h-4 md:w-4" />}
                </Button>
              </div>
              
              <div className="text-xs text-slate-400 hidden md:block font-light">
                {t('header.brand')} — {t('nav.liveDemoMini')}
              </div>
            </div>
          </div>
        </section>

        {/* Chat Section - Responsive: stacked on mobile, sidebar on desktop */}
        <aside className="w-full md:w-80 md:min-w-80 border-t md:border-t-0 md:border-l border-slate-700/30 bg-gradient-to-b from-slate-800/60 to-slate-900/80 backdrop-blur-sm shadow-2xl basis-[40%] md:h-full min-h-0 overflow-hidden">
          <ChatSidebar />
        </aside>
      </main>

      {/* Hidden status for screen readers */}
      <div className="sr-only" role="status" aria-live="polite">{status}</div>
    </div>
  );
};

export default LiveDemoMini;