# 🎬 WTW : What To Watch

A sleek, modern movie and TV discovery platform built with React. Browse trending titles, explore categories like Anime, Documentaries, and Reality TV, watch trailers, and get detailed info on any title all powered by the [TMDB API](https://www.themoviedb.org/) through a Supabase Edge Function proxy.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-purple?logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase)

---

## ✨ Features

-  **Trending & Popular** : Discover what's hot right now across movies and TV
- **Top Rated** : Browse the highest-rated titles of all time
- **Now Playing & On The Air** : See what's currently in theaters or airing
- **Instant Search** : Find any movie or series with real-time results
- **Category Pages** : Dedicated pages for Movies, Series, Anime, Reality TV, Documentaries, and News
- **Watch Page** : View trailers, cast, seasons/episodes, streaming providers, and more
- **Hero Spotlight** : Animated hero banners featuring featured content
- **Advanced Filtering** : Filter by genre, year, rating, and sort order
- **Dark / Light Mode** : Toggle between themes seamlessly
- **Fully Responsive** " Optimized for desktop, tablet, and mobile

---

## 🛠 Tech Stack

| Technology | Purpose |
|---|---|
| [React 18](https://react.dev) | UI framework |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Vite](https://vitejs.dev) | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com) | Accessible component library |
| [Framer Motion](https://www.framer.com/motion) | Animations & transitions |
| [TanStack Query](https://tanstack.com/query) | Data fetching & caching |
| [React Router](https://reactrouter.com) | Client-side routing |
| [Supabase](https://supabase.com) | Edge Functions (TMDB API proxy) |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ (or [Bun](https://bun.sh/))
- A [Supabase](https://supabase.com) project with a TMDB proxy edge function deployed

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-anon-key
```

### Installation

```bash
# Clone the repository
git clone https://github.com/Yeabfikre/what-to-watch.git
cd what-to-watch

# Install dependencies
npm install

# Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview   # Preview the production build locally
```

### Testing

```bash
npm run test          # Run tests once
npm run test:watch    # Run tests in watch mode
```

---

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/               # shadcn/ui primitives (49 components)
│   ├── Navbar.tsx         # Navigation bar with theme toggle
│   ├── HeroSpotlight.tsx  # Animated hero banner
│   ├── MovieCard.tsx      # Title card with hover effects
│   ├── MovieDetailModal.tsx # Detailed info modal
│   ├── MovieRow.tsx       # Horizontal scrolling row
│   ├── FilterBar.tsx      # Genre/year/rating filters
│   ├── SearchBar.tsx      # Real-time search
│   ├── Footer.tsx         # Footer component
│   └── ThemeToggle.tsx    # Dark/light mode switch
├── pages/                # Route-level pages
│   ├── Index.tsx          # Home — trending, popular, top rated
│   ├── Movies.tsx         # Movies category
│   ├── Series.tsx         # TV series category
│   ├── Anime.tsx          # Anime category
│   ├── Reality.tsx        # Reality TV category
│   ├── Documentaries.tsx  # Documentaries category
│   ├── News.tsx           # News & talk shows
│   └── Watch.tsx          # Full detail/watch page
├── hooks/                # Custom React hooks
├── lib/                  # TMDB API client & utilities
├── integrations/         # Third-party service clients (Supabase)
└── index.css             # Global styles & design tokens
```

---

## 📝 API Architecture

The app doesn't call the TMDB API directly. Instead, it routes requests through a **Supabase Edge Function** (`/functions/v1/tmdb`) which acts as a secure proxy, keeping the TMDB API key server-side.

```
Client  →  Supabase Edge Function  →  TMDB API
```

---

## 📄 License

This project is for personal/educational use.  
Movie data provided by [TMDB](https://www.themoviedb.org/). This product uses the TMDB API but is not endorsed or certified by TMDB.
