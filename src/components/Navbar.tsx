import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import SearchBar from "./SearchBar";
import ThemeToggle from "./ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import type { TmdbMovie } from "@/lib/tmdb";

interface NavbarProps {
  onMovieClick: (movie: TmdbMovie) => void;
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
  const [catOpen, setCatOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky left-0 right-0 top-0 z-50 flex items-center gap-6 backdrop-blur-md px-6 py-4 md:px-12 lg:px-16"
    >
      <a href="/" className="shrink-0">
        <h2 className="text-lg font-bold tracking-tight text-foreground drop-shadow-lg">
          WTW : What To Watch
        </h2>
      </a>
      <div className="flex-1 max-w-sm">
        <SearchBar onMovieClick={onMovieClick} />
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
        <DropdownMenu open={catOpen} onOpenChange={setCatOpen}>
          <DropdownMenuTrigger
            onMouseEnter={() => setCatOpen(true)}
            onMouseLeave={() => setCatOpen(false)}
            className={`flex items-center gap-1 text-sm font-medium transition outline-none ${
              categoryLinks.some((l) => location.pathname === l.path)
                ? "text-primary"
                : "text-foreground/80 hover:text-foreground"
            }`}
          >
            Categories <ChevronDown className="h-3.5 w-3.5" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            onMouseEnter={() => setCatOpen(true)}
            onMouseLeave={() => setCatOpen(false)}
          >
            {categoryLinks.map((link) => (
              <DropdownMenuItem key={link.path} asChild>
                <a
                  href={link.path}
                  className={`w-full cursor-pointer ${
                    location.pathname === link.path ? "text-primary" : ""
                  }`}
                >
                  {link.label}
                </a>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </nav>
      <div className="ml-auto shrink-0">
        <ThemeToggle />
      </div>
    </motion.header>
  );
};

export default Navbar;
