import React, { createContext, useState, useContext } from "react";

const UserAreaContext = createContext();

export const UserAreaProvider = ({ children }) => {
  const [userArea, setUserArea] = useState("");

  const updateUserArea = (newArea) => {
    setUserArea(newArea);
  };

  return (
    <UserAreaContext.Provider value={{ userArea, updateUserArea }}>
      {children}
    </UserAreaContext.Provider>
  );
};

export const useUserArea = () => {
  const context = useContext(UserAreaContext);
  if (context === undefined) {
    throw new Error("useUserArea must be used within a UserAreaProvider");
  }
  return context;
};
