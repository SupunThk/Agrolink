import { createContext, useEffect, useReducer } from "react";
import Reducer from "./Reducer";

const INITIAL_STATE = {
  user: (() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (err) {
        console.log("Failed to parse user:", err);
        return null;
      }
    }
    return null;
  })(),
  isFetching: false,
  error: false,
  isVerified: false,
  showVModal: false,
  showDModal: false,
  adminSidebarOpen: false,
  theme: localStorage.getItem("theme") || "light",
};

export const Context = createContext(INITIAL_STATE);

export const ContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(Reducer, INITIAL_STATE);

  useEffect(() => {
    localStorage.setItem("user", JSON.stringify(state.user));
  }, [state.user]);

  useEffect(() => {
    localStorage.setItem("theme", state.theme);
  }, [state.theme]);

  return (
    <Context.Provider
      value={{
        user: state.user,
        isFetching: state.isFetching,
        isVerified: state.isVerified,
        showVModal: state.showVModal,
        showDModal: state.showDModal,
        adminSidebarOpen: state.adminSidebarOpen,
        theme: state.theme,
        dispatch,
      }}
    >
      {children}
    </Context.Provider>
  );
};