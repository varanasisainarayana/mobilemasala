// import React, { useState, useEffect } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../../Context/AuthContext";

// const Sidebar = ({ toggle, userRole }) => {
//   const [activeStep, setActiveStep] = useState(1);
//   const { logout } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const handleLogout = () => {
//     logout();
//     navigate("/");
//   };

//   const menuItems = [
//     {
//       id: 1,
//       label: "Dashboard",
//       icon: "bi bi-house",
//       path: "/dashboard",
//       roles: 0,
//     },
//     {
//       id: 2,
//       label: "Posts",
//       icon: "bi bi-file-earmark-image",
//       path: "/posts",
//       roles: 0,
//     },
//     {
//       id: 3,
//       label: "Rss Details",
//       icon: "bi bi-file-earmark-image",
//       path: "/rssdetails",
//       roles: 0,
//     },
//     {
//       id: 4,
//       label: "Visual Stories",
//       icon: "bi bi-quote",
//       path: "/visualstories",
//       roles: 0,
//     },
//     {
//       id: 5,
//       label: "Trending",
//       icon: "bi bi-newspaper",
//       path: "/trending",
//       roles: 0,
//     },
//     { id: 6, label: "Roles", icon: "bi bi-people", path: "/role", roles: 0 },
//     {
//       id: 7,
//       label: "Create User",
//       icon: "bi bi-people",
//       path: "/createusers",
//       roles: 0,
//     },
//     {
//       id: 8,
//       label: "Category",
//       icon: "bi bi-bookmarks-fill",
//       path: "/category",
//       roles: 0,
//     },
//   ];

//   const filteredMenuItems = menuItems.filter((item) => item.roles === 0);
//   useEffect(() => {
//     const activeItem = menuItems.find((item) =>
//       location.pathname.startsWith(item.path)
//     );
//     if (activeItem) {
//       setActiveStep(activeItem.id);
//     }
//   }, [location.pathname, menuItems]);
//   return (
//     <aside
//       className="d-flex justify-content-between flex-column text-black vh-100 pe-4"
//       style={{ backgroundColor: "#333547" }}
//     >
//       <div className="position-absolute top-0 end-0 ">
//         <i
//           className="bi bi-x fs-3 text-white cursor-pointer"
//           onClick={toggle}
//         ></i>
//       </div>
//       <div className="ms-3">
//         <Link to="/Dashboard">
//           <img
//             src="../MMLogo3.png"
//             style={{ height: "3rem" }}
//             className="ms-3 mt-2"
//             alt="CoolBrand"
//           />
//         </Link>
//         <ul className="nav nav-pills flex-column justify-content-center list-unstyled mt-2">
//           {filteredMenuItems.map((item) => (
//             <li
//               key={item.id}
//               className={
//                 activeStep === item.id ? "nav-item  m-3 active" : "nav-item m-3"
//               }
//               onClick={() => setActiveStep(item.id)}
//             >
//               <Link to={item.path}>
//                 <i className={`${item.icon} fs-5 m-3`}></i>
//                 <span className=" fs-6  fw-bold">{item.label}</span>
//               </Link>
//             </li>
//           ))}
//         </ul>
//       </div>

//       <div
//         className="p-1 d-flex flex-column  align-items-center"
//         style={{ color: "#f0e9e9" }}
//       >
//         <hr style={{ width: "100%", borderColor: "#f0e9e9" }} />
//         <span className="fs-5 fw-bold cursor-pointer" onClick={handleLogout}>
//           <i className="bi bi-box-arrow-left m-2 fw-bold"></i> Log out
//         </span>
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;
import React, { useState, useEffect, useMemo } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import { useStores } from "../../store";
import { useObserver } from "mobx-react";
import { FadeLoader } from "react-spinners";
import { toJS } from "mobx";
import { use } from "react";

const Sidebar = ({ toggle }) => {
  const [activeStep, setActiveStep] = useState(1);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const { AuthStore } = useStores();
  const { userInfo } = useAuth();

  useEffect(() => {
    AuthStore.setUser(userInfo);
  }, [userInfo]);

  const menuItems = useMemo(() => {
    if (AuthStore.loading)
      return [
        {
          id: 1,
          label: "Dashboard",
          icon: "bi bi-speedometer2",
          path: "/dashboard",
        },
      ];

    const baseMenuItems = [
      {
        id: 1,
        label: "Dashboard",
        icon: "bi bi-speedometer2",
        path: "/dashboard",
      },
    ];

    if (AuthStore.user?.roletype === 0 || userInfo.roletype === 0) {
      return [
        ...baseMenuItems,
        { id: 2, label: "Posts", icon: "bi bi-file-text", path: "/posts" },
        { id: 3, label: "Videos", icon: "bi bi-play-btn", path: "/videos" },
        {
          id: 4,
          label: "Photo Stories",
          icon: "bi bi-image",
          path: "/stories",
        },
        {
          id: 5,
          label: "Rss Details",
          icon: "bi bi-journal-text",
          path: "/rssdetails",
        },
        {
          id: 6,
          label: "Trending",
          icon: "bi bi-newspaper",
          path: "/trending",
        },
        { id: 7, label: "Roles", icon: "bi bi-people", path: "/role" },
        {
          id: 8,
          label: "Create User",
          icon: "bi bi-person",
          path: "/createusers",
        },
        { id: 9, label: "Category", icon: "bi bi-folder", path: "/category" },
        { id: 10, label: "Polls", icon: "bi bi-bar-chart", path: "/polls" },
      ];
    }

    console.log("AuthStore permissions:", toJS(AuthStore.user?.permissions));
    console.log("UserInfo permissions:", userInfo?.permissions);

    const userPermissions = [];
    const permissions = AuthStore.user?.permissions || userInfo?.permissions;

    permissions.forEach((perm) => {
      if (
        perm.add === 1 ||
        perm.edit === 1 ||
        perm.delete === 1 ||
        perm.access === 1
      ) {
        if (!userPermissions.some((item) => item.id === perm.module_id)) {
          switch (perm.module_id) {
            case 2:
              userPermissions.push({
                id: 2,
                label: "Posts",
                icon: "bi bi-file-text",
                path: "/posts",
              });
              break;
            case 3:
              {
                userInfo.rss !== "" &&
                  userPermissions.push({
                    id: 3,
                    label: "Rss Details",
                    icon: "bi bi-journal-text",
                    path: "/rssdetails",
                  });
              }
              break;
            case 4:
              userPermissions.push({
                id: 4,
                label: "Photo Stories",
                icon: "bi bi-image",
                path: "/stories",
              });
              break;
            case 5:
              userPermissions.push({
                id: 5,
                label: "Trending",
                icon: "bi bi-newspaper",
                path: "/trending",
              });
              break;
            case 6:
              userPermissions.push({
                id: 6,
                label: "Videos",
                icon: "bi bi-play-btn",
                path: "/videos",
              });
              break;
            case 7:
              userPermissions.push({
                id: 7,
                label: "Category",
                icon: "bi bi-folder",
                path: "/category",
              });
              break;
            case 8:
              userPermissions.push({
                id: 8,
                label: "Polls",
                icon: "bi bi-bar-chart",
                path: "/polls",
              });
            default:
              break;
          }
        }
      }
    });

    return [...baseMenuItems, ...userPermissions];
  }, [AuthStore.user, AuthStore.loading, userInfo]);

  useEffect(() => {
    // Find the active item based on the current location
    const activeItem = menuItems.find(
      (item) => location.pathname === item.path
    );

    // Update activeStep based on the found item or default to 1 (Dashboard)
    setActiveStep(activeItem ? activeItem.id : 1);
  }, [location.pathname]);

  return useObserver(() => (
    <>
      {AuthStore.loading ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "60vh" }}>
          <FadeLoader size={50} color={"#123abc"} loading={AuthStore.loading} />
          <span className="ms-2">Loading...</span>
        </div>
      ) : (
        <aside
          className={`sidebar vh-100 d-flex flex-column justify-content-between ${
            toggle ? "collapsed" : ""
          }`}>
          {/* <div className="close-icon">
            <i
              className="bi bi-x fs-3 text-white cursor-pointer"
              onClick={toggle}></i>
          </div> */}
          <div className="sidebar-menu">
            <Link to="/">
              <img
                src="../MMLogo3.png"
                className="brand-logo d-none d-lg-block"
                alt="CoolBrand"
              />
              <img
                src="../mobileview.webp"
                className="brand-logo d-lg-none"
                alt="CoolBrand"
              />
            </Link>
            <ul className="nav nav-pills flex-column list-unstyled mt-2">
              {menuItems.map((item) => (
                <Link to={item.path}>
                  <li
                    key={item.id}
                    className={`nav-item fs-5 ${
                      activeStep === item.id ? "active fs-5" : ""
                    }`}>
                    <i className={`${item.icon} fs-5`}></i>
                    <span className="nav-label">{item.label}</span>
                  </li>
                </Link>
              ))}
            </ul>
          </div>
          <div className="logout-section">
            <hr />
            <span className="fs-4 cursor-pointer" onClick={handleLogout}>
              <i className="bi bi-box-arrow-left mx-2 fs-4"></i>
              <span className="d-none d-lg-inline mx-2">Log out</span>
            </span>
          </div>
        </aside>
      )}
    </>
  ));
};

export default Sidebar;
