import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, Menu } from "lucide-react";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getMediaType, type TmdbMovie } from "@/lib/tmdb";

interface NavbarProps {
  onMovieClick?: (movie: TmdbMovie) => void;
}

const navLinks = [
  { label: "Movies", path: "/movies" },
  { label: "Series", path: "/series" },
  { label: "News", path: "/news" },
];

const categoryLinks = [
  { label: "Anime", path: "/anime" },
  { label: "Reality", path: "/reality" },
  { label: "Documentaries", path: "/documentaries" },
];

const Navbar = ({ onMovieClick }: NavbarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [catOpen, setCatOpen] = useState(false);
  const catCloseTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleCatEnter = () => {
    if (catCloseTimerRef.current) {
      clearTimeout(catCloseTimerRef.current);
      catCloseTimerRef.current = null;
    }
    setCatOpen(true);
  };

  const handleCatLeave = () => {
    if (catCloseTimerRef.current) {
      clearTimeout(catCloseTimerRef.current);
    }
    catCloseTimerRef.current = setTimeout(() => {
      setCatOpen(false);
    }, 180);
  };

  useEffect(() => {
    return () => {
      if (catCloseTimerRef.current) clearTimeout(catCloseTimerRef.current);
    };
  }, []);

  const handleMovieSelect = (movie: TmdbMovie) => {
    if (onMovieClick) {
      onMovieClick(movie);
    } else {
      const type = getMediaType(movie);
      navigate(`/title/${type}/${movie.id}`);
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky left-0 right-0 top-0 z-50 flex items-center gap-3 md:gap-6 backdrop-blur-md px-4 sm:px-6 md:px-12 lg:px-16 py-4"
    >
      <a href="/" className="shrink-0">
        <h2 className="text-lg font-bold tracking-tight text-foreground drop-shadow-lg">
          <span className="hidden md:inline">WTW : </span>What To Watch
        </h2>
      </a>
      <div className="w-full md:flex-1 md:max-w-sm">
        <SearchBar onMovieClick={handleMovieSelect} />
      </div>
      <nav className="hidden md:flex items-center gap-10 lg:gap-16">
        {navLinks.map((link) => (
          <a
            key={link.path}
            href={link.path}
            className={`text-sm font-medium transition ${
              location.pathname === link.path
                ? "text-primary"
                : "text-foreground/80 hover:text-foreground"
            }`}
          >
            {link.label}
          </a>
        ))}
        <DropdownMenu
          open={catOpen}
          onOpenChange={(open) => {
            if (!open && catCloseTimerRef.current) {
              clearTimeout(catCloseTimerRef.current);
            }
            setCatOpen(open);
          }}
        >
          <DropdownMenuTrigger
            onMouseEnter={handleCatEnter}
            onMouseLeave={handleCatLeave}
            className={`flex items-center gap-1 text-sm font-medium transition outline-none cursor-pointer ${
              categoryLinks.some((l) => location.pathname === l.path)
                ? "text-primary"
                : "text-foreground/80 hover:text-foreground"
            }`}
          >
            Categories{" "}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                catOpen ? "rotate-180" : ""
              }`}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            sideOffset={4}
            onMouseEnter={handleCatEnter}
            onMouseLeave={handleCatLeave}
            className="z-50 min-w-[10rem] border border-border/80 bg-card/95 backdrop-blur-md p-1 shadow-xl rounded-xl"
          >
            {categoryLinks.map((link) => (
              <DropdownMenuItem
                key={link.path}
                asChild
                onClick={() => {
                  if (catCloseTimerRef.current) clearTimeout(catCloseTimerRef.current);
                  setCatOpen(false);
                }}
              >
                <a
                  href={link.path}
                  className={`w-full cursor-pointer rounded-lg px-2.5 py-1.5 text-sm font-medium transition hover:bg-accent ${
                    location.pathname === link.path ? "text-primary font-semibold" : "text-foreground/90"
                  }`}
                >
                  {link.label}
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
      <div className="ml-auto flex items-center gap-2 shrink-0">
        <ThemeToggle />
        <Sheet>
          <SheetTrigger className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-transparent md:hidden">
            <Menu className="h-5 w-5 text-foreground" />
            <span className="sr-only">Toggle menu</span>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <SheetHeader>
              <SheetTitle className="text-left text-lg font-bold">Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-8 flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Navigation
                </h4>
                {navLinks.map((link) => (
                  <a
                    key={link.path}
                    href={link.path}
                    className={`text-lg font-medium transition ${
                      location.pathname === link.path
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Categories
                </h4>
                {categoryLinks.map((link) => (
                  <a
                    key={link.path}
                    href={link.path}
                    className={`text-lg font-medium transition ${
                      location.pathname === link.path
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    }`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
};

export default Navbar;
