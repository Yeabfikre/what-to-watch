import { Film, Github, Twitter, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-12 md:px-12 lg:px-16">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <Film className="h-5 w-5 text-primary" />
              <span className="text-lg font-bold text-foreground">WTW</span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Your go-to destination for discovering movies and series worth watching.
            </p>
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
              <li><Link to="/" className="transition hover:text-primary">Trending</Link></li>
              <li><Link to="/" className="transition hover:text-primary">Top Rated</Link></li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-foreground">
              Connect
            </h3>
            <div className="flex gap-4">
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
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} WTW : What To Watch. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
