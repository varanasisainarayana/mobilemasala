


import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from '../../Context/AuthContext';

const Navbar = ({ toggle }) => {
  const { logout,userInfo } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    
      <header
      className="navbar navbar-expand-lg navbar-light d-flex justify-content-between col navbar-custom"
      
    >
      <div className="container-fluid d-flex">
        <div onClick={toggle}>
          <span>
            <i className="bi bi-list h-100 w-100 fs-2 text-light "></i>
          </span>
        </div>

   
              <div className="nav-item  d-block fw-bold">
              <small className="p-1 fs-5 text-light" >{userInfo.username}</small>
                  <i className="bi bi-person-circle  text-light  fs-3"> </i>
              </div>
       
      </div>
    </header>
   
  
  );
};

export default Navbar;
