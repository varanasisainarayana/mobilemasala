import React, { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { BASE_URL } from "../../config";
import { useNavigate } from "react-router-dom";
import { FadeLoader } from "react-spinners";

const Roles = () => {
  const [roles, setRoles] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ rolename: "", status: "active" });
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isEdit, setIsEdit] = useState(false);
  const [rolesPerPage, setRolesPerPage] = useState(15);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRoles, setTotalRoles] = useState([]);

  useEffect(() => {
    const fetching = async () => {
      await fetchRoles();
    };
    fetching();
  }, [currentPage, rolesPerPage]);

  const fetchRoles = async () => {
    setLoading(true);
    await fetch(
      `${BASE_URL}/mm/getallroles?page=${currentPage}&size=${rolesPerPage}`
    )
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

  const fetchTotalRoles = async () => {
    setLoading(true);
    await fetch(`${BASE_URL}/mm/getallroles`)
      .then((response) => response.json())
      .then((data) => {
        setTotalRoles(data?.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    const fetching = async () => {
      await fetchTotalRoles();
    };
    fetching();
  }, []);

  const filteredRoles = roles.filter(
    (role) =>
      role.rolename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      role.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const csvHeaders = [
    { label: "Role Name", key: "roleName" },
    { label: "Status", key: "status" },
  ];

  const csvData = roles.map((role) => ({
    roleName: role.rolename,
    status: role.status,
  }));

  const handleDelete = async (role) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (confirmDelete) {
      const roleId = role.roleid;
      setLoading(true);
      await fetch(`${BASE_URL}/mm/delete?type=role&id=${roleId}`, {
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
              await fetchRoles();
              await fetchTotalRoles();
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    fetch(`${BASE_URL}/mm/add-role`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        if (data?.status === 200) {
          setAlert({ show: true, message: data.message, type: "success" });
          setShowModal(false);
          setFormData({ rolename: "", status: "active" });
          fetchRoles();
        } else {
          alert("Failed to update RSS");
        }
      })
      .catch((error) => console.error);
  };

  const handlePermissions = (role) => {
    navigate(`/permissions/${role.roleid}`, { state: { role: role } });
  };

  const handleAlertClose = () => {
    setAlert({ show: false, message: "", type: "" });
  };

  const handleEditRole = (role) => {
    setFormData({
      rolename: role.rolename,
      status: role.status,
      roleid: role.roleid,
    });
    setShowModal(true);
    setIsEdit(true);
  };

  const searchFunction = (e) => {
    const value = e.target.value.toLowerCase();
    // setNoDataMessage("");
    // setFilteredRssData(value);
    try {
      if (value !== "") {
        const filtered = filtermethod(value);
        if (filtered.length === 0) {
          // setNoDataMessage("No matching rss found.");
        }
        setRoles(filtered);
      } else {
        fetchRoles();
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const filtermethod = (value) => {
    return roles.filter(
      (role) =>
        role.rolename.toLowerCase().includes(value) ||
        role.status.toLowerCase().includes(value)
    );
  };

  const handlePageSizeChange = (e) => {
    setRolesPerPage(e.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="container">
      <div className="row p-3">
        <div className="col-12 d-flex justify-content-between align-items-center mt-3">
          <h3 className="fs-4">Roles</h3>
          <button
            className="btn btn-outline-primary"
            onClick={() => {
              setFormData({ rolename: "", status: "active" });
              setIsEdit(false);
              setShowModal(true);
            }}>
            Add Role
          </button>
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
                filename="roles.csv"
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

              {/* Roles Per Page - One Line */}
              <div
                className="form-group d-flex align-items-center"
                style={{ whiteSpace: "nowrap" }}>
                <label className="form-label fw-bold me-2 mb-0">
                  Roles per page:
                </label>
                <select
                  className="form-select form-select-sm"
                  value={rolesPerPage}
                  onChange={handlePageSizeChange}>
                  {[5, 10, 15, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row m-3">
              <div className="col-12 d-flex justify-content-end fw-bold">
                Showing {rolesPerPage * (currentPage - 1) + 1}-
                {rolesPerPage * currentPage > totalRoles.length
                  ? totalRoles.length
                  : rolesPerPage * currentPage}{" "}
                of {totalRoles.length}
              </div>
            </div>
            <div className="col-12">
              {loading ? (
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ maxHeight: "60vh", overflow: "auto" }}>
                  <FadeLoader size={50} color={"#123abc"} loading={loading} />
                  <span className="ms-2">Loading...</span>
                </div>
              ) : (
                <>
                  <div
                    className="table-responsive rounded shadow "
                    style={{ maxHeight: "65vh", overflowY: "auto" }}>
                    <table className="table table-hover table-bordered">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Role Name</th>
                          <th>Status</th>
                          <th>Action</th>
                          <th>Permissions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {roles.map((role, index) => (
                          <tr key={index}>
                            <td>
                              {index + 1 + (currentPage - 1) * rolesPerPage}
                            </td>
                            <td>{role.rolename}</td>
                            <td>
                              <div
                                className={`badge p-2 ${
                                  role.status === "active"
                                    ? "bg-success"
                                    : "bg-danger"
                                } `}>
                                {role.status.toUpperCase()}
                              </div>
                            </td>
                            <td className="d-flex">
                              {/* <button
                          className="btn btn-outline-secondary btn-sm m-1"
                          onClick={() => handleEditRole(role)}>
                          <i className="bi bi-pencil-square m-1 text-dark"></i>
                        </button> */}
                              <button
                                className="btn btn-outline-danger"
                                onClick={() => handleDelete(role)}>
                                <i className="bi bi-trash text-danger"></i>
                              </button>
                            </td>
                            <td>
                              <button
                                className="btn btn-primary"
                                onClick={() => handlePermissions(role)}>
                                View Permissions
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
                            Math.ceil(totalRoles.length / rolesPerPage)
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
          className="modal d-block"
          tabIndex="-1"
          style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEdit ? "Edit" : "Add"} User Role
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleFormSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="roleName" className="form-label">
                      Role Name
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="roleName"
                      required
                      placeholder="Enter role name"
                      value={formData.rolename}
                      onChange={(e) =>
                        setFormData({ ...formData, rolename: e.target.value })
                      }
                    />
                  </div>
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="roleActive"
                      checked={formData.status === "active"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          status: e.target.checked ? "active" : "inactive",
                        })
                      }
                    />
                    <label htmlFor="roleActive" className="form-check-label">
                      Active
                    </label>
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setFormData({ rolename: "", status: "active" });
                      setIsEdit(false);
                      setShowModal(false);
                    }}>
                    Close
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {isEdit ? "Edit" : "Add"} Role
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Roles;
