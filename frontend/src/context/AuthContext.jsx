// import {
//   createContext,
//   useContext,
//   useEffect,
//   useState,
// } from "react";

// import api from "../services/api";

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const savedUser = localStorage.getItem("user");

//     if (savedUser) {
//       setUser(JSON.parse(savedUser));
//     }

//     setLoading(false);
//   }, []);

//   const login = async (email, password) => {
//     const response = await api.post("/auth/login", {
//       email,
//       password,
//     });

//     const data = response.data;

//     if (data.accessToken) {
//       localStorage.setItem("accessToken", data.accessToken);
//     }

//     if (data.user) {
//       localStorage.setItem("user", JSON.stringify(data.user));
//       setUser(data.user);
//     }

//     return data;
//   };

//   const logout = async () => {
//     try {
//       await api.post("/auth/logout");
//     } catch (error) {
//       console.log("Logout API error:", error);
//     }

//     localStorage.removeItem("accessToken");
//     localStorage.removeItem("user");

//     setUser(null);
//   };

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         login,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   return useContext(AuthContext);
// };