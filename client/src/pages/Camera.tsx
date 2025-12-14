import React, { useRef, useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Camera as CameraIcon,
  X,
  Zap,
  RotateCcw,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import { IdentificationResult } from "@/lib/mockData";
import { identifyImage, loadModel } from "@/lib/aiModel";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export default function Camera() {
  const [, setLocation] = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<IdentificationResult | null>(null);
  const [modelLoading, setModelLoading] = useState(true);
  const { addPost } = useApp();
  const { toast } = useToast();

  useEffect(() => {
    // Load AI model on mount
    loadModel()
      .then(() => {
        setModelLoading(false);
        toast({
          title: "AI Hazır",
          description: "Model yüklendi, tanıma başlayabilir! 🎯",
        });
      })
      .catch((error) => {
        setModelLoading(false);
        console.error("Model loading failed:", error);
        toast({
          variant: "destructive",
          title: "Model Hatası",
          description: "AI modeli yüklenemedi. Mock veri kullanılacak.",
        });
      });

    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 4096 }, // High resolution width
          height: { ideal: 2160 }, // High resolution height
          aspectRatio: 9 / 16,
          frameRate: { ideal: 30 }, // Smooth 30fps
          // Advanced settings for better quality
          focusMode: "continuous",
          exposureMode: "continuous",
          whiteBalanceMode: "continuous",
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      toast({
        variant: "destructive",
        title: "Kamera Hatası",
        description: "Kameraya erişilemedi. Lütfen izinleri kontrol edin.",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Use actual video dimensions for full quality
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(video, 0, 0);

        // Use PNG for lossless quality (larger file size)
        // Or increase JPEG quality to 0.95 (1.0 = max quality)
        const imageUrl = canvas.toDataURL("image/jpeg", 0.95);

        setCapturedImage(imageUrl);
        analyzeImage(imageUrl);
      }
    }
  };

  const analyzeImage = async (imageUrl: string) => {
    setIsAnalyzing(true);
    try {
      // Use real AI model for inference
      const res = await identifyImage(imageUrl);
      setResult(res);
    } catch (error) {
      console.error("AI inference error:", error);
      toast({
        variant: "destructive",
        title: "Analiz Hatası",
        description: "Görüntü analiz edilemedi. Tekrar deneyin.",
      });
      // Fallback to mock for demo
      setResult({
        name: "Tespit Edilemedi",
        type: "Bilinmeyen",
        confidence: 0.3,
        facts: ["Daha net bir fotoğraf çekmeyi deneyin."],
        classes: [{ name: "Bilinmeyen", percentage: 30 }],
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const savePost = () => {
    if (capturedImage && result) {
      addPost({
        id: Date.now().toString(),
        imageUrl: capturedImage,
        user: {
          username: "ben",
          avatarUrl: "https://github.com/shadcn.png",
        },
        location: result.location || "Bilinmeyen Konum",
        likes: 0,
        isLiked: false,
        description: `Keşfedildi: ${result.name} ✨`,
        timestamp: "Şimdi",
        aiResult: result,
      });
      toast({
        title: "Paylaşıldı!",
        description: "Keşfiniz başarıyla paylaşıldı.",
      });
      setLocation("/");
    }
  };

  const reset = () => {
    setCapturedImage(null);
    setResult(null);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center z-10">
        <button
          onClick={() => setLocation("/")}
          className="text-white p-2"
          data-testid="button-close-camera"
        >
          <X size={28} />
        </button>
        <span className="text-white font-medium">AI Tarayıcı</span>
        <button className="text-white p-2">
          <Zap
            size={24}
            className={isAnalyzing || modelLoading ? "animate-pulse" : ""}
          />
        </button>
      </div>

      {/* Main View */}
      <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
        {!capturedImage ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {modelLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-white font-medium">
                    AI Model Yükleniyor...
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="relative w-full h-full">
            <img
              src={capturedImage}
              alt="Captured"
              className="w-full h-full object-cover"
            />

            {/* Analysis Overlay */}
            {isAnalyzing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-sm">
                <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-white font-medium animate-pulse">
                  AI Analiz Ediyor...
                </p>
                <p className="text-white/70 text-sm mt-2">
                  TensorFlow.js ile gerçek zamanlı tanıma
                </p>
              </div>
            )}

            {/* Result Overlay */}
            {!isAnalyzing && result && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pt-20">
                <div className="bg-card text-card-foreground p-5 rounded-2xl shadow-xl animate-in slide-in-from-bottom-10 duration-500">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h2
                        className="text-2xl font-bold"
                        data-testid="text-result-name"
                      >
                        {result.name}
                      </h2>
                      <p className="text-muted-foreground">
                        {result.type} • %{Math.round(result.confidence * 100)}{" "}
                        Güven
                      </p>
                    </div>
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                      AI
                    </div>
                  </div>

                  <div className="space-y-2 mt-4 mb-4">
                    {result.classes.slice(0, 2).map((cls, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 text-sm"
                        data-testid={`class-${i}`}
                      >
                        <span className="text-xs w-20 truncate">
                          {cls.name}
                        </span>
                        <div className="flex-1 bg-secondary h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full transition-all duration-500"
                            style={{ width: `${cls.percentage}%` }}
                          />
                        </div>
                        <span className="w-12 text-right font-mono text-xs">
                          {cls.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={savePost}
                    className="w-full py-6 text-lg font-semibold"
                    data-testid="button-share"
                  >
                    <Check className="mr-2" /> Paylaş
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Controls (Only when not captured) */}
      {!capturedImage && (
        <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 flex items-center justify-around bg-gradient-to-t from-black/80 to-transparent">
          <button
            className="text-white p-4 rounded-full bg-white/10 backdrop-blur-md"
            data-testid="button-gallery"
          >
            <ImageIcon size={24} />
          </button>

          <button
            onClick={takePhoto}
            disabled={modelLoading}
            className="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative group disabled:opacity-50"
            data-testid="button-capture"
          >
            <div className="w-16 h-16 bg-white rounded-full transition-transform group-active:scale-90" />
          </button>

          <button
            className="text-white p-4 rounded-full bg-white/10 backdrop-blur-md"
            data-testid="button-flip"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      )}

      {/* Retake Button (When captured) */}
      {capturedImage && !isAnalyzing && (
        <button
          onClick={reset}
          className="absolute top-4 left-4 z-20 bg-black/50 text-white p-2 rounded-full backdrop-blur-md"
          data-testid="button-retake"
        >
          <X size={24} />
        </button>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
