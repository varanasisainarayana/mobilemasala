// import React, { createContext, useState, useEffect, useContext } from 'react';

// const AuthContext = createContext();

// export const useAuth = () => {
//   return useContext(AuthContext);
// };

// export const AuthProvider = ({ children }) => {
//   const [isLoggedIn, setIsLoggedIn] = useState(
//     sessionStorage.getItem('isLoggedIn') === 'false'
//   );

//     const [userInfo, setUserInfo] = useState({ username: '', email: '' });

//     useEffect(() => {
//       sessionStorage.setItem('isLoggedIn', isLoggedIn);
//       if (isLoggedIn) {
//         sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
//       } else {
//         sessionStorage.removeItem('userInfo');
//       }
//     }, [isLoggedIn, userInfo]);
//   const login = (username,email) => {
//     setIsLoggedIn(true);
//     setUserInfo({ username, email });

//   };

//   const logout = () => {
//     setIsLoggedIn(false);

//     setUserInfo({ username: '', email: '' });

//   };

//   return (
//     <AuthContext.Provider value={{ isLoggedIn, login, logout, userInfo }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };

import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    sessionStorage.getItem("isLoggedIn") === "true"
  );

  // Initialize userInfo from sessionStorage if available
  const storedUserInfo = sessionStorage.getItem("userInfo");
  const [userInfo, setUserInfo] = useState(
    storedUserInfo
      ? JSON.parse(storedUserInfo)
      : { username: "", email: "", roletype: "", permissions: [] }
  );

  useEffect(() => {
    sessionStorage.setItem("isLoggedIn", isLoggedIn);
    if (isLoggedIn) {
      sessionStorage.setItem("userInfo", JSON.stringify(userInfo));
    } else {
      sessionStorage.removeItem("userInfo");
    }
  }, [isLoggedIn, userInfo]);

  const login = (email, username, roletype, permissions, rss) => {
    setIsLoggedIn(true);
    setUserInfo({ username, email, roletype, permissions, rss });
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserInfo({ username: "", email: "", roletype: "" });
    sessionStorage.removeItem("userInfo"); // Clear userInfo from sessionStorage
    sessionStorage.removeItem("isLoggedIn"); // Clear isLoggedIn from sessionStorage
    sessionStorage.removeItem("user"); // Clear token from sessionStorage
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout, userInfo }}>
      {children}
    </AuthContext.Provider>
  );
};
