import { createContext, useContext, useEffect, useState, useRef } from "react";
import { jwtDecode } from "jwt-decode";
import * as authApi from "../api/authApi";

const AuthContext = createContext(null);

// How often to check whether the token has expired while the app is open.
// A short interval here is cheap (just decoding a JWT locally, no network
// call) and means an expired session gets caught quickly instead of only
// being discovered the next time an API call happens to fail with 401.
const SESSION_CHECK_INTERVAL_MS = 30_000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const intervalRef = useRef(null);

  const isTokenExpired = (token) => {
    try {
      const { exp } = jwtDecode(token);
      // exp is in seconds, Date.now() is in milliseconds.
      return !exp || Date.now() >= exp * 1000;
    } catch {
      return true;
    }
  };

  const clearSession = () => {
    localStorage.removeItem("sozo_token");
    localStorage.removeItem("sozo_user");
    setUser(null);
  };

  // Restores the session on a page refresh, but only if the stored token
  // hasn't actually expired — otherwise the app would show a "logged in"
  // UI for a session that the backend will reject on the very next request.
  useEffect(() => {
    const storedUser = localStorage.getItem("sozo_user");
    const storedToken = localStorage.getItem("sozo_token");

    if (storedUser && storedToken) {
      if (isTokenExpired(storedToken)) {
        clearSession();
      } else {
        setUser(JSON.parse(storedUser));
      }
    }
    setIsLoading(false);
  }, []);

  // Periodically checks the token while the app is open, so an expired
  // session logs the user out proactively instead of waiting for them to
  // click something and hit a confusing failed request.
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const token = localStorage.getItem("sozo_token");
      if (token && isTokenExpired(token)) {
        clearSession();
      }
    }, SESSION_CHECK_INTERVAL_MS);

    return () => clearInterval(intervalRef.current);
  }, []);

  const login = async (username, password) => {
    const { token, user: loggedInUser } = await authApi.login(username, password);
    localStorage.setItem("sozo_token", token);
    localStorage.setItem("sozo_user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = () => {
    clearSession();
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
