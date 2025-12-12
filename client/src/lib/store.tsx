import React, { createContext, useContext, useState, useEffect } from "react";
import { Post, IdentificationResult } from "@/lib/mockData";
import galataImg from "@assets/generated_images/galata_tower_in_istanbul.png";

interface AppState {
  posts: Post[];
  savedPosts: string[]; // IDs
  addPost: (post: Post) => void;
  toggleLike: (id: string) => void;
  toggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
}

const AppContext = createContext<AppState | undefined>(undefined);

const INITIAL_POSTS: Post[] = [
  {
    id: "1",
    imageUrl: galataImg,
    user: {
      username: "gezgin_istanbul",
      avatarUrl: "https://github.com/shadcn.png",
    },
    location: "Galata Kulesi, İstanbul",
    likes: 1240,
    isLiked: true,
    description: "Gün batımında Galata kulesi harika görünüyor! 🌅",
    timestamp: "2 saat önce",
    aiResult: {
      name: "Galata Kulesi",
      type: "Tarihi Yapı",
      confidence: 0.98,
      facts: [
        "1348 yılında Cenevizliler tarafından inşa edilmiştir.",
        "İstanbul'un en ikonik sembollerinden biridir.",
        "Hezarfen Ahmed Çelebi buradan uçmuştur.",
      ],
      classes: [
        { name: "Kule", percentage: 98 },
        { name: "Tarihi Eser", percentage: 85 },
        { name: "İstanbul", percentage: 99 },
      ],
    },
  },
  {
    id: "3",
    imageUrl: capadociaImg,
    user: {
      username: "travel_turkey",
      avatarUrl: "https://github.com/shadcn.png",
    },
    location: "Kapadokya, Nevşehir",
    likes: 3421,
    isLiked: false,
    description: "Peri bacaları ve balonlar... Büyüleyici! 🎈",
    timestamp: "1 gün önce",
    aiResult: {
      name: "Sıcak Hava Balonu",
      type: "Aktivite",
      confidence: 0.95,
      facts: [
        "Kapadokya, dünyadaki en iyi balon turu rotalarından biridir.",
        "Her sabah gün doğumunda yüzlerce balon havalanır.",
        "Peri bacaları volkanik tüflerden oluşmuştur.",
      ],
      classes: [
        { name: "Balon", percentage: 95 },
        { name: "Manzara", percentage: 92 },
        { name: "Gökyüzü", percentage: 88 },
      ],
    },
  },
  {
    id: "4",
    imageUrl: catImg,
    user: {
      username: "kedili_sokak",
      avatarUrl: "https://github.com/shadcn.png",
    },
    location: "Kadıköy, İstanbul",
    likes: 567,
    isLiked: true,
    description: "İstanbul'un gerçek sahipleri. 🐱",
    timestamp: "3 saat önce",
    aiResult: {
      name: "Kedi",
      type: "Hayvan",
      confidence: 0.99,
      facts: [
        "İstanbul, sokak kedileriyle ünlüdür.",
        "Kediler 30 farklı ses çıkarabilir.",
        "Antik Mısır'da kutsal sayılırlardı.",
      ],
      classes: [
        { name: "Kedi", percentage: 99 },
        { name: "Memeli", percentage: 95 },
        { name: "Sevimli", percentage: 100 },
      ],
    },
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [savedPosts, setSavedPosts] = useState<string[]>(["1"]); // Mock saved post

  const addPost = (post: Post) => {
    setPosts([post, ...posts]);
  };

  const toggleLike = (id: string) => {
    setPosts(
      posts.map((post) =>
        post.id === id
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const toggleSave = (id: string) => {
    if (savedPosts.includes(id)) {
      setSavedPosts(savedPosts.filter((pId) => pId !== id));
    } else {
      setSavedPosts([...savedPosts, id]);
    }
  };

  const isSaved = (id: string) => savedPosts.includes(id);

  return (
    <AppContext.Provider
      value={{ posts, savedPosts, addPost, toggleLike, toggleSave, isSaved }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
