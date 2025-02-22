import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FadeLoader } from "react-spinners";
import { BASE_URL } from "../../config";
import { useAuth } from "../../Context/AuthContext";

const Category = () => {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const { userInfo } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [categoriesPerPage, setCategoriesPerPage] = useState(10);
  const [totalCategories, setTotalCategories] = useState([]);

  useEffect(() => {
    const fetching = async () => {
      await fetchCategories();
    };
    fetching();
  }, [currentPage, categoriesPerPage]);

  const fetchCategories = async () => {
    try {
      setLoading(false);
      const response = await fetch(
        `${BASE_URL}/mm/getcategory?page=${currentPage}&size=${categoriesPerPage}`
      ); // Fetch categories
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
        order: category.order,
      }));
      setLoading(true);
      setCategories(formattedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  useEffect(() => {
    const fetching = async () => {
      await fetchTotalCategories();
    };
    fetching();
  }, []);

  const fetchTotalCategories = async () => {
    try {
      setLoading(false);
      const response = await fetch(`${BASE_URL}/mm/getcategory`); // Fetch categories
      setLoading(true);
      const apiResponse = await response.json();
      setTotalCategories(apiResponse.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const redirectToAdds = () => {
    navigate("/addcategory");
  };

  // Function to navigate to the edit category page

  const handleEditCategory = (category) => {
    navigate(`/editcategory`, { state: { category } }); // Pass the category object
  };

  // Function to handle search input change
  const handleSearchChange = async (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);
    if (searchValue === "") {
      await fetchCategories();
    } else {
      const filteredCategories = totalCategories.filter((category) => {
        const nameMatch = category.categoryName
          .toLowerCase()
          .includes(searchValue);
        const languageMatch =
          (category.language === 1 && "english".includes(searchValue)) ||
          (category.language === 2 && "hindi".includes(searchValue)) ||
          (category.language === 3 && "telugu".includes(searchValue));
        const categoryTypeMatch =
          (category.categoryType === 1 && "post".includes(searchValue)) ||
          (category.categoryType === 2 && "videos".includes(searchValue)) ||
          (category.categoryType === 3 && "vstories".includes(searchValue));
        const homeViewTypeMatch = category.homeViewType
          .toLowerCase()
          .includes(searchValue);
        const statusMatch =
          (category.status === 0 && "active".includes(searchValue)) ||
          (category.status === 1 && "inactive".includes(searchValue));
        const orderMatch = category.order.toString().includes(searchValue);
        return (
          nameMatch ||
          languageMatch ||
          categoryTypeMatch ||
          homeViewTypeMatch ||
          statusMatch ||
          orderMatch
        );
      });
      setCategories(filteredCategories);
    }
  };

  // Filter categories based on the search term

  const convertToCSV = (data) => {
    const header = [
      "Category ID",
      "Category Name",
      "Category URL",
      "Category Code",
      "Language",
      "Category Type",
      "Category Query",
      "Home View Type",
      "Category Group ID",
      "Status",
      "Order",
    ];

    const escapeField = (field) => {
      if (field == null) return ""; // Handle null or undefined
      return `"${String(field).replace(/"/g, '""')}"`; // Escape double quotes and wrap in quotes
    };

    const rows = data.map((category) => [
      escapeField(category.categoryId),
      escapeField(category.categoryName),
      escapeField(category.categoryUrl),
      escapeField(category.categoryCode),
      escapeField(category.language),
      escapeField(category.categoryType),
      escapeField(category.categoryQuery),
      escapeField(category.homeViewType),
      escapeField(category.categoryGroupId),
      escapeField(category.status),
      escapeField(category.order),
    ]);

    // Create a CSV string
    const csvContent = [header, ...rows].map((row) => row.join(",")).join("\n");
    return csvContent;
  };

  // Function to trigger CSV download
  const downloadCSV = () => {
    const csvData = convertToCSV(categories);
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "categories.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteCategory = (category) => {
    const apiUrl = `${BASE_URL}/mm/delete?type=category&id=${category.categoryId}`;
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
            message: "Deleted Suuccess",
            type: "success",
          });

          setTimeout(async () => {
            setAlert({ show: false, message: "", type: "" });
            navigate("/category");
            await fetchCategories();
            await fetchTotalCategories();
          }, 1000);
        } else {
          // Handle unsuccessful response
          return response.json().then((errorData) => {
            alert(`Failed to delete category: ${errorData.message}`);
          });
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("An error occurred while deleting the category.");
      });
  };

  const handleAlertClose = () => {
    setAlert({ show: false, message: "", type: "" });
    // navigate("/category");
  };

  const handlePageSizeChange = (e) => {
    setCategoriesPerPage(e.target.value);
    setCurrentPage(1);
  };

  return (
    <section className="container-fluid p-auto m-auto">
      <div className="row">
        <div className="d-flex justify-content-between  flex-wrap mt-5 px-4">
          <h3 className="fs-4">Category</h3>
          {userInfo?.roletype === 0 ? (
            <button
              className="btn btn-outline-info shadow"
              onClick={redirectToAdds}>
              Add Category
            </button>
          ) : (
            userInfo?.permissions[5].add === 1 &&
            userInfo?.permissions[5].access === 1 && (
              <button
                className="btn btn-outline-info shadow"
                onClick={redirectToAdds}>
                Add Category
              </button>
            )
          )}
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
        <div className="content-page">
          <div className="content">
            <div className="container-fluid">
              <div className="page-title-box pt-2"></div>
              <div className="row">
                <div className="col-12">
                  {loading ? (
                    <>
                      <div className="card shadow cutsom-shadow">
                        <div className="card-body">
                          <div className="mb-3 d-flex justify-content-between align-items-center  flex-wrap">
                            <label className="form-group fw-bold fs-5 ">
                              Search Category :
                            </label>
                            <input
                              type="text"
                              placeholder="Search..."
                              value={searchTerm}
                              onChange={handleSearchChange}
                              className="form-control mx-3 w-auto"
                            />
                            <button
                              className="btn btn-outline-success m-3 m-2"
                              onClick={downloadCSV}>
                              Download
                            </button>
                            <div className="form-group col-4 d-flex align-items-center">
                              <label className="form-label mb-0 me-2 fw-bold">
                                Categories per page:{" "}
                              </label>
                              <select
                                className="form-control"
                                value={categoriesPerPage}
                                onChange={handlePageSizeChange}>
                                <option value={10}>10</option>
                                <option value={15}>15</option>
                                <option value={20}>20</option>
                                <option value={30}>30</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                              </select>
                            </div>
                          </div>
                          <div className="row m-3">
                            <div className="col-12 d-flex justify-content-end fw-bold">
                              Showing{" "}
                              {categoriesPerPage * (currentPage - 1) + 1}-
                              {categoriesPerPage * currentPage >
                              categories.length
                                ? categories.length
                                : categoriesPerPage * currentPage}{" "}
                              of {totalCategories.length} Categories
                            </div>
                          </div>{" "}
                          <div
                            className="table-responsive"
                            style={{ maxHeight: "60vh", overflowY: "auto" }}>
                            <table className="table table-hover  table-bordered">
                              <thead className="text-start">
                                <tr>
                                  <th>S.No.</th>
                                  <th>Category Name</th>
                                  <th>Language</th>
                                  <th>Category Type</th>
                                  <th>Home View Type</th>
                                  <th>Status</th>
                                  {userInfo?.roletype === 0 ? (
                                    <th>Actions</th>
                                  ) : (
                                    (userInfo?.permissions[5].edit === 1 ||
                                      userInfo?.permissions[5].delete === 1) &&
                                    userInfo.permissions[5].access === 1 && (
                                      <th>Actions</th>
                                    )
                                  )}
                                  <th>Order</th>
                                </tr>
                              </thead>
                              <tbody className="text-start ">
                                {categories.map((category, index) => (
                                  <tr
                                    key={index}
                                    // onClick={() =>
                                    //   handleEditCategory(category.categoryId)
                                    // }
                                  >
                                    <td>
                                      {currentPage === 1
                                        ? index + 1
                                        : index +
                                          1 +
                                          (currentPage - 1) * categoriesPerPage}
                                    </td>
                                    <td>{category.categoryName}</td>
                                    <td>
                                      {category.language === 1
                                        ? "English"
                                        : category.language === 2
                                        ? "Hindi"
                                        : category.language === 3
                                        ? "Telugu"
                                        : ""}
                                    </td>
                                    <td>
                                      {category.categoryType === 1
                                        ? "Post"
                                        : category.categoryType === 2
                                        ? "Videos"
                                        : category.categoryType === 3
                                        ? "Vstories"
                                        : ""}
                                    </td>
                                    <td>{category.homeViewType}</td>
                                    <td>
                                      <div
                                        className={`badge ${
                                          category.status === 0
                                            ? "bg-success"
                                            : "bg-danger"
                                        }`}>
                                        {category.status === 0
                                          ? "Active"
                                          : "InActive"}
                                      </div>
                                    </td>
                                    {userInfo?.roletype === 0 ? (
                                      <td className="d-flex">
                                        <button
                                          className="btn btn-outline-secondary btn-sm m-1"
                                          onClick={(e) => {
                                            e.stopPropagation(); // Prevent row click event
                                            handleEditCategory(category);
                                          }}>
                                          <i className="bi bi-pencil-square m-1 text-dark"></i>
                                        </button>
                                        <button
                                          className="btn btn-outline-danger btn-sm m-1"
                                          onClick={(e) => {
                                            e.stopPropagation(); // Prevent row click event
                                            handleDeleteCategory(category);
                                          }}>
                                          <i className="bi bi-trash m-1 text-danger ">
                                            {" "}
                                          </i>
                                        </button>
                                      </td>
                                    ) : (
                                      (userInfo?.permissions[5].edit === 1 ||
                                        userInfo?.permissions[5].delete ===
                                          1) &&
                                      userInfo.permissions[5].access === 1 && (
                                        <td className="d-flex">
                                          {userInfo?.permissions[5].edit ===
                                            1 &&
                                            userInfo?.permissions[5].access ===
                                              1 && (
                                              <button
                                                className="btn btn-outline-secondary btn-sm m-1"
                                                onClick={(e) => {
                                                  e.stopPropagation(); // Prevent row click event
                                                  handleEditCategory(category);
                                                }}>
                                                <i className="bi bi-pencil-square m-1 text-dark"></i>
                                              </button>
                                            )}
                                          {userInfo?.permissions[5].delete ===
                                            1 &&
                                            userInfo?.permissions[5].access ===
                                              1 && (
                                              <button
                                                className="btn btn-outline-danger btn-sm m-1"
                                                onClick={(e) => {
                                                  e.stopPropagation(); // Prevent row click event
                                                  handleDeleteCategory(
                                                    category
                                                  );
                                                }}>
                                                <i className="bi bi-trash m-1 text-danger ">
                                                  {" "}
                                                </i>
                                              </button>
                                            )}
                                        </td>
                                      )
                                    )}
                                    <td>{category.order}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          <div className="row">
                            <div className="col">
                              <div className="d-flex justify-content-center align-content-center m-2">
                                <button
                                  disabled={currentPage === 1}
                                  onClick={() =>
                                    setCurrentPage((prevPage) => prevPage - 1)
                                  }
                                  className="btn btn-outline-info px-3">
                                  Prev
                                </button>
                                <span className="m-1 px-2">{currentPage}</span>
                                <button
                                  disabled={
                                    currentPage >=
                                    Math.ceil(
                                      totalCategories.length / categoriesPerPage
                                    )
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
                        </div>
                      </div>
                    </>
                  ) : (
                    <center className="m-4">
                      <FadeLoader color="#102154" />
                    </center>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Category;
