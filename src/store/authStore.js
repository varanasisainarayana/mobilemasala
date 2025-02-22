import { makeAutoObservable } from "mobx";

class AuthStore {
  constructor() {
    makeAutoObservable(this);
  }

  user = {};
  loading = true;

  async setUser(user) {
    this.user = user;
    await sessionStorage.setItem("user", JSON.stringify(user));
    this.loading = false;
  }
}
export default AuthStore;
