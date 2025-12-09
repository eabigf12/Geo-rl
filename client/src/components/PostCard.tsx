import React, { useState } from 'react';
import { Post } from '@/lib/mockData';
import { Heart, Bookmark, Share2, MoreHorizontal, MapPin, Info } from 'lucide-react';
import { useApp } from '@/lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from '@/components/ui/button';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const { toggleLike, toggleSave, isSaved } = useApp();
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);

  const handleLike = () => {
    toggleLike(post.id);
    if (!post.isLiked) {
      setIsLikeAnimating(true);
      setTimeout(() => setIsLikeAnimating(false), 1000);
    }
  };

  const saved = isSaved(post.id);

  return (
    <div className="bg-card border-b border-border pb-4 mb-2 last:border-0 last:mb-0">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
            <img src={post.user.avatarUrl} alt={post.user.username} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold leading-none">{post.user.username}</span>
            {post.location && (
              <span className="text-xs text-muted-foreground flex items-center gap-0.5 mt-0.5">
                <MapPin size={10} /> {post.location}
              </span>
            )}
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Image */}
      <div className="relative aspect-square bg-muted overflow-hidden" onDoubleClick={handleLike}>
        <img src={post.imageUrl} alt={post.aiResult.name} className="w-full h-full object-cover" loading="lazy" />
        
        {/* Like Animation Overlay */}
        <AnimatePresence>
          {isLikeAnimating && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1.2, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
            >
              <Heart size={100} className="fill-white text-white drop-shadow-lg" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* AI Tag - Instagram Shopping style tag */}
        <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-full flex items-center gap-2 text-xs font-medium border border-white/20 shadow-lg">
           <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
           {post.aiResult.confidence * 100}% {post.aiResult.name}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between px-3 py-3">
        <div className="flex items-center gap-4">
          <button onClick={handleLike} className="transition-transform active:scale-90">
            <Heart size={26} className={cn("transition-colors", post.isLiked ? "fill-red-500 text-red-500" : "text-foreground")} />
          </button>
          
          <Drawer>
            <DrawerTrigger asChild>
               <button className="transition-transform active:scale-90">
                <Info size={26} className="text-foreground" />
              </button>
            </DrawerTrigger>
            <DrawerContent>
              <div className="mx-auto w-full max-w-sm">
                <DrawerHeader>
                  <DrawerTitle className="text-2xl font-bold flex items-center gap-2">
                    {post.aiResult.name} 
                    <span className="text-sm font-normal text-muted-foreground border px-2 py-0.5 rounded-full">
                      {post.aiResult.type}
                    </span>
                  </DrawerTitle>
                  <DrawerDescription>AI Analiz Raporu</DrawerDescription>
                </DrawerHeader>
                <div className="p-4 pb-0 space-y-4">
                  
                  {/* Confidence Bars */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-muted-foreground">Tespit Edilenler</h4>
                    {post.aiResult.classes.map((cls, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                         <span className="text-sm w-24 truncate">{cls.name}</span>
                         <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                           <div className="h-full bg-primary rounded-full" style={{ width: `${cls.percentage}%` }} />
                         </div>
                         <span className="text-xs font-mono text-muted-foreground">{cls.percentage}%</span>
                      </div>
                    ))}
                  </div>

                  {/* Facts */}
                  <div className="bg-secondary/50 p-4 rounded-xl space-y-2">
                    <h4 className="text-sm font-medium text-primary flex items-center gap-2">
                      <Info size={14} /> Bunları biliyor muydunuz?
                    </h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {post.aiResult.facts.map((fact, idx) => (
                        <li key={idx}>{fact}</li>
                      ))}
                    </ul>
                  </div>

                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline">Kapat</Button>
                  </DrawerClose>
                </DrawerFooter>
              </div>
            </DrawerContent>
          </Drawer>

          <button className="transition-transform active:scale-90">
            <Share2 size={26} className="text-foreground" />
          </button>
        </div>
        <button onClick={() => toggleSave(post.id)} className="transition-transform active:scale-90">
          <Bookmark size={26} className={cn("transition-colors", saved ? "fill-foreground text-foreground" : "text-foreground")} />
        </button>
      </div>

      {/* Likes & Caption */}
      <div className="px-3 space-y-1">
        <div className="font-semibold text-sm">{post.likes.toLocaleString()} beğenme</div>
        <div className="text-sm">
          <span className="font-semibold mr-2">{post.user.username}</span>
          <span className="text-muted-foreground/90">{post.description}</span>
        </div>
        <div className="text-xs text-muted-foreground uppercase pt-1">{post.timestamp}</div>
      </div>
    </div>
  );
}
