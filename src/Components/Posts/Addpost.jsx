import React, { useState, useRef, useEffect } from "react";
// import ReactQuill from "react-qu?ill";
// import "react-quill/dist?/quill.snow.css"; // Im?port Quill CSS
// import QuillToolbar, { modules, formats } from "./EditorToolbar";
import { useAuth } from "../../Context/AuthContext";
import { BASE_URL } from "../../config";
import JoditEditor from "jodit-react";
import EditorJS from "@editorjs/editorjs";
import ImageTool from "@editorjs/image";
import Embed from "@editorjs/embed";

import { useNavigate, useLocation } from "react-router-dom";
import Editor from "../editor";

const Posts1 = () => {
  const { userInfo } = useAuth();
  const editorRef = useRef(null);
  const log = () => {
    if (editorRef.current) {
      console.log(editorRef.current.getContent());
    }
  };
  const [formData, setFormData] = useState({
    categoryName: "",
    postTitle: "",
    contentType: 1,
    // contentType: "",
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
          category.categoryType === 1
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
        category.categoryType === 1
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

      const fileUrl = responseText?.FILE_URL;
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
            contentType: 1,
            users: userInfo.username,
            trendingNow: false,
            hotContent: false,
            sendGmail: false,
            schedule: "",
            language: "",
            hashtag: "",
            status: "",
            description: "",
            videoPath: "",
          });
          setTimeout(() => {
            setAlert({ show: false, message: "", type: "" });
            Navigate("/Posts");
          }, 1000);
        } else {
          setAlert({
            show: true,
            message: data.message || "Error adding post. Please try again.",
            type: "danger",
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        setAlert({
          show: true,
          message: "Error adding post. Please try again.",
          type: "danger",
        });
      });
  };

  const redirecttoposts = () => {
    Navigate("/Posts");
  };

  const handleAlertClose = () => {
    setAlert({ show: false, message: "", type: "" });
    // Navigate("/Posts");
  };

  function compressAndResizeImage(
    file,
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.7
  ) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function (event) {
        const img = new Image();
        img.onload = function () {
          // Create a canvas element
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");

          // Calculate the new dimensions
          let width = img.width;
          let height = img.height;

          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (maxHeight / width) * height;
              width = maxWidth;
            } else {
              width = (maxWidth / height) * width;
              height = maxHeight;
            }
          }

          // Set canvas dimensions
          canvas.width = width;
          canvas.height = height;

          // Draw the image onto the canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Convert the canvas to Base64 with the specified quality
          const base64Image = canvas.toDataURL("image/jpeg", quality);

          resolve(base64Image);
        };
        img.onerror = function () {
          reject(new Error("Error processing image."));
        };
        img.src = event.target.result;
      };

      reader.onerror = function () {
        reject(new Error("Error reading image file."));
      };
      reader.readAsDataURL(file);
    });
  }

  // const config = {
  //   readonly: false, // Change this to true if you want it read-only
  //   height: 400, // Set height if needed
  //   toolbarAdaptive: true,
  //   uploader: {
  //     insertImageAsBase64URI: true,
  //     insertVideoAsBase64URI: true,
  //   },
  //   defaultActionOnPaste: "insert_as_html",
  //   defaultActionOnPasteFromWord: "insert_as_html",
  //   askBeforePasteFromWord: false,
  //   askBeforePasteHTML: false,
  //   controls: {
  //     font: {
  //       list: {
  //         Poppins: "Poppins, sans-serif",
  //       },
  //     },
  //     video: {
  //       icon: "video",
  //       popup: (editor, current, self, close) => {
  //         // Custom video input dialog
  //         const container = editor.create.fromHTML(`
  //           <div style="padding: 10px;">
  //             <input type="file" accept="video/*" style="margin-bottom: 10px;" />
  //             <button>Insert</button>
  //           </div>
  //         `);

  //         const input = container.querySelector("input");
  //         const button = container.querySelector("button");

  //         button.addEventListener("click", () => {
  //           const file = input.files[0];
  //           if (file) {
  //             const reader = new FileReader();
  //             reader.onload = (e) => {
  //               const base64Video = e.target.result;
  //               const videoHTML = `<video controls style="max-width: 100%;"><source src="${base64Video}" type="${file.type}" /></video>`;
  //               editor.selection.insertHTML(videoHTML);
  //             };
  //             reader.readAsDataURL(file); // Convert video to Base64
  //           }
  //           close();
  //         });

  //         return container;
  //       },
  //     },
  //   },

  //   style: {
  //     font: ["Poppins"],
  //   },
  // };

  // useEffect(() => {
  //   if (!editorInstance.current) {
  //     editorInstance.current = new EditorJS({
  //       holder: "editorjs",
  //       tools: {
  //         embed: Embed,
  //         image: {
  //           class: ImageTool,
  //           config: {
  //             endpoints: {
  //               // byFile:
  //               //   "https://demo.mobilemasala.com/api/s3/upload?Content-Type=multipart/form-data", // Backend URL for file uploads
  //               byUrl:
  //                 "https://demo.mobilemasala.com/api/s3/upload?Content-Type=multipart/form-data", // Backend URL for URL uploads
  //             },
  //             field: "file", // Set the key as `file` instead of `image`
  //             types: "image/*",
  //             onUploadSuccess: (response) => {
  //               // Handle response from the server
  //               console.log("Upload response:", response);

  //               // Check if the response contains 'FILE_URL'
  //               if (response.FILE_URL) {
  //                 return {
  //                   success: 1,
  //                   file: {
  //                     url: response.FILE_URL, // Return the correct URL format
  //                   },
  //                 };
  //               } else {
  //                 console.error("Invalid response format", response);
  //                 return {
  //                   success: 0,
  //                   error: "Invalid response format",
  //                 };
  //               }
  //             },
  //           },
  //         },
  //       },
  //       onReady: () => {
  //         console.log("Editor.js is ready!");
  //       },
  //       onChange: () => {
  //         console.log("Content updated!");
  //       },
  //     });
  //   }

  //   return () => {
  //     if (editorInstance.current) {
  //       editorInstance.current.destroy();
  //       editorInstance.current = null;
  //     }
  //   };
  // }, []);

  const handleUploadSuccess = async (response) => {
    console.log("Upload response:", response);

    try {
      // Parse the response to extract the image URL
      const imageUrl = response.substring("FILE_URL:".length).trim();

      // Find the Jodit editor instance
      const editorInstance = document.querySelector(".jodit");

      // Check if the editor instance is found
      if (editorInstance) {
        // Insert the image into the editor
        editorInstance.execCommand("insertImage", imageUrl);
      } else {
        console.error("Jodit editor instance not found.");
      }
    } catch (error) {
      console.error("Error handling upload success:", error);
      // Handle the error, e.g., display an error message to the user
    }
  };

  const config = {
    readonly: false,
    height: 400,
    toolbarAdaptive: true,
    // uploader: {
    //   insertImageAsBase64URI: false, // Ensure no Base64 embedding
    //   url: "https://demo.mobilemasala.com/api/s3/upload?Content-Type=multipart/form-data",
    //   filesVariableName: "file", // Prevent default wrapping of files
    //   headers: {}, // Add any custom headers if required
    //   process: async (files) => {
    //     console.log("Uploading files:", files);
    //     const file = files[0]; // Get the first file
    //     if (!file) {
    //       console.error("No file selected");
    //       return;
    //     }

    //     try {
    //       // Create form data with only the 'file' key
    //       const formData = new FormData();
    //       formData.append("file", file);

    //       // Make the API call
    //       const response = await fetch(
    //         "https://demo.mobilemasala.com/api/s3/upload?Content-Type=multipart/form-data",
    //         {
    //           method: "POST",
    //           body: formData, // Send the formData directly
    //         }
    //       );

    //       if (!response.ok) {
    //         throw new Error("Failed to upload file");
    //       }

    //       // Get the response as text
    //       const responseText = await response.text();

    //       // Extract the FILE_URL from the response text
    //       const fileUrlMatch = responseText.match(/FILE_URL:(.+)/);
    //       if (fileUrlMatch && fileUrlMatch[1]) {
    //         const fileUrl = fileUrlMatch[1].trim();

    //         // Insert the uploaded image URL into the editor
    //         const imgHTML = `<img src="${fileUrl}" alt="Uploaded Image" style="max-width: 100%;"/>`;
    //         const editorInstance = document.querySelector(".jodit-wysiwyg"); // Find your editor
    //         editorInstance.selection.insertHTML(imgHTML); // Insert into editor
    //       } else {
    //         console.error("Invalid response format", responseText);
    //       }
    //     } catch (error) {
    //       console.error("Error uploading file:", error);
    //     }
    //   },
    // },
    uploader: {
      url: "https://demo.mobilemasala.com/api/s3/upload?Content-Type=multipart/form-data",
      method: "POST",
      format: "formData",
      prepareData: (formData) => {
        // ... existing code
        const file = formData.get("files[0]"); // Get the first file
        formData.delete("files[0]"); // Remove default key

        // Add file to formData with the correct key
        formData.append("file", file);
        console.log("Prepared FormData:", formData); // Log formData for debugging
        return formData;
      },
      onUploadSuccess: async (responseData) => {
        try {
          console.log("Response received:", responseData);
          if (typeof responseData !== "string") {
            throw new Error("Invalid response type. Expected string.");
          }
          const imageUrl = responseData.substring("FILE_URL:".length).trim();
          console.log("Extracted image URL:", imageUrl);
          await handleUploadSuccess(imageUrl);
        } catch (error) {
          console.error("Error handling upload success:", error);
        }
      },
    },
    defaultActionOnPaste: "insert_as_html",
    defaultActionOnPasteFromWord: "insert_as_html",
    askBeforePasteFromWord: false,
    askBeforePasteHTML: false,
    controls: {
      font: {
        list: {
          Poppins: "Poppins, sans-serif",
        },
      },
    },
    style: {
      font: ["Poppins"],
    },
  };

  const handleEditorChange = (content) => {
    console.log("Content was updated:", content);

    setFormData((prevData) => ({
      ...prevData,
      description: content,
    }));
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="d-flex justify-content-between mt-3">
          <h4 className="fs-4">Add Posts</h4>
          <button
            className="btn btn-outline-warning text-dark shadow px-3"
            onClick={redirecttoposts}>
            Posts
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
                  onChange={handleChange}
                  disabled>
                  {/* <option value="">...Select...</option> */}
                  <option value="1">Posts</option>
                  {/* <option value="2">Videos</option>

                  <option value="3">Vstories</option> */}
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
                  className="form-control"
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
                {/*  <JoditEditor
                  ref={editor}
                  value={formData.description}
                  config={config}
                  onBlur={(newContent) => {
                    try {
                      setFormData({ ...formData, description: newContent });
                    } catch (error) {
                      console.error("Error updating formData:", error);
                    }
                  }} // Save content on editor blur
                />*/}
                <Editor
                  description={formData.description}
                  handleEditorChange={handleEditorChange}
                />
                {/* <div
                  id="editorjs"
                  style={{
                    border: "1px solid #ccc",
                    minHeight: "300px",
                  }}></div> */}
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

export default Posts1;
