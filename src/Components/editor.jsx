import React, { useState, useRef, useEffect } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageResize from "quill-image-resize";
import { FaEye, FaSmile, FaTimes } from "react-icons/fa";
import QuillToggleFullscreenButton from "quill-toggle-fullscreen-button";
import emojiList from "./emojiList";
const Size = Quill.import("formats/size");
Size.whitelist = ["small", "normal", "large", "huge"];
Quill.register(Size, true);
Quill.register("modules/imageResize", ImageResize);
Quill.register("modules/toggleFullscreen", QuillToggleFullscreenButton);

const Font = Quill.import("formats/font");
Font.whitelist = [
  "poppins",
  "arial",
  "courier",
  "georgia",
  "times-new-roman",
  "verdana",
  "roboto",
  "monospace",
  "comic-sans",
  "inconsolata",
  "mirza",
];
Quill.register(Font, true);

const BlockEmbed = Quill.import("blots/block/embed");

class VideoBlot extends BlockEmbed {
  static create(value) {
    let node = super.create();
    node.setAttribute("src", value);
    node.setAttribute("frameborder", "0");
    node.setAttribute("allowfullscreen", true);
    const isMobile = window.innerWidth <= 768;
    node.style.width = isMobile ? "100%" : "550px";
    const isInstagram = value.includes("instagram.com");

    // Set dynamic height based on the source
    if (isInstagram) {
      node.style.height = isMobile ? "800px" : "650px";
    } else {
      node.style.height = isMobile ? "300px" : "400px";
    }

    // Additional inline styles
    node.style.border = "none";
    node.style.display = "block";
    node.style.margin = "0 auto";
    node.style.borderRadius = "10px";
    // node.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
    node.style.border = "3px solid rgba(0, 0, 0, 0.1)";
    // }

    return node;
  }

  static value(node) {
    return node.getAttribute("src");
  }
}

VideoBlot.blotName = "video";
VideoBlot.tagName = "iframe";
Quill.register(VideoBlot);

const EmojiCharacterPicker = ({ onSelect, onClose }) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.2)", // Blackish overlay
        zIndex: 1000, // Slightly lower than modal to keep it behind
      }}>
      <div className="emoji-picker">
        <div className="emoji-header">
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="emoji-list">
          {emojiList.map((emoji, index) => {
            const codePoint = parseInt(emoji.unicode, 16);

            if (isNaN(codePoint)) {
              console.error(`Invalid code point for emoji: ${emoji.name}`);
              return null;
            }

            return (
              <button
                key={index}
                type="button"
                onClick={() => onSelect(emoji.unicode)}
                title={emoji.shortname}
                className="emoji-button">
                <span role="img" aria-label={emoji.name}>
                  {String.fromCodePoint(codePoint)}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const Editor = ({ description, handleEditorChange }) => {
  const [value, setValue] = useState("");
  const quillRef = useRef(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [isVideoUpload, setIsVideoUpload] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    if (description) {
      setValue(description);
    }
  }, []);

  const handleChange = (content, delta, source, editor) => {
    setValue(editor.getHTML());
    handleEditorChange(editor.getHTML());
  };

  const applyImageWidth = () => {
    console.log("Applying image styles...");

    // Extract images and their widths from the description
    const imageRegex = /<img[^>]*src="([^"]*)"[^>]*width="(\d+)"/g;
    const descriptionImages = [];
    let match;

    // Parse the description to find images with src and width
    while ((match = imageRegex.exec(description)) !== null) {
      descriptionImages.push({
        src: match[1],
        width: match[2], // the width from the description
      });
    }

    console.log("Images in description with their widths:", descriptionImages);

    // Access Quill editor instance and find images in the editor
    const quillEditor = quillRef.current.getEditor();
    const imagesInEditor = quillEditor.root.querySelectorAll("img");

    console.log("Images in the editor:", imagesInEditor);

    imagesInEditor.forEach((image, index) => {
      const imgSrc = image.getAttribute("src");
      console.log(`Image ${index + 1}: Editor image source: ${imgSrc}`);
      console.log(imgSrc);

      // Check if the image in the editor matches an image in the description
      const matchingImage = descriptionImages.find(
        (descImage) => descImage.src === imgSrc
      );
      if (matchingImage) {
        // If a match is found, apply the width from the description
        image.style.width = `${matchingImage.width}px`;
        console.log(`Image ${index + 1}: Width applied: ${image.style.width}`);
      }
    });
  };

  useEffect(() => {
    setTimeout(() => {
      if (quillRef.current) {
        console.log("Editor is initialized.");
        applyImageWidth(); // Apply the width to images once editor is initialized
      }
    }, 1000);
  }, [quillRef]);

  const handleMediaUrl = async () => {
    const url = prompt(`Enter the ${isVideoUpload ? "video" : "image"} URL:`);
    if (url) {
      if (isVideoUpload) {
        let embedUrl = url;
        const youtubeMatch = url.match(
          /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        );

        if (youtubeMatch) {
          embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}?showinfo=0`;
        }

        // Handle Vimeo URL matching and transformation
        const vimeoMatch = url.match(
          /^(?:(https?):\/\/)?(?:www\.)?vimeo\.com\/(\d+)/
        );
        if (vimeoMatch) {
          embedUrl = `${vimeoMatch[1] || "https"}://player.vimeo.com/video/${
            vimeoMatch[2]
          }/`;
        }

        // Handle Instagram video URL matching and transformation
        const instagramMatch = url.match(
          /^(https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+))/
        );
        if (instagramMatch) {
          embedUrl = `https://www.instagram.com/reel/${instagramMatch[2]}/embed`;
        }

        // Handle Twitter video URL matching and transformation
        const twitterMatch = url.match(
          /(?:https?:\/\/(?:www\.)?(?:x\.com|twitter\.com)\/(?:[^\/]+)\/status\/(\d+))/
        );
        if (twitterMatch) {
          embedUrl = `https://twitter.com/i/videos/tweet/${twitterMatch[1]}`;
        }

        const dailymotionMatch = url.match(
          /(?:https?:\/\/)?(?:www\.)?dailymotion\.com\/video\/([a-zA-Z0-9]+)/
        );
        if (dailymotionMatch) {
          embedUrl = `https://www.dailymotion.com/embed/video/${dailymotionMatch[1]}`;
        }

        const facebookReelMatch = url.match(
          /(?:https?:\/\/)?(?:www\.)?facebook\.com\/reel\/(\d+)/
        );
        if (facebookReelMatch) {
          embedUrl = `https://www.facebook.com/reel/${facebookReelMatch[1]}`;
        }
        const range = quillRef.current.getEditor().getSelection();
        quillRef.current
          .getEditor()
          .insertEmbed(range.index, "video", embedUrl);
      } else {
        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const formData = new FormData();
          formData.append("file", blob, `image_${Date.now()}.jpg`);

          const uploadResponse = await fetch(
            "https://demo.mobilemasala.com/api/s3/upload?Content-Type=multipart/form-data",
            {
              method: "POST",
              body: formData,
            }
          );

          const data = await uploadResponse.json();

          if (data && data.FILE_URL) {
            const range = quillRef.current.getEditor().getSelection();
            quillRef.current
              .getEditor()
              .insertEmbed(range.index, "image", data.FILE_URL);
            setTimeout(() => {
              const editor = quillRef.current.getEditor();
              const images = editor.root.querySelectorAll("img"); // Select all images
              const lastImage = images[images.length - 1]; // Get the last inserted image

              if (lastImage) {
                lastImage.style.width = "257px"; // Apply inline width
                lastImage.style.height = "auto"; // Maintain aspect ratio
              }
            }, 100);
          } else {
            alert("Image upload failed");
          }
        } catch (error) {
          console.error("Image upload failed:", error);
          alert("Image upload failed. Please try again.");
        }
      }
    }
    setShowImageModal(false);
  };

  const handleFormatChange = (format, value) => {
    const quillEditor = quillRef.current.getEditor();
    const range = quillEditor.getSelection();

    if (range) {
      quillEditor.format(format, value);
    }
  };
  const [isFullScreen, setIsFullScreen] = useState(false);

  const handleFileUpload = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", isVideoUpload ? "video/*" : "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files[0];
      const formData = new FormData();
      formData.append("file", file);

      try {
        const uploadResponse = await fetch(
          "https://demo.mobilemasala.com/api/s3/upload?Content-Type=multipart/form-data",
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await uploadResponse.json();

        if (data && data.FILE_URL) {
          const range = quillRef.current.getEditor().getSelection();
          if (isVideoUpload) {
            const url = data.FILE_URL;
            quillRef.current.getEditor().insertEmbed(range.index, "video", url);
          } else {
            const url = data.FILE_URL;
            quillRef.current.getEditor().insertEmbed(range.index, "image", url);
            setTimeout(() => {
              const editor = quillRef.current.getEditor();
              const images = editor.root.querySelectorAll("img"); // Select all images
              const lastImage = images[images.length - 1]; // Get the last inserted image

              if (lastImage) {
                lastImage.style.width = "257px"; // Apply inline width
                lastImage.style.height = "auto"; // Maintain aspect ratio
              }
            }, 100);
          }
        } else {
          alert("Upload failed");
        }
      } catch (error) {
        console.error("Upload failed:", error);
        alert("Upload failed. Please try again.");
      }

      setShowImageModal(false);
    };
  };

  const onClose = () => {
    setShowEmojiPicker(false);
  };

  useEffect(() => {
    if (quillRef.current) {
      const quill = quillRef.current.getEditor();
      const toolbar = quill.getModule("toolbar");
      console.log(toolbar);

      toolbar.addHandler("image", () => {
        setIsVideoUpload(false);
        setShowImageModal(true);
      });
      toolbar.addHandler("video", () => {
        setIsVideoUpload(true);
        setShowImageModal(true);
      });
      quill.on("text-change", () => {
        const images = quill.root.querySelectorAll("img");
        images.forEach((img) => {
          if (img.hasAttribute("width")) {
            const newWidth = img.getAttribute("width");
            img.style.width = `${newWidth}px`;
            img.style.height = "auto";
            // img.removeAttribute("width");
            // img.removeAttribute("height");
          }
        });
      });
    }
  }, [isFullScreen]);

  const colors = [
    "#000000",
    "#e60000",
    "#ff9900",
    "#ffff00",
    "#008a00",
    "#0066cc",
    "#9933ff",
    "#ffffff",
    "#facccc",
    "#ffebcc",
    "#ffffcc",
    "#cce8cc",
    "#cce0f5",
    "#ebd6ff",
    "#bbbbbb",
    "#f06666",
    "#ffc266",
    "#ffff66",
    "#66b966",
    "#66a3e0",
    "#c285ff",
    "#888888",
    "#a10000",
    "#b26b00",
    "#b2b200",
    "#006100",
    "#0047b2",
    "#6b24b2",
    "#444444",
    "#5c0000",
    "#663d00",
    "#666600",
    "#003700",
    "#002966",
    "#3d1466",
  ];
  const [selectTrue, setSelectTrue] = useState(false);

  const handleSpecialCharacter = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleEmojiSelect = (unicode) => {
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();
    if (range) {
      quill.insertText(range.index, String.fromCodePoint(`0x${unicode}`));
      setShowEmojiPicker(false);
    }
  };

  const handleFullScreenToggle = () => {
    setIsFullScreen((prevState) => !prevState);
  };

  const handlePreviewToggle = () => {
    setIsPreviewMode((prevState) => !prevState);
  };

  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const [isScrollEnabled, setIsScrollEnabled] = useState(true);

  return (
    <div>
      {showEmojiPicker && (
        <EmojiCharacterPicker onSelect={handleEmojiSelect} onClose={onClose} />
      )}
      {!isFullScreen ? (
        <>
          <div id="toolbar-container">
            <span className="ql-formats">
              <button className="ql-bold"></button>
              <button className="ql-italic"></button>
              <button className="ql-underline"></button>
              <button className="ql-strike"></button>
              <button className="ql-blockquote"></button>
              <button className="ql-script" value="sub"></button>
              <button className="ql-script" value="super"></button>
              <button className="ql-indent" value="-1"></button>
              <button className="ql-indent" value="+1"></button>
            </span>

            <span className="ql-formats">
              <button className="ql-header" value="1"></button>
              <button className="ql-header" value="2"></button>
              <button className="ql-align" value=""></button>
              <button className="ql-align" value="center"></button>
              <button className="ql-align" value="right"></button>
              <button className="ql-align" value="justify"></button>
            </span>
            <span className="ql-formats">
              <select className="ql-font" title="font">
                <option value="poppins">Poppins</option>
                <option value="arial">Arial</option>
                <option value="courier">Courier</option>
                <option value="georgia">Georgia</option>
                <option value="times-new-roman">Times New Roman</option>
                <option value="verdana">Verdana</option>
                <option value="roboto">Roboto</option>
                <option value="monospace">Monospace</option>
                <option value="comic-sans">Comic Sans</option>
                <option value="inconsolata">Inconsolata</option>
                <option value="mirza">Mirza</option>
              </select>
            </span>
            <span className="ql-formats">
              <select
                className="ql-size"
                title="text size"
                onChange={(e) => handleFormatChange("size", e.target.value)}>
                <option value="small">Small</option>
                <option value="normal">Normal</option>
                <option value="large">Large</option>
                <option value="huge">Huge</option>
              </select>
            </span>
            <span className="ql-formats">
              <button
                type="button"
                onClick={handleSpecialCharacter}
                title="Special Characters">
                <FaSmile />
              </button>
              <button
                type="button"
                onClick={handlePreviewToggle}
                title="Preview">
                <FaEye />
              </button>
            </span>
            <span className="ql-formats">
              <button className="ql-image"></button>
              <button className="ql-video" title="Insert Video" />
              <button className="ql-link" title="Insert Link"></button>
            </span>
            <span className="ql-formats">
              <select className="ql-color" title="text color">
                {colors.map((color) => (
                  <option key={color} value={color}></option>
                ))}
              </select>
              <select className="ql-background" title="background color">
                {colors.map((color) => (
                  <option key={color} value={color}></option>
                ))}
              </select>
              <button className="ql-code-block" title="code" />
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="ql-fullscreen"
                title="toggle full screen">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
                  <polyline class="ql-even ql-stroke" points="12 3 15 3 15 6" />
                  <polyline class="ql-even ql-stroke" points="6 15 3 15 3 12" />
                  <polyline
                    class="ql-even ql-stroke"
                    points="12 15 15 15 15 12"
                  />
                  <polyline class="ql-even ql-stroke" points="6 3 3 3 3 6" />
                </svg>
              </button>
              <button
                onClick={() => setIsScrollEnabled(!isScrollEnabled)}
                className="ql-scroll"
                title="toggle scroll">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
                  <rect
                    class="ql-stroke"
                    height="12"
                    width="12"
                    x="3"
                    y="3"></rect>
                  <line class="ql-stroke" x1="3" x2="15" y1="9" y2="9"></line>
                </svg>
              </button>
            </span>
          </div>
          <ReactQuill
            ref={quillRef}
            value={value}
            className="custom-quill-editor"
            onChange={handleChange}
            modules={{
              toolbar: "#toolbar-container",
              imageResize: {
                modules: ["Resize", "DisplaySize"],
              },
            }}
            formats={[
              "header",
              "font",
              "size",
              "bold",
              "italic",
              "underline",
              "strike",
              "list",
              "bullet",
              "align",
              "link",
              "image",
              "video",
              "color",
              "background",
              "script",
              "indent",
              "blockquote",
              "code-block",
              "toggleFullscreen",
              "formula",
              "clean",
              "undo",
              "redo",
            ]}
            style={{
              height: isScrollEnabled ? "350px" : "auto",
              overflowY: isScrollEnabled ? "auto" : "visible",
            }}
          />
        </>
      ) : (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999,
          }}>
          <div
            id="toolbar-container"
            style={{
              width: "100%",
              background: "#fff",
              zIndex: 1000, // Keep toolbar above editor
              position: "relative",
              padding: "10px",
            }}>
            <span className="ql-formats">
              <button className="ql-bold"></button>
              <button className="ql-italic"></button>
              <button className="ql-underline"></button>
              <button className="ql-strike"></button>
              <button className="ql-blockquote"></button>
              <button className="ql-script" value="sub"></button>
              <button className="ql-script" value="super"></button>
              <button className="ql-indent" value="-1"></button>
              <button className="ql-indent" value="+1"></button>
            </span>

            <span className="ql-formats">
              <button className="ql-header" value="1"></button>
              <button className="ql-header" value="2"></button>
              <button className="ql-align" value=""></button>
              <button className="ql-align" value="center"></button>
              <button className="ql-align" value="right"></button>
              <button className="ql-align" value="justify"></button>
            </span>
            <span className="ql-formats">
              <select className="ql-font" title="font">
                <option value="poppins">Poppins</option>
                <option value="arial">Arial</option>
                <option value="courier">Courier</option>
                <option value="georgia">Georgia</option>
                <option value="times-new-roman">Times New Roman</option>
                <option value="verdana">Verdana</option>
                <option value="roboto">Roboto</option>
                <option value="monospace">Monospace</option>
                <option value="comic-sans">Comic Sans</option>
                <option value="inconsolata">Inconsolata</option>
                <option value="mirza">Mirza</option>
              </select>
            </span>
            <span className="ql-formats">
              <select
                className="ql-size"
                title="text size"
                onChange={(e) => handleFormatChange("size", e.target.value)}>
                <option value="small">Small</option>
                <option value="normal">Normal</option>
                <option value="large">Large</option>
                <option value="huge">Huge</option>
              </select>
            </span>
            <span className="ql-formats">
              <button
                type="button"
                onClick={handleSpecialCharacter}
                title="Special Characters">
                <FaSmile />
              </button>
              <button
                type="button"
                onClick={handlePreviewToggle}
                title="Preview">
                <FaEye />
              </button>
            </span>
            <span className="ql-formats">
              <button className="ql-image"></button>
              <button className="ql-video" title="Insert Video" />
              <button className="ql-link" title="Insert Link"></button>
            </span>
            <span className="ql-formats">
              <select className="ql-color" title="text color">
                {colors.map((color) => (
                  <option key={color} value={color}></option>
                ))}
              </select>
              <select className="ql-background" title="background color">
                {colors.map((color) => (
                  <option key={color} value={color}></option>
                ))}
              </select>
              <button className="ql-code-block" title="code" />
              <button
                onClick={() => setIsFullScreen(!isFullScreen)}
                className="ql-fullscreen"
                title="toggle full screen">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 18">
                  <polyline class="ql-even ql-stroke" points="12 3 15 3 15 6" />
                  <polyline class="ql-even ql-stroke" points="6 15 3 15 3 12" />
                  <polyline
                    class="ql-even ql-stroke"
                    points="12 15 15 15 15 12"
                  />
                  <polyline class="ql-even ql-stroke" points="6 3 3 3 3 6" />
                </svg>
              </button>
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "100%",
              background: "white",
              padding: "10px",
              display: "flex",
              flexDirection: "column",
              overflowY: "auto",
            }}>
            <ReactQuill
              ref={quillRef}
              value={value}
              className="custom-quill-editor"
              onChange={handleChange}
              modules={{
                toolbar: "#toolbar-container",
                imageResize: {
                  modules: ["Resize", "DisplaySize"],
                },
              }}
              formats={[
                "header",
                "font",
                "size",
                "bold",
                "italic",
                "underline",
                "strike",
                "list",
                "bullet",
                "align",
                "link",
                "image",
                "video",
                "color",
                "background",
                "script",
                "indent",
                "blockquote",
                "code-block",
                "toggleFullscreen",
                "formula",
                "clean",
                "undo",
                "redo",
              ]}
              style={{
                height: "calc(100% - 60px)", // Adjust height to leave space for the toolbar
                flexGrow: 1,
                overflowY: "auto", // Ensure content inside the editor scrolls
              }}
            />
          </div>
        </div>
      )}

      {isPreviewMode && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.2)", // Blackish overlay
            zIndex: 1000, // Slightly lower than modal to keep it behind
          }}>
          <div
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
              zIndex: 1001, // Ensure the modal is above the overlay
              maxHeight: "90%",
              overflowY: "auto",
              width: "80%",
            }}>
            <h3 style={{ textAlign: "center", marginBottom: "10px" }}>
              Preview Mode
            </h3>
            <div
              className="ql-editor"
              style={{
                padding: "20px",
              }}
              dangerouslySetInnerHTML={{ __html: value }}
            />
            <div
              style={{
                width: "100%",
                margin: "10px auto",
                textAlign: "center",
              }}>
              <button
                onClick={handlePreviewToggle}
                style={{
                  display: "block",
                  margin: "10px auto",
                  padding: "10px 20px",
                  backgroundColor: "red",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showImageModal && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
          }}>
          <h3>Select {isVideoUpload ? "Video" : "Image"} Option</h3>
          <button
            onClick={handleMediaUrl}
            type="button"
            style={{
              padding: "10px 20px",
              margin: "10px",
              cursor: "pointer",
            }}>
            Enter {isVideoUpload ? "Video" : "Image"} URL
          </button>
          <button
            onClick={handleFileUpload}
            type="button"
            style={{
              padding: "10px 20px",
              margin: "10px",
              cursor: "pointer",
            }}>
            Upload from System
          </button>
          <button
            onClick={() => setShowImageModal(false)}
            type="button"
            style={{
              padding: "10px 20px",
              margin: "10px",
              cursor: "pointer",
              backgroundColor: "red",
              color: "white",
            }}>
            Cancel
          </button>
        </div>
      )}

      {showImageModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 999,
          }}
          onClick={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
};

export default Editor;
