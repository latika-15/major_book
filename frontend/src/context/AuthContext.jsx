
// import React, { createContext, useContext, useState, useEffect } from "react";

// const AuthContext = createContext();

// // Backend base URL (Flask API) - adapt if your backend uses different port/path
// const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api/auth";

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(() => {
//     try {
//       return JSON.parse(localStorage.getItem("user")) || null;
//     } catch {
//       return null;
//     }
//   });
//   const [token, setToken] = useState(() => localStorage.getItem("token") || "");
//   const [loading, setLoading] = useState(true);

//   // LOGIN
//   const login = async (email, password) => {
//     try {
//       const response = await fetch(`${API_URL}/login`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ email, password }),
//       });

//       const data = await response.json();

//       if (response.ok && data.token) {
//         localStorage.setItem("user", JSON.stringify(data.user));
//         localStorage.setItem("token", data.token);
//         setUser(data.user);
//         setToken(data.token);
//         return true;
//       } else {
//         alert(data.error || "Invalid credentials");
//         return false;
//       }
//     } catch (error) {
//       console.error("Login error:", error);
//       alert("Server not responding. Please try again.");
//       return false;
//     }
//   };

//   // REGISTER
//   const register = async (name, email, password) => {
//     try {
//       const response = await fetch(`${API_URL}/register`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ name, email, password }),
//       });

//       const data = await response.json();

//       if (response.ok && data.token) {
//         localStorage.setItem("user", JSON.stringify(data.user));
//         localStorage.setItem("token", data.token);
//         setUser(data.user);
//         setToken(data.token);
//         return true;
//       } else {
//         alert(data.error || "Registration failed");
//         return false;
//       }
//     } catch (error) {
//       console.error("Register error:", error);
//       alert("Server not responding. Please try again.");
//       return false;
//     }
//   };

//   // LOGOUT
//   const logout = () => {
//     localStorage.removeItem("user");
//     localStorage.removeItem("token");
//     setUser(null);
//     setToken("");
//   };

//   // Validate token on load
//   useEffect(() => {
//     const validateUser = async () => {
//       const savedToken = localStorage.getItem("token");
//       if (!savedToken) {
//         setLoading(false);
//         return;
//       }

//       try {
//         const res = await fetch(`${API_URL}/validate`, {
//           method: "GET",
//           headers: { Authorization: `Bearer ${savedToken}` },
//         });
//         const data = await res.json();

//         if (res.ok && data.user) {
//           setUser(data.user);
//           setToken(savedToken);
//         } else {
//           logout();
//         }
//       } catch (err) {
//         console.error("Token validation failed:", err);
//         logout();
//       } finally {
//         setLoading(false);
//       }
//     };

//     validateUser();
//   }, []);

//   // Keep localStorage synced with token state
//   useEffect(() => {
//     if (token) localStorage.setItem("token", token);
//     else localStorage.removeItem("token");
//   }, [token]);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         token,
//         login,
//         register,
//         logout,
//         loading,
//       }}
//     >
//       {!loading && children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);


import React, { createContext, useContext, useState, useEffect } from "react";
import API from "../api/axios"; // ✅ using axios instance

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // ✅ LOGIN
  const login = async (email, password) => {
    try {
      const { data } = await API.post("/auth/login", { email, password });

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user.role);

        setUser(data.user);
        return true;
      } else {
        alert(data.message || "Invalid credentials");
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Server not responding. Please try again.");
      return false;
    }
  };

  // ✅ REGISTER
  const register = async (name, email, password, role) => {
    try {
      const { data } = await API.post("/auth/register", {
        name,
        email,
        password,
        role,
      });

      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("role", data.user.role);

        setUser(data.user);
        return true;
      } else {
        alert(data.message || "Registration failed");
        return false;
      }
    } catch (error) {
      console.error("Register error:", error);
      alert("Server not responding. Please try again.");
      return false;
    }
  };

  // 🚪 LOGOUT
  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  // ✅ Fetch Profile
  const fetchProfile = async () => {
    try {
      const res = await API.get("/auth/profile");
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
    } catch (err) {
      console.log("Profile fetch failed");
      logout();
    }
  };

  // 🎯 RUN ON APP LOAD — if accessToken exists → load profile
  useEffect(() => {
    if (localStorage.getItem("accessToken")) {
      fetchProfile();
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        loading,
        fetchProfile, // exported if needed elsewhere
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
