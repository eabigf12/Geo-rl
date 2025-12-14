import React from "react";
import { useApp } from "@/lib/store";
import BottomNav from "@/components/BottomNav";
import { Search } from "lucide-react";

export default function Explore() {
  const { posts } = useApp();
  // Duplicate posts to fill the grid for demo
  const allPosts = [...posts, ...posts, ...posts, ...posts];

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Search Bar */}
      <div className="sticky top-0 z-40 bg-background pt-2 pb-2 px-3">
        <div className="relative">
          <Search
            className="absolute left-3 top-2.5 text-muted-foreground"
            size={16}
          />
          <input
            type="text"
            placeholder="Ara..."
            className="w-full bg-muted rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-0.5">
        {allPosts.map((post, idx) => (
          <div
            key={`${post.id}-${idx}`}
            className="aspect-square relative group cursor-pointer bg-muted"
          >
            <img
              src={post.imageUrl}
              alt={post.aiResult.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
}
