import React from "react";
import { useApp } from "@/lib/store";
import PostCard from "@/components/PostCard";
import BottomNav from "@/components/BottomNav";
import { Bell, Send } from "lucide-react";

export default function Home() {
  const { posts } = useApp();

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border px-4 h-14 flex items-center justify-between">
        <h1 className="font-bold text-xl tracking-tight">Keşfet</h1>
        <div className="flex items-center gap-5">
          <button className="relative">
            <Bell size={24} />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background" />
          </button>
          <button>
            <Send size={24} />
          </button>
        </div>
      </header>

      {/* Feed */}
      <main className="max-w-md mx-auto">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
