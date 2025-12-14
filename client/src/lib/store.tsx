import React, { createContext, useContext, useState, useEffect } from "react";
import { Post, IdentificationResult } from "@/lib/mockData";
import galataImg from "@assets/generated_images/galata_tower_in_istanbul.png";

interface UserProfile {
  username: string;
  name: string;
  avatar: string;
  bio?: string;
  followers: number;
  following: number;
}

interface AppState {
  posts: Post[];
  savedPosts: string[]; // IDs
  currentUser: UserProfile | null;
  addPost: (post: Post) => void;
  toggleLike: (id: string) => void;
  toggleSave: (id: string) => void;
  isSaved: (id: string) => boolean;
  updateUserProfile: (profile: {
    name: string;
    bio: string;
    avatar: string;
  }) => void;
  setCurrentUser: (user: UserProfile) => void;
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
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);
  const [savedPosts, setSavedPosts] = useState<string[]>(["1"]); // Mock saved post
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Update posts when currentUser changes (update avatars for user's posts)
  useEffect(() => {
    if (currentUser) {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.user.username === currentUser.username
            ? { ...post, user: { ...post.user, avatarUrl: currentUser.avatar } }
            : post
        )
      );
    }
  }, [currentUser?.avatar]); // Only trigger when avatar changes

  const addPost = (post: Post) => {
    // If currentUser exists and post doesn't have user info, use currentUser's info
    const postWithUser = {
      ...post,
      user: {
        username: post.user?.username || currentUser?.username || "user",
        avatarUrl:
          post.user?.avatarUrl ||
          currentUser?.avatar ||
          "https://github.com/shadcn.png",
      },
    };
    setPosts([postWithUser, ...posts]);
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

  const updateUserProfile = (profile: {
    name: string;
    bio: string;
    avatar: string;
  }) => {
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        name: profile.name,
        bio: profile.bio,
        avatar: profile.avatar,
      };
      setCurrentUser(updatedUser);

      // Update all posts by this user with the new avatar
      setPosts(
        posts.map((post) =>
          post.user.username === currentUser.username
            ? { ...post, user: { ...post.user, avatarUrl: profile.avatar } }
            : post
        )
      );
    }
  };

  return (
    <AppContext.Provider
      value={{
        posts,
        savedPosts,
        currentUser,
        addPost,
        toggleLike,
        toggleSave,
        isSaved,
        updateUserProfile,
        setCurrentUser,
      }}
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
