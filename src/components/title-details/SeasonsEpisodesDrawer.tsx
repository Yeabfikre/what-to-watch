import React from "react";
import { ChevronDown, Play, Tv } from "lucide-react";
import { tmdbImg } from "@/lib/tmdb";

interface Episode {
  id: number;
  name: string;
  episode_number: number;
  runtime?: number;
  overview?: string;
  still_path?: string | null;
}

interface Season {
  season_number: number;
  name: string;
  episode_count: number;
}

interface SeasonsEpisodesDrawerProps {
  isTV: boolean;
  seasons: Season[];
  selectedSeason: number;
  setSelectedSeason: (season: number) => void;
  selectedEpisode: number;
  setSelectedEpisode: (episode: number) => void;
  seasonData?: { episodes?: Episode[] };
  isPlaying: boolean;
  onSelectEpisode: (episodeNumber: number) => void;
}

export const SeasonsEpisodesDrawer: React.FC<SeasonsEpisodesDrawerProps> = ({
  isTV,
  seasons,
  selectedSeason,
  setSelectedSeason,
  selectedEpisode,
  setSelectedEpisode,
  seasonData,
  isPlaying,
  onSelectEpisode,
}) => {
  if (!isTV || !seasons || seasons.length === 0) return null;

  return (
    <section className="mt-8 border-t border-white/10 pt-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <span className="h-4 w-1 rounded-full bg-[#f5f2ea]" />
          <h2 className="text-base font-semibold text-[#f5f2ea]">Seasons &amp; episodes</h2>
        </div>

        {seasons.length > 1 && (
          <div className="relative">
            <select
              value={selectedSeason}
              onChange={(e) => {
                setSelectedSeason(Number(e.target.value));
                setSelectedEpisode(1);
              }}
              className="appearance-none rounded-xl border border-[#2e2a26] bg-[#161513] px-4 py-2 pr-9 text-xs font-semibold text-[#f5f2ea] outline-none transition hover:border-white/30"
            >
              {seasons.map((s) => (
                <option key={s.season_number} value={s.season_number} className="bg-zinc-900 text-white">
                  {s.name} ({s.episode_count} ep)
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/60" />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-96 overflow-y-auto pr-1 hide-scrollbar">
        {seasonData?.episodes?.map((ep) => {
          const stillUrl = tmdbImg.still(ep.still_path);
          const isCurrent = isPlaying && selectedEpisode === ep.episode_number;
          return (
            <button
              type="button"
              key={ep.id}
              onClick={() => onSelectEpisode(ep.episode_number)}
              className={`flex gap-3.5 rounded-2xl border p-3 text-left transition active:scale-[0.99] cursor-pointer group focus:outline-none ${
                isCurrent
                  ? "border-[#e8a13a] bg-[#e8a13a]/10"
                  : "border-[#2e2a26] bg-[#161513] hover:border-white/20 hover:bg-white/[0.04]"
              }`}
            >
              <div className="h-18 w-28 shrink-0 overflow-hidden rounded-xl bg-secondary relative">
                {stillUrl ? (
                  <img
                    src={stillUrl}
                    alt={ep.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Tv className="h-6 w-6 text-white/30" />
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="h-5 w-5 text-white fill-current" />
                </div>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <p className="text-xs sm:text-sm font-semibold text-[#f5f2ea] truncate group-hover:text-[#e8a13a]">
                  {ep.episode_number}. {ep.name}
                </p>
                {ep.runtime && (
                  <span className="text-[11px] text-[#b7b7b6] mt-0.5">{ep.runtime}m</span>
                )}
                {ep.overview && (
                  <p className="mt-1 text-[11px] text-gray-400 line-clamp-2">{ep.overview}</p>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};

export default SeasonsEpisodesDrawer;

