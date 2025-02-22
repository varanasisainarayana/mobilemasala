import React from "react";
import AuthStore from "./authStore";
class RootStore {
  constructor() {
    this.AuthStore = new AuthStore(this);
  }
}
const StoresContext = React.createContext(new RootStore());
export const useStores = () => React.useContext(StoresContext);
