import React, { useState, useRef, useEffect } from "react";
// import ReactQuill from "react-qu?ill";
// import "react-quill/dist?/quill.snow.css"; // Im?port Quill CSS
// import QuillToolbar, { modules, formats } from "./EditorToolbar";
import { useAuth } from "../../Context/AuthContext";
import { BASE_URL } from "../../config";
// import JoditEditor from "jodit-react";

import Editor from "../editor";

import { useNavigate, useLocation } from "react-router-dom";

const AddVideo = () => {
  const { userInfo } = useAuth();
  const [formData, setFormData] = useState({
    categoryName: "",
    postTitle: "",
    contentType: 2,
    users: "",
    trendingNow: false,
    hotContent: false,
    sendGmail: false,
    schedule: "",
    scheduleDate: null,
    language: 1,
    hashtag: "",
    status: "",
    description: "",
    videoPath: "",
    uploadedBy: userInfo.email,
  });

  const [imageFile, setImageFile] = useState(null); // To handle image file
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const editor = useRef(null); // Jodit Editor reference

  const location = useLocation();
  const { categories: allCategories } = location.state || {};
  const [categories, setCategories] = useState([]); // State to store all categories
  const [filteredCategories, setFilteredCategories] = useState([]); // State to store filtered categories

  const Navigate = useNavigate();

  useEffect(() => {
    setCategories(allCategories || []);
    setFilteredCategories(allCategories || []);
    if (allCategories?.length > 0) {
      const defaultFiltered = allCategories.filter(
        (category) =>
          category.language === parseInt(formData.language) &&
          category.categoryType === 2
      );
      if (defaultFiltered.length > 0) {
        setFormData((prevData) => ({
          ...prevData,
          categoryName: defaultFiltered[0].categoryId, // Set the first category ID as default
        }));
      }
    }
  }, [allCategories]);

  useEffect(() => {
    // const selectedLanguage = formData.language;
    console.log(formData.language);
    const filtered = allCategories.filter(
      (category) =>
        category.language === parseInt(formData.language) &&
        category.categoryType === 2
    );
    console.log(allCategories);
    console.log(filtered);
    setFilteredCategories(filtered);
    if (filtered.length > 0 && !formData.categoryName) {
      setFormData((prevData) => ({
        ...prevData,
        categoryName: filtered[0].categoryId, // Set the first category ID as default
      }));
    }
  }, [formData.language, allCategories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // const handleQuillChange = (value) => {
  //   setFormData({
  //     ...formData,
  //     description: value,
  //   });
  // };

  const handleEditorChange = (content, editor) => {
    console.log("Content was updated:", content);

    const modifiedContent = content.replace(
      /<img([^>]*)width="(\d+)"([^>]*)>/g,
      '<img$1 style="width: $2px;"$3>'
    );

    setFormData((prevData) => ({
      ...prevData,
      description: modifiedContent, // Save modified content
    }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files[0];

    if (!file) {
      console.error("No file selected");
      return;
    }

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
        throw new Error("Failed to upload image");
      }

      // Get the response as text
      const responseText = await response.json();

      // Extract the FILE_URL from the response text

      const fileUrl = responseText.FILE_URL;
      console.log("File uploaded successfully:", fileUrl);
      setImageFile(fileUrl); // Set the extracted URL to the state
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      categoryName: formData.categoryName,
      postTitle: formData.postTitle,
      contentType: formData.contentType,
      users: formData.users,
      trendingNow: formData.trendingNow,
      hotContent: formData.hotContent,
      sendGmail: formData.sendGmail,
      schedule: formData.schedule,
      scheduleDate: null,
      language: formData.language,
      hashtag: formData.hashtag,
      status: formData.status,
      description: formData.description,
      videoPath: formData.videoPath,
      uploadedBy: userInfo.email,
    };

    const wrappedData = new FormData();
    wrappedData.append("data", JSON.stringify(data));
    wrappedData.append("imagePath", imageFile);
    fetch(`${BASE_URL}/mm/articles`, {
      method: "POST",
      body: wrappedData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 200) {
          setAlert({ show: true, message: data.message, type: "success" });
          setFormData({
            categoryName: "",
            postTitle: "",
            contentType: 2,
            users: "",
            trendingNow: false,
            hotContent: false,
            sendGmail: false,
            schedule: "",
            scheduleDate: null,
            language: "",
            hashtag: "",
            status: "",
            description: "",
            videoPath: "",
          });
          setTimeout(() => {
            setAlert({ show: false, message: "", type: "" });
            Navigate("/videos");
          }, 1000);
        } else {
          setAlert({ show: true, message: data.message, type: "danger" });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setAlert({
          show: true,
          message: "Error adding video. Please try again.",
          type: "danger",
        });
      });
  };

  const redirecttoposts = () => {
    Navigate("/videos");
  };

  const handleAlertClose = () => {
    setAlert({ show: false, message: "", type: "" });
    // Navigate("/videos");
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

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="d-flex justify-content-between mt-3">
          <h4 className="fs-4">Add Videos</h4>
          <button
            className="btn btn-outline-warning text-dark shadow px-3"
            onClick={redirecttoposts}>
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
                  className="form-select"
                  value={formData.language}
                  onChange={handleChange}>
                  {/* <option value="">...Select...</option> */}
                  <option value={1}>English</option>
                  <option value={2}>Hindi</option>
                  <option value={3}>Telugu</option>
                </select>
              </div>
              <div className="form-group col-lg">
                <label htmlFor="category">Category Name</label>
                <select
                  id="category"
                  name="categoryName"
                  className="form-select"
                  value={formData.categoryName}
                  onChange={handleChange}>
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
            </div>

            <div className="row my-4">
              <div className="form-group col-lg">
                <label htmlFor="rssName">Content Type *</label>
                <select
                  id="rssName"
                  name="contentType"
                  className="form-select"
                  value={formData.contentType}
                  disabled
                  onChange={handleChange}>
                  <option value="2">Videos</option>
                </select>
              </div>

              <div className="form-group col-lg">
                <label htmlFor="postTitle">Post Title * </label>
                <input
                  type="text"
                  className="form-control"
                  id="postTitle"
                  name="postTitle"
                  placeholder="Enter Title"
                  value={formData.postTitle}
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

              <div className="form-group col-lg">
                <label htmlFor="formFileMultiple" className="form-label">
                  Select Images *
                </label>
                <input
                  className="form-control"
                  id="formFileMultiple"
                  name="ImagePath"
                  type="file"
                  onChange={handleImageChange}
                />
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
                  className="form-select"
                  value={formData.schedule}
                  onChange={handleChange}>
                  <option value="">Choose...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
            <div className="row my-4"></div>

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
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}>
                  <option value="">...Select...</option>
                  <option value="1">Publish</option>
                  <option value="0">Pending</option>
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
                  modules={modules("toolbar")}
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
                /> */}
                <Editor
                  description={formData.description}
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

export default AddVideo;
