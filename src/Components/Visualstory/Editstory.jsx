import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../config";
// import { contextType } from "react-quill";

const Editstory = () => {
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null); // State for image preview
  const [storyTitle, setStoryTitle] = useState("");
  const [storyDescription, setStoryDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [status, setStatus] = useState("");
  const location = useLocation();
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const Navigate = useNavigate();
  const [filteredCategories, setFilteredCategories] = useState([]);

  const { item, categories, main, mainItem } = location.state || {};
  console.log("item", item, item?.imageId);

  useEffect(() => {
    if (item) {
      setStoryTitle((main ? item?.title : item?.postTitle) || "");
      setStoryDescription(item?.description || "");
      setLanguage((main ? item?.languageId : item?.language) || "");
      setStatus(item?.status || "");
      setImage((main ? item?.imageLink : item?.imagePath) || null);
      setImagePreview((main ? item?.imageLink : item?.imagePath) || null); // Set image preview from item if available
      setCategoryName(item?.categoryName || "");
    }
  }, [item]);

  const filterCategories = (language) => {
    // Example filtering logic (adjust as necessary)
    console.log(language);
    const filtered = categories.filter((category) => {
      // Assuming each category has a property to match against languageId
      return category.language == language && category.categoryType === 3; //
    });
    setFilteredCategories(filtered);
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      console.error("No file selected");
      return;
    }

    // Create a preview URL for the file
    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    // Create form data
    const formData = new FormData();
    formData.append("file", file);

    try {
      // Make the API call
      const response = await fetch(
        "https://demo.mobilemasala.com/api/s3/upload?Content-Type=multipart/form-data",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      // Get the response as text
      const responseText = await response.json();

      // Extract the FILE_URL from the response text

      const fileUrl = responseText?.FILE_URL;
      setImage(fileUrl); // Set the uploaded file
      setImagePreview(fileUrl); // Set the extracted URL as the preview
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  useEffect(() => {
    filterCategories(language);
  }, [language, categories]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    const data = {
      postTitle: storyTitle,
      status: status,
      description: storyDescription,
      language: language,
      postId: item?.postId,
      categoryName: categoryName,
      contentType: 3,
    };

    const storyData = {
      title: storyTitle,
      description: storyDescription,
      status: status,
      postId: item?.postId,
      imageId: item?.imageId,
      languageId: language,
    };

    formData.append("data", JSON.stringify(!main ? data : storyData));
    formData.append("imagePath", image);

    try {
      const url = main
        ? `${BASE_URL}/mm/saveOrUpdatevisual`
        : `${BASE_URL}/mm/articles`;

      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();

      if (result.status === 200) {
        setAlert({ show: true, message: result.message, type: "success" });

        // Clear the form fields after successful submission
        setLanguage("");
        setStatus("");
        setStoryDescription("");
        setStoryTitle("");
        setImagePreview(null); // Clear image preview

        setTimeout(() => {
          setAlert({ show: false, message: "", type: "" });
          if (!main) {
            Navigate("/stories", { state: { item } });
          } else {
            Navigate("/addstory", {
              state: { item: mainItem, main: true, categories: categories },
            });
          }
        }, 1000);
      } else {
        setAlert({ show: true, message: result.message, type: "danger" });
      }
    } catch (error) {
      console.error("Error:", error);
      setAlert("An error occurred while updating the story.");
    }
  };

  useEffect(() => {
    // Set filtered categories based on the selected language
    filterCategories(language);
  }, [language, categories]);

  const handleAlertClose = () => {
    setAlert({ show: false, message: "", type: "" });
    // Navigate("/stories");
  };

  const postredirect = () => {
    Navigate("/stories");
  };

  return (
    <div className="container-fluid p-auto m-auto">
      <div className="d-flex justify-content-between mt-3">
        <h4 className="fs-4">Edit Story</h4>
        <button
          className="btn btn-outline-warning text-dark shadow"
          onClick={postredirect}>
          {" "}
          Stories
        </button>
      </div>
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
      <form onSubmit={handleSubmit} className="card shadow mt-3">
        <div className="row m-3">
          <div className="col-12 col-md-6">
            <label className="form-label">Story Title *</label>
            <input
              type="text"
              className="form-control"
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
            />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">Choose Images *</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleImageChange}
            />
            <small className="text-danger">
              Please Upload 720 X 1280 in Pixels Only
            </small>
          </div>
          <div className="col-12 col-md-3">
            {imagePreview && (
              <img
                src={imagePreview}
                alt="Preview"
                className="img-fluid mt-3"
                style={{ maxHeight: "100px", objectFit: "contain" }} // Optional styles for better display
              />
            )}
          </div>
        </div>

        <div className="row m-3">
          <div className="col-12 col-md-6">
            <label className="form-label">Select Language</label>
            <select
              className="form-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}>
              <option value="">Select Language</option>
              <option value={1}>English</option>
              <option value={2}>Hindi</option>
              <option value={3}>Telugu</option>
            </select>
          </div>

          <div className="col-12 col-md-6">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}>
              <option value="">--select--</option>
              <option value={1}>Publish</option>
              <option value={2}>Pending</option>
            </select>
          </div>
        </div>

        <div className="row m-3">
          <div className="form-group col-lg">
            <label htmlFor="category">Category Name</label>
            <select
              id="category"
              name="categoryName"
              className="form-select"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}>
              {filteredCategories.length > 0 ? (
                filteredCategories.map((item) => (
                  <option key={item.categoryId} value={item.categoryId}>
                    {item.categoryName}
                  </option>
                ))
              ) : (
                <option value="">No categories available</option>
              )}
            </select>
          </div>
          <div className="col-6">
            <label className="form-label">Story Description</label>
            <textarea
              className="form-control"
              rows="3"
              value={storyDescription}
              onChange={(e) => setStoryDescription(e.target.value)}
            />
          </div>
        </div>

        <div className="d-flex justify-content-center m-3">
          <button type="submit" className="btn btn-primary mx-1">
            Save
          </button>
          <button
            type="button"
            className="btn btn-secondary mx-1"
            onClick={() => Navigate("/stories")}>
            Back
          </button>
        </div>
      </form>
    </div>
  );
};

export default Editstory;
