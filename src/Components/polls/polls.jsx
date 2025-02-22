import React, { useEffect, useState } from "react";
import { FadeLoader } from "react-spinners";
import { BASE_URL } from "../../config";
import { CSVLink } from "react-csv";
import { useAuth } from "../../Context/AuthContext";

const Polls = () => {
  const [polls, setPolls] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [totalPolls, setTotalPolls] = useState([]);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    language: 0,
    question: "",
    category: "",
    postId: "",
    options: {
      A: { value: "", votes: 0 },
      B: { value: "", votes: 0 },
      C: { value: "", votes: 0 },
      D: { value: "", votes: 0 },
    },
  });
  const [message, setMessage] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const { userInfo } = useAuth();
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredCategories, setFilteredCategories] = useState([]);

  useEffect(() => {
    const fetching = async () => {
      await fetchPolls();
    };
    fetching();
  }, [currentPage, rowsPerPage]);

  const fetchTotalPolls = async () => {
    setLoading(true);
    await fetch(`${BASE_URL}/mm/all-questions`)
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        const pollsWithVotes =
          data?.data.map((poll) => {
            const totalVotes = Object.values(poll.options).reduce(
              (acc, option) => acc + option.votes,
              0
            );
            return { ...poll, totalVotes };
          }) || [];
        setTotalPolls(pollsWithVotes);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  const fetchCategories = async () => {
    setLoading(true);
    await fetch(`${BASE_URL}/mm/getcategory`)
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        setCategories(data?.data || []);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    const fetching = async () => {
      await fetchTotalPolls();
      await fetchCategories();
    };
    fetching();
  }, []);

  useEffect(() => {
    if (categories.length > 0) {
      const filtered = categories.filter(
        (category) => category.language === parseInt(formData.language)
      );

      setFilteredCategories(filtered);

      // If no category is selected or the language changes, set the first category
      if (
        filtered.length > 0 &&
        !filtered.some((cat) => cat.categoryName === formData.category)
      ) {
        setFormData((prev) => ({
          ...prev,
          category: filtered[0].categoryName,
        }));
      }
    }
  }, [categories, formData.language]);

  const fetchPolls = async () => {
    setLoading(true);
    await fetch(
      `${BASE_URL}/mm/all-questions?page=${currentPage}&size=${rowsPerPage}`
    )
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        const pollsWithVotes =
          data?.data.map((poll) => {
            const totalVotes = Object.values(poll.options).reduce(
              (acc, option) => acc + option.votes,
              0
            );
            return { ...poll, totalVotes };
          }) || [];
        setPolls(pollsWithVotes);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  const filteredPolls = polls.filter(
    (poll) =>
      poll.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poll.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      Object.values(poll.options)
        .map((option) => option.value)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      poll.totalVotes.toString().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (poll) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this poll?"
    );
    if (confirmDelete) {
      setLoading(true);
      const pollId = poll.pollId;
      await fetch(`${BASE_URL}/mm/delete?type=poll&id=${pollId}`, {
        method: "POST",
      })
        .then((response) => {
          setLoading(false);
          if (response.ok) {
            setMessage({
              show: true,
              message: "Poll deleted successfully",
              type: "success",
            });
            setTimeout(async () => {
              setMessage({ show: false, message: "", type: "" });
              await fetchPolls();
              await fetchTotalPolls();
            }, 1000);
          } else {
            message("Failed to delete poll");
          }
        })
        .catch((error) => {
          console.error("Error deleting poll:", error);
          setLoading(false);
          setMessage({
            show: true,
            message: "Error deleting poll. Please try again.",
            type: "danger",
          });
          setTimeout(() => {
            setMessage({ show: false, message: "", type: "" });
          }, 1000);
        });
    }
  };

  const headers = [
    { label: "S.No", key: "sno" },
    { label: "Category Name", key: "category" },
    { label: "Question", key: "question" },
    { label: "Option A", key: "optionA" },
    { label: "Option B", key: "optionB" },
    { label: "Option C", key: "optionC" },
    { label: "Option D", key: "optionD" },
    { label: "Total Votes", key: "totalVotes" },
    { label: "Post ID", key: "id" },
  ];

  const csvData = polls.map((poll, index) => ({
    sno: index + 1,
    category: poll.category,
    question: poll.question,
    optionA: poll.options.A.value,
    optionB: poll.options.B.value,
    optionC: poll.options.C.value,
    optionD: poll.options.D.value,
    totalVotes: poll.totalVotes,
    id: poll.postId,
  }));

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.language) {
      alert("Please select language");
      return;
    }
    if (!formData.category) {
      alert("Please select category");
      return;
    }
    if (!formData.postId) {
      alert("Please enter post ID");
      return;
    }
    if (!formData.question) {
      alert("Please enter question");
      return;
    }
    if (
      !formData.options.A.value ||
      !formData.options.B.value ||
      !formData.options.C.value ||
      !formData.options.D.value
    ) {
      alert("Please enter all options");
      return;
    }
    fetch(`${BASE_URL}/mm/${isEdit ? "edit-question" : "add-question"}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then(async (data) => {
        if (data?.status === 200) {
          setMessage({ show: true, message: data.message, type: "success" });
          setTimeout(() => {
            setMessage({ show: false, message: "", type: "" });
            setShowModal(false);
            setFormData({
              question: "",
              category: "",
              postId: "",
              options: {
                A: { value: "", votes: 0 },
                B: { value: "", votes: 0 },
                C: { value: "", votes: 0 },
                D: { value: "", votes: 0 },
              },
              // status: "active",
            });
            setIsEdit(false);
          }, 1000);
          await fetchPolls();
          await fetchTotalPolls();
        } else {
          message("Failed to save poll");
        }
      })
      .catch((error) => console.error(error));
  };

  const handleEditPoll = (poll) => {
    setFormData({
      language: poll.language,
      question: poll.question,
      category: poll.category,
      postId: poll.postId,
      options: {
        A: { value: poll.options.A.value, votes: poll.options.A.votes },
        B: { value: poll.options.B.value, votes: poll.options.B.votes },
        C: { value: poll.options.C.value, votes: poll.options.C.votes },
        D: { value: poll.options.D.value, votes: poll.options.D.votes },
      },
    });
    setShowModal(true);
    setIsEdit(true);
  };

  const handlePageSizeChange = (e) => {
    setRowsPerPage(e.target.value);
    setCurrentPage(1);
  };

  const searchFunction = async (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    // setNoDataMessage("");
    // setFilteredRssData(value);
    try {
      if (value !== "") {
        const filtered = filtermethod(value);
        console.log(filtered);
        if (filtered.length === 0) {
          // setNoDataMessage("No matching rss found.");
        }
        setPolls(filtered);
      } else {
        await fetchPolls();
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const filtermethod = (value) => {
    return totalPolls.filter((poll) => {
      const question = poll.question ? poll.question.toLowerCase() : "";
      const category = poll.category ? poll.category.toLowerCase() : "";
      const options = poll.options
        ? Object.values(poll.options)
            .map((option) => option?.value || "")
            .join(" ")
            .toLowerCase()
        : "";
      const totalVotes =
        poll.totalVotes !== undefined ? poll.totalVotes.toString() : "";

      return (
        question.includes(value) ||
        category.includes(value) ||
        options.includes(value) ||
        totalVotes.includes(value)
      );
    });
  };

  return (
    <div
      className="container-fluid"
      style={{ padding: "20px", overflowX: "hidden" }}>
      <div className="row">
        <div className="col-12 d-flex justify-content-between align-items-center mt-3 flex-wrap">
          <h3 className="fs-4">Polls</h3>
          {userInfo?.roletype === 0 ? (
            <button
              className="btn btn-outline-primary mt-2 mt-md-0"
              onClick={() => {
                setFormData({
                  question: "",
                  category: "",
                  postId: "",
                  options: {
                    A: { value: "", votes: 0 },
                    B: { value: "", votes: 0 },
                    C: { value: "", votes: 0 },
                    D: { value: "", votes: 0 },
                  },
                });
                setIsEdit(false);
                setShowModal(true);
              }}
              style={{ minWidth: "100px" }}>
              Add Poll
            </button>
          ) : (
            userInfo?.permissions[6].add === 1 &&
            userInfo?.permissions[6].access === 1 && (
              <button
                className="btn btn-outline-primary mt-2 mt-md-0"
                onClick={() => {
                  setFormData({
                    question: "",
                    category: "",
                    postId: "",
                    options: {
                      A: { value: "", votes: 0 },
                      B: { value: "", votes: 0 },
                      C: { value: "", votes: 0 },
                      D: { value: "", votes: 0 },
                    },
                  });
                  setIsEdit(false);
                  setShowModal(true);
                }}
                style={{ minWidth: "100px" }}>
                Add Poll
              </button>
            )
          )}
        </div>
        {message.show && (
          <div
            className={`message message-${message.type} message-dismissible fade show mt-3`}
            role="message">
            {message.message}
            <button
              type="button"
              className="btn-close"
              onClick={() =>
                setMessage({ show: false, message: "", type: "" })
              }></button>
          </div>
        )}
        <div className="card shadow custom-shadow mt-3">
          <div className="card-body d-flex flex-column">
            <div
              className="d-flex justify-content-between align-items-center mt-3 flex-wrap"
              style={{
                width: "100%",
                margin: "auto",
                gap: "10px",
              }}>
              {/* Download CSV Button - Left Aligned */}
              <CSVLink
                data={csvData}
                headers={headers}
                filename={"polls.csv"}
                className="btn btn-outline-success text-dark mt-2 mt-md-0"
                target="_blank"
                style={{
                  minWidth: "150px",
                  marginRight: "auto", // Push to the left
                }}>
                Download CSV
              </CSVLink>

              {/* Right Side: Search and Rows Per Page */}
              <div
                className="d-flex align-items-center mt-2 mt-md-0 flex-wrap justify-content-end"
                style={{
                  gap: "15px",
                  flexGrow: 1, // Takes available space
                  maxWidth: "600px", // Prevents excessive stretching
                }}>
                {/* Search Box */}
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={searchFunction}
                  style={{
                    flexGrow: 1, // Allow it to expand
                    minWidth: "200px",
                    maxWidth: "300px",
                  }}
                />

                {/* Rows Per Page Selector */}
                <div className="d-flex align-items-center">
                  <label
                    className="fw-bold me-2"
                    style={{ whiteSpace: "nowrap" }}>
                    Rows per page:
                  </label>
                  <select
                    className="form-control"
                    value={rowsPerPage}
                    onChange={handlePageSizeChange}
                    style={{
                      minWidth: "80px",
                      maxWidth: "100px",
                      textAlign: "center",
                    }}>
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={15}>15</option>
                    <option value={30}>30</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="row m-3">
              <div className="col-12 d-flex justify-content-end fw-bold">
                Showing {rowsPerPage * (currentPage - 1) + 1}-
                {rowsPerPage * currentPage > totalPolls.length
                  ? totalPolls.length
                  : rowsPerPage * currentPage}{" "}
                of {totalPolls.length} Polls
              </div>
            </div>
            <div className="col-12">
              {loading ? (
                <div
                  className="d-flex justify-content-center align-items-center"
                  style={{ minHeight: "60vh" }}>
                  <FadeLoader loading={loading} />
                </div>
              ) : (
                <>
                  <div
                    className="table-responsive rounded shadow"
                    style={{
                      maxHeight: "60vh",
                      overflowY: "auto",
                      scrollbarWidth: "thin",
                    }}>
                    <table className="table table-hover table-bordered">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>Category Name</th>
                          <th>Question</th>
                          <th>Options</th>
                          <th>Total Votes</th>
                          {userInfo?.roletype === 0 ? (
                            <th>Actions</th>
                          ) : (
                            (userInfo?.permissions[6].edit === 1 ||
                              userInfo?.permissions[6].delete === 1) &&
                            userInfo.permissions[6].access === 1 && (
                              <th>Actions</th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {polls.map((poll, index) => (
                          <tr key={index}>
                            <td>
                              {index + 1 + (currentPage - 1) * rowsPerPage}
                            </td>
                            <td>{poll.category}</td>
                            <td>{poll.question}</td>
                            <td>
                              <ul>
                                {Object.values(poll.options).map(
                                  (option, i) => (
                                    <li key={i}>{option.value}</li>
                                  )
                                )}
                              </ul>
                            </td>
                            <td>{poll.totalVotes}</td>
                            {userInfo?.roletype === 0 ? (
                              <td className="d-flex">
                                <button
                                  className="btn btn-outline-secondary btn-sm m-1"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent row click event
                                    handleEditPoll(poll);
                                  }}>
                                  <i className="bi bi-pencil-square m-1 text-dark"></i>
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm m-1"
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevent row click event
                                    handleDelete(poll);
                                  }}>
                                  <i className="bi bi-trash m-1 text-danger ">
                                    {" "}
                                  </i>
                                </button>
                              </td>
                            ) : (
                              (userInfo?.permissions[6].edit === 1 ||
                                userInfo?.permissions[6].delete === 1) &&
                              userInfo.permissions[6].access === 1 && (
                                <td className="d-flex">
                                  {userInfo?.permissions[6].edit === 1 &&
                                    userInfo?.permissions[6].access === 1 && (
                                      <button
                                        className="btn btn-outline-secondary btn-sm m-1"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent row click event
                                          handleEditPoll(poll);
                                        }}>
                                        <i className="bi bi-pencil-square m-1 text-dark"></i>
                                      </button>
                                    )}
                                  {userInfo?.permissions[6].delete === 1 &&
                                    userInfo?.permissions[6].access === 1 && (
                                      <button
                                        className="btn btn-outline-danger btn-sm m-1"
                                        onClick={(e) => {
                                          e.stopPropagation(); // Prevent row click event
                                          handleDelete(poll);
                                        }}>
                                        <i className="bi bi-trash m-1 text-danger ">
                                          {" "}
                                        </i>
                                      </button>
                                    )}
                                </td>
                              )
                            )}
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
                            Math.ceil(totalPolls.length / rowsPerPage)
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
          style={{
            background: "rgba(0, 0, 0, 0.2)", // Dark overlay for focus
            backdropFilter: "blur(1px)", // Subtle blur effect
          }}>
          <div className="modal-dialog modal-md">
            {" "}
            {/* Bigger modal for better UX */}
            <div className="modal-content shadow-lg rounded-3">
              {/* Modal Header */}
              <div className="modal-header">
                <h5 className="modal-title">
                  {isEdit ? "Edit Poll" : "Create Poll"}
                </h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}></button>
              </div>

              {/* Modal Body */}
              <form
                className="modal-body p-4"
                style={{
                  maxHeight: "70vh", // Scrollable content
                  overflowY: "auto",
                }}>
                <div className="mb-3">
                  <label htmlFor="language" className="form-label fw-bold">
                    Language
                  </label>
                  <select
                    className="form-select"
                    id="language"
                    required
                    value={formData.language}
                    onChange={(e) =>
                      setFormData({ ...formData, language: e.target.value })
                    }>
                    <option value={0}>Select Language</option>
                    <option value={1}>English</option>
                    <option value={2}>Hindi</option>
                    <option value={3}>Telugu</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="pollCategory" className="form-label fw-bold">
                    Category
                  </label>
                  <select
                    className="form-select"
                    id="pollCategory"
                    required
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }>
                    <option value="">Select Category</option>
                    {filteredCategories.map((category, index) => (
                      <option value={category.categoryName} key={index}>
                        {category.categoryName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mb-3">
                  <label htmlFor="pollPostId" className="form-label fw-bold">
                    Post ID
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="pollPostId"
                    required
                    placeholder="Enter post ID"
                    value={formData.postId}
                    onChange={(e) =>
                      setFormData({ ...formData, postId: e.target.value })
                    }
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="pollQuestion" className="form-label fw-bold">
                    Question
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="pollQuestion"
                    required
                    placeholder="Enter poll question"
                    value={formData.question}
                    onChange={(e) =>
                      setFormData({ ...formData, question: e.target.value })
                    }
                  />
                </div>

                {Object.entries(formData.options).map(
                  ([key, option], index) => (
                    <div className="mb-3" key={index}>
                      <label
                        htmlFor={`option${key}`}
                        className="form-label fw-bold">
                        Option {key}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id={`option${key}`}
                        required
                        placeholder={`Enter option ${key}`}
                        value={option.value}
                        onChange={(e) => {
                          const updatedOptions = { ...formData.options };
                          updatedOptions[key].value = e.target.value;
                          setFormData({ ...formData, options: updatedOptions });
                        }}
                      />
                    </div>
                  )
                )}
              </form>

              {/* Modal Footer */}
              <div className="modal-footer bg-light">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-3"
                  onClick={() => setShowModal(false)}>
                  Close
                </button>
                <button
                  className="btn btn-primary px-4"
                  onClick={handleFormSubmit}>
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Polls;
