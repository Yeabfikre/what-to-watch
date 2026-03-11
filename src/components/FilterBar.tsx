import { SlidersHorizontal, ChevronDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export interface FilterValues {
  genre: string | null;
  country: string | null;
  year: string | null;
  rating: string | null;
  quality: string | null;
  sort: string;
}

interface FilterBarProps {
  categories: string[];
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
}

const QUALITY_OPTIONS = ["All", "HD", "SD", "CAM"];
const YEAR_OPTIONS = ["2026", "2025", "2024", "2023", "2022", "2021", "2020", "2010s", "2000s", "90s & older"];
const RATING_OPTIONS = ["9+", "8+", "7+", "6+", "5+"];
const SORT_OPTIONS = ["Popularity", "Rating", "Release Date", "Title A-Z"];

const COUNTRY_OPTIONS = [
  "Argentina", "Australia", "Austria", "Belgium", "Brazil", "Canada", "China", 
  "Czech Republic", "Denmark", "Finland", "France", "Germany", "Hong Kong", 
  "Hungary", "India", "Ireland", "Israel", "Italy", "Japan", "Luxembourg", 
  "Mexico", "Netherlands", "New Zealand", "Norway", "Poland", "Romania", 
  "Russia", "South Africa", "South Korea", "Spain", "Sweden", "Switzerland", 
  "Taiwan", "Thailand", "United Kingdom", "United States of America"
];

const FilterBar = ({ categories, filters, onFiltersChange }: FilterBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const { genre, country, year, rating, quality, sort } = filters;

  const update = (patch: Partial<FilterValues>) =>
    onFiltersChange({ ...filters, ...patch });

  const activeCount =
    (genre && genre !== "All" ? 1 : 0) +
    (country ? 1 : 0) +
    (year ? 1 : 0) +
    (rating ? 1 : 0) +
    (quality && quality !== "All" ? 1 : 0) +
    (sort !== "Popularity" ? 1 : 0);

  const clearAll = () =>
    onFiltersChange({ genre: null, country: null, year: null, rating: null, quality: null, sort: "Popularity" });

  return (
    <div className="rounded-xl border border-border/40 bg-card/60 backdrop-blur-md">
      {/* Toggle header */}
      <button
        onClick={() => setIsExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-3.5"
      >
        <div className="flex items-center gap-2.5">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Filters</span>
          <AnimatePresence>
            {activeCount > 0 && (
              <motion.span
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground"
              >
                {activeCount}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") { e.stopPropagation(); clearAll(); }
              }}
              className="cursor-pointer text-xs font-medium text-primary hover:text-primary/80"
            >
              Clear all
            </motion.span>
          )}
          <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </motion.div>
        </div>
      </button>

      {/* Expandable panel */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-5 border-t border-border/30 px-5 py-4">
              {/* Genre */}
              <FilterSection label="Genre">
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <Chip
                      key={cat}
                      label={cat}
                      active={genre === cat}
                      onClick={() => update({ genre: genre === cat ? null : cat })}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Country */}
              <FilterSection label="Country">
                <div className="flex flex-wrap gap-2">
                  {COUNTRY_OPTIONS.map((c) => (
                    <Chip
                      key={c}
                      label={c}
                      active={country === c}
                      onClick={() => update({ country: country === c ? null : c })}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Year */}
              <FilterSection label="Year">
                <div className="flex flex-wrap gap-2">
                  {YEAR_OPTIONS.map((yr) => (
                    <Chip
                      key={yr}
                      label={yr}
                      active={year === yr}
                      onClick={() => update({ year: year === yr ? null : yr })}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Rating */}
              <FilterSection label="Rating">
                <div className="flex flex-wrap gap-2">
                  {RATING_OPTIONS.map((r) => (
                    <Chip
                      key={r}
                      label={r}
                      active={rating === r}
                      onClick={() => update({ rating: rating === r ? null : r })}
                    />
                  ))}
                </div>
              </FilterSection>


              {/* Sort */}
              <FilterSection label="Sort by">
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((s) => (
                    <Chip
                      key={s}
                      label={s}
                      active={sort === s}
                      onClick={() => update({ sort: s })}
                    />
                  ))}
                </div>
              </FilterSection>
            </div>

            {/* Active filters summary */}
            {activeCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 border-t border-border/30 px-5 py-3">
                <span className="text-xs font-medium text-muted-foreground">Active:</span>
                {genre && genre !== "All" && (
                  <ActiveTag label={genre} onRemove={() => update({ genre: null })} />
                )}
                {country && (
                  <ActiveTag label={country} onRemove={() => update({ country: null })} />
                )}
                {year && (
                  <ActiveTag label={year} onRemove={() => update({ year: null })} />
                )}
                {rating && (
                  <ActiveTag label={`Rating ${rating}`} onRemove={() => update({ rating: null })} />
                )}
                {quality && quality !== "All" && (
                  <ActiveTag label={`Quality: ${quality}`} onRemove={() => update({ quality: null })} />
                )}
                {sort !== "Popularity" && (
                  <ActiveTag label={sort} onRemove={() => update({ sort: "Popularity" })} />
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ---- Sub-components ---- */

const FilterSection = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
    {children}
  </div>
);

const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <motion.button
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
      active
        ? "bg-primary text-primary-foreground shadow-sm"
        : "border border-border/50 bg-muted/40 text-muted-foreground hover:border-primary/30 hover:bg-muted/70 hover:text-foreground"
    }`}
  >
    {label}
  </motion.button>
);

const ActiveTag = ({ label, onRemove }: { label: string; onRemove: () => void }) => (
  <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
    {label}
    <button onClick={onRemove} className="ml-0.5 rounded-sm hover:bg-primary/20">
      <X className="h-3 w-3" />
    </button>
  </span>
);

export default FilterBar;
