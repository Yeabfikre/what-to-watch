// TMDB proxy edge function - supports: trending, popular, top_rated, now_playing, on_the_air, discover, details, season, search, genres, images
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TMDB_BASE = "https://api.themoviedb.org/3";

const ALLOWED_TYPES = new Set(["movie", "tv", "all"]);

function validateType(type: string | null, fallback: string = "movie"): string {
  const val = type ?? fallback;
  if (!ALLOWED_TYPES.has(val)) throw new Error(`Invalid type: ${val}`);
  return val;
}

function validateId(id: string | null): string {
  if (!id || !/^\d+$/.test(id)) throw new Error("Invalid or missing id parameter");
  return id;
}

function validatePage(page: string | null): string {
  const val = page ?? "1";
  if (!/^\d+$/.test(val)) throw new Error("Invalid page parameter");
  return val;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const token = Deno.env.get("TMDB_API_TOKEN");
  if (!token) {
    return new Response(JSON.stringify({ error: "TMDB_API_TOKEN not configured" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    const tmdbFetch = async (path: string) => {
      const res = await fetch(`${TMDB_BASE}${path}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`TMDB API error [${res.status}]: ${await res.text()}`);
      }
      return res.json();
    };

    let data: unknown;

    switch (action) {
      case "trending": {
        const type = validateType(url.searchParams.get("type"), "all");
        const tw = url.searchParams.get("window") === "day" ? "day" : "week";
        const page = validatePage(url.searchParams.get("page"));
        data = await tmdbFetch(`/trending/${type}/${tw}?page=${page}`);
        break;
      }
      case "popular": {
        const type = validateType(url.searchParams.get("type"));
        const page = validatePage(url.searchParams.get("page"));
        data = await tmdbFetch(`/${type}/popular?page=${page}`);
        break;
      }
      case "top_rated": {
        const type = validateType(url.searchParams.get("type"));
        const page = validatePage(url.searchParams.get("page"));
        data = await tmdbFetch(`/${type}/top_rated?page=${page}`);
        break;
      }
      case "now_playing": {
        const page = validatePage(url.searchParams.get("page"));
        data = await tmdbFetch(`/movie/now_playing?page=${page}`);
        break;
      }
      case "upcoming": {
        const page = validatePage(url.searchParams.get("page"));
        data = await tmdbFetch(`/movie/upcoming?page=${page}`);
        break;
      }
      case "on_the_air": {
        const page = validatePage(url.searchParams.get("page"));
        data = await tmdbFetch(`/tv/on_the_air?page=${page}`);
        break;
      }
      case "discover": {
        const type = validateType(url.searchParams.get("type"));
        const genreId = (url.searchParams.get("genre_id") || "").replace(/[^\d,]/g, "");
        const platform = (url.searchParams.get("platform") || "").replace(/[^\d,]/g, "");
        const withCompanies = (url.searchParams.get("with_companies") || "").replace(/[^\d,]/g, "");
        const ALLOWED_SORTS = ["popularity.desc","popularity.asc","vote_average.desc","vote_average.asc","primary_release_date.desc","primary_release_date.asc","original_title.asc","original_title.desc","first_air_date.desc","first_air_date.asc","original_name.asc","original_name.desc"];
        const sortByRaw = url.searchParams.get("sort_by") || "popularity.desc";
        const sortBy = ALLOWED_SORTS.includes(sortByRaw) ? sortByRaw : "popularity.desc";
        const year = (url.searchParams.get("year") || "").replace(/\D/g, "").slice(0, 4);
        const yearGte = (url.searchParams.get("year_gte") || "").replace(/\D/g, "").slice(0, 4);
        const yearLte = (url.searchParams.get("year_lte") || "").replace(/\D/g, "").slice(0, 4);
        const voteGte = (url.searchParams.get("vote_average_gte") || "").replace(/[^\d.]/g, "");

        const origLang = (url.searchParams.get("with_original_language") || "").replace(/[^a-z]/gi, "").slice(0, 2);
        const originCountry = (url.searchParams.get("with_origin_country") || "").replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase();
        const withKeywords = (url.searchParams.get("with_keywords") || "").replace(/[^\d,]/g, "");

        let path = `/discover/${type}?sort_by=${sortBy}`;
        if (genreId) path += `&with_genres=${genreId}`;
        if (platform) path += `&with_watch_providers=${platform}&watch_region=US`;
        if (withCompanies) path += `&with_companies=${withCompanies}`;
        if (origLang) path += `&with_original_language=${origLang}`;
        if (originCountry) path += `&with_origin_country=${originCountry}`;
        if (withKeywords) path += `&with_keywords=${withKeywords}`;
        if (year) {
          if (type === "movie") {
            path += `&primary_release_year=${year}`;
          } else {
            path += `&first_air_date_year=${year}`;
          }
        }
        if (yearGte) {
          if (type === "movie") {
            path += `&primary_release_date.gte=${yearGte}-01-01`;
          } else {
            path += `&first_air_date.gte=${yearGte}-01-01`;
          }
        }
        if (yearLte) {
          if (type === "movie") {
            path += `&primary_release_date.lte=${yearLte}-12-31`;
          } else {
            path += `&first_air_date.lte=${yearLte}-12-31`;
          }
        }
        if (voteGte) path += `&vote_average.gte=${voteGte}&vote_count.gte=50`;
        const discoverPage = validatePage(url.searchParams.get("page"));
        path += `&page=${discoverPage}`;
        data = await tmdbFetch(path);
        break;
      }
      case "details": {
        const type = validateType(url.searchParams.get("type"));
        const id = validateId(url.searchParams.get("id"));
        data = await tmdbFetch(`/${type}/${id}?append_to_response=credits,videos,watch/providers,external_ids,images&include_image_language=en,null`);
        break;
      }
      case "season": {
        const id = validateId(url.searchParams.get("id"));
        const seasonNum = (url.searchParams.get("season_number") || "1").replace(/\D/g, "") || "1";
        data = await tmdbFetch(`/tv/${id}/season/${seasonNum}`);
        break;
      }
      case "search": {
        const query = url.searchParams.get("query");
        if (!query) throw new Error("Missing query parameter");
        data = await tmdbFetch(`/search/multi?query=${encodeURIComponent(query)}`);
        break;
      }
      case "genres": {
        const movieGenres = await tmdbFetch(`/genre/movie/list`);
        const tvGenres = await tmdbFetch(`/genre/tv/list`);
        const allGenres = [...movieGenres.genres];
        for (const g of tvGenres.genres) {
          if (!allGenres.find((x: { id: number }) => x.id === g.id)) {
            allGenres.push(g);
          }
        }
        data = { genres: allGenres };
        break;
      }
      case "images": {
        const type = validateType(url.searchParams.get("type"));
        const id = validateId(url.searchParams.get("id"));
        data = await tmdbFetch(`/${type}/${id}/images`);
        break;
      }
      default:
        return new Response(JSON.stringify({ error: "Unknown action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("TMDB edge function error:", message);
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
