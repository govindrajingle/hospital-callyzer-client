import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restores the session on a page refresh — without this, reloading the
  // page would always bounce back to the login screen even with a valid
  // token still sitting in localStorage.
  useEffect(() => {
    const storedUser = localStorage.getItem("sozo_user");
    const storedToken = localStorage.getItem("sozo_token");
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    const { token, user: loggedInUser } = await authApi.login(
      username,
      password,
    );
    localStorage.setItem("sozo_token", token);
    localStorage.setItem("sozo_user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = () => {
    localStorage.removeItem("sozo_token");
    localStorage.removeItem("sozo_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
