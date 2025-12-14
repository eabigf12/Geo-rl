import { useState } from "react";
import { useLocation } from "wouter";
import { auth } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { Camera, Eye, EyeOff } from "lucide-react";

export default function Auth() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  // Get redirect URL from query params
  const searchParams = new URLSearchParams(window.location.search);
  const redirectTo = searchParams.get("redirect") || "/";

  const handleSubmit = async () => {
    if (!formData.username || !formData.password) {
      toast({
        title: "Hata",
        description: "Lütfen tüm alanları doldurun",
        variant: "destructive",
      });
      return;
    }

    if (!isLogin && !formData.name) {
      toast({
        title: "Hata",
        description: "Lütfen adınızı girin",
        variant: "destructive",
      });
      return;
    }

    if (formData.password.length < 6) {
      toast({
        title: "Hata",
        description: "Şifre en az 6 karakter olmalı",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Convert username to email format for Firebase
      const email = `${formData.username}@geosnap.app`;

      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, formData.password);
        toast({
          title: "Hoş geldiniz!",
          description: "Başarıyla giriş yaptınız.",
        });
      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          formData.password
        );

        // Update user profile with display name
        await updateProfile(userCredential.user, {
          displayName: formData.name,
        });

        toast({
          title: "Hesap oluşturuldu!",
          description: "GeoSnap'e hoş geldiniz.",
        });
      }

      setLocation(redirectTo);
    } catch (error: any) {
      let errorMessage = "Bir hata oluştu";

      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Bu kullanıcı adı zaten kullanımda";
      } else if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        errorMessage = "Kullanıcı adı veya şifre hatalı";
      } else if (error.code === "auth/invalid-credential") {
        errorMessage = "Geçersiz kullanıcı bilgileri";
      }

      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4">
            <Camera size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            GeoSnap
          </h1>
          <p className="text-muted-foreground mt-2">
            Fotoğraflarınızı AI ile keşfedin
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => {
                setIsLogin(true);
              }}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                isLogin
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              Giriş Yap
            </button>
            <button
              onClick={() => {
                setIsLogin(false);
              }}
              className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
                !isLogin
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              Kayıt Ol
            </button>
          </div>

          <div className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium mb-2">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Adınız Soyadınız"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                  disabled={loading}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">
                Kullanıcı Adı
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    username: e.target.value.toLowerCase().replace(/\s/g, ""),
                  })
                }
                placeholder="kullaniciadi"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Şifre</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary pr-12"
                  onKeyPress={(e) => e.key === "Enter" && handleSubmit()}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Yükleniyor..." : isLogin ? "Giriş Yap" : "Kayıt Ol"}
            </button>
          </div>

          {isLogin && (
            <div className="mt-4 text-center">
              <button className="text-sm text-primary hover:underline">
                Şifremi Unuttum
              </button>
            </div>
          )}
        </div>

        {/* Info Note */}
        <div className="mt-6 bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">
            💡 Firebase Authentication ile güvenli giriş yapıyorsunuz
          </p>
        </div>
      </div>
    </div>
  );
}
