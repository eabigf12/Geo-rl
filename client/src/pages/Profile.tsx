import React from 'react';
import { useApp } from '@/lib/store';
import BottomNav from '@/components/BottomNav';
import { Settings, Grid, Bookmark, User as UserIcon, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Profile() {
  const { posts, savedPosts, isSaved } = useApp();
  const [activeTab, setActiveTab] = React.useState<'posts' | 'saved'>('saved');

  // Filter posts based on tab
  const displayPosts = activeTab === 'posts' 
    ? posts.filter(p => p.user.username === 'ben') // Only my posts
    : posts.filter(p => isSaved(p.id));

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 h-14 flex items-center justify-between">
        <h1 className="font-bold text-lg">ben</h1>
        <div className="flex items-center gap-4">
          <button>
            <Settings size={24} />
          </button>
        </div>
      </header>

      {/* Profile Info */}
      <div className="p-4">
        <div className="flex items-center gap-6 mb-4">
          <div className="w-20 h-20 rounded-full bg-muted border border-border p-1">
            <img src="https://github.com/shadcn.png" alt="Profile" className="w-full h-full rounded-full object-cover" />
          </div>
          <div className="flex-1 flex justify-around text-center">
            <div>
              <div className="font-bold text-lg">12</div>
              <div className="text-xs text-muted-foreground">Gönderi</div>
            </div>
            <div>
              <div className="font-bold text-lg">458</div>
              <div className="text-xs text-muted-foreground">Takipçi</div>
            </div>
            <div>
              <div className="font-bold text-lg">245</div>
              <div className="text-xs text-muted-foreground">Takip</div>
            </div>
          </div>
        </div>
        
        <div className="mb-4">
          <h2 className="font-bold">Benim Profilim</h2>
          <p className="text-sm text-muted-foreground">Fotoğraf çekmeyi ve dünyayı keşfetmeyi seviyorum. 🌍📸</p>
        </div>

        <div className="flex gap-2">
           <button className="flex-1 bg-secondary text-secondary-foreground font-semibold py-1.5 rounded-lg text-sm">Profili Düzenle</button>
           <button className="flex-1 bg-secondary text-secondary-foreground font-semibold py-1.5 rounded-lg text-sm">Profili Paylaş</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-t border-border mt-2">
        <button 
          onClick={() => setActiveTab('posts')}
          className={cn("flex-1 py-3 flex justify-center border-b-2 transition-colors", activeTab === 'posts' ? "border-foreground text-foreground" : "border-transparent text-muted-foreground")}
        >
          <Grid size={24} />
        </button>
        <button 
          onClick={() => setActiveTab('saved')}
          className={cn("flex-1 py-3 flex justify-center border-b-2 transition-colors", activeTab === 'saved' ? "border-foreground text-foreground" : "border-transparent text-muted-foreground")}
        >
          <Bookmark size={24} />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-0.5">
        {displayPosts.length > 0 ? (
          displayPosts.map((post) => (
            <div key={post.id} className="aspect-square relative group cursor-pointer bg-muted">
              <img src={post.imageUrl} alt={post.aiResult.name} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))
        ) : (
          <div className="col-span-3 py-10 text-center text-muted-foreground">
             <div className="flex justify-center mb-2">
               {activeTab === 'posts' ? <Camera size={48} className="opacity-20" /> : <Bookmark size={48} className="opacity-20" />}
             </div>
             <p>Henüz gönderi yok.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
