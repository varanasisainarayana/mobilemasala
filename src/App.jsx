import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Sidebar from "./Components/Sidebar/Sidebar";
import Navbar from "./Components/Navbar/Navbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import Dashboard from "./Components/Dashboard/Dashboard";
import Posts from "./Components/Posts/Posts";
import Addpost from "./Components/Posts/Addpost";
import Editposts from "./Components/Posts/Editposts";
import Paparazzi from "./Components/Paparazzi/Paparazzi";
import RssDetails from "./Components/Rss Details/RssDetails";
import Trending from "./Components/Trending/Trending";
import Login from "./Components/Login/Login";
import Category from "./Components/Category/Category";
import Addcategory from "./Components/Category/Addcategory";
import EditCategory from "./Components/Category/EditCategory";
import { AuthProvider, useAuth } from "./Context/AuthContext";
import Addstory from "./Components/Visualstory/Addstory";
import Editstory from "./Components/Visualstory/Editstory";
import NotFound from "./Components/NotFound";
import Role from "./Components/Role/Role";
import Createusers from "./Components/Users/Users";
import "./App.css";
import Videos from "./Components/videos/video";
import Editvideos from "./Components/videos/editVideo";
import AddVideo from "./Components/videos/addVideo";
import Stories from "./Components/Visualstory/visualstory";
import EditRSSForm from "./Components/Rss Details/EditRssDetails";
import AddRSSForm from "./Components/Rss Details/addRssDetails";
import ManagePermissions from "./Components/Role/permissions";
import Polls from "./Components/polls/polls";

function App() {
  const [toggleed, setToggleed] = useState(false);

  useEffect(() => {
    if (
      sessionStorage.getItem("isLoggedIn") === "true" &&
      window.location.pathname === "/"
    ) {
      window.location.href = "/dashboard";
    }
  }, []);

  useEffect(() => {
    if (window.innerWidth > 768) {
      setToggleed(false);
    }
  }, []);
  const toggle = () => {
    setToggleed(!toggleed);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="d-flex vh-100 p-0 m-0">
          <AuthenticatedContent toggleed={toggleed} toggle={toggle} />
        </div>
      </Router>
    </AuthProvider>
  );
}

const ProtectedRoute = ({ element }) => {
  // const { isLoggedIn } = useAuth();
  const isLoggedIn = sessionStorage.getItem("isLoggedIn");

  return isLoggedIn ? element : <Navigate to="/" />;
};

const AuthenticatedContent = ({ toggleed, toggle }) => {
  const { isLoggedIn } = useAuth();

  return (
    <>
      {isLoggedIn && (
        <div
          className={toggleed ? "d-none w-auto vh-100 " : " w-auto  h-auto "}>
          <Sidebar />
        </div>
      )}
      <div className="col-lg col-md col-sm overflow-auto">
        {isLoggedIn && <Navbar toggle={toggle} />}
        <Routes>
          {isLoggedIn ? (
            <>
              <Route
                path="/dashboard"
                element={<ProtectedRoute element={<Dashboard />} />}
              />
              <Route
                path="/Posts"
                element={<ProtectedRoute element={<Posts />} />}
              />
              <Route
                path="/addpost"
                element={<ProtectedRoute element={<Addpost />} />}
              />
              <Route
                path="/editposts"
                element={<ProtectedRoute element={<Editposts />} />}
              />
              <Route
                path="/videos"
                element={<ProtectedRoute element={<Videos />} />}
              />
              <Route
                path="/editvideos"
                element={<ProtectedRoute element={<Editvideos />} />}
              />
              <Route
                path="/addvideo"
                element={<ProtectedRoute element={<AddVideo />} />}
              />
              <Route
                path="/stories"
                element={<ProtectedRoute element={<Stories />} />}
              />
              <Route
                path="/paparazzi"
                element={<ProtectedRoute element={<Paparazzi />} />}
              />
              <Route
                path="/category"
                element={<ProtectedRoute element={<Category />} />}
              />
              <Route
                path="/addcategory"
                element={<ProtectedRoute element={<Addcategory />} />}
              />
              <Route
                path="/editcategory"
                element={<ProtectedRoute element={<EditCategory />} />}
              />
              <Route
                path="/rssdetails"
                element={<ProtectedRoute element={<RssDetails />} />}
              />

              <Route
                path="/editrssdetails"
                element={<ProtectedRoute element={<EditRSSForm />} />}
              />

              <Route
                path="/addrssdetails"
                element={<ProtectedRoute element={<AddRSSForm />} />}
              />

              <Route
                path="/trending"
                element={<ProtectedRoute element={<Trending />} />}
              />

              <Route
                path="/addstory"
                element={<ProtectedRoute element={<Addstory />} />}
              />

              <Route
                path="/editstory"
                element={<ProtectedRoute element={<Editstory />} />}
              />

              <Route
                path="/role"
                element={<ProtectedRoute element={<Role />} />}
              />
              <Route
                path="/permissions/:roleid"
                element={<ProtectedRoute element={<ManagePermissions />} />}
              />
              <Route
                path="/createusers"
                element={<ProtectedRoute element={<Createusers />} />}
              />
              <Route
                path="/polls"
                element={<ProtectedRoute element={<Polls />} />}
              />
              {/* <Route path="*" element={<NotFound />} /> */}
            </>
          ) : (
            <>
              {/* Unauthenticated Routes */}
              <Route path="/" element={<Login />} />
              {/* <Route path="*" element={<NotFound />} /> */}
            </>
          )}
        </Routes>
      </div>
    </>
  );
};

export default App;
