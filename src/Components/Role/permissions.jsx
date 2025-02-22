import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { BASE_URL } from "../../config";

const ManagePermissions = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { role } = location.state;
  const defaultPermissions = [
    { module_id: 2, add: 0, edit: 0, delete: 0, access: 0 },
    { module_id: 3, add: 0, edit: 0, delete: 0, access: 0 },
    { module_id: 4, add: 0, edit: 0, delete: 0, access: 0 },
    { module_id: 5, add: 0, edit: 0, delete: 0, access: 0 },
    { module_id: 6, add: 0, edit: 0, delete: 0, access: 0 },
    { module_id: 7, add: 0, edit: 0, delete: 0, access: 0 },
    { module_id: 8, add: 0, edit: 0, delete: 0, access: 0 },
  ];
  const [permissions, setPermissions] = useState(defaultPermissions);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  const fetchPermissions = () => {
    fetch(`${BASE_URL}/mm/getPermissionbyid/${role.roleid}`)
      .then((response) => response.json())
      .then((data) => {
        if (data?.data.length !== 0) {
          const fetchedPermissions = data.data;
          const mergedPermissions = defaultPermissions.map(
            (defaultPermission) => {
              const fetchedPermission = fetchedPermissions.find(
                (perm) => perm.module_id === defaultPermission.module_id
              );
              return fetchedPermission || defaultPermission;
            }
          );
          setPermissions(mergedPermissions);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const handlePermissionChange = (index, field) => {
    const updatedPermissions = [...permissions];
    if (field === "access") {
      const newValue = updatedPermissions[index][field] === 1 ? 0 : 1;
      updatedPermissions[index] = {
        ...updatedPermissions[index],
        add: newValue,
        edit: newValue,
        delete: newValue,
        access: newValue,
      };
    } else {
      updatedPermissions[index][field] =
        updatedPermissions[index][field] === 1 ? 0 : 1;
    }
    setPermissions(updatedPermissions);
  };

  const handleAlertClose = () => {
    setAlert({ show: false, message: "", type: "" });
  };

  const handleSave = () => {
    const body = {
      roleid: role.roleid,
      permissionsJson: permissions,
    };

    fetch(`${BASE_URL}/mm/update-permissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then((response) => response.json())
      .then((data) => {
        setAlert({
          show: true,
          message: "Permissions updated successfully!",
          type: "success",
        });
        setTimeout(() => {
          setAlert({ show: false, message: "", type: "" });
          navigate("/role");
        }, 1000);
      })
      .catch((error) => {
        console.error("Error:", error);
        setAlert({
          show: true,
          message: "Failed to update permissions!",
          type: "danger",
        });
        setTimeout(() => {
          setAlert({ show: false, message: "", type: "" });
        }, 1000);
      });
  };

  const returnPageName = (pageId) => {
    switch (pageId) {
      case 2:
        return "Posts";
      case 3:
        return "Rss Details";
      case 4:
        return "Visual Stories";
      case 5:
        return "Trending News";
      case 6:
        return "Videos";
      case 7:
        return "Categories";
      case 8:
        return "Polls";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="container">
      <h3 className="mt-4">Manage Permissions</h3>
      <p>
        Role Name: <strong>{role.rolename}</strong>
      </p>
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
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Page Name</th>
            <th>Add</th>
            <th>Edit</th>
            <th>Delete</th>
            <th>Access</th>
          </tr>
        </thead>
        <tbody>
          {permissions.map((permission, index) => (
            <tr key={index}>
              <td>{returnPageName(permission.module_id)}</td>
              <td>
                <input
                  type="checkbox"
                  checked={permission.add === 1}
                  onChange={() => handlePermissionChange(index, "add")}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={permission.edit === 1}
                  onChange={() => handlePermissionChange(index, "edit")}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={permission.delete === 1}
                  onChange={() => handlePermissionChange(index, "delete")}
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  checked={permission.access === 1}
                  onChange={() => handlePermissionChange(index, "access")}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="col-12 d-flex ">
        <button onClick={handleSave} className="btn btn-primary">
          Save
        </button>
        <button
          type="button"
          className="btn btn-secondary mx-1"
          onClick={() => window.history.back()}>
          Back
        </button>
      </div>
    </div>
  );
};

export default ManagePermissions;
