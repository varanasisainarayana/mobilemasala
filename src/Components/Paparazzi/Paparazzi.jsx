import React, { useState, useEffect } from "react";
import ReactTable from "react-table-6";
import "react-table-6/react-table.css";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../../config";

const Paparazzi = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(15);
  const [totalPosts, setTotalPosts] = useState(0);
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${BASE_URL}`);
        const apiPosts = await response.json();

        // Map the API data to the format expected by the table
        const formattedPosts = apiPosts.map((post, index) => ({
          postid: post.postid,
          categoryname: post.categoryid ? post.categoryid : "N/A", // Assuming categoryid needs to be mapped to categoryname
          posttitle: post.posttitle ? post.posttitle : "Untitled", // Fallback if posttitle is null
          rssname: post.rssid ? post.rssid : "N/A", // Assuming rssid needs to be mapped to rssname
          status: post.status ? post.status : "pending", // Fallback if status is null
          created_at: post.created_at ? post.created_at : "N/A",
          published_date: post.published_date ? post.published_date : "N/A",
          updated_at: post.updated_at ? post.updated_at : "N/A",
          postlink: post.postlink ? post.postlink : "#",
        }));
        setPosts(formattedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    fetchPosts();
  }, []);

  const navigate = useNavigate();

  const redirectToAdds = () => {
    navigate("/addpost");
  };

  const columns = [
    {
      Header: "S.No",
      accessor: "postid",
    },
    {
      Header: "Category Name",
      accessor: "categoryname",
    },
    {
      Header: "Post Title",
      accessor: "posttitle",
    },
    {
      Header: "RSS Name",
      accessor: "rssname",
    },
    {
      Header: "Status",
      accessor: "status",
      Cell: ({ value }) => (
        <div
          className={`badge ${
            value === "Publish" ? "bg-success" : "bg-danger"
          }`}>
          {value}
        </div>
      ),
    },
    {
      Header: "Received on",
      accessor: "created_at",
    },
    {
      Header: "Published on",
      accessor: "published_date",
    },
    {
      Header: "Edited on",
      accessor: "updated_at",
    },
    {
      Header: "View",
      accessor: "postlink",
      Cell: ({ value }) => (
        <a href={value} target="_blank" rel="noopener noreferrer">
          <i className="bi bi-eye-slash"></i>
        </a>
      ),
    },
    {
      Header: "Action",
      accessor: "postid",
      Cell: ({ value }) => (
        <div>
          <button
            className="btn me-2"
            onClick={() => navigate(`/posts2/${value}`)}>
            <i className="bi bi-pencil-square"></i>
          </button>
          <button className="btn me-2">
            <i className="bi bi-trash3"></i>
          </button>
        </div>
      ),
    },
  ];
  const [filterdata, setFiltereddata] = useState("");
  const Searchfunction = (e) => {
    const value = e.target.value;
    setFiltereddata(value);
    if (value !== "") {
      setPosts(filtermethod(value));
    }
  };
  const filtermethod = (value) => {
    return posts.filter((item) => item.posttitle.includes(value));
  };
  console.log(posts);
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="d-flex justify-content-between mt-5 px-4">
          <h4> Videos </h4>
          <button className="btn btn-info text-light" onClick={redirectToAdds}>
            Add New
          </button>
        </div>
        <div className="content-page">
          <div className="content">
            <div className="container-fluid">
              <div className="page-title-box pt-2">
                {/* ... (page title and buttons) */}
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="card">
                    <div className="card-body">
                      <div className="row bg-info p-2 my-2">
                        <div className="col">
                          <h5 className="text-center">Filters:</h5>
                        </div>
                        <div className="form-group col">
                          <select id="inputState1" className="form-control">
                            <option defaultValue>Choose...</option>
                            <option>Fashion</option>
                          </select>
                        </div>
                        <div className="col form-group">
                          <select id="inputState2" className="form-control">
                            <option defaultValue>Choose...</option>
                            <option>Fashion</option>
                          </select>
                        </div>
                        <div className="col form-group">
                          <select id="inputState3" className="form-control">
                            <option defaultValue>Choose...</option>
                            <option>Fashion</option>
                          </select>
                        </div>
                        <button className="btn btn-warning text-dark col">
                          Submit
                        </button>
                      </div>
                      <div className="row my-3">
                        <div className="col-md-6">
                          <button className="btn btn-info text-light">
                            <i className="fas fa-file-csv"></i> Export CSV
                          </button>
                        </div>
                        <div className="col-md-4 text-right">
                          <div className="form-group">
                            <input
                              type="text"
                              placeholder="Search..."
                              className="form-control"
                              // Implement search functionality here
                              onChange={Searchfunction}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="postsrow">
                        <ReactTable
                          data={posts}
                          columns={columns}
                          pageSizeOptions={[5, 10, 20, 25, 50]}
                          defaultPageSize={5}
                          className="-striped -highlight"
                        />
                      </div>
                      <div className="row">
                        <div className="col">
                          <div className="d-flex justify-content-center align-content-center m-2">
                            <button
                              disabled={currentPage === 0}
                              onClick={() => setCurrentPage(currentPage - 1)}>
                              Prev
                            </button>
                            <span className="m-1">
                              {currentPage + 1} of{" "}
                              {Math.ceil(totalPosts / pageSize)}
                            </span>
                            <button
                              disabled={
                                currentPage >=
                                Math.ceil(totalPosts / pageSize) - 1
                              }
                              onClick={() => setCurrentPage(currentPage + 1)}>
                              Next
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Paparazzi;
