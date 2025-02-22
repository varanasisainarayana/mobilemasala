import React, { useState, useEffect, useRef } from "react";
// import ReactQuill from "re/act-quill";
// import "react-quill/dist/quill.snow.css"; // Import Quill CSS
// import QuillToolbar, { modules, formats } from "./EditorToolbar"; // Import the correct path
// import JoditEditor from "jodit-react";
import Editor from "../editor";

import { useNavigate, useLocation } from "react-router-dom";
import { BASE_URL } from "../../config";

const Editvideos = () => {
  const location = useLocation();
  const { item, categories } = location.state || {}; // Extract 'item' and 'categories' from location state
  const [image, setImage] = useState(null); // State for the new image file
  const editor = useRef(null); // Jodit Editor reference
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  console.log(item.description);

  // const [langdata, setlangData] = useState({
  //   language: 0,
  //   categoryName: "",
  //   // Add other form fields as needed
  // });
  console.log(categories);
  const [filteredCategories, setFilteredCategories] = useState([]);

  const filterCategories = (language) => {
    // Example filtering logic (adjust as necessary)
    console.log(language);
    const filtered = categories.filter((category) => {
      // Assuming each category has a property to match against languageId
      return category.language == language && category.categoryType === 2;
    });
    setFilteredCategories(filtered);
  };

  console.log(filteredCategories);
  console.log(item);
  const [formData, setFormData] = useState({
    postId: item?.postId || null,
    categoryName: item?.categoryName || "",
    postTitle: item?.postTitle || "",
    rssName: item?.rssName || "",
    users: item?.users || "",
    trendingNow: item?.trendingNow || false,
    hotContent: item?.hotContent || false,
    sendGmail: item?.sendGmail || false,
    // schedule: item?.schedule || "",
    language: item?.language || "",
    hashtag: item?.hashtag || "",
    status: item?.status !== 0 ? 1 : item?.status, // assuming default of 1
    author: item?.author || "", // default value
    description: item?.description || "",
    contentType: parseInt(item?.contentType) || 1, // assuming default of 1
    autoStatus: item?.autoStatus || 0,
    autoTime: item?.autoTime || "",
    catType: item?.catType || null,
    categoryId: item?.categoryId || 0,
    categoryIdOld: item?.categoryIdOld || 0,
    imagePath: item?.imagePath || "",
    keywords: item?.keywords || null,
    notiInput: item?.notiInput || 0,
    publishedDate: item?.publishedDate || "",
    publishedOn: item?.publishedOn || null, // Added
    rssId: item?.rssId || 0,
    schedule: item?.schedule || null,
    scheduleDate: item?.scheduleDate || null,
    timageLinkNew: item?.timageLinkNew || null,
    updatedAt: item?.updatedAt || "",
    uploadedBy: item?.uploadedBy || null,
    videoFilePath: item?.videoFilePath || null,
    videoPath: item?.videoPath || "", // Retain this
    writer: item?.writer || null,
    categoryUrl: item?.categoryUrl || "", // Added
    guid: item?.guid || null, // Added
    hitCount: item?.hitCount || 0, // Added
    postIntro: item?.postIntro || "", // Added
    trending: item?.trending || 0, // Added
  });
  console.log(formData.description);

  useEffect(() => {
    // Set filtered categories based on the selected language
    filterCategories(formData.language);
  }, [formData.language, categories]);

  const Navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "categoryName") {
      // Find the selected category by categoryId
      const selectedCategory = filteredCategories.find(
        (category) => category.categoryName === value
      );
      console.log(JSON.stringify(selectedCategory));
      // Update both categoryId and categoryName in formData
      setFormData((prevData) => ({
        ...prevData,
        categoryId: selectedCategory ? selectedCategory.categoryId : "",
        categoryName: selectedCategory ? selectedCategory.categoryName : "",
      }));
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
      if (name == formData.language) {
        filterCategories(formData.language);
      }
    }
  };

  // const handleQuillChange = (value) => {
  //   setFormData({
  //     ...formData,
  //     description: value
  //   });
  // };

  const handleEditorChange = (content, editor) => {
    console.log("Content was updated:", content);

    setFormData((prevData) => ({
      ...prevData,
      description: content,
    }));
  };

  const config = {
    readonly: false, // Change this to true if you want it read-only
    height: 400, // Set height if needed
    toolbarAdaptive: true,
    uploader: {
      insertImageAsBase64URI: true, // Insert image as Base64 URL
    },
    defaultActionOnPaste: "insert_as_html",
    defaultActionOnPasteFromWord: "insert_as_html",
    askBeforePasteFromWord: false,
    askBeforePasteHTML: false,
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    setFormData({
      ...formData,
      scheduleDate: null,
    });

    const wrappeddata = new FormData();
    wrappeddata.append("data", JSON.stringify(formData));
    console.log(wrappeddata);
    wrappeddata.append(
      "imagePath",
      image !== null ? image : formData.imagePath
    );
    fetch(`${BASE_URL}/mm/articles`, {
      method: "POST",
      body: wrappeddata,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 200) {
          setAlert({ show: true, message: data.message, type: "success" });

          setTimeout(() => {
            setAlert({ show: false, message: "", type: "" });
            Navigate("/videos");
          }, 1000);
        } else {
          setAlert({ show: true, message: data.message, type: "danger" });
        }
      })
      .catch((error) => {
        console.error("Error updating post:", error);
        setAlert({
          show: true,
          message: "Error editing videos. Please try again.",
          type: "danger",
        });
      });
  };
  const [imagePreview, setImagePreview] = useState(item?.imagePath || ""); // Initialize with existing image path if available

  const postredirect = () => {
    Navigate("/videos");
  };

  const handleFileChange = async (e) => {
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

  const handleAlertClose = () => {
    setAlert({ show: false, message: "", type: "" });
    Navigate("/videos");
  };
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="d-flex justify-content-between mt-3">
          <h4 className="fs-4">Edit Videos</h4>
          <button
            className="btn btn-outline-warning text-dark shadow"
            onClick={postredirect}>
            {" "}
            Videos
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
        <div className="p-2">
          <form
            className="col-12 h-100 w-100 shadow p-5"
            onSubmit={handleSubmit}>
            <div className="row my-4">
              <div className="form-group col-lg">
                <label htmlFor="language">Select Language</label>
                <select
                  id="language"
                  name="language"
                  className="form-control"
                  value={formData.language}
                  onChange={handleChange}>
                  <option value={0}>Choose...</option>
                  <option value={1}>English</option>
                  <option value={2}>Hindi</option>

                  <option value={3}>Telugu</option>
                </select>
              </div>
              <div className="form-group col-lg">
                <label htmlFor="category">Category Name</label>
                <select
                  id="category"
                  name="categoryName" // Ensure this matches the state key
                  className="form-control"
                  value={formData.categoryName} // Adjust this to match your state
                  onChange={handleChange}>
                  {/* <option value={0}>Choose...</option> */}
                  {filteredCategories &&
                    filteredCategories.map((category) => (
                      <option
                        key={category.categoryId}
                        value={category.categoryName}>
                        {category.categoryName}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="row my-4">
              <div className="form-group col-lg">
                <label htmlFor="rssName">Content Type</label>
                <select
                  id="rssName"
                  name="contentType"
                  className="form-control"
                  value={parseInt(formData.contentType)}
                  disabled
                  onChange={handleChange}>
                  <option value="2">Videos</option>
                </select>
              </div>
              <div className="form-group col-lg">
                <label htmlFor="postTitle">Post Title</label>
                <input
                  type="text"
                  className="form-control"
                  id="postTitle"
                  name="postTitle"
                  placeholder="Enter Title"
                  value={formData.postTitle} // Corrected to formData.postTitle
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row my-4">
              <div className="form-group col-lg">
                <label htmlFor="options" className="m-1">
                  Select Options
                </label>
                <br />
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="trendingNow"
                    name="trendingNow"
                    checked={formData.trendingNow}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="trendingNow">
                    Trending Now
                  </label>
                </div>
                {/* <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="hotContent"
                    name="hotContent"
                    checked={formData.hotContent}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="hotContent">
                    Hot Content
                  </label>
                </div> */}
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="sendGmail"
                    name="sendGmail"
                    checked={formData.sendGmail}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="sendGmail">
                    Send Gmail
                  </label>
                </div>
              </div>

              <div className="form-group col-lg-3">
                <label htmlFor="formFileMultiple" className="form-label">
                  Select Images
                </label>
                <input
                  className="form-control "
                  id="formFileMultiple"
                  type="file"
                  onChange={handleFileChange} // Removed the value property
                />
              </div>
              <div className="col-lg-3">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="img-fluid mt-3" // Add some margin to separate from the input
                    style={{ maxHeight: "100px", objectFit: "contain" }} // Optional styles for better display
                  />
                )}
              </div>
            </div>

            <div className="row my-4">
              <div className="form-group col-lg">
                <label htmlFor="videoPath" className="form-label">
                  Video / Audio
                </label>
                <input
                  type="url"
                  className="form-control"
                  id="videoPath"
                  name="videoPath"
                  placeholder="Video / Audio url"
                  value={formData.videoPath}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-lg">
                <label htmlFor="schedulePost">Schedule Post</label>
                <select
                  id="schedule"
                  name="schedule"
                  className="form-control"
                  value={formData.schedule}
                  onChange={handleChange}>
                  <option value="">Choose...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>

            <div className="row my-4">
              <div className="form-group col-lg">
                <label htmlFor="hashtag">HashTag</label>
                <input
                  type="text"
                  className="form-control"
                  id="hashtag"
                  name="hashtag"
                  placeholder="Enter Hashtag"
                  value={formData.hashtag}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group col-lg">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  className="form-control"
                  value={formData.status}
                  onChange={handleChange}>
                  {/* <option value="">Choose...</option> */}
                  <option value={1}>Publish</option>
                  <option value={0}>Pending</option>
                </select>
              </div>
            </div>

            {/* <div className="row my-4">
                <div className="form-group col-12">
                  <label htmlFor="content">Content</label>
                  <QuillToolbar toolbarId="toolbar" />
                  <ReactQuill
                    value={formData.description}
                    onChange={handleQuillChange}
                    modules={modules('toolbar')}
                    formats={formats}
                  />
                </div>
              </div> */}
            <div className="row my-4">
              <div className="form-group col-12">
                <label htmlFor="description">Content</label>
                {/* <JoditEditor
                  ref={editor}
                  value={formData.description}
                  config={config}
                  onBlur={(newContent) =>
                    setFormData({ ...formData, description: newContent })
                  } // Save content on editor blur
                  onChange={(newContent) =>
                    setFormData({ ...formData, description: newContent })
                  }
                /> */}
                <Editor
                  description={item.description}
                  handleEditorChange={handleEditorChange}
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
    </div>
  );
};

export default Editvideos;
