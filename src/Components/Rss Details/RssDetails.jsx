import React, { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { BASE_URL } from "../../config";
import { use } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";

const RssDetails = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [rssData, setRssData] = useState([]);
  const [filteredRssData, setFilteredRssData] = useState([]);
  const navigate = useNavigate();
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const { userInfo } = useAuth();
  const [rss, setRss] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rssPerPage, setRssPerPage] = useState(10);
  const [loading, setLoading] = useState(false);
  const [noDataMessage, setNoDataMessage] = useState("");

  // Fetch RSS data from API
  useEffect(() => {
    const fetching = async () => {
      await fetchRssData();
    };
    fetching();
  }, [userInfo, currentPage, rssPerPage]);

  useEffect(() => {
    const fetching = async () => {
      await fetchRss();
    };
    fetching();
  }, []);

  const fetchRssData = async () => {
    setLoading(true);
    await fetch(
      `${BASE_URL}/mm/getallrss?page=${currentPage}&size=${rssPerPage}`
    )
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        if (userInfo.roletype === 1) {
          const userRssIds = userInfo.rss.split(",").map(Number);
          const filteredData = data?.data.filter((rss) =>
            userRssIds.includes(rss.rssid)
          );
          setRssData(filteredData);
        } else {
          setRssData(data?.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
        setLoading(false);
      });
  };

  const fetchRss = async () => {
    setLoading(true);
    await fetch(`${BASE_URL}/mm/getallrss`)
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        if (userInfo.roletype === 1) {
          const userRssIds = userInfo.rss.split(",").map(Number);
          const filteredData = data?.data.filter((rss) =>
            userRssIds.includes(rss.rssid)
          );
          setRss(filteredData);
        } else {
          setRss(data?.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
        setLoading(false);
      });
  };

  // Filter RSS data based on search term
  // useEffect(() => {
  //   const filteredData = rssData.filter(
  //     (rss) =>
  //       rss.rssName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       rss.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       rss.sourceUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       rss.status.toLowerCase().includes(searchTerm.toLowerCase())
  //   );
  //   setFilteredRssData(filteredData);
  // }, [searchTerm, rssData]);

  const handleEdit = (rss) => {
    navigate("/editrssdetails", { state: { item: rss } });
  };

  const handleDelete = async (rss) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (confirmDelete) {
      const rssId = rss.rssid;
      await fetch(`${BASE_URL}/mm/delete?type=rss&id=${rssId}`, {
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
              await fetchRssData();
              await fetchRss();
            }, 1000);
          } else {
            alert("Failed to delete post");
          }
        })
        .catch((error) => {
          console.error("Error deleting post:", error);
          setLoading(false);
          setAlert({
            show: true,
            message: "Error deleting post. Please try again.",
            type: "danger",
          });
        });
    }
  };

  const handlePageSizeChange = (e) => {
    setRssPerPage(e.target.value);
    setCurrentPage(1);
  };

  const handleAlertClose = () => {
    setAlert({ show: false, message: "", type: "" });
  };

  const searchFunction = (e) => {
    const value = e.target.value.toLowerCase();
    setNoDataMessage("");
    setFilteredRssData(value);
    try {
      if (value !== "") {
        const filtered = filtermethod(value);
        if (filtered.length === 0) {
          setNoDataMessage("No matching rss found.");
        }
        setRssData(filtered);
      } else {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const filtermethod = (value) => {
    return rss.filter(
      (rss) =>
        rss.rssName.toLowerCase().includes(value) ||
        rss.categoryName.toLowerCase().includes(value) ||
        rss.sourceUrl.toLowerCase().includes(value) ||
        rss.status.toLowerCase().includes(value)
    );
  };

  return (
    <section className="container-fluid" style={{ height: "90vh" }}>
      <div className="row" style={{ height: "100%" }}>
        <div
          className="col-12 shadow p-3 bg-white rounded"
          style={{ height: "100%" }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h3 className="fs-4">RSS Details</h3>
            {userInfo.roletype === 0 ||
            (userInfo.permissions[1].add === 1 &&
              userInfo.permissions[1].access === 1) ? (
              <button
                onClick={() => navigate("/addrssdetails")}
                className="btn btn-outline-info m-2">
                Add RSS
              </button>
            ) : null}
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
          <div className="card shadow custom-shadow">
            <div className="card-body d-flex flex-column">
              <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-2">
                {/* CSV Download Button */}
                <CSVLink
                  data={rssData}
                  filename="rss_data.csv"
                  className="btn btn-outline-success text-dark"
                  target="_blank">
                  <i className="fas fa-file-csv me-2"></i> Download CSV
                </CSVLink>

                {/* Search Input - Wider */}
                <input
                  type="text"
                  className="form-control w-50"
                  placeholder="Search..."
                  onChange={searchFunction}
                />

                {/* RSS Per Page - One Line */}
                <div
                  className="form-group d-flex align-items-center"
                  style={{ whiteSpace: "nowrap" }}>
                  <label className="form-label fw-bold me-2 mb-0">
                    RSS per page:
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={rssPerPage}
                    onChange={handlePageSizeChange}>
                    {[5, 10, 15, 30, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {userInfo.roletype === 0 && (
                <div className="row m-3">
                  <div className="col-12 d-flex justify-content-end fw-bold">
                    Showing {rssPerPage * (currentPage - 1) + 1}-
                    {rssPerPage * currentPage > rss.length
                      ? rss.length
                      : rssPerPage * currentPage}{" "}
                    of {rss.length} RSS
                  </div>
                </div>
              )}
              <div
                className="table-responsive flex-grow-1"
                style={{ maxHeight: "60vh", overflowY: "auto" }}>
                <table className="table table-bordered table-hover">
                  <thead>
                    <tr>
                      <th>S.No</th>
                      <th>Category Name</th>
                      <th>RSS Name</th>
                      <th>RSS Source URL</th>
                      <th>Status</th>
                      {userInfo?.roletype === 0 ? (
                        <th>Action</th>
                      ) : (userInfo.permissions[1].edit === 1 ||
                          userInfo.permissions[1].delete === 1) &&
                        userInfo.permissions[1].access === 1 ? (
                        <th>Action</th>
                      ) : null}
                    </tr>
                  </thead>
                  <tbody>
                    {rssData.length > 0 ? (
                      rssData.map((rss, index) => (
                        <tr key={index}>
                          <td>
                            {rssData.indexOf(rss) +
                              1 +
                              rssPerPage * (currentPage - 1)}
                          </td>
                          <td>{rss.categoryName}</td>
                          <td>{rss.rssName}</td>
                          <td>
                            <p
                              onClick={() =>
                                window.open(rss.sourceUrl, "_blank")
                              }
                              style={{
                                color: "blue",
                                textDecoration: "none",
                                cursor: "pointer",
                              }}
                              onMouseOver={(e) => {
                                e.target.style.textDecoration = "underline";
                                e.target.style.color = "darkblue";
                              }}
                              onMouseOut={(e) => {
                                e.target.style.textDecoration = "none";
                                e.target.style.color = "blue";
                              }}>
                              {rss.sourceUrl}
                            </p>
                          </td>
                          <td>
                            <div
                              className={`badge ${
                                rss.status === "Active"
                                  ? "bg-success"
                                  : "bg-danger"
                              }`}>
                              {rss.status === "Active" ? "Active" : "InActive"}
                            </div>
                          </td>
                          {userInfo?.roletype === 0 ? (
                            <td className="d-flex">
                              <button
                                className="btn btn-outline-warning m-1"
                                onClick={() => handleEdit(rss)}>
                                <i className="bi bi-pencil-square text-dark"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger m-1"
                                onClick={() => handleDelete(rss)}>
                                <i className="bi bi-trash text-danger" />
                              </button>
                            </td>
                          ) : (userInfo.permissions[1].edit === 1 ||
                              userInfo.permissions[1].delete === 1) &&
                            userInfo.permissions[1].access === 1 ? (
                            <td className="d-flex">
                              {userInfo.permissions[1].edit === 1 &&
                                userInfo.permissions[1].access === 1 && (
                                  <button
                                    className="btn btn-outline-warning m-1"
                                    onClick={() => handleEdit(rss)}>
                                    <i className="bi bi-pencil-square text-dark"></i>
                                  </button>
                                )}
                              {userInfo.permissions[1].delete === 1 &&
                                userInfo.permissions[1].access === 1 && (
                                  <button
                                    className="btn btn-outline-danger m-1"
                                    onClick={() => handleDelete(rss)}>
                                    <i className="bi bi-trash text-danger" />
                                  </button>
                                )}
                            </td>
                          ) : null}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="text-center">
                          {noDataMessage
                            ? noDataMessage
                            : "No RSS data available."}
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
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((prevPage) => prevPage - 1)}
                      className="btn btn-outline-info px-3">
                      Prev
                    </button>
                    <span className="m-1 px-2">{currentPage}</span>
                    <button
                      disabled={
                        currentPage >= Math.ceil(rss.length / rssPerPage)
                      }
                      onClick={() => setCurrentPage((prevPage) => prevPage + 1)}
                      className="btn btn-outline-info px-3">
                      Next
                    </button>
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

export default RssDetails;
