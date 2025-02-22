import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "../../config";
import { useAuth } from "../../Context/AuthContext";

const Addstory = () => {
  const { userInfo } = useAuth();
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [storyTitle, setStoryTitle] = useState("");
  const [storyDescription, setStoryDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [status, setStatus] = useState("");
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [categoryName, setCategoryName] = useState("");
  const [stories, setStories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const Navigate = useNavigate();
  const location = useLocation();
  const { categories: allCategories, main, item } = location.state || {};
  console.log("item", allCategories, main, item);

  useEffect(() => {
    setCategories(allCategories || []);
    if (!main) {
      setFilteredCategories(allCategories || []);
      if (allCategories?.length > 0) {
        const defaultFiltered = allCategories.filter(
          (category) =>
            category.language === parseInt(language) &&
            category.categoryType === 3
        );
        if (defaultFiltered.length > 0) {
          setCategories(defaultFiltered[0].categoryId);
        }
      }
    } else {
      setCategoryName(item?.categoryId || "");
      setLanguage(item?.language || "");
    }
  }, [allCategories, main, item]);

  useEffect(() => {
    console.log(language);
    const filtered = allCategories.filter(
      (category) =>
        category.language === parseInt(language) && category.categoryType === 3
    );
    console.log(allCategories);
    console.log(filtered);
    setFilteredCategories(filtered);
    if (filtered.length > 0 && !categoryName) {
      setCategoryName(filtered[0].categoryId);
    }
  }, [language, allCategories, categoryName]);

  useEffect(() => {
    if (item?.postId) {
      StoryApicallmethod(item.postId);
    }
  }, [item]);

  const StoryApicallmethod = async (postId) => {
    try {
      const response = await fetch(`${BASE_URL}/mm/visual?id=${postId}`);
      const data = await response.json();

      setStories(Array.isArray(data?.data) ? data.data : []);
    } catch (error) {
      console.error("Error fetching stories:", error);
      setAlert({
        show: true,
        message: "Error fetching stories. Please try again.",
        type: "danger",
      });
      setStories([]);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      console.error("No file selected");
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);

    const formData = new FormData();
    formData.append("file", file);

    try {
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

      const responseText = await response.json();
      const fileUrl = responseText?.FILE_URL;
      setImage(fileUrl);
      setImagePreview(fileUrl);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

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
      uploadedBy: userInfo.email,
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
      setAlert({ show: true, message: result.message, type: "success" });

      if (result.status === 200) {
        setLanguage("");
        setStatus("");
        setStoryDescription("");
        setStoryTitle("");
        setImagePreview(null);
        setCategoryName("");
        setTimeout(() => {
          setAlert({ show: false, message: "", type: "" });
          if (!main) {
            Navigate("/stories");
          }
          StoryApicallmethod(item?.postId);
        }, 1000);
      } else {
        setAlert({ show: true, message: result.message, type: "danger" });
      }
    } catch (error) {
      console.error("Error:", error);
      setAlert({
        show: true,
        message: "Error adding post. Please try again.",
        type: "danger",
      });
    }
  };

  const gotoeditstory = (story) => {
    Navigate("/editstory", {
      state: {
        item: story,
        main: true,
        categories: allCategories,
        mainItem: item,
      },
    });
  };

  const gotodeletestory = (story) => {
    const confirmDelete = window.confirm("Are you sure you want to delete?");
    if (confirmDelete) {
      const apiUrl = `${BASE_URL}/mm/delete?type=visualstory&id=${story.imageId}`;
      fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((response) => {
          if (response.ok) {
            setAlert({
              show: true,
              message: "Deleted Success",
              type: "success",
            });

            setTimeout(() => {
              setAlert({ show: false, message: "", type: "" });
              StoryApicallmethod(item?.postId);
              if (!main) {
                Navigate("/stories");
              }
            }, 1000);
          } else {
            return response.json().then((errorData) => {
              setAlert({ show: false, message: errorData.message, type: "" });

              Navigate("/addstory");
            });
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          setAlert({ show: false, message: error, type: "" });

          Navigate("/addstory");
        });
    }
  };

  const handleAlertClose = () => {
    setAlert({ show: false, message: "", type: "" });
  };

  const postredirect = () => {
    Navigate("/stories");
  };

  return (
    <div className="container-fluid p-auto m-auto">
      <div className="d-flex justify-content-between mt-3">
        <h4 className="fs-4">Add Story</h4>
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
        <div className="row m-2">
          <div className="col-12">
            <h6 className="text-danger">{item?.postTitle}</h6>
          </div>
        </div>
        <div className="row m-2">
          <div className="col-12 col-md-6">
            <label className="form-label">Story Title *</label>
            <input
              type="text"
              className="form-control"
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
              required
            />
          </div>
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
        </div>
        <div className="row m-2">
          <div className="col-12 col-md-6">
            <label className="form-label">Status *</label>
            <select
              className="form-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              required>
              <option value={0}>--select--</option>
              <option value={1}>Publish</option>
              <option value={2}>Pending</option>
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label">Choose Image *</label>
            <input
              type="file"
              className="form-control"
              accept="image/*"
              onChange={handleImageChange}
              required
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
                style={{ maxHeight: "100px", objectFit: "contain" }}
              />
            )}
          </div>
        </div>
        <div className="row m-2">
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

      {main && (
        <div
          className="table-responsive rounded shadow my-3"
          style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <table className="table table-hover table-bordered">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Title</th>
                <th>Description</th>
                <th>Image</th>
                <th>Language</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(stories) && stories.length > 0 ? (
                stories.map((story, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{story.title}</td>
                    <td>{story.description}</td>
                    <td
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}>
                      {story.imageLink && (
                        <img
                          src={story.imageLink}
                          alt={story.title}
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                          }}
                        />
                      )}
                    </td>
                    <td>
                      {story.languageId === 1
                        ? "English"
                        : story.languageId === 2
                        ? "Hindi"
                        : story.languageId === 3
                        ? "Telugu"
                        : ""}
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-warning m-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          gotoeditstory(story);
                        }}>
                        <i className="bi bi-pencil-square"></i>
                      </button>
                      <button
                        className="btn btn-outline-danger m-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          gotodeletestory(story);
                        }}>
                        <i className="bi bi-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">
                    No Stories uploaded
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Addstory;
