import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../api/taskApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(() => {
    return localStorage.getItem("taskly_token") || null;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateUser = async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const res = await getMe();
        setUser(res.data);
      } catch (error) {
        localStorage.removeItem("taskly_token");
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    validateUser();
  }, [token]);

  const login = (userData) => {
    localStorage.setItem("taskly_token", userData.token);
    setToken(userData.token);
    setUser({
    _id: userData._id,
    name: userData.name,
    email: userData.email,
  });
  };

  const logout = () => {
    localStorage.removeItem("taskly_token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);