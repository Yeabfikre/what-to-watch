import { useState, useEffect, useCallback, useRef } from "react";
import { PROVIDERS, type StreamProvider } from "@/config/providers";
import { toast } from "@/components/ui/use-toast";

interface UseStreamFailoverOptions {
  active: boolean;
  timeoutSeconds?: number;
  initialProviderIdx?: number;
  onServerChange?: (idx: number) => void;
}

export function useStreamFailover({
  active,
  timeoutSeconds = 7,
  initialProviderIdx = 0,
  onServerChange,
}: UseStreamFailoverOptions) {
  const [providerIdx, setProviderIdx] = useState(initialProviderIdx);
  const [failedProviders, setFailedProviders] = useState<number[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [playbackConfirmed, setPlaybackConfirmed] = useState(false);
  const [autoSwitchEnabled, setAutoSwitchEnabled] = useState(true);

  const providerIdxRef = useRef(providerIdx);
  providerIdxRef.current = providerIdx;

  const failedProvidersRef = useRef(failedProviders);
  failedProvidersRef.current = failedProviders;

  const autoSwitchEnabledRef = useRef(autoSwitchEnabled);
  autoSwitchEnabledRef.current = autoSwitchEnabled;

  const playbackConfirmedRef = useRef(playbackConfirmed);
  playbackConfirmedRef.current = playbackConfirmed;

  // Switch to specific server
  const switchToServer = useCallback(
    (idx: number, isAutoFailover = false) => {
      if (idx === providerIdxRef.current && !isAutoFailover) return;
      const targetProvider = PROVIDERS[idx] || PROVIDERS[0];
      setProviderIdx(idx);
      setPlaybackConfirmed(false);
      onServerChange?.(idx);

      if (isAutoFailover) {
        toast({
          title: "Switching Server",
          description: `Server ${PROVIDERS[providerIdxRef.current]?.name || ""} unavailable. Now trying ${targetProvider.name}...`,
        });
      }
    },
    [onServerChange]
  );

  // Skip to next untried server
  const skipToNextServer = useCallback(
    (reason = "User skipped") => {
      const current = providerIdxRef.current;
      const failed = failedProvidersRef.current;

      // Mark current as failed if not already
      if (!failed.includes(current)) {
        setFailedProviders((prev) => [...prev, current]);
      }

      // Find next provider that hasn't failed yet
      let nextIdx = (current + 1) % PROVIDERS.length;
      let count = 0;
      while (failed.includes(nextIdx) && count < PROVIDERS.length) {
        nextIdx = (nextIdx + 1) % PROVIDERS.length;
        count++;
      }

      if (count >= PROVIDERS.length) {
        // All have failed once, reset failed list and loop
        toast({
          variant: "destructive",
          title: "All Servers Tested",
          description: "All streaming servers were attempted. Cycling back to Server 1.",
        });
        setFailedProviders([]);
        nextIdx = (current + 1) % PROVIDERS.length;
      }

      switchToServer(nextIdx, true);
    },
    [switchToServer]
  );

  // Listen for iframe postMessages (success or error) and user interactions
  useEffect(() => {
    if (!active) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        const data = event.data;
        // Success signals: vidsrc sends MEDIA_DATA on valid stream load
        if (
          data?.type === "MEDIA_DATA" ||
          data?.type === "PLAYER_READY" ||
          data?.event === "playing" ||
          data === "playing" ||
          data?.status === "playing"
        ) {
          setPlaybackConfirmed(true);
          setCountdown(null);
        }

        // Error signals
        if (
          data?.type === "ERROR" ||
          data?.type === "playback_error" ||
          data?.error === "no_source" ||
          data === "error"
        ) {
          skipToNextServer("Server reported playback error");
        }
      } catch {
        // ignore cross-origin access issues
      }
    };

    // When user clicks inside iframe, window blurs
    const handleBlur = () => {
      setTimeout(() => {
        if (document.activeElement?.tagName === "IFRAME") {
          setPlaybackConfirmed(true);
          setCountdown(null);
        }
      }, 50);
    };

    window.addEventListener("message", handleMessage);
    window.addEventListener("blur", handleBlur);

    return () => {
      window.removeEventListener("message", handleMessage);
      window.removeEventListener("blur", handleBlur);
    };
  }, [active, skipToNextServer]);

  // Countdown timer for automatic failover
  useEffect(() => {
    if (!active || !autoSwitchEnabled || playbackConfirmed) {
      setCountdown(null);
      return;
    }

    setCountdown(timeoutSeconds);

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          skipToNextServer("Timeout: no stream detected");
          return null;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [active, providerIdx, autoSwitchEnabled, playbackConfirmed, timeoutSeconds, skipToNextServer]);

  const cancelAutoSwitch = useCallback(() => {
    setAutoSwitchEnabled(false);
    setCountdown(null);
    toast({
      title: "Auto-Switch Paused",
      description: "Automatic server switching is now paused. You can switch servers manually.",
    });
  }, []);

  const resumeAutoSwitch = useCallback(() => {
    setAutoSwitchEnabled(true);
    setCountdown(timeoutSeconds);
    toast({
      title: "Auto-Switch Enabled",
      description: "Automatic server failover resumed.",
    });
  }, [timeoutSeconds]);

  return {
    providerIdx,
    currentProvider: PROVIDERS[providerIdx] || PROVIDERS[0],
    failedProviders,
    countdown,
    playbackConfirmed,
    autoSwitchEnabled,
    switchToServer,
    skipToNextServer,
    cancelAutoSwitch,
    resumeAutoSwitch,
    setPlaybackConfirmed,
  };
}
