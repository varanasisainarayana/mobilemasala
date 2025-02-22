import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="row">
      <div className="col-12 p-md-5">
      <div className="d-flex  flex-column justify-content-center align-items-center p-md-5">
        <img src="/404.webp"  alt="404-not-found"/>
      {/* <h1 className="fw-bold m-1">404 - Page Not Found</h1>
      <p className="m-2">The page you're looking for does not exist.</p> */}
      <button
        className="btn btn-outline-info "
        onClick={() => window.history.back()}
      >
        Redirect
      </button>
    </div>
      </div>
    </div>
  );
};

export default NotFound;
  