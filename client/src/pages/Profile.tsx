import React from "react";
import { useApp } from "@/lib/store";
import { useAuth } from "@/App";
import { auth, storage } from "@/lib/firebase";
import { signOut, updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Profile() {
  const { posts, savedPosts, isSaved, currentUser, updateUserProfile } =
    useApp();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<"posts" | "saved">("saved");
  const [isEditing, setIsEditing] = React.useState(false);
  const [showSettings, setShowSettings] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    name: user?.displayName || "",
    bio: currentUser?.bio || "",
    avatar:
      user?.photoURL || currentUser?.avatar || "https://github.com/shadcn.png",
  });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Update form when user or currentUser changes
  React.useEffect(() => {
    setEditForm({
      name: user?.displayName || currentUser?.name || "",
      bio: currentUser?.bio || "",
      avatar:
        user?.photoURL ||
        currentUser?.avatar ||
        "https://github.com/shadcn.png",
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

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

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

    setUploadingImage(true);

    try {
      // Create a unique filename
      const filename = `avatars/${user.uid}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, filename);

      // Upload the file
      await uploadBytes(storageRef, file);

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update the form with new avatar URL
      setEditForm((prev) => ({ ...prev, avatar: downloadURL }));

      toast({
        title: "Başarılı",
        description: "Profil resmi yüklendi.",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Hata",
        description: "Resim yüklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      // Update Firebase profile
      if (user) {
        await updateProfile(user, {
          displayName: editForm.name,
          photoURL: editForm.avatar,
        });
      }

      // Update local app state
      updateUserProfile(editForm);

      toast({
        title: "Profil güncellendi",
        description: "Değişiklikleriniz kaydedildi.",
      });

      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  const handleCancelEdit = () => {
    setEditForm({
      name: user?.displayName || currentUser?.name || "",
      bio: currentUser?.bio || "",
      avatar:
        user?.photoURL ||
        currentUser?.avatar ||
        "https://github.com/shadcn.png",
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
            <div className="w-20 h-20 rounded-full bg-muted border border-border p-1">
              <img
                src={
                  isEditing ? editForm.avatar : user.photoURL || editForm.avatar
                }
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            {isEditing && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center text-white"
                >
                  {uploadingImage ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Camera size={20} />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                  disabled={uploadingImage}
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
