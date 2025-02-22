import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css"; // Import Quill CSS
import QuillToolbar, { modules, formats } from "./EditorToolbar"; // Import the correct path
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../config";

const Posts1 = () => {
  const [formData, setFormData] = useState({
    category: "",
    postitle: "",
    rssName: "",
    users: "",
    trendingNow: false,
    hotContent: false,
    sendGmail: false,
    schedulePost: "",
    language: "",
    hashtag: "",
    status: "",
    author: "",
    content: "Helloo wefrgfqwdefrg",
  });
  const Navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleQuillChange = (value) => {
    setFormData({
      ...formData,
      content: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mock API call
    fetch(`${BASE_URL}/create_post`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Success:", data);
        Navigate("/Posts1");
        setFormData([]);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="d-flex justify-content-between mt-3">
          <h4>Add Posts</h4>
          <button className="btn btn-warning text-dark">View Posts</button>
        </div>
        <div className="p-2">
          <form
            className="col-12 h-100 w-100 shadow p-5"
            onSubmit={handleSubmit}>
            <div className="row my-4">
              <div className="form-group col-lg">
                <label htmlFor="category">Category Name</label>
                <select
                  id="category"
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}>
                  <option value="">Choose...</option>
                  <option value="Fashion">Fashion</option>
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
                  value={formData.postTitle}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row my-4">
              <div className="form-group col-lg">
                <label htmlFor="rssName">Rss Name</label>
                <select
                  id="rssName"
                  name="rssName"
                  className="form-control"
                  value={formData.rssName}
                  onChange={handleChange}>
                  <option value="">Choose...</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div className="form-group col-lg">
                <label htmlFor="users">Users</label>
                <select
                  id="users"
                  name="users"
                  className="form-control"
                  value={formData.users}
                  onChange={handleChange}>
                  <option value="">Choose...</option>
                  <option value="infomasala@gmail.com">
                    infomasala@gmail.com
                  </option>
                </select>
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
                  Select Images
                </label>
                <input
                  className="form-control"
                  id="formFileMultiple"
                  type="file"
                />
              </div>
            </div>

            <div className="row my-4">
              <div className="form-group col-lg">
                <label htmlFor="schedulePost">Schedule Post</label>
                <select
                  id="schedulePost"
                  name="schedulePost"
                  className="form-control"
                  value={formData.schedulePost}
                  onChange={handleChange}>
                  <option value="">Choose...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="form-group col-lg">
                <label htmlFor="language">Select Language</label>
                <select
                  id="language"
                  name="language"
                  className="form-control"
                  value={formData.language}
                  onChange={handleChange}>
                  <option value="">Choose...</option>
                  <option value="EN">EN</option>
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
                  <option value="">Choose...</option>
                  <option value="Publish">Publish</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </div>

            <div className="row my-4">
              <div className="form-group col-lg-6">
                <label htmlFor="author">Author</label>
                <input
                  type="text"
                  className="form-control"
                  id="author"
                  name="author"
                  placeholder="Enter Author"
                  value={formData.author}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="row my-4">
              <div className="form-group col-12">
                <label htmlFor="content">Content</label>
                <QuillToolbar toolbarId="toolbar" />
                <ReactQuill
                  value={formData.content}
                  onChange={handleQuillChange}
                  modules={modules("toolbar")}
                  formats={formats}
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary">
              Submit
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Posts1;
