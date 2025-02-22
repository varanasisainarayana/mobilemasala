import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { BASE_URL } from "../../config";

const EditRSSForm = () => {
  const location = useLocation();
  const { item } = location.state || {};
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    rssid: item?.rssid || "",
    categoryName: item?.categoryName || "Fashion",
    rssName: item?.rssName || "",
    sourceUrl: item.sourceUrl || "",
    status: item?.status || "Active",
  });

  //hit api to get categories
  useEffect(() => {
    fetch(`${BASE_URL}/mm/getcategory`)
      .then((res) => res.json())
      .then((data) => setCategories(data?.data));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    //hit aa api to save rss
    fetch(`${BASE_URL}/mm/saverss`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data?.status === 200) {
          setAlert({ show: true, message: data.message, type: "success" });

          setTimeout(() => {
            setAlert({ show: false, message: "", type: "" });
            window.history.back();
          }, 1000);
        } else {
          alert("Failed to update RSS");
        }
      })
      .catch((error) => console.error);
  };

  const handleAlertClose = () => {
    setAlert({ show: false, message: "", type: "" });
  };

  return (
    <div className="container mt-5">
      <h3 className="mb-4">Add RSS</h3>
      {alert.show && (
        <div
          className={`alert alert-${alert.type} alert-dismissible w-50 fade show m-auto p-auto`}
          role="alert">
          {alert.message}
          <button
            type="button"
            className="btn-close"
            onClick={handleAlertClose}></button>
        </div>
      )}
      <form onSubmit={handleSubmit} className="row g-3 mx-auto">
        <div className="col-md-6">
          <label htmlFor="categoryName" className="form-label">
            Category Name
          </label>
          <select
            id="categoryName"
            name="categoryName"
            value={formData.categoryName}
            onChange={handleChange}
            className="form-select">
            {categories.map((category) => (
              <option key={category.categoryName} value={category.categoryName}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-6">
          <label htmlFor="rssName" className="form-label">
            RSS Name
          </label>
          <input
            type="text"
            id="rssName"
            name="rssName"
            value={formData.rssName}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter RSS Name"
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="sourceURL" className="form-label">
            Source URL
          </label>
          <input
            type="text"
            id="sourceUrl"
            name="sourceUrl"
            value={formData.sourceUrl}
            onChange={handleChange}
            className="form-control"
            placeholder="Enter Source URL"
          />
        </div>
        <div className="col-md-6">
          <label htmlFor="status" className="form-label">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="form-select">
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>
        <div className="col-12 d-flex ">
          {/* <button type="button" className="btn btn-secondary">
            View RSS
          </button> */}
          <button type="submit" className="btn btn-primary">
            Save
          </button>
          <button
            type="button"
            className="btn btn-secondary mx-1"
            onClick={() => window.history.back()}>
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRSSForm;
