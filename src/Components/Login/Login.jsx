import React, { useEffect, useState } from "react";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../config"; // Import the base URL
import { useStores } from "../../store";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(false);

  useEffect(() => {
    sessionStorage.setItem("isLoggedIn", false);
    sessionStorage.removeItem("userInfo");
    sessionStorage.removeItem("user");
  }, []);

  const { login } = useAuth();
  const { AuthStore } = useStores();
  const Navigate = useNavigate();
  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log(username, password);

    const apiEndpoint = `${BASE_URL}/mm/login?username=${encodeURIComponent(
      username
    )}&password=${encodeURIComponent(password)}`;

    try {
      const response = await fetch(apiEndpoint, {
        method: "POST",
      });

      const result = await response.json();
      console.log("Login successful:", result);

      if (result.status === 200) {
        await login(
          result.data.email,
          result.data.username,
          result.data.roletype,
          result.data.permissions,
          result.data.rss_access
        );
        await AuthStore.setUser({
          email: result.data.email,
          username: result.data.username,
          roletype: result.data.roletype,
          permissions: result.data.permissions,
          rssAccess: result.data.rss_access,
        });
        setMessage(result.data.message);
        setTimeout(() => {
          Navigate("/dashboard");
        }, 1000);

        setTimer(true);
      } else if (result.status === 401) {
        setMessage(result.data.message);
        setTimer(true);
      }
    } catch (error) {
      setMessage(
        "Network error: Unable to reach the server. Please try again later."
      );
      setTimer(true);
    }
  };

  setTimeout(() => {
    setTimer(false);
  }, 1000);
  console.log(message);
  return (
    <section className="ftco-section">
      <div className="container">
        <div className="row d-flex flex-column justify-content-center align-items-center">
          <div className="col-md-6 text-center mt-5 mb-3">
            <img
              src="./MMLogo3.png"
              alt="image"
              style={{ height: "50px", width: "250px" }}
            />
          </div>
        </div>
        <div className="row justify-content-center align-content-center">
          <div className="col-md-5 col-lg-5 col-xl-5 col-12">
            <div
              className="login-wrap p-5 p-md-5"
              style={{
                boxShadow:
                  "rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px",
              }}>
              <h6 className="text-center">Welcome back!</h6>
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group m-3">
                  <label htmlFor="username" className="m-1">
                    User Name
                  </label>
                  <input
                    type="text"
                    className="form-control rounded-left"
                    placeholder="username"
                    name="username"
                    onChange={(e) => setUsername(e.target.value)}
                    value={username}
                    required
                  />
                </div>
                <div className="form-group m-3">
                  <label htmlFor="password" className="m-1">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    className="form-control rounded-left"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group d-md-flex justify-content-between m-3">
                  <div>
                    <input type="checkbox" />
                    <span className="checkmark"></span>
                    <label className="checkbox-wrap checkbox-primary p-2">
                      Remember Me
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary rounded px-4 py-1 loginbtn">
                    Log In
                  </button>
                </div>
                <div className="d-flex  justify-content-center align-items-center">
                  <p className="text-danger "> {timer ? message : ""}</p>
                </div>
              </form>
            </div>
          </div>
        </div>
        <p className="text-center m-1 p-4">© 2023 Mobile Masala</p>
      </div>
    </section>
  );
};

export default Login;
