import React from "react";
import { Building2, Film, User } from "lucide-react";
import { tmdbImg, type TmdbCast, type TmdbProductionCompany } from "@/lib/tmdb";

interface CastAndStudiosSectionProps {
  isTV: boolean;
  cast: TmdbCast[];
  directorName: string;
  directorPhoto: string | null;
  studios: TmdbProductionCompany[];
}

export const CastAndStudiosSection: React.FC<CastAndStudiosSectionProps> = ({
  isTV,
  cast,
  directorName,
  directorPhoto,
  studios,
}) => {
  return (
    <div className="space-y-10 pt-6 border-t border-border">
      {/* Row 1: Director & Studios Side by Side */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Director / Creator */}
        <div>
          <div className="mb-4 flex items-center gap-2 border-b border-border/50 pb-2">
            <div className="h-4 w-1 rounded-full bg-primary" />
            <h2 className="text-base font-semibold text-foreground">
              {isTV ? "Creator" : "Director"}
            </h2>
          </div>

          <div className="flex items-center gap-3.5 rounded-lg border border-border bg-card p-3 shadow-sm max-w-sm">
            <div className="h-14 w-14 sm:h-16 sm:w-16 shrink-0 overflow-hidden rounded-md bg-muted relative">
              {directorPhoto ? (
                <img
                  src={directorPhoto}
                  alt={directorName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <User className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-sm sm:text-base font-semibold text-foreground truncate">
                {directorName}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {isTV ? "Creator" : "Director"}
              </p>
            </div>
          </div>
        </div>

        {/* Studios */}
        <div>
          <div className="mb-4 flex items-center gap-2 border-b border-border/50 pb-2">
            <div className="h-4 w-1 rounded-full bg-primary" />
            <h2 className="text-base font-semibold text-foreground">Studios</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {studios.length > 0 ? (
              studios.map((company) => {
                const logoUrl = tmdbImg.logo(company.logo_path);
                return (
                  <div
                    key={company.id}
                    className="flex items-center gap-2.5 rounded-lg bg-card border border-border p-2 px-3 transition-colors hover:bg-secondary/60 shadow-sm"
                  >
                    <div className="flex h-7 w-10 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white dark:bg-zinc-900 border border-border/40 p-1">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={company.name}
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </div>
                    <span className="truncate text-xs font-medium text-foreground">
                      {company.name}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center gap-2.5 rounded-lg bg-card border border-border p-2 px-3 shadow-sm">
                <div className="flex h-7 w-10 shrink-0 items-center justify-center rounded-md bg-white dark:bg-zinc-900 border border-border/40 p-1">
                  <Film className="h-3.5 w-3.5 text-muted-foreground" />
                </div>
                <span className="truncate text-xs font-medium text-foreground">
                  Independent Production
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Responsive Proportional Actors Grid */}
      <section>
        <div className="mb-5 flex items-center gap-2 border-b border-border/50 pb-2">
          <div className="h-4 w-1 rounded-full bg-primary" />
          <h2 className="text-base font-semibold text-foreground">Actors</h2>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 sm:gap-3.5">
          {cast.slice(0, 16).map((actor) => {
            const photoUrl = tmdbImg.profile(actor.profile_path);
            return (
              <div key={actor.id} className="group block text-left">
                <div className="aspect-[3/4] overflow-hidden rounded-lg bg-card ring-1 ring-border transition-all group-hover:ring-primary/60 group-hover:shadow-md relative shadow-sm">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={actor.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <User className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="mt-1.5 line-clamp-1 text-xs font-medium text-foreground group-hover:text-primary transition-colors">
                  {actor.name}
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {actor.character || "Actor"}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default CastAndStudiosSection;
