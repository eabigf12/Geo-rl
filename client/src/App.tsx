import { Switch, Route, Redirect, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/lib/store";
import { useState, useEffect, createContext, useContext } from "react";
import { auth } from "./lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Explore from "@/pages/Explore";
import Camera from "@/pages/Camera";
import Profile from "@/pages/Profile";
import Auth from "@/pages/Auth";

// Auth Context
interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

// Auth Provider Component
function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Protected Route Component
function ProtectedRoute({ component: Component, ...rest }: any) {
  const { user, loading } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to={`/auth?redirect=${location}`} />;
  }

  return <Component {...rest} />;
}

// Public Route (redirects to home if already authenticated)
function PublicRoute({ component: Component, ...rest }: any) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Redirect to="/" />;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/auth">
        {(params) => <PublicRoute component={Auth} {...params} />}
      </Route>

      {/* Protected Routes */}
      <Route path="/">
        {(params) => <ProtectedRoute component={Home} {...params} />}
      </Route>
      <Route path="/explore">
        {(params) => <ProtectedRoute component={Explore} {...params} />}
      </Route>
      <Route path="/camera">
        {(params) => <ProtectedRoute component={Camera} {...params} />}
      </Route>
      <Route path="/profile">
        {(params) => <ProtectedRoute component={Profile} {...params} />}
      </Route>

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AppProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
