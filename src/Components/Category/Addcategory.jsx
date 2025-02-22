import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../config";

const AddCategory = () => {
  const [formData, setFormData] = useState({});
  const navigate = useNavigate();
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    fetch(`${BASE_URL}/mm/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        console.log("Success:", data);
        setAlert({ show: true, message: data.message, type: "success" });
        setFormData({});
        setTimeout(() => {
          setAlert({ show: false, message: "", type: "" });
          navigate("/category");
        }, 1000);
      })
      .catch((error) => {
        console.error("Error:", error);
        setAlert({
          show: true,
          message: "Error adding category. Please try again.",
          type: "danger",
        });
      });
  };

  const handleNavigateBack = () => {
    navigate("/category");
  };

  const handleAlertClose = () => {
    setAlert({ show: false, message: "", type: "" });
    // navigate("/category");
  };

  return (
    <section className="container-fluid p-auto m-auto">
      <div className="row">
        <div className="d-flex justify-content-between my-3">
          <h4 className="fs-3">Add Category</h4>
          <button
            className="btn btn-outline-warning text-dark shadow"
            onClick={handleNavigateBack}>
            Back to Category
          </button>
        </div>
        {alert.show && (
          <div
            className={`alert alert-${alert.type} alert-dismissible  w-50 fade show m-auto p-auto`}
            role="alert">
            {alert.message}
            <button
              type="button"
              className="btn-close"
              onClick={handleAlertClose}></button>
          </div>
        )}
        <div className="p-2">
          <form
            className="col-12 h-100 w-100 shadow p-5"
            onSubmit={handleSubmit}>
            <div className="row my-4">
              <div className="form-group col-lg">
                <label htmlFor="categoryname">Category Name:</label>
                <input
                  type="text"
                  className="form-control"
                  id="categoryname"
                  name="categoryName"
                  placeholder="Enter category Name"
                  value={formData.categoryName || ""}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-lg-6">
                <label htmlFor="language">Language:</label>
                <select
                  id="language"
                  name="language"
                  className="form-control"
                  value={formData.language || ""}
                  onChange={handleChange}>
                  <option value="">...select...</option>
                  <option value="1">English</option>
                  <option value="2">Hindi</option>
                  <option value="3">Telugu</option>
                  <option value="4">Tamil</option>
                  <option value="5">Kannada</option>
                  <option value="6">Malayalam</option>
                </select>
              </div>
            </div>

            <div className="row my-4">
              <div className="form-group col-lg-6">
                <label htmlFor="home_view_type">Home View Type:</label>
                <select
                  id="home_view_type"
                  name="homeViewType"
                  className="form-control"
                  value={formData.homeViewType || ""}
                  onChange={handleChange}>
                  <option value="">...select...</option>
                  <option value="dark-block">dark-block</option>
                  <option value="light-block">light-block</option>
                  <option value="trending-block">trending-block</option>
                  <option value="number-slider">number-slider</option>
                  <option value="motion-slider">motion-slider</option>
                  <option value="photo-stories">photo-stories</option>
                  <option value="youtube-videos">youtube-videos</option>
                </select>
              </div>
              <div className="form-group col-lg-6">
                <label htmlFor="category_type">Category Type:</label>
                <select
                  className="form-control"
                  id="category_type"
                  name="categoryType"
                  value={formData.categoryType || ""}
                  onChange={handleChange}>
                  <option value="">...select...</option>
                  <option value="1">Post</option>
                  <option value="2">Video</option>
                  <option value="3">Vstories</option>
                </select>
              </div>
            </div>

            <div className="row my-4">
              <div className="form-group col-lg-6">
                <label htmlFor="status">Status:</label>
                <select
                  id="status"
                  name="status"
                  className="form-control"
                  value={formData.status || ""}
                  onChange={handleChange}>
                  <option value="">...select...</option>
                  <option value="0">Active</option>
                  <option value="1">Inactive</option>
                </select>
              </div>
              <div className="form-group col-lg-6">
                <label htmlFor="home_view_type">Order:</label>
                <input
                  type="number"
                  className="form-control"
                  id="order"
                  name="order"
                  placeholder="Enter order"
                  value={formData.order || 0}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              Submit
            </button>
            <button
              type="button"
              className="btn btn-secondary mx-1"
              onClick={() => window.history.back()}>
              Back
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default AddCategory;
