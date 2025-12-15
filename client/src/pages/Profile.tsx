import React from "react";
import { useApp } from "@/lib/store";
import { useAuth } from "@/App";
import { auth } from "@/lib/firebase";
import { signOut, updateProfile } from "firebase/auth";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import {
  Settings,
  Grid,
  Bookmark,
  Camera,
  X,
  Check,
  LogOut,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Profile() {
  const {
    posts,
    savedPosts,
    isSaved,
    currentUser,
    updateUserProfile,
    setCurrentUser,
  } = useApp();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<"posts" | "saved">("saved");
  const [isEditing, setIsEditing] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    name: user?.displayName || "",
    bio: currentUser?.bio || "",
    avatar: currentUser?.avatar || user?.photoURL || "",
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Initialize currentUser if it doesn't exist
  React.useEffect(() => {
    if (user && !currentUser) {
      const username = user.email?.split("@")[0] || "kullanici";
      console.log("Initializing currentUser for:", username);
      setCurrentUser({
        username: username,
        name: user.displayName || username,
        avatar: user.photoURL || "",
        bio: "",
        followers: 0,
        following: 0,
      });
    }
  }, [user, currentUser, setCurrentUser]);

  // Update form when user or currentUser changes
  React.useEffect(() => {
    setEditForm({
      name: user?.displayName || currentUser?.name || "",
      bio: currentUser?.bio || "",
      avatar: currentUser?.avatar || user?.photoURL || "",
    });
  }, [user, currentUser]);

  // Safety check
  if (!user) {
    return (
      <div className="bg-background min-h-screen pb-20 flex items-center justify-center">
        <p className="text-muted-foreground">Profil yükleniyor...</p>
      </div>
    );
  }

  // Extract username from email (remove @geosnap.app)
  const username = user.email?.split("@")[0] || "kullanici";
  const displayName = user.displayName || currentUser?.name || username;

  // Filter posts based on tab
  const displayPosts =
    activeTab === "posts"
      ? posts.filter((p) => p.user.username === username)
      : posts.filter((p) => isSaved(p.id));

  const myPostsCount = posts.filter((p) => p.user.username === username).length;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Hata",
        description: "Dosya boyutu 5MB'dan küçük olmalı.",
        variant: "destructive",
      });
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Hata",
        description: "Lütfen bir resim dosyası seçin.",
        variant: "destructive",
      });
      return;
    }

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = () => {
      setEditForm((prev) => ({ ...prev, avatar: reader.result as string }));
      toast({
        title: "Başarılı",
        description: "Profil resmi yüklendi. Kaydetmeyi unutmayın!",
      });
    };
    reader.onerror = () => {
      toast({
        title: "Hata",
        description: "Resim yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    try {
      console.log(
        "Saving profile with avatar length:",
        editForm.avatar?.length
      );

      // Update Firebase profile (only display name, skip photoURL for base64)
      if (user) {
        await updateProfile(user, {
          displayName: editForm.name,
          // Don't update photoURL with base64 - it's too large for Firebase Auth
        });
      }

      // Update local app state (includes avatar)
      updateUserProfile(editForm);

      toast({
        title: "Profil güncellendi",
        description: "Değişiklikleriniz kaydedildi.",
      });

      setIsEditing(false);
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({
        title: "Hata",
        description: error.message || "Profil güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: user?.displayName || currentUser?.name || "",
      bio: currentUser?.bio || "",
      avatar: currentUser?.avatar || user?.photoURL || "",
    });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        title: "Çıkış yapıldı",
        description: "Başarıyla çıkış yaptınız.",
      });
      setLocation("/auth");
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Çıkış yapılırken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // Get current avatar URL - check all possible sources including editForm as fallback
  const currentAvatarUrl = isEditing
    ? editForm.avatar
    : currentUser?.avatar || user?.photoURL || editForm.avatar || "";

  // Debug log
  React.useEffect(() => {
    console.log("=== Avatar Debug ===");
    console.log("isEditing:", isEditing);
    console.log(
      "editForm.avatar:",
      editForm.avatar ? `${editForm.avatar.substring(0, 50)}...` : "empty"
    );
    console.log(
      "currentUser?.avatar:",
      currentUser?.avatar
        ? `${currentUser.avatar.substring(0, 50)}...`
        : "empty"
    );
    console.log("user?.photoURL:", user?.photoURL || "empty");
    console.log(
      "Final currentAvatarUrl:",
      currentAvatarUrl ? `${currentAvatarUrl.substring(0, 50)}...` : "empty"
    );
    console.log("===================");
  }, [
    isEditing,
    editForm.avatar,
    currentUser?.avatar,
    user?.photoURL,
    currentAvatarUrl,
  ]);

  return (
    <div className="bg-background min-h-screen pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 h-14 flex items-center justify-between">
        <h1 className="font-bold text-lg">{username}</h1>
        <div className="flex items-center gap-4">
          {isEditing ? (
            <>
              <button
                onClick={handleCancelEdit}
                className="text-muted-foreground"
              >
                <X size={24} />
              </button>
              <button onClick={handleSaveProfile} className="text-blue-500">
                <Check size={24} />
              </button>
            </>
          ) : (
            <button onClick={() => setShowSettings(!showSettings)}>
              <Settings size={24} />
            </button>
          )}
        </div>
      </header>

      {/* Settings Dropdown */}
      {showSettings && !isEditing && (
        <div className="absolute right-4 top-16 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[200px]">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-3 text-left hover:bg-secondary flex items-center gap-3 text-red-500"
          >
            <LogOut size={18} />
            Çıkış Yap
          </button>
        </div>
      )}

      {/* Profile Info */}
      <div className="p-4">
        <div className="flex items-center gap-6 mb-4">
          <div className="relative">
            {currentAvatarUrl ? (
              <div className="w-20 h-20 rounded-full bg-muted border border-border overflow-hidden">
                <img
                  src={currentAvatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-muted border border-border flex items-center justify-center">
                <UserRound size={40} className="text-muted-foreground" />
              </div>
            )}
            {isEditing && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white cursor-pointer"
                >
                  <Camera size={20} />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </>
            )}
          </div>
          <div className="flex-1 flex justify-around text-center">
            <div>
              <div className="font-bold text-lg">{myPostsCount}</div>
              <div className="text-xs text-muted-foreground">Gönderi</div>
            </div>
            <div>
              <div className="font-bold text-lg">
                {currentUser?.followers || 0}
              </div>
              <div className="text-xs text-muted-foreground">Takipçi</div>
            </div>
            <div>
              <div className="font-bold text-lg">
                {currentUser?.following || 0}
              </div>
              <div className="text-xs text-muted-foreground">Takip</div>
            </div>
          </div>
        </div>

        <div className="mb-4">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium block mb-1">Ad</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm"
                  placeholder="Adınız"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">
                  Biyografi
                </label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-sm resize-none"
                  placeholder="Kendiniz hakkında bir şeyler yazın..."
                  rows={3}
                />
              </div>
            </div>
          ) : (
            <>
              <h2 className="font-bold">{displayName}</h2>
              {(currentUser?.bio || editForm.bio) && (
                <p className="text-sm text-muted-foreground">
                  {currentUser?.bio || editForm.bio}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">{user.email}</p>
            </>
          )}
        </div>

        {!isEditing && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-secondary text-secondary-foreground font-semibold py-1.5 rounded-lg text-sm"
            >
              Profili Düzenle
            </button>
            <button className="flex-1 bg-secondary text-secondary-foreground font-semibold py-1.5 rounded-lg text-sm">
              Profili Paylaş
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-t border-border mt-2">
        <button
          onClick={() => setActiveTab("posts")}
          className={cn(
            "flex-1 py-3 flex justify-center border-b-2 transition-colors",
            activeTab === "posts"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground"
          )}
        >
          <Grid size={24} />
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          className={cn(
            "flex-1 py-3 flex justify-center border-b-2 transition-colors",
            activeTab === "saved"
              ? "border-foreground text-foreground"
              : "border-transparent text-muted-foreground"
          )}
        >
          <Bookmark size={24} />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-0.5">
        {displayPosts.length > 0 ? (
          displayPosts.map((post) => (
            <div
              key={post.id}
              className="aspect-square relative group cursor-pointer bg-muted"
            >
              <img
                src={post.imageUrl}
                alt={post.aiResult.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))
        ) : (
          <div className="col-span-3 py-10 text-center text-muted-foreground">
            <div className="flex justify-center mb-2">
              {activeTab === "posts" ? (
                <Camera size={48} className="opacity-20" />
              ) : (
                <Bookmark size={48} className="opacity-20" />
              )}
            </div>
            <p>Henüz gönderi yok.</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
