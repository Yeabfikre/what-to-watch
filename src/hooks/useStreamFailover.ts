import { useState, useEffect, useCallback, useRef } from "react";
import { PROVIDERS, type StreamProvider } from "@/config/providers";
import { toast } from "@/components/ui/use-toast";

interface UseStreamFailoverOptions {
  active: boolean;
  initialProviderIdx?: number;
  onServerChange?: (idx: number) => void;
}

export function useStreamFailover({
  active,
  initialProviderIdx = 0,
  onServerChange,
}: UseStreamFailoverOptions) {
  const [providerIdx, setProviderIdx] = useState(initialProviderIdx);
  const [failedProviders, setFailedProviders] = useState<number[]>([]);
  const [playbackConfirmed, setPlaybackConfirmed] = useState(false);
  const [lastErrorMessage, setLastErrorMessage] = useState<string | null>(null);

  const providerIdxRef = useRef(providerIdx);
  providerIdxRef.current = providerIdx;

  const failedProvidersRef = useRef(failedProviders);
  failedProvidersRef.current = failedProviders;

  // Switch to a specific server
  const switchToServer = useCallback(
    (idx: number, isAutoFailover = false, reason?: string) => {
      if (idx === providerIdxRef.current && !isAutoFailover) return;
      const prevName = PROVIDERS[providerIdxRef.current]?.name || "Current server";
      const nextProvider = PROVIDERS[idx] || PROVIDERS[0];

      setProviderIdx(idx);
      setPlaybackConfirmed(false);
      setLastErrorMessage(reason || null);
      onServerChange?.(idx);

      if (isAutoFailover) {
        toast({
          title: "Switched to Next Server",
          description: `${prevName} reported an error (${reason || "Unavailable"}). Now streaming from ${nextProvider.name}.`,
        });
      }
    },
    [onServerChange]
  );

  // Skip to next untried server
  const skipToNextServer = useCallback(
    (reason = "Server issue reported") => {
      const current = providerIdxRef.current;
      const failed = failedProvidersRef.current;

      // Mark current as having an issue
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
        // All have had issues, reset list and loop
        setFailedProviders([]);
        nextIdx = (current + 1) % PROVIDERS.length;
      }

      switchToServer(nextIdx, true, reason);
    },
    [switchToServer]
  );

  // Listen for iframe postMessages (success or error) and user interactions
  useEffect(() => {
    if (!active) return;

    const handleMessage = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (typeof data === "string") {
          try {
            data = JSON.parse(data);
          } catch {
            // plain string
          }
        }

        // Check for success signals
        if (
          data?.type === "MEDIA_DATA" ||
          data?.type === "PLAYER_READY" ||
          data?.event === "playing" ||
          data === "playing" ||
          data?.status === "playing"
        ) {
          setPlaybackConfirmed(true);
          setLastErrorMessage(null);
          return;
        }

        // Check for error signals from server/player
        const isErrorType =
          typeof data?.type === "string" &&
          (data.type.toLowerCase().includes("error") ||
            data.type.toLowerCase().includes("fail"));

        const isErrorEvent =
          typeof data?.event === "string" &&
          (data.event.toLowerCase().includes("error") ||
            data.event.toLowerCase().includes("fail"));

        const isErrorStatus =
          typeof data?.status === "string" &&
          (data.status.toLowerCase().includes("error") ||
            data.status.toLowerCase().includes("unavailable"));

        const hasErrorMessage =
          typeof data?.message === "string" &&
          (data.message.toLowerCase().includes("error") ||
            data.message.toLowerCase().includes("no valid source") ||
            data.message.toLowerCase().includes("failed to load"));

        const hasErrorField =
          Boolean(data?.error) ||
          data?.error === "no_source" ||
          data?.code === "MEDIA_ERR_SRC_NOT_SUPPORTED";

        const isStringError =
          typeof data === "string" &&
          (data.toLowerCase().includes("error") ||
            data.toLowerCase().includes("no_source") ||
            data.toLowerCase().includes("playback_error"));

        if (
          isErrorType ||
          isErrorEvent ||
          isErrorStatus ||
          hasErrorMessage ||
          hasErrorField ||
          isStringError
        ) {
          const reasonText =
            typeof data?.message === "string"
              ? data.message
              : typeof data?.error === "string"
              ? data.error
              : "Playback error received from server";
          skipToNextServer(reasonText);
        }
      } catch {
        // ignore cross-origin access issues
      }
    };

    // When user clicks inside iframe to play, window blurs
    const handleBlur = () => {
      setTimeout(() => {
        if (document.activeElement?.tagName === "IFRAME") {
          setPlaybackConfirmed(true);
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

  return {
    providerIdx,
    currentProvider: PROVIDERS[providerIdx] || PROVIDERS[0],
    failedProviders,
    playbackConfirmed,
    lastErrorMessage,
    switchToServer,
    skipToNextServer,
    setPlaybackConfirmed,
  };
}
