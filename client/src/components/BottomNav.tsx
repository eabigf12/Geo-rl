import { Link, useLocation } from "wouter";
import { Home, Compass, PlusSquare, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-background border-t border-border flex items-center justify-around z-50 pb-safe">
      <Link href="/">
        <a className={cn("p-3 rounded-full transition-colors", isActive('/') ? "text-primary" : "text-muted-foreground hover:text-primary")}>
          <Home size={26} strokeWidth={isActive('/') ? 2.5 : 2} />
        </a>
      </Link>
      
      <Link href="/explore">
        <a className={cn("p-3 rounded-full transition-colors", isActive('/explore') ? "text-primary" : "text-muted-foreground hover:text-primary")}>
          <Compass size={26} strokeWidth={isActive('/explore') ? 2.5 : 2} />
        </a>
      </Link>

      <Link href="/camera">
        <a className="p-3">
          <div className="bg-primary text-primary-foreground rounded-xl p-2 shadow-lg hover:scale-105 transition-transform">
             <PlusSquare size={28} strokeWidth={2} />
          </div>
        </a>
      </Link>

      <Link href="/profile">
        <a className={cn("p-3 rounded-full transition-colors", isActive('/profile') ? "text-primary" : "text-muted-foreground hover:text-primary")}>
          <User size={26} strokeWidth={isActive('/profile') ? 2.5 : 2} />
        </a>
      </Link>
    </nav>
  );
}
