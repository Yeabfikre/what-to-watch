import React, { useEffect, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface BackgroundTrailerProps {
  trailerKey: string | null;
  backdropUrl: string | null;
  title: string;
  isStreamingFull: boolean;
  onTrailerStateChange?: (isPlaying: boolean) => void;
}

export const BackgroundTrailer: React.FC<BackgroundTrailerProps> = ({
  trailerKey,
  backdropUrl,
  title,
  isStreamingFull,
  onTrailerStateChange,
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isTrailerActive, setIsTrailerActive] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imgError, setImgError] = useState(false);

  // If user opened full streaming player, cancel trailer
  useEffect(() => {
    if (isStreamingFull) {
      setIsTrailerActive(false);
      setIsPlaying(false);
      onTrailerStateChange?.(false);
    }
  }, [isStreamingFull, onTrailerStateChange]);

  // Autoplay trailer after 300ms delay like phonofilm.cc
  useEffect(() => {
    if (!trailerKey || isStreamingFull) {
      setIsTrailerActive(false);
      setIsPlaying(false);
      return;
    }

    setHasError(false);
    setIsPlaying(false);
    setIsMuted(true);

    const timer = setTimeout(() => {
      setIsTrailerActive(true);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [trailerKey, isStreamingFull]);

  // Listen for YouTube Iframe API postMessages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data !== "string") return;
      try {
        const data = JSON.parse(event.data);

        // Player error
        if (data.event === "onError") {
          setHasError(true);
          setIsTrailerActive(false);
          setIsPlaying(false);
          onTrailerStateChange?.(false);
          return;
        }

        // YouTube playerState 1 = PLAYING
        if (data?.info?.playerState === 1) {
          setIsPlaying(true);
          onTrailerStateChange?.(true);
        }
      } catch {
        // Not a JSON message or non-YT message
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onTrailerStateChange]);

  // When iframe loads, establish listening channel
  const handleIframeLoad = () => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({
          event: "listening",
          id: trailerKey,
          channel: "widget",
        }),
        "*"
      );
    } catch {
      // Ignored
    }
  };

  // YouTube Command Sender Helper
  const sendCommand = useCallback((func: string, args: unknown[] = []) => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: "command", func, args }),
        "*"
      );
    } catch {
      // Ignored
    }
  }, []);

  // Mute / Unmute Toggle
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sendCommand(nextMuted ? "mute" : "unMute");
  };

  // Build phonofilm YouTube background embed URL
  const embedUrl = trailerKey
    ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${trailerKey}&enablejsapi=1&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&start=6`
    : null;

  return (
    <>
      {/* 1. STATIC BACKDROP IMAGE (Cross-fades to opacity-0 when trailer plays) */}
      {backdropUrl && !imgError && (
        <img
          src={backdropUrl}
          alt={title}
          className={`absolute inset-0 h-full w-full object-cover object-center scale-105 transition-opacity duration-1000 ${
            isPlaying && isTrailerActive ? "opacity-0" : "opacity-90"
          }`}
          onError={() => setImgError(true)}
        />
      )}

      {/* 2. BACKGROUND TRAILER IFRAME */}
      {isTrailerActive && embedUrl && !hasError && !isStreamingFull && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <iframe
            ref={iframeRef}
            title={`${title} Background Trailer`}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            tabIndex={-1}
            aria-hidden="true"
            onLoad={handleIframeLoad}
            className={`pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-opacity duration-800 ${
              isPlaying ? "opacity-100" : "opacity-0"
            }`}
            style={{
              width: "max(100%, 177.78vh)",
              height: "max(100%, 56.25vw)",
            }}
            src={embedUrl}
          />
        </div>
      )}

      {/* 3. DEDICATED MUTE / UNMUTE BUTTON (Bottom-right corner of trailer hero) */}
      {isTrailerActive && isPlaying && !isStreamingFull && (
        <button
          type="button"
          onClick={toggleMute}
          aria-label={isMuted ? "Unmute trailer" : "Mute trailer"}
          className="absolute bottom-6 right-6 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white backdrop-blur-md transition-all hover:bg-black/80 hover:scale-105 active:scale-95 sm:h-11 sm:w-11 md:bottom-8 md:right-8 cursor-pointer shadow-lg"
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4 sm:h-5 sm:w-5 text-white/90" />
          ) : (
            <Volume2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          )}
        </button>
      )}
    </>
  );
};

export default BackgroundTrailer;
