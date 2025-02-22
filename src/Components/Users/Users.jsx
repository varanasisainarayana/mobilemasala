import React, { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { FadeLoader } from "react-spinners";
import { BASE_URL } from "../../config";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [rssData, setRssData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    roleid: 0,
    roletype: "",
    rssAccess: "",
    status: "inactive",
  });
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedUserRss, setSelectedUserRss] = useState([]);
  const [showRssModal, setShowRssModal] = useState(false);
  const [usersPerPage, setUsersPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState([]);

  const fetchUsers = async () => {
    setLoading(true);
    await fetch(
      `${BASE_URL}/mm/getallusers?page=${currentPage}&size=${usersPerPage}`
    )
      .then((response) => response.json())
      .then((data) => {
        setUsers(data?.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  const fetchRss = async () => {
    await fetch(`${BASE_URL}/mm/getallrss`)
      .then((response) => response.json())
      .then((data) => setRssData(data?.data))
      .catch((error) => console.error(error));
  };

  const fetchroles = async () => {
    setLoading(true);
    await fetch(`${BASE_URL}/mm/getallroles`)
      .then((response) => response.json())
      .then((data) => {
        setRoles(data?.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  const fetchTotalUsers = async () => {
    setLoading(true);
    await fetch(`${BASE_URL}/mm/getallusers`)
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        setTotalUsers(data?.data);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    const fetching = async () => {
      await fetchRss();
      await fetchTotalUsers();
      await fetchroles();
    };
    fetching();
  }, []);

  useEffect(() => {
    const fetching = async () => {
      await fetchUsers();
    };
    fetching();
  }, [usersPerPage, currentPage]);

  const handleAlertClose = () => {
    setAlert({ show: false, message: "", type: "" });
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? formData.status === "active"
            ? "inactive"
            : "active"
          : value,
    });
  };

  const handleRssChange = (rssId) => {
    let currentAccess = formData.rssAccess ? formData.rssAccess.split(",") : [];
    if (rssId === "all") {
      if (currentAccess.length === rssData.length) {
        setFormData({ ...formData, rssAccess: "" });
      } else {
        setFormData({
          ...formData,
          rssAccess: rssData.map((rss) => rss.rssid).join(","),
        });
      }
    } else {
      const index = currentAccess.indexOf(rssId.toString());
      if (index > -1) {
        currentAccess.splice(index, 1);
      } else {
        currentAccess.push(rssId.toString());
      }
      setFormData({ ...formData, rssAccess: currentAccess.join(",") });
    }
  };

  const handleSubmit = async () => {
    const formattedData = {
      ...formData,
      roleid: parseInt(formData.roleid, 10),
      roletype: parseInt(formData.roletype, 10),
      rssAccess: formData.rssAccess,
    };

    await fetch(`${BASE_URL}/mm/create-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedData),
    })
      .then((response) => response.json())
      .then(async (data) => {
        console.log("Form Data:", data);
        setShowModal(false);
        setAlert({
          show: true,
          message: "User added successfully!",
          type: "success",
        });
        setTimeout(() => {
          setAlert({ show: false, message: "", type: "" });
        }, 1000);
        setFormData({
          username: "",
          password: "",
          email: "",
          roleid: 0,
          roletype: "",
          rssAccess: "",
          status: "inactive",
        });
        await fetchUsers();
      })
      .catch((error) => {
        console.error("Error:", error);
        setAlert({
          show: true,
          message: "Failed to add user!",
          type: "danger",
        });
        setTimeout(() => {
          setAlert({ show: false, message: "", type: "" });
        }, 1000);
      });
  };

  const csvHeaders = [
    { label: "UserName", key: "username" },
    { label: "Email", key: "email" },
    { label: "Password", key: "password" },
    { label: "Status", key: "status" },
  ];

  const csvData = users.map((user) => ({
    username: user.username,
    email: user.email,
    password: user.password,
    status: user.status,
  }));

  const handleViewRss = (rssIds) => {
    if (rssIds !== null) {
      const userRss = rssData.filter((rss) => rssIds.includes(rss.rssid));
      setSelectedUserRss(userRss);
      setShowRssModal(true);
    } else {
      setShowRssModal(true);
      setSelectedUserRss([]);
    }
  };

  const handleDelete = async (user) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (confirmDelete) {
      const userId = user.userId;
      setLoading(true);
      await fetch(`${BASE_URL}/mm/delete?type=user&id=${userId}`, {
        method: "POST",
      })
        .then((response) => {
          setLoading(false);
          if (response.ok) {
            setAlert({
              show: true,
              message: "Delete Success",
              type: "success",
            });
            setTimeout(async () => {
              setAlert({ show: false, message: "", type: "" });
              // navigate("/Posts");
              await fetchUsers();
              await fetchTotalUsers();
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

  const handleEditUser = (user) => {
    setIsEdit(true);
    setShowModal(true);
    console.log("User:", user.roleid);
    setFormData({
      username: user.username,
      password: user.password,
      email: user.email,
      roleid: user.roleid,
      roletype: user.roletype,
      rssAccess: user.rssAccess,
      status: user.status || "inactive",
      userId: user.userId,
    });
  };

  // const filteredUsers = users.filter(
  //   (user) =>
  //     user.username.toLowerCase().includes(value) ||
  //     user.email.toLowerCase().includes(value) ||
  //     user.status.toLowerCase().includes(value) ||
  //     (user.roletype === 0
  //       ? "admin".includes(value)
  //       : "user".includes(value))
  // );

  const searchFunction = async (e) => {
    const value = e.target.value.toLowerCase();
    // setNoDataMessage("");
    // setFilteredRssData(value);
    try {
      if (value !== "") {
        const filtered = filtermethod(value);
        if (filtered.length === 0) {
          // setNoDataMessage("No matching rss found.");
        }
        setUsers(filtered);
      } else {
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const filtermethod = (value) => {
    return totalUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value) ||
        user.status.toLowerCase().includes(value) ||
        (user.roletype === 0 ? "admin".includes(value) : "user".includes(value))
    );
  };

  const handlePageSizeChange = (e) => {
    setUsersPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  return (
    <div className="row m-auto p-auto">
      <div className="col">
        <div className="d-flex justify-content-between align-items-center m-3">
          <h3 className="fs-4">Create user</h3>
          <div>
            <button
              className="btn btn-outline-primary me-2 shadow"
              onClick={() => setShowModal(true)}>
              Add User
            </button>
          </div>
        </div>
        {alert.show && (
          <div
            className={`alert alert-${alert.type} alert-dismissible fade show`}
            role="alert">
            {alert.message}
            <button
              type="button"
              className="btn-close"
              onClick={handleAlertClose}></button>
          </div>
        )}
        <div className="card shadow custom-shadow mt-3">
          <div className="card-body d-flex flex-column">
            <div className="d-flex flex-wrap gap-3 justify-content-between align-items-center mb-2">
              {/* CSV Download Button */}
              <CSVLink
                data={csvData}
                headers={csvHeaders}
                filename="Users.csv"
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

              {/* Users Per Page - One Line */}
              <div
                className="form-group d-flex align-items-center"
                style={{ whiteSpace: "nowrap" }}>
                <label className="form-label fw-bold me-2 mb-0">
                  Users per page:
                </label>
                <select
                  className="form-select form-select-sm"
                  value={usersPerPage}
                  onChange={handlePageSizeChange}>
                  {[5, 10, 15, 30, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row m-3">
              <div className="col-12 d-flex justify-content-end fw-bold">
                Showing {usersPerPage * (currentPage - 1) + 1}-
                {usersPerPage * currentPage > totalUsers.length
                  ? totalUsers.length
                  : usersPerPage * currentPage}{" "}
                of {totalUsers.length} Users
              </div>
            </div>
            <div className="col-12">
              {loading ? (
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ minHeight: "60vh" }}>
                  <FadeLoader size={50} color={"#123abc"} loading={loading} />
                  <span className="ms-2">Loading...</span>
                </div>
              ) : (
                <>
                  <div
                    className="table-responsive rounded shadow "
                    style={{ maxHeight: "60vh", overflowY: "auto" }}>
                    <table className="table table-bordered table-hover">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>User Name</th>
                          <th>Email</th>
                          <th>Role Type</th>
                          <th>RSS Access</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user, index) => (
                          <tr key={index}>
                            <td>
                              {usersPerPage * (currentPage - 1) + index + 1}
                            </td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>{user.roletype === 0 ? "Admin" : "User"}</td>
                            <td>
                              <button
                                className="btn btn-success"
                                onClick={() => handleViewRss(user.rssAccess)}>
                                <i className="bi bi-eye"></i>
                              </button>
                            </td>
                            <td>{user.status}</td>
                            <td className="d-flex">
                              <button
                                className="btn btn-outline-secondary btn-sm m-1"
                                onClick={() => handleEditUser(user)}>
                                <i className="bi bi-pencil-square m-1 text-dark"></i>
                              </button>
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDelete(user)}>
                                <i className="bi bi-trash text-danger"></i>
                              </button>
                            </td>
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
                            Math.ceil(totalUsers.length / usersPerPage)
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
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{isEdit ? "Edit" : "Add"} Users</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      name="username"
                      value={formData.username}
                      onChange={handleFormChange}
                      placeholder="Enter Username"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleFormChange}
                      placeholder="Enter Password"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      placeholder="Enter Email"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Add Role</label>
                    <select
                      className="form-select"
                      name="roleid"
                      value={formData.roleid}
                      onChange={handleFormChange}
                      required>
                      <option value="" disabled>
                        Select
                      </option>
                      {roles.map((role, index) => (
                        <option key={index} value={role.roleid}>
                          {role.rolename}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Role Type</label>
                    <select
                      className="form-select"
                      name="roletype"
                      placeholder="Select Role Type"
                      value={formData.roletype}
                      onChange={handleFormChange}
                      required>
                      <option value="" disabled>
                        Select
                      </option>
                      <option value={0}>Admin</option>
                      <option value={1}>User/Freelancer</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">RSS Access</label>
                    <div className="dropdown">
                      <button
                        className="btn btn-outline-secondary dropdown-toggle form-control"
                        type="button"
                        id="rssDropdown"
                        aria-expanded="false"
                        onClick={() => setDropdownOpen(!dropdownOpen)}>
                        Select RSS Access
                      </button>
                      {dropdownOpen && (
                        <div
                          className="dropdown-menu p-3"
                          style={{
                            display: "block",
                            position: "absolute",
                            zIndex: 1050,
                            maxHeight: "200px",
                            overflowY: "auto",
                            width: "100%",
                          }}>
                          {/* Select All Option */}
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="selectAll"
                              onChange={() => handleRssChange("all")}
                              checked={
                                formData.rssAccess.length === rssData.length &&
                                rssData.length > 0
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor="selectAll">
                              Select All
                            </label>
                          </div>
                          {/* Individual RSS Options */}
                          {rssData.map((rss) => (
                            <div className="form-check" key={rss.rssid}>
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`rss-${rss.rssid}`}
                                onChange={() => handleRssChange(rss.rssid)}
                                checked={formData.rssAccess.includes(rss.rssid)}
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`rss-${rss.rssid}`}>
                                {rss.rssName}
                              </label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="status"
                      checked={formData.status === "active"}
                      onChange={handleFormChange}
                    />
                    <label className="form-check-label">Active</label>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}>
                  Close
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSubmit}>
                  {isEdit ? "Edit" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal for Viewing User's RSS Access */}
      {showRssModal && (
        <div
          className="modal show d-block"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">User's RSS Access</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowRssModal(false)}></button>
              </div>
              <div className="modal-body">
                {selectedUserRss.length > 0 ? (
                  <table className="table table-bordered table-hover">
                    <thead>
                      <tr>
                        <th>S.No</th>
                        <th>RSS Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedUserRss.map((rss, index) => (
                        <tr key={rss.rssid}>
                          <td>{index + 1}</td>
                          <td>{rss.rssName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div>No RSS Access for this user</div>
                )}
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRssModal(false)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
