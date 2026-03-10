import { Github, Twitter, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:px-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="space-y-4 lg:col-span-2 text-left">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img src="/apple-touch-icon.png" alt="WTW Logo" className="h-8 w-8 rounded-md" />
              <span className="text-xl font-bold tracking-tight text-foreground drop-shadow-lg">
                WTW : What To Watch
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-md">
              WTW is a Free Movies streaming site. We let you watch movies online without having to register or pay, with over 10,000 movies and TV-Series.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://x.com/yabfikre" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition hover:text-primary">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground transition hover:text-primary">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://github.com/Yeabfikre/what-to-watch" target="_blank" rel="noopener noreferrer" className="text-muted-foreground transition hover:text-primary">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Browse */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
              Browse
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/movies" className="transition hover:text-primary">Movies</Link></li>
              <li><Link to="/series" className="transition hover:text-primary">Series</Link></li>
              <li><Link to="/anime" className="transition hover:text-primary">Anime</Link></li>
              <li><Link to="/reality" className="transition hover:text-primary">Reality</Link></li>
              <li><Link to="/documentaries" className="transition hover:text-primary">Documentaries</Link></li>
            </ul>
          </div>

          {/* More */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
              More
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/reality" className="transition hover:text-primary">Reality</Link></li>
              <li><Link to="/news" className="transition hover:text-primary">News</Link></li>
              <li><Link to="/trending" className="transition hover:text-primary">Trending</Link></li>
              <li><Link to="/top-rated" className="transition hover:text-primary">Top Rated</Link></li>
            </ul>
          </div>

          {/* Disclaimer */}
          <div className="space-y-3 lg:col-span-1">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground opacity-0 hidden lg:block">
              Disclaimer
            </h3>
            <div className="rounded-md border border-border bg-black/20 p-4">
              <p className="text-xs leading-relaxed text-muted-foreground">
                WTW does not store any files on our server, we only link to the media which is hosted on 3rd party services.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col items-center gap-4 sm:flex-row sm:justify-center text-xs text-muted-foreground">
          <div>
            © {new Date().getFullYear()} WTW : What To Watch. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
