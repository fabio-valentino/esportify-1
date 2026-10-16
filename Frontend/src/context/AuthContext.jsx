import { createContext, useContext, useEffect, useState } from "react";
import { login, logout, getCurrentUser } from "../services/authApi";
import { clearToken } from "../services/tokenStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Saat halaman dibuka/refresh: kalau ada token, tanya backend siapa pemiliknya
  useEffect(() => {
    getCurrentUser()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const signIn = async (credentials) => {
    await login(credentials);
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (err) {
      clearToken();
      throw err;
    }
  };

  const signOut = async () => {
    try {

      await logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}