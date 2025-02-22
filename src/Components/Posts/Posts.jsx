// import React, { useState, useEffect } from "react";
// import ReactTable from "react-table-6";
// import "react-table-6/react-table.css";
// import { useNavigate } from "react-router-dom";
// import { FadeLoader } from "react-spinners";
// // import { SelectionState } from "react-draft-wysiwyg";
// import { BASE_URL } from "../../config";

// const Posts = () => {
//   const [posts, setPosts] = useState([]);
//   const [currentPage, setCurrentPage] = useState(0);
//   const [pageSize, setPageSize] = useState(200);
//   const [totalPosts, setTotalPosts] = useState(0);
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [filteredcategories, setFilteredCategories] = useState([]);
//   const [alert, setAlert] = useState({ show: false, message: "", type: "" });

//   // State variables for filters
//   const [selectedCategory, setSelectedCategory] = useState(0);
//   const [selectedLanguage, setSelectedLanguage] = useState(0);
//   const [selectedStatus, setSelectedStatus] = useState(0);

//   useEffect(() => {
//     fetchPosts(currentPage, selectedLanguage, selectedCategory, selectedStatus);
//     categorydata();
//   }, [currentPage, pageSize]);

//   const categorydata = async () => {
//     try {
//       const response = await fetch(`${BASE_URL}/mm/getcategory`);
//       const apiResponse = await response.json();
//       const formattedCategories = apiResponse.data.map((category) => ({
//         categoryId: category.categoryId,
//         categoryName: category.categoryName || "N/A",
//         categoryUrl: category.categoryUrl || "N/A",
//         categoryCode: category.categoryCode || "N/A",
//         language: category.language || "N/A",
//         categoryType: category.categoryType || "N/A",
//         categoryQuery: category.categoryQuery || "N/A",
//         homeViewType: category.homeViewType || "N/A",
//         categoryGroupId: category.categoryGroupId || "N/A",
//         status: category.status,
//       }));
//       setCategories(formattedCategories);
//     } catch (error) {
//       console.error("Error fetching categories:", error);
//     }
//   };

//   const fetchPosts = async (
//     page,
//     selectedLanguage,
//     selectedCategory,
//     selectedStatus
//   ) => {
//     console.log(page, selectedLanguage, selectedCategory, selectedStatus);
//     try {
//       const response = await fetch(
//         `${BASE_URL}/mm/getarticlesdata?page=${
//           page + 1
//         }&size=${pageSize}&categoryId=${parseInt(
//           selectedCategory
//         )}&language=${parseInt(selectedLanguage)}&status=${parseInt(
//           selectedStatus
//         )}`
//       );
//       const apiResponse = await response.json();
//       setLoading(true);
//       setPosts(apiResponse.data); // Assuming apiResponse.data contains the list of posts
//       setTotalPosts(apiResponse.totalPosts); // Make sure your API response contains total posts count
//     } catch (error) {
//       console.error("Error fetching posts:", error);
//     }
//   };

//   const navigate = useNavigate();

//   const [filterdata, setFiltereddata] = useState("");
//   const Searchfunction = (e) => {
//     const value = e.target.value;
//     setFiltereddata(value);
//     if (value !== "") {
//       setPosts(filtermethod(value));
//     } else {
//       fetchPosts(currentPage);
//     }
//   };

//   const filtermethod = (value) => {
//     return posts.filter((item) => item.postTitle.includes(value));
//   };

//   const convertToCSV = (posts) => {
//     const header = [
//       "Category ID",
//       "Category Name",
//       "Category URL",
//       "Category Code",
//       "Language",
//       "Category Type",
//       "Category Query",
//       "Created At",
//       "Published Date",
//       "Edited On",
//       "Status",
//       "Uploaded By",
//     ];

//     const rows = posts.map((category) => [
//       category.categoryId,
//       category.categoryName,
//       category.categoryUrl,
//       category.categoryCode,
//       category.language,
//       category.categoryType,
//       category.categoryQuery,
//       category.createdAt,
//       category.publishedDate,
//       category.publishedOn || "N/A", // Ensure publishedOn is handled properly
//       category.status === 1 ? "Publish" : "Pending",
//       category.uploadedBy,
//     ]);

//     // Join headers and rows with commas and new lines
//     const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n");
//     return csvContent;
//   };

//   // Function to trigger CSV download
//   const downloadCSV = () => {
//     if (!posts || posts.length === 0) {
//       alert("No data available to download.");
//       return;
//     }

//     const csvData = convertToCSV(posts);
//     const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
//     const url = URL.createObjectURL(blob);
//     const link = document.createElement("a");
//     link.setAttribute("href", url);
//     link.setAttribute("download", "posts.csv");
//     link.style.visibility = "hidden";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (
//       selectedCategory !== 0 ||
//       selectedLanguage !== 0 ||
//       selectedStatus !== 0
//     ) {
//       fetchPosts(currentPage, selectedLanguage,selectedCategory, selectedStatus);
//       //  console.log(selectedCategory,selectedLanguage,selectedStatus)
//     }
//   };

//   useEffect(() => {
//     // Fetch categories when the component mounts
//     categorydata();
//   }, []);

//   useEffect(() => {
//     // Filter categories based on selected language
//     if (selectedLanguage) {
//       const filtered = categories.filter(
//         (category) => category.language == selectedLanguage
//       );
//       setFilteredCategories(filtered);
//     } else {
//       setFilteredCategories(categories); // Reset if no language is selected
//     }
//   }, [selectedLanguage, categories]);

//   const languagemethod = (e) => {
//     setSelectedLanguage(e.target.value);
//   };

//   const handleEditposts = async (item) => {
//     navigate("/editposts", { state: { item, categories } });
//   };
//   const handleaddstory = (item) => {
//     navigate("/addstory", { state: { item } });
//   };

//   const redirectToAdds = () => {
//     navigate("/addpost", { state: { categories } });
//   };

//   const handleDeleteposts = (item) => {

//     // const confirmDelete = window.confirm("Are you sure you want to delete this post?");
//     // if (confirmDelete) {
//       const postId = item.postId; // Assuming `item` has an `id` property

//       console.log(postId);
//       fetch(`${BASE_URL}/mm/delete?type=article&id=${postId}`, {
//         method: "POST",
//       })
//       .then(response => {
//         if (response.ok) {
//           setAlert({ show: true, message: "Delete Success" ,type: "success" });
//           setTimeout(() => {
//             setAlert({ show: false, message: "", type: "" });
//             navigate("/Posts");
//             fetchPosts(currentPage, selectedLanguage, selectedCategory, selectedStatus);

//           }, 1000);
//         } else {
//           alert("Failed to delete post");
//         }
//       })
//       .catch(error => {
//         console.error("Error deleting post:", error);
//         setAlert({
//           show: true,
//           message: "Error deleting post. Please try again.",
//           type: "danger",
//         });

//       });

//   };

//   const handleAlertClose = () => {
//     setAlert({ show: false, message: "", type: "" });
//     navigate("/Posts");
//   };
// const displaymethod=(item)=>{

//   window.location.href = `https://www.mobilemasala.com/${item.categoryUrl}/${item.postUrl}`;
// }
//   console.log(filteredcategories);
//   return (
//     <section className="container-fluid m-auto p-auto">
//       <div className="row">
//         <div className="d-flex justify-content-between flex-wrap mt-5 px-4">
//           <h3 className="fs-4">Posts</h3>
//           <button
//             className="btn btn-outline-info shadow"
//             onClick={redirectToAdds}
//           >
//             Add Posts
//           </button>
//         </div>
//         {alert.show && (
//           <div className={`alert alert-${alert.type} alert-dismissible w-50 fade show m-auto p-auto`} role="alert">
//             {alert.message}
//             <button type="button" className="btn-close" onClick={handleAlertClose}></button>
//           </div>
//         )}
//         <div className="content-page">
//           <div className="content">
//             <div className="container-fluid">
//               <div className="page-title-box pt-2"></div>
//               <div className="row">
//                 <div className="col-12">
//                   {loading ? (
//                     <>
//                       <div className="card shadow  custom-shadow">
//                         <div className="card-body">
//                           <form
//                             onSubmit={handleSubmit}
//                             className="row shadow border rounded p-2 m-1"
//                           >
//                             <div className="form-group col-12 col-md d-flex align-items-center m-1">
//                               <label className="form-label mb-0 me-2 fw-bold">
//                                 Language:{" "}
//                               </label>
//                               <select
//                                 id="inputState2"
//                                 className="form-control"
//                                 value={selectedLanguage}
//                                 onChange={languagemethod}
//                               >
//                                 <option value={0}>-select-</option>
//                                 <option value={1}>English</option>
//                                 <option value={2}>Hindi</option>
//                                 <option value={3}>Telugu</option>
//                               </select>
//                             </div>
//                             <div className="form-group col-12 col-md d-flex align-items-center m-1">
//                               <label className="form-label mb-0 me-2 fw-bold">
//                                 Categories:{" "}
//                               </label>
//                               <select
//                                 id="inputState1"
//                                 className="form-control"
//                                 value={selectedCategory}
//                                 onChange={(e) =>
//                                   setSelectedCategory(e.target.value)
//                                 }
//                               >
//                                 <option value={0}>-select-</option>

//                                 {filteredcategories.map((item) => (
//                                   <option
//                                     key={item.categoryId}
//                                     value={item.categoryId}
//                                   >
//                                     {item.categoryName}
//                                   </option>
//                                 ))}
//                               </select>
//                             </div>

//                             <div className="form-group col-12 col-md d-flex align-items-center m-1">
//                               <label className="form-label mb-0 me-2 fw-bold">
//                                 Status:{" "}
//                               </label>
//                               <select
//                                 id="inputState3"
//                                 className="form-control"
//                                 value={selectedStatus}
//                                 onChange={(e) =>
//                                   setSelectedStatus(e.target.value)
//                                 }
//                               >
//                                 <option value={0}>-select-</option>

//                                 <option value={1}>Publish</option>
//                                 <option value={0}>Pending</option>
//                               </select>
//                             </div>
//                             <div className="col-12 col-md d-flex align-items-center m-1">
//                               <button className="btn btn-outline-warning text-dark w-auto fw-bold px-md-4">
//                                 Submit
//                               </button>
//                             </div>
//                           </form>
//                           <div className="row m-3">
//                             <div className="col-12 d-flex flex-wrap justify-content-between">
//                               <div className="btn btn-outline-success m-auto ">
//                                 <i
//                                   className="fas fa-file-csv fs-sm-6"
//                                   onClick={downloadCSV}
//                                 >
//                                   Download csv
//                                 </i>
//                               </div>
//                               <div className="form-group m-auto d-flex align-content-center">
//                                 <label className="form-label m-2 fw-bold">
//                                   Search:
//                                 </label>
//                                 <input
//                                   type="text"
//                                   placeholder="Search..."
//                                   className="form-control"
//                                   onChange={Searchfunction}
//                                 />
//                               </div>
//                             </div>
//                           </div>
//                           <div
//                             className="table-responsive rounded "
//                             style={{ maxHeight: "60vh", overflowY: "auto" }}
//                           >
//                             <table className="table table-hover table-bordered shadow p-2">
//                               <thead className="text-start">
//                                 <tr>
//                                   <th>S.No</th>
//                                   <th>CategoryName</th>
//                                   <th>language</th>
//                                   <th>PostTitle</th>
//                                   <th>Status</th>
//                                   <th>Received</th>
//                                   <th>Published</th>
//                                   <th>Edited</th>

//                                   <th>AddStory</th>

//                                   <th>View</th>
//                                   <th>Action</th>
//                                   <th>UploadedBy</th>
//                                 </tr>
//                               </thead>
//                               <tbody className="text-start">
//                                 {posts.length > 0 ? (
//                                   posts.map((item, index) => (
//                                     <tr key={index}>
//                                       <td>
//                                         {index + 1 + currentPage * pageSize}
//                                       </td>
//                                       <td>{item.categoryName}</td>
//                                       <td>
//                                         {item.language === 1
//                                           ? "English"
//                                           : item.language === 2
//                                           ? "Hindi"
//                                           : item.language === 3
//                                           ? "Telugu"
//                                           : ""}
//                                       </td>
//                                       <td>{item.postTitle}</td>
//                                       <td>
//   <span className={item.status === 1 ? "bg-success text-white rounded px-2 py-1" : "bg-danger text-white px-2 py-1 rounded"}>
//     {item.status === 1 ? "Publish" : "Pending"}
//   </span>
// </td>

//                                       <td>{item.createdAt}</td>
//                                       <td>{item.publishedDate}</td>
//                                       <td>{item.publishedDate}</td>
//                                       <td className="items-center">
//                                         {item.categoryName == 12 ||
//                                         item.categoryName == 30 ? (
//                                           <button
//                                             className="btn btn-outline-success btn-sm m-1 "
//                                             onClick={(e) => {
//                                               e.stopPropagation(); // Prevent row click event
//                                               handleaddstory(item);
//                                             }}
//                                           >
//                                             <i className="bi bi-image  text-dark"></i>
//                                           </button>
//                                         ) : (
//                                           ""
//                                         )}
//                                       </td>

//                                       <td>
//                                         <button className="btn btn-outline-info btn-sm m-1" onClick={(e) => {
//                                             e.stopPropagation(); // Prevent row click event
//                                             displaymethod(item);
//                                           }}>
//                                           <i className="bi bi-eye fw-bold m-1 "></i>
//                                         </button>
//                                       </td>
//                                       <td className="d-flex">
//                                         <button
//                                           className="btn btn-outline-secondary btn-sm m-1"
//                                           onClick={(e) => {
//                                             e.stopPropagation(); // Prevent row click event
//                                             handleEditposts(item);
//                                           }}
//                                         >
//                                           <i className="bi bi-pencil-square m-1 text-dark"></i>
//                                         </button>
//                                         <button
//                                           className="btn btn-outline-danger btn-sm m-1"
//                                           onClick={(e) => {
//                                             e.stopPropagation(); // Prevent row click event
//                                             handleDeleteposts(item);
//                                           }}
//                                         >
//                                           <i className="bi bi-trash m-1 text-danger ">
//                                             {" "}
//                                           </i>
//                                         </button>
//                                       </td>
//                                       <td>{item.uploadedBy}</td>
//                                     </tr>
//                                   ))
//                                 ) : (
//                                   // Display this row when no posts are available
//                                   <tr>
//                                     <td colSpan="11" className="text-center">
//                                       No posts available
//                                     </td>
//                                   </tr>
//                                 )}
//                               </tbody>
//                             </table>
//                           </div>
//                           <div className="row">
//                             <div className="col">
//                               <div className="d-flex justify-content-center align-content-center m-2">
//                                 <button
//                                   disabled={currentPage === 0}
//                                   onClick={() =>
//                                     setCurrentPage((prevPage) => prevPage - 1)
//                                   }
//                                   className="btn btn-outline-info px-3"
//                                 >
//                                   Prev
//                                 </button>
//                                 <span className="m-1 px-2">
//                                   {currentPage + 1}
//                                 </span>
//                                 <button
//                                   disabled={
//                                     curre ntPage >=
//                                     Math.ceil(totalPosts / pageSize) - 1
//                                   }
//                                   onClick={() =>
//                                     setCurrentPage((prevPage) => prevPage + 1)
//                                   }
//                                   className="btn btn-outline-info  px-3"
//                                 >
//                                   Next
//                                 </button>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     </>
//                   ) : (
//                     <center className="my-4">
//                       <FadeLoader color="#102154" />
//                     </center>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Posts;

import React, { useState, useEffect } from "react";
import ReactTable from "react-table-6";
import "react-table-6/react-table.css";
import { useNavigate } from "react-router-dom";
import { FadeLoader } from "react-spinners";
// import { SelectionState } from "react-draft-wysiwyg";
import { BASE_URL } from "../../config";
import { useAuth } from "../../Context/AuthContext";

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(200);
  const [totalPosts, setTotalPosts] = useState(0);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filteredcategories, setFilteredCategories] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [noDataMessage, setNoDataMessage] = useState("");
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");

  const [allPosts, setAllPosts] = useState([]);

  const { userInfo } = useAuth();
  // State variables for filters
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState(0);
  const [originalPosts, setOriginalPosts] = useState([]);
  const [contentType, setContentType] = useState(1);
  const [isPopupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    // fetchallPosts();
    const fetching = async () => {
      if (userInfo.roletype === 0) {
        await fetchPosts(
          currentPage,
          selectedLanguage,
          selectedCategory,
          selectedStatus
        );
        if (searchText !== "") {
          await fetchPostsByContentType();
        }
      } else {
        await fetchPosts(
          currentPage,
          selectedLanguage,
          selectedCategory,
          selectedStatus,
          userInfo.username
        );
        if (searchText !== "") {
          await fetchPostsByContentTypeForUser();
        }
      }
    };

    fetching();
    categorydata();
  }, [currentPage, pageSize]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  // const fetchallPosts = async () => {
  //   try {
  //     const response = await fetch(`${BASE_URL}/mm/getarticlesdata`);
  //     const apiResponse = await response.json();
  //     setPosts(apiResponse.data);
  //   } catch (error) {
  //     console.error("Error fetching posts:", error);
  //   }
  // };

  const fetchPostsByContentType = async () => {
    try {
      setLoading(false);
      const response = await fetch(
        `${BASE_URL}/mm/get-posts?contenttype=1&seacrh=${searchText}`
      );
      setLoading(true);
      if (!response.ok) {
        console.error(`Error: Received status ${response.status}`);
        // setAllPosts([]);
        setNoDataMessage("No data found for the applied filters");
        return;
      }
      const apiResponse = await response.json();
      setPosts(apiResponse.data);
      console.log("All Posts", apiResponse.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  // useEffect(() => {
  //   if (searchText) {
  //     if (userInfo.roletype === 0) {
  //       fetchPostsByContentTypeAndSearch();
  //     } else {
  //       fetchPostsByContentTypeAndSearchForUser();
  //     }
  //   } else {
  //     if (userInfo.roletype === 0) {
  //       fetchPosts(
  //         currentPage,
  //         selectedLanguage,
  //         selectedCategory,
  //         selectedStatus
  //       );
  //     } else {
  //       fetchPosts(
  //         currentPage,
  //         selectedLanguage,
  //         selectedCategory,
  //         selectedStatus,
  //         userInfo.username
  //       );
  //     }
  //   }
  // }, [searchText]);

  const fetchPostsByContentTypeForUser = async () => {
    try {
      setLoading(false);
      const response = await fetch(
        `${BASE_URL}/mm/get-posts?contenttype=1&seacrh=${searchText}&uploadedby=${userInfo.username}`
      );
      setLoading(true);
      if (!response.ok) {
        console.error(`Error: Received status ${response.status}`);
        setAllPosts([]);
        setNoDataMessage("No data found for the applied filters");
        return;
      }
      const apiResponse = await response.json();
      setPosts(apiResponse.data);
      console.log("All Posts", apiResponse.data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const categorydata = async () => {
    try {
      setLoading(false);
      const response = await fetch(`${BASE_URL}/mm/getcategory`);
      setLoading(true);
      const apiResponse = await response.json();
      const formattedCategories = apiResponse.data.map((category) => ({
        categoryId: category.categoryId,
        categoryName: category.categoryName || "N/A",
        categoryUrl: category.categoryUrl || "N/A",
        categoryCode: category.categoryCode || "N/A",
        language: category.language || "N/A",
        categoryType: category.categoryType || "N/A",
        categoryQuery: category.categoryQuery || "N/A",
        homeViewType: category.homeViewType || "N/A",
        categoryGroupId: category.categoryGroupId || "N/A",
        status: category.status,
      }));
      const filteredCategories = formattedCategories.filter(
        (category) => category.categoryType === 1
      );

      setCategories(filteredCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchPosts = async (
    page,
    selectedLanguage,
    selectedCategory,
    selectedStatus,
    uploadedBy
  ) => {
    console.log(
      page,
      selectedLanguage,
      selectedCategory,
      selectedStatus,
      uploadedBy
    );
    try {
      const queryParams = new URLSearchParams({
        page: page + 1,
        size: pageSize,
        // categoryId: parseInt(selectedCategory, 10),
        // language: parseInt(selectedLanguage, 10),
        // status: parseInt(selectedStatus, 10),
        contentType: 1,
      });

      if (uploadedBy) {
        queryParams.append("uploadedby", uploadedBy);
      }

      if (parseInt(selectedCategory, 10) !== 0) {
        queryParams.append("categoryId", parseInt(selectedCategory, 10));
      }

      if (parseInt(selectedLanguage, 10) !== 0) {
        queryParams.append("language", parseInt(selectedLanguage, 10));
      }

      if (parseInt(selectedStatus, 10) !== 0) {
        queryParams.append("status", parseInt(selectedStatus, 10));
      }
      setLoading(false);
      // Make the API request
      const response = await fetch(
        `${BASE_URL}/mm/getarticlesdata?${queryParams}`
      );
      if (!response.ok) {
        console.error(`Error: Received status ${response.status}`);
        setPosts([]);
        setNoDataMessage("No data found for the applied filters");
        return;
      }

      // Parse the response JSON
      const apiResponse = await response.json();
      console.log("API Response:", apiResponse);

      // Handle "no data" scenario
      if (apiResponse.data === "no data found") {
        setPosts([]);
        setNoDataMessage("No data found for the applied filters");
        return;
      }
      setLoading(true);
      // const filteredPosts = apiResponse.data.filter(
      //   (post) => post.contentType === 1
      // );
      setOriginalPosts(apiResponse?.data);
      setPosts(apiResponse?.data); // Assuming apiResponse.data contains the list of posts
      setTotalPosts(apiResponse?.data[0]?.totalCount);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const navigate = useNavigate();

  // const [filterdata, setFiltereddata] = useState("");
  // const Searchfunction = (e) => {
  //   const value = e.target.value.toLowerCase();
  //   setNoDataMessage("");
  //   setFiltereddata(value);
  //   try {
  //     if (value !== "") {
  //       const filtered = filtermethod(value);
  //       if (filtered.length === 0) {
  //         setNoDataMessage("No matching posts found.");
  //       }
  //       setPosts(filtered);
  //     } else {
  //       setPosts(originalPosts);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching posts:", error);
  //   }
  // };

  // const filtermethod = (value) => {
  //   return allPosts.filter(
  //     (item) =>
  //       (item.postTitle?.toLowerCase() || "").includes(value) ||
  //       (item.uploadedBy?.toLowerCase() || "").includes(value) ||
  //       (item.categoryName?.toLowerCase() || "").includes(value) ||
  //       (item.language === 1 && value === "english") ||
  //       (item.language === 2 && value === "hindi") ||
  //       (item.language === 3 && value === "telugu") ||
  //       (item.status === 1 && value === "publish") ||
  //       (item.status === 2 && value === "pending") ||
  //       (item.createdAt?.toLowerCase() || "").includes(value) ||
  //       (item.publishedDate?.toLowerCase() || "").includes(value) ||
  //       (item.updatedAt?.toLowerCase() || "").includes(value)
  //   );
  // };

  useEffect(() => {
    const filteringPosts = async () => {
      if (debouncedSearchText !== "") {
        if (userInfo.roletype === 0) {
          // setLoading(false);
          await fetchPostsByContentType();
          // setLoading(true);
        } else {
          await fetchPostsByContentTypeForUser();
          // setLoading(true);
        }
      } else {
        if (userInfo.roletype === 0) {
          setLoading(false);
          await fetchPosts(
            currentPage,
            selectedLanguage,
            selectedCategory,
            selectedStatus
          );
          setLoading(true);
        } else {
          setLoading(false);
          await fetchPosts(
            currentPage,
            selectedLanguage,
            selectedCategory,
            selectedStatus,
            userInfo.username
          );
          setLoading(true);
        }
      }
    };
    filteringPosts();
  }, [debouncedSearchText]);

  const returnCategoryType = (category) => {
    switch (category.contentType) {
      case 1:
        return "Post";
      case 2:
        return "Videos";
      case 3:
        return "Photo Stories";
      default:
        return "Post";
    }
  };

  const returnLanguage = (language) => {
    switch (language) {
      case 1:
        return "English";
      case 2:
        return "Hindi";
      case 3:
        return "Telugu";
      default:
        return "English";
    }
  };

  const convertToCSV = (posts) => {
    const header = [
      "Category ID",
      "Category Name",
      "Category URL",
      "Language",
      "Category Type",
      "Post Title",
      "Post ID",
      "Post Url",
      "Created At",
      "Published Date",
      "Edited On",
      "Status",
      "Uploaded By",
    ];

    // Helper function to handle special characters in fields
    const escapeField = (field) => {
      if (field == null) return ""; // Handle null or undefined
      return `"${String(field).replace(/"/g, '""')}"`; // Escape double quotes and wrap in quotes
    };

    const rows = posts.map((category) => [
      escapeField(category.categoryId),
      escapeField(category.categoryName),
      escapeField(category.categoryUrl),
      escapeField(returnLanguage(category.language)),
      escapeField(returnCategoryType(category)),
      escapeField(category.postTitle),
      escapeField(category.postId),
      escapeField(category.postUrl),
      escapeField(category.createdAt),
      escapeField(category.publishedDate),
      escapeField(category.updatedAt || "N/A"), // Ensure editedOn is handled properly
      escapeField(category.status === 1 ? "Publish" : "Pending"),
      escapeField(category.uploadedBy),
    ]);

    // Join headers and rows with commas and new lines
    const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n");
    return csvContent;
  };

  // Function to trigger CSV download
  const downloadCSV = () => {
    if (!posts || posts.length === 0) {
      alert("No data available to download.");
      return;
    }

    const csvData = convertToCSV(posts);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "posts.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCurrentPage(0);
    if (
      selectedCategory !== 0 ||
      selectedLanguage !== 0 ||
      selectedStatus !== 0
    ) {
      if (userInfo.roletype === 0) {
        await fetchPosts(
          currentPage,
          selectedLanguage,
          selectedCategory,
          selectedStatus
        );
      } else {
        await fetchPosts(
          currentPage,
          selectedLanguage,
          selectedCategory,
          selectedStatus,
          userInfo.username
        );
      }
      //  console.log(selectedCategory,selectedLanguage,selectedStatus)
    } else {
      setPosts(originalPosts);
    }
  };

  useEffect(() => {
    //if all filters are reset, fetch posts again
    console.log(selectedCategory, selectedLanguage, selectedStatus);
    if (
      selectedCategory === "0" &&
      selectedLanguage === "0" &&
      selectedStatus === "0"
    ) {
      console.log("fetching posts again");
      setCurrentPage(0);
      const fetching = async () => {
        if (userInfo.roletype === 0) {
          await fetchPosts(
            currentPage,
            selectedLanguage,
            selectedCategory,
            selectedStatus
          );
        } else {
          await fetchPosts(
            currentPage,
            selectedLanguage,
            selectedCategory,
            selectedStatus,
            userInfo.username
          );
        }
      };
      fetching();
    }
  }, [selectedCategory, selectedLanguage, selectedStatus]);

  useEffect(() => {
    // Fetch categories when the component mounts
    const categoryFetch = async () => {
      await categorydata();
    };
    categoryFetch();
  }, []);

  useEffect(() => {
    // Filter categories based on selected language
    if (selectedLanguage) {
      const filtered = categories.filter(
        (category) =>
          category.language == selectedLanguage && category.categoryType === 1
      );
      setFilteredCategories(filtered);
    } else {
      setFilteredCategories(categories); // Reset if no language is selected
    }
  }, [selectedLanguage, categories]);

  const languagemethod = (e) => {
    if (e.target.value === "0") {
      console.log("resetting category");
      setSelectedCategory("0");
    }
    setSelectedLanguage(e.target.value);
  };

  const handleEditposts = async (item) => {
    navigate("/editposts", { state: { item, categories } });
  };
  const handleaddstory = (item) => {
    navigate("/addstory", { state: { item } });
  };

  const redirectToAdds = () => {
    navigate("/addpost", { state: { categories } });
  };

  const handleDeleteposts = async (item) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (confirmDelete) {
      const postId = item.postId;

      console.log(postId);
      await fetch(`${BASE_URL}/mm/delete?type=article&id=${postId}`, {
        method: "POST",
      })
        .then((response) => {
          if (response.ok) {
            setAlert({
              show: true,
              message: "Delete Success",
              type: "success",
            });
            setTimeout(async () => {
              setAlert({ show: false, message: "", type: "" });
              navigate("/Posts");
              if (userInfo.roletype === 0) {
                await fetchPosts(
                  currentPage,
                  selectedLanguage,
                  selectedCategory,
                  selectedStatus
                );
              } else {
                await fetchPosts(
                  currentPage,
                  selectedLanguage,
                  selectedCategory,
                  selectedStatus,
                  userInfo.username
                );
              }
            }, 1000);
          } else {
            alert("Failed to delete post");
          }
        })
        .catch((error) => {
          console.error("Error deleting post:", error);
          setAlert({
            show: true,
            message: "Error deleting post. Please try again.",
            type: "danger",
          });
        });
    }
  };

  const handlePageSizeChange = async (e) => {
    setPageSize(parseInt(e.target.value, 10));
    setCurrentPage(0);
    if (userInfo.roletype === 0) {
      await fetchPosts(
        currentPage,
        selectedLanguage,
        selectedCategory,
        selectedStatus
      );
    } else {
      await fetchPosts(
        currentPage,
        selectedLanguage,
        selectedCategory,
        selectedStatus,
        userInfo.username
      );
    }
  };

  const handleAlertClose = () => {
    setAlert({ show: false, message: "", type: "" });
    // navigate("/Posts");
  };
  const displaymethod = (item) => {
    window.location.href = `https://dev.mobilemasala.com/${item.categoryUrl}/${item.postUrl}`;
  };
  console.log(filteredcategories);
  return (
    <section className="container-fluid m-auto p-auto">
      <div className="row">
        <div className="d-flex justify-content-between flex-wrap mt-5 px-4">
          <h3 className="fs-4">Posts</h3>
          {userInfo?.roletype === 0 ? (
            <button
              className="btn btn-outline-info shadow"
              onClick={redirectToAdds}>
              Add Posts
            </button>
          ) : (
            userInfo?.permissions[0].add === 1 &&
            userInfo?.permissions[0].access === 1 && (
              <button
                className="btn btn-outline-info shadow"
                onClick={redirectToAdds}>
                Add Posts
              </button>
            )
          )}
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
        <div className="content-page">
          <div className="content">
            <div className="container-fluid">
              <div className="page-title-box pt-2"></div>
              <div className="row">
                <div className="col-12">
                  <div className="card shadow  custom-shadow">
                    <div className="card-body">
                      <form
                        onSubmit={handleSubmit}
                        className="row shadow border rounded p-2 m-1">
                        <div className="form-group col-12 col-md d-flex align-items-center m-1">
                          <label className="form-label mb-0 me-2 fw-bold">
                            Language:{" "}
                          </label>
                          <select
                            id="inputState2"
                            className="form-control"
                            value={selectedLanguage}
                            onChange={languagemethod}>
                            <option value={0}>-select-</option>
                            <option value={1}>English</option>
                            <option value={2}>Hindi</option>
                            <option value={3}>Telugu</option>
                          </select>
                        </div>
                        <div className="form-group col-12 col-md d-flex align-items-center m-1">
                          <label className="form-label mb-0 me-2 fw-bold">
                            Categories:{" "}
                          </label>
                          <select
                            id="inputState1"
                            className="form-control"
                            value={selectedCategory}
                            onChange={(e) =>
                              setSelectedCategory(e.target.value)
                            }>
                            <option value={0}>-select-</option>

                            {filteredcategories.map((item) => (
                              <option
                                key={item.categoryId}
                                value={item.categoryId}>
                                {item.categoryName}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group col-12 col-md d-flex align-items-center m-1">
                          <label className="form-label mb-0 me-2 fw-bold">
                            Status:{" "}
                          </label>
                          <select
                            id="inputState3"
                            className="form-control"
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}>
                            <option value={0}>-select-</option>

                            <option value={1}>Publish</option>
                            <option value={2}>Pending</option>
                          </select>
                        </div>
                        <div className="col-12 col-md d-flex align-items-center m-1">
                          <button className="btn btn-outline-warning text-dark w-auto fw-bold px-md-4">
                            Submit
                          </button>
                        </div>
                      </form>

                      <div className="row m-3">
                        <div className="col-12 d-flex flex-wrap gap-3 justify-content-between align-items-center">
                          {/* Download CSV Button */}
                          <button
                            className="btn btn-outline-success d-flex align-items-center"
                            onClick={downloadCSV}>
                            <i className="fas fa-file-csv me-2"></i> Download
                            CSV
                          </button>

                          {/* Search Input - Increased Width */}
                          <div className="form-group d-flex align-items-center w-50">
                            <label className="form-label fw-bold me-2 mb-0">
                              Search:
                            </label>
                            <input
                              type="text"
                              placeholder="Search..."
                              className="form-control form-control-sm"
                              onChange={(e) => setSearchText(e.target.value)}
                            />
                          </div>

                          {/* Posts Per Page - One Line */}
                          <div
                            className="form-group d-flex align-items-center"
                            style={{ whiteSpace: "nowrap" }}>
                            <label className="form-label fw-bold me-2 mb-0">
                              Posts per page:
                            </label>
                            <select
                              className="form-select form-select-sm"
                              value={pageSize}
                              onChange={handlePageSizeChange}>
                              {[
                                5, 10, 15, 20, 50, 100, 200, 300, 500, 1000,
                              ].map((size) => (
                                <option key={size} value={size}>
                                  {size}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="row m-3">
                        <div className="col-12 d-flex justify-content-end">
                          {userInfo?.roletype === 0 ? (
                            <span className="fw-bold">
                              Posts {currentPage * pageSize + 1} to{" "}
                              {Math.min(
                                (currentPage + 1) * posts.length,
                                totalPosts
                              )}{" "}
                              of {totalPosts}
                            </span>
                          ) : null}
                        </div>
                      </div>
                      {loading ? (
                        <>
                          <div
                            className="table-responsive rounded "
                            style={{ maxHeight: "60vh", overflowY: "auto" }}>
                            <table className="table table-hover table-bordered shadow p-2">
                              <thead className="text-start">
                                <tr>
                                  <th>S.No</th>
                                  <th>CategoryName</th>
                                  <th>language</th>
                                  <th>PostTitle</th>
                                  <th>Status</th>
                                  <th>Received</th>
                                  <th>Published</th>
                                  <th>Edited</th>

                                  {/* <th>AddStory</th> */}

                                  <th>View</th>
                                  {userInfo?.roletype === 0 ? (
                                    <th>Action</th>
                                  ) : (
                                    (userInfo?.permissions[0].edit === 1 ||
                                      userInfo?.permissions[0].delete === 1) &&
                                    userInfo.permissions[0].access === 1 && (
                                      <th>Action</th>
                                    )
                                  )}
                                  <th>UploadedBy</th>
                                </tr>
                              </thead>
                              <tbody className="text-start">
                                {posts.length > 0 ? (
                                  posts.map((item, index) => (
                                    <tr key={index}>
                                      <td>
                                        {index + 1 + currentPage * pageSize}
                                      </td>
                                      <td>{item.categoryName}</td>
                                      <td>
                                        {item.language === 1
                                          ? "English"
                                          : item.language === 2
                                          ? "Hindi"
                                          : item.language === 3
                                          ? "Telugu"
                                          : ""}
                                      </td>
                                      <td>{item.postTitle}</td>
                                      <td>
                                        <span
                                          className={
                                            item.status === 1
                                              ? "bg-success text-white rounded px-2 py-1"
                                              : "bg-danger text-white px-2 py-1 rounded"
                                          }>
                                          {item.status === 1
                                            ? "Publish"
                                            : "Pending"}
                                        </span>
                                      </td>

                                      <td>{item.createdAt}</td>
                                      <td>{item.publishedDate}</td>
                                      <td>{item.updatedAt}</td>
                                      {/* <td className="items-center">
                                        {item.categoryName == 12 ||
                                        item.categoryName == 30 ? (
                                          <button
                                            className="btn btn-outline-success btn-sm m-1 "
                                            onClick={(e) => {
                                              e.stopPropagation(); // Prevent row click event
                                              handleaddstory(item);
                                            }}
                                          >
                                            <i className="bi bi-image  text-dark"></i>
                                          </button>
                                        ) : (
                                          ""
                                        )}
                                      </td> */}

                                      <td>
                                        <button
                                          className="btn btn-outline-info btn-sm m-1"
                                          onClick={(e) => {
                                            e.stopPropagation(); // Prevent row click event
                                            displaymethod(item);
                                          }}>
                                          <i className="bi bi-eye fw-bold m-1 "></i>
                                        </button>
                                      </td>
                                      {userInfo?.roletype === 0 ? (
                                        <td className="d-flex">
                                          <button
                                            className="btn btn-outline-secondary btn-sm m-1"
                                            onClick={(e) => {
                                              e.stopPropagation(); // Prevent row click event
                                              handleEditposts(item);
                                            }}>
                                            <i className="bi bi-pencil-square m-1 text-dark"></i>
                                          </button>
                                          <button
                                            className="btn btn-outline-danger btn-sm m-1"
                                            onClick={(e) => {
                                              e.stopPropagation(); // Prevent row click event
                                              handleDeleteposts(item);
                                            }}>
                                            <i className="bi bi-trash m-1 text-danger ">
                                              {" "}
                                            </i>
                                          </button>
                                        </td>
                                      ) : (
                                        (userInfo?.permissions[0].edit === 1 ||
                                          userInfo?.permissions[0].delete ===
                                            1) &&
                                        userInfo.permissions[0].access ===
                                          1 && (
                                          <td className="d-flex">
                                            {userInfo?.permissions[0].edit ===
                                              1 &&
                                              userInfo?.permissions[0]
                                                .access === 1 && (
                                                <button
                                                  className="btn btn-outline-secondary btn-sm m-1"
                                                  onClick={(e) => {
                                                    e.stopPropagation(); // Prevent row click event
                                                    handleEditposts(item);
                                                  }}>
                                                  <i className="bi bi-pencil-square m-1 text-dark"></i>
                                                </button>
                                              )}
                                            {userInfo?.permissions[0].delete ===
                                              1 &&
                                              userInfo?.permissions[0]
                                                .access === 1 && (
                                                <button
                                                  className="btn btn-outline-danger btn-sm m-1"
                                                  onClick={(e) => {
                                                    e.stopPropagation(); // Prevent row click event
                                                    handleDeleteposts(item);
                                                  }}>
                                                  <i className="bi bi-trash m-1 text-danger ">
                                                    {" "}
                                                  </i>
                                                </button>
                                              )}
                                          </td>
                                        )
                                      )}
                                      <td>{item.uploadedBy}</td>
                                    </tr>
                                  ))
                                ) : (
                                  // Display this row when no posts are available
                                  <tr>
                                    <td colSpan="11" className="text-center">
                                      No posts available
                                    </td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                          <div className="row">
                            <div className="col">
                              <div className="d-flex justify-content-center align-content-center m-2">
                                <button
                                  disabled={currentPage === 0}
                                  onClick={() =>
                                    setCurrentPage((prevPage) => prevPage - 1)
                                  }
                                  className="btn btn-outline-info px-3">
                                  Prev
                                </button>
                                <span className="m-1 px-2">
                                  {currentPage + 1}
                                </span>
                                <button
                                  disabled={
                                    currentPage >=
                                    Math.ceil(totalPosts / pageSize) - 1
                                  }
                                  onClick={() =>
                                    setCurrentPage((prevPage) => prevPage + 1)
                                  }
                                  className="btn btn-outline-info px-3">
                                  Next
                                </button>
                              </div>
                            </div>
                          </div>
                        </>
                      ) : (
                        <center className="my-4">
                          <FadeLoader color="#102154" />
                        </center>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Posts;
