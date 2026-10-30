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
    <div className="space-y-12 pt-6 border-t border-border">
      {/* Row 1: Director & Studios Side by Side */}
      <div className="grid gap-10 md:grid-cols-2">
        {/* Director / Creator */}
        <div>
          <div className="mb-4 flex items-center gap-2 border-b border-border/50 pb-2">
            <div className="h-4 w-1 rounded-full bg-primary" />
            <h2 className="text-base font-semibold text-foreground">
              {isTV ? "Creator" : "Director"}
            </h2>
          </div>

          <div className="flex flex-col items-start">
            <div className="h-28 w-28 sm:h-32 sm:w-32 overflow-hidden rounded-3xl bg-card ring-1 ring-border relative shadow-sm">
              {directorPhoto ? (
                <img
                  src={directorPhoto}
                  alt={directorName}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <User className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
            </div>
            <h4 className="mt-2.5 text-sm sm:text-base font-bold text-foreground">
              {directorName}
            </h4>
            <p className="text-xs text-muted-foreground">
              {isTV ? "Creator" : "Director"}
            </p>
          </div>
        </div>

        {/* Studios */}
        <div>
          <div className="mb-4 flex items-center gap-2 border-b border-border/50 pb-2">
            <div className="h-4 w-1 rounded-full bg-primary" />
            <h2 className="text-base font-semibold text-foreground">Studios</h2>
          </div>

          <div className="space-y-3">
            {studios.length > 0 ? (
              studios.map((company) => {
                const logoUrl = tmdbImg.logo(company.logo_path);
                return (
                  <div
                    key={company.id}
                    className="flex items-center gap-3.5 rounded-2xl bg-card border border-border p-2.5 pr-4 transition-colors hover:bg-secondary/60 shadow-sm"
                  >
                    <div className="flex h-11 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white dark:bg-zinc-900 border border-border/40 p-1.5">
                      {logoUrl ? (
                        <img
                          src={logoUrl}
                          alt={company.name}
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                        />
                      ) : (
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="line-clamp-1 text-sm font-semibold text-foreground">
                      {company.name}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex items-center gap-3.5 rounded-2xl bg-card border border-border p-2.5 pr-4">
                <div className="flex h-11 w-16 shrink-0 items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-border/40 p-1.5">
                  <Film className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="line-clamp-1 text-sm font-semibold text-foreground">
                  Independent Production
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Full Width Actors Grid */}
      <section>
        <div className="mb-6 flex items-center gap-2 border-b border-border/50 pb-2">
          <div className="h-4 w-1 rounded-full bg-primary" />
          <h2 className="text-base font-semibold text-foreground">Actors</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
          {cast.map((actor) => {
            const photoUrl = tmdbImg.profile(actor.profile_path);
            return (
              <div key={actor.id} className="group block">
                <div className="aspect-square overflow-hidden rounded-3xl bg-card ring-1 ring-border transition-all group-hover:ring-primary/60 group-hover:shadow-md relative shadow-sm">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt={actor.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <User className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="mt-2 line-clamp-1 text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                  {actor.name}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">Actor</div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default CastAndStudiosSection;
