import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Download,
  Copy,
  Check,
  ExternalLink,
  Film,
  Tv,
  Server,
  Sparkles,
  Terminal,
  FileVideo,
  ShieldCheck,
  Info,
  Calendar,
  Clock,
  Layers,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { PROVIDERS } from "@/config/providers";
import { fetchSeason, tmdbImg, type TmdbSeason } from "@/lib/tmdb";
import { useToast } from "@/hooks/use-toast";

export interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  tmdbId: number;
  type?: "movie" | "tv";
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string;
  seasons?: {
    season_number: number;
    name: string;
    episode_count: number;
    air_date: string | null;
  }[];
  initialSeason?: number;
  initialEpisode?: number;
  initialServerIdx?: number;
}

export function DownloadModal({
  isOpen,
  onClose,
  title,
  tmdbId,
  type = "movie",
  posterPath,
  releaseDate,
  seasons = [],
  initialSeason = 1,
  initialEpisode = 1,
  initialServerIdx = 0,
}: DownloadModalProps) {
  const { toast } = useToast();
  const isTV = type === "tv";

  // Server selection state
  const [selectedServerIdx, setSelectedServerIdx] = useState<number>(initialServerIdx);
  // TV season & episode state
  const [selectedSeason, setSelectedSeason] = useState<number>(initialSeason);
  const [selectedEpisode, setSelectedEpisode] = useState<number>(initialEpisode);
  // Feedback copy states
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [copiedCmd, setCopiedCmd] = useState<boolean>(false);

  // Filter valid seasons (exclude season 0 specials by default unless it's the only one)
  const validSeasons = useMemo(() => {
    const regular = seasons.filter((s) => s.season_number > 0);
    return regular.length > 0 ? regular : seasons;
  }, [seasons]);

  // Fetch season data for TV shows to get accurate episode titles & counts
  const { data: seasonData, isLoading: isLoadingSeason } = useQuery<TmdbSeason>({
    queryKey: ["tmdb", "downloadModalSeason", tmdbId, selectedSeason],
    queryFn: () => fetchSeason(tmdbId, selectedSeason),
    enabled: isOpen && isTV && !!tmdbId,
  });

  const episodes = seasonData?.episodes || [];
  const activeEpisode = episodes.find((e) => e.episode_number === selectedEpisode);

  // Active provider
  const currentProvider = PROVIDERS[selectedServerIdx] || PROVIDERS[0];

  // Compute stream URL for active server
  const streamUrl = useMemo(() => {
    if (!tmdbId) return "";
    return isTV
      ? currentProvider.tv(String(tmdbId), selectedSeason, selectedEpisode)
      : currentProvider.movie(String(tmdbId));
  }, [currentProvider, tmdbId, isTV, selectedSeason, selectedEpisode]);

  // Clean filename for downloads
  const safeTitle = useMemo(() => {
    return title.replace(/[^a-zA-Z0-9_\- ]/g, "").trim().replace(/\s+/g, "_");
  }, [title]);

  const episodeCode = isTV
    ? `S${String(selectedSeason).padStart(2, "0")}E${String(selectedEpisode).padStart(2, "0")}`
    : "";

  const downloadBaseName = isTV
    ? `${safeTitle}_${episodeCode}_${currentProvider.name}`
    : `${safeTitle}_${releaseDate ? releaseDate.slice(0, 4) : "Movie"}_${currentProvider.name}`;

  // 1. Download Video Stream launcher (.strm file + open download window)
  const handleDownloadStream = () => {
    if (!streamUrl) return;

    // Trigger .strm file download (native streaming launcher for VLC, Kodi, PotPlayer, MPV)
    const strmContent = `${streamUrl}\n`;
    const blob = new Blob([strmContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${downloadBaseName}.strm`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Open stream page in background/new tab so download extensions (IDM, Video DownloadHelper, 1DM) capture video
    window.open(streamUrl, "_blank", "noopener,noreferrer");

    toast({
      title: `Downloading from ${currentProvider.name}`,
      description: `Stream link saved as ${downloadBaseName}.strm. Video stream opened in downloader tab.`,
    });
  };

  // 2. Download M3U Playlist file
  const handleDownloadM3U = () => {
    if (!streamUrl) return;

    const m3uContent = `#EXTM3U\n#EXTINF:-1,${title} ${episodeCode} [${currentProvider.name}]\n${streamUrl}\n`;
    const blob = new Blob([m3uContent], { type: "application/x-mpegurl;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${downloadBaseName}.m3u`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "M3U Playlist Downloaded",
      description: `Saved as ${downloadBaseName}.m3u. Double-click to play or record with VLC Player.`,
    });
  };

  // 3. Copy Direct Server URL
  const handleCopyUrl = () => {
    if (!streamUrl) return;
    navigator.clipboard.writeText(streamUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
    toast({
      title: "Direct Server URL Copied",
      description: `Copied ${currentProvider.name} stream link to clipboard. Ready for IDM or browser download manager.`,
    });
  };

  // 4. Copy yt-dlp terminal command
  const ytdlpCommand = `yt-dlp "${streamUrl}" -o "${downloadBaseName}.mp4"`;
  const handleCopyCommand = () => {
    navigator.clipboard.writeText(ytdlpCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
    toast({
      title: "yt-dlp Command Copied",
      description: "Paste into your terminal to download the full MP4 video file with audio.",
    });
  };

  const poster = posterPath ? tmdbImg.poster(posterPath) : null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-zinc-950/95 border-white/10 text-white backdrop-blur-2xl p-0 overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header Bar */}
        <DialogHeader className="p-5 pb-3 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-start gap-4">
            {poster ? (
              <img
                src={poster}
                alt={title}
                className="w-14 h-20 rounded-lg object-cover shadow-md border border-white/10 shrink-0"
              />
            ) : (
              <div className="w-14 h-20 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0">
                <Film className="h-6 w-6 text-white/40" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                  {isTV ? <Tv className="h-3 w-3" /> : <Film className="h-3 w-3" />}
                  {isTV ? "TV Series" : "Movie"}
                </span>
                <span className="text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> 1080p Full HD
                </span>
                {releaseDate && (
                  <span className="text-xs text-zinc-400 flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> {releaseDate.slice(0, 4)}
                  </span>
                )}
              </div>

              <DialogTitle className="text-lg sm:text-xl font-bold text-white truncate">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs text-zinc-400 truncate mt-0.5">
                Download high-speed video streams across all available servers.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* ======================================================== */}
          {/* TV SHOW SEASON & EPISODE PICKER (Only if TV Series)      */}
          {/* ======================================================== */}
          {isTV && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-primary" />
                  Select Episode to Download
                </span>
                {activeEpisode && (
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {episodeCode}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Season Dropdown */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium block mb-1">
                    Season
                  </label>
                  <select
                    value={selectedSeason}
                    onChange={(e) => {
                      setSelectedSeason(Number(e.target.value));
                      setSelectedEpisode(1);
                    }}
                    className="w-full bg-zinc-900 border border-white/15 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {validSeasons.map((s) => (
                      <option key={s.season_number} value={s.season_number}>
                        {s.name || `Season ${s.season_number}`} ({s.episode_count} Episodes)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Episode Dropdown */}
                <div>
                  <label className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium block mb-1">
                    Episode {isLoadingSeason ? "(Loading...)" : ""}
                  </label>
                  <select
                    value={selectedEpisode}
                    onChange={(e) => setSelectedEpisode(Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-white/15 rounded-lg px-3 py-2 text-xs font-medium text-white focus:outline-none focus:border-primary cursor-pointer"
                  >
                    {episodes.length > 0 ? (
                      episodes.map((ep) => (
                        <option key={ep.episode_number} value={ep.episode_number}>
                          Ep. {ep.episode_number}: {ep.name || `Episode ${ep.episode_number}`}
                        </option>
                      ))
                    ) : (
                      // Fallback count if season data is loading
                      Array.from({ length: validSeasons.find(s => s.season_number === selectedSeason)?.episode_count || 12 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          Episode {num}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {activeEpisode && (
                <div className="text-[11px] text-zinc-400 bg-black/40 rounded-lg p-2.5 border border-white/5 flex items-center justify-between">
                  <span className="truncate pr-2 font-medium text-white/90">
                    Ep {activeEpisode.episode_number}: {activeEpisode.name}
                  </span>
                  {activeEpisode.runtime && (
                    <span className="shrink-0 flex items-center gap-1 text-zinc-400">
                      <Clock className="h-3 w-3" /> {activeEpisode.runtime}m
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* SERVER SELECTION: EVERY SERVER SUPPORTED                 */}
          {/* ======================================================== */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Server className="h-3.5 w-3.5 text-primary" />
                Select Download Server ({PROVIDERS.length} Available)
              </span>
              <span className="text-[11px] text-primary font-medium">
                Active: {currentProvider.name}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {PROVIDERS.map((provider, idx) => {
                const isSelected = selectedServerIdx === idx;
                return (
                  <button
                    key={provider.name}
                    type="button"
                    onClick={() => setSelectedServerIdx(idx)}
                    className={`flex flex-col items-start p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-primary bg-primary/15 shadow-sm shadow-primary/20 ring-1 ring-primary/40"
                        : "border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${isSelected ? "bg-primary animate-pulse" : "bg-zinc-500"}`} />
                        {provider.name}
                      </span>
                      {idx === 0 && (
                        <span className="text-[9px] font-semibold bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded">
                          Fast
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      Server {idx + 1} • {idx < 3 ? "1080p Ultra HD" : "Multi-Source HD"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* PRIMARY DOWNLOAD ACTIONS                                 */}
          {/* ======================================================== */}
          <div className="space-y-2.5 pt-1">
            {/* Primary Download Button */}
            <button
              type="button"
              onClick={handleDownloadStream}
              className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 active:scale-[0.98] transition-all cursor-pointer"
            >
              <Download className="h-4 w-4" />
              <span>Download Video from {currentProvider.name}</span>
            </button>

            {/* Secondary Actions Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* VLC / Media Player Playlist (.m3u) */}
              <button
                type="button"
                onClick={handleDownloadM3U}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-semibold text-white/90 hover:border-white/30 hover:bg-white/10 transition active:scale-[0.98] cursor-pointer"
                title="Download .m3u playlist to play or record in VLC Player"
              >
                <FileVideo className="h-3.5 w-3.5 text-orange-400" />
                <span>Download .M3U Playlist</span>
              </button>

              {/* Copy Stream URL */}
              <button
                type="button"
                onClick={handleCopyUrl}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-xs font-semibold text-white/90 hover:border-white/30 hover:bg-white/10 transition active:scale-[0.98] cursor-pointer"
                title="Copy stream link for Internet Download Manager (IDM) or VLC"
              >
                {copiedUrl ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-emerald-400">URL Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Copy Stream URL</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* TERMINAL / YT-DLP COMMAND DOWNLOADER                     */}
          {/* ======================================================== */}
          <div className="rounded-xl border border-white/10 bg-black/60 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-primary" />
                Download via Terminal (yt-dlp)
              </span>
              <button
                type="button"
                onClick={handleCopyCommand}
                className="flex items-center gap-1 text-[11px] font-medium text-primary hover:underline cursor-pointer"
              >
                {copiedCmd ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedCmd ? "Copied" : "Copy Command"}</span>
              </button>
            </div>
            <div className="bg-zinc-950 rounded-lg p-2 font-mono text-[11px] text-zinc-300 border border-white/5 overflow-x-auto whitespace-nowrap">
              <code>{ytdlpCommand}</code>
            </div>
          </div>

          {/* Helpful Tips Card */}
          <div className="flex items-start gap-2.5 rounded-xl border border-white/5 bg-white/[0.02] p-3 text-xs text-zinc-400">
            <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-white/90 block">Fast Download Tip</span>
              <p className="leading-relaxed text-[11px]">
                To download full video files directly inside your browser in 1 click, install the free{" "}
                <a
                  href="https://www.downloadhelper.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline font-medium inline-flex items-center gap-0.5"
                >
                  Video DownloadHelper <ExternalLink className="h-2.5 w-2.5" />
                </a>{" "}
                or use{" "}
                <strong className="text-white">IDM / 1DM</strong>. They automatically grab the video stream from{" "}
                <strong className="text-white">{currentProvider.name}</strong> at maximum bandwidth.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
