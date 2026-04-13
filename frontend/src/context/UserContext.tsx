"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { logout as apiLogout } from "@/lib/api/auth";
import { useRouter } from "next/navigation";

// Define types
type DecodedToken = {
  id: string;
  role: "user" | "admin" | string;
  username: string;
  email: string;
  phoneNumber: string;
  profilePhoto: string | null;
  isActive: boolean;
  isVerified: boolean;
  termsAccepted: boolean;
  team: string;
  createdBy: string | null;
  updatedBy: string | null;
  createdAt: string;
  updatedAt: string;
  iat: number;
  exp: number;
};

type UserContextType = {
  user: DecodedToken | null;
  setUser: React.Dispatch<React.SetStateAction<DecodedToken | null>>;
  logout: () => Promise<void>;
  loading: boolean;
  refreshUser: () => void;
  isAdmin: boolean;
  hasRole: (roles: string | string[]) => boolean;
};

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<DecodedToken | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUserFromToken = () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        const decoded: DecodedToken = jwtDecode(token);
        // Check if token is expired
        const now = Date.now() / 1000;
        if (decoded.exp < now) {
          handleLogout(); // token expired
        } else {
          setUser(decoded);

          // Set up Authorization header for future requests
          setupAuthHeader(token);
        }
      } else {
        setUser(null);
        // Remove Authorization header
        removeAuthHeader();
      }
    } catch {
      setUser(null);
      // Remove Authorization header
      removeAuthHeader();
    } finally {
      setLoading(false);
    }
  };

  // Function to set up the Authorization header for fetch requests
  const setupAuthHeader = (token: string) => {
    // This will intercept all fetch requests and add the Authorization header
    const originalFetch = window.fetch;
    window.fetch = function (input, init) {
      init = init || {};
      init.headers = init.headers || {};

      // Add Authorization header to all non-external requests
      const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
      const isRelativeUrl = url.startsWith('/') || url.startsWith(window.location.origin);

      if (isRelativeUrl) {
        Object.assign(init.headers, {
          'Authorization': `Bearer ${token}`
        });
      }

      return originalFetch.call(this, input, init);
    };
  };

  // Function to remove the Authorization header
  const removeAuthHeader = () => {
    // Restore original fetch
    if (window.fetch.__original) {
      window.fetch = window.fetch.__original;
    }
  };

  const refreshUser = () => {
    fetchUserFromToken();
  };

  const handleLogout = async () => {
    try {
      await apiLogout(); // Call API logout
    } catch (error) {
      console.error("API logout failed", error);
    }

    // Clear local storage
    localStorage.removeItem("token");

    // Remove Authorization header
    removeAuthHeader();

    // Clear user state
    setUser(null);

    // Redirect to login
    router.push("/auth/signin");
  };

  // Role-based helper functions
  const isAdmin = user?.role === "admin";

  const hasRole = (roles: string | string[]) => {
    if (!user) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  // Store original fetch before overriding
  useEffect(() => {
    // Store original fetch
    if (!window.fetch.__original) {
      window.fetch.__original = window.fetch;
    }

    fetchUserFromToken();

    // Set up storage event listener to handle token changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "token") {
        refreshUser();
      }
    };

    // Listen for custom auth events
    const handleAuthChange = () => {
      refreshUser();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('authStateChange', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authStateChange', handleAuthChange);

      // Restore original fetch on unmount
      if (window.fetch.__original) {
        window.fetch = window.fetch.__original;
      }
    };
  }, []);

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      logout: handleLogout,
      loading,
      refreshUser,
      isAdmin,
      hasRole
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

// Add TypeScript declaration to extend Window interface
declare global {
  interface Window {
    fetch: any & {
      __original?: typeof fetch;
    };
  }
}