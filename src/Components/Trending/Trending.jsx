import React, { useEffect, useState } from "react";
import { CSVLink } from "react-csv";
import { BASE_URL } from "../../config";
import { FadeLoader } from "react-spinners";
import { useAuth } from "../../Context/AuthContext";
import { useNavigate } from "react-router-dom";
// import { set } from "jodit/types/core/helpers";

// const trendingNewsData = [
//   {
//     categoryName: 'Movies',
//     postTitle: "Vijay Antony's next titled Gagana Maargan; first look and all details here",
//     rssName: 'OTT (HT, Mint, DM)',
//     status: 'Publish',
//     publishedOn: '16-10-2024 14:25:23',
//   },
//   {
//     categoryName: 'Film Gossip',
//     postTitle: 'National Crush Rashmika Mandanna is now Brand Ambassador for Indian Cyber Crime Coordination I4C',
//     rssName: 'Own Post',
//     status: 'Publish',
//     publishedOn: '16-10-2024 12:57:38',
//   },
//   {
//     categoryName: 'Film Gossip',
//     postTitle: 'लाइव शो में प्रियंका चोपड़ा के पति को महसूस हुआ खतरा, स्टेज से भागे निक जोनस, वीडियो वायरल',
//     rssName: 'Manoranjan Hindi',
//     status: 'Publish',
//     publishedOn: '16-10-2024 12:57:28',
//   },
//   {
//     categoryName: 'Film Gossip',
//     postTitle: 'भड़कीं दिव्या खोसला, बोलीं- मिस्टर करण जौहर मुझे चुप कराने के लिए…',
//     rssName: 'Manoranjan Hindi',
//     status: 'Publish',
//     publishedOn: '16-10-2024 12:55:13',
//   },
//   {
//     categoryName: 'Film Gossip',
//     postTitle: 'ఇండియన్ సైబర్ క్రైమ్ కోఆర్డినేషన్ బ్రాండ్ అంబాసిడర్ గా ఎంపికైన నేషనల్ క్రష్ రష్మిక మందన్న',
//     rssName: 'Own Post',
//     status: 'Publish',
//     publishedOn: '16-10-2024 12:52:56',
//   },
//   {
//     categoryName: 'Film Gossip',
//     postTitle: 'సినిమా టికెట్ ధరలపై ఉప ముఖ్యమంత్రి శ్రీ పవన్ కళ్యాణ్ తో చర్చ',
//     rssName: 'Own Post',
//     status: 'Publish',
//     publishedOn: '16-10-2024 12:40:58',
//   },
//   {
//     categoryName: 'Movies',
//     postTitle: "'త్రిముఖ' మోషన్ పోస్టర్ ఆవిష్కరించిన హీరో సాయి ధరమ్ తేజ్",
//     rssName: 'Own Post',
//     status: 'Publish',
//     publishedOn: '16-10-2024 12:33:36',
//   },
//   {
//     categoryName: 'Movies',
//     postTitle: 'HBD Prithviraj Sukumaran: L2 Empuraan makers unveil Zayed Masood\'s character poster from Mohanlal starrer',
//     rssName: 'OTT (HT, Mint, DM)',
//     status: 'Publish',
//     publishedOn: '16-10-2024 10:24:45',
//   },
//   {
//     categoryName: 'Film Gossip',
//     postTitle: 'Aishwarya Rai fans roast content creator who ‘made fun of’ actor’s style and love for Aaradhya: ‘The audacity…’',
//     rssName: 'Hindustan Times',
//     status: 'Publish',
//     publishedOn: '16-10-2024 10:19:27',
//   },
//   {
//     categoryName: 'Movies',
//     postTitle: 'Suriya 45 update: Suriya and RJ Balaji’s project’s genre, shoot plans, and all you need to know',
//     rssName: 'OTT (HT, Mint, DM)',
//     status: 'Publish',
//     publishedOn: '16-10-2024 10:09:08',
//   },
// ];

const Trending = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [trendingNewsData, setTrendingNewsData] = useState([]);
  const [totalTrendingNewsData, setTotalTrendingNewsData] = useState([]);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [newsPerPage, setNewsPerPage] = useState(200);
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchNews();
  }, [currentPage, newsPerPage]);

  const fetchNews = () => {
    setLoading(true);
    fetch(`${BASE_URL}/mm/gettrending?page=${currentPage}&size=${newsPerPage}`)
      .then((response) => response.json())
      .then((data) => {
        setTrendingNewsData(data?.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  const fetchTotalNews = () => {
    setLoading(true);
    fetch(`${BASE_URL}/mm/gettrending`)
      .then((response) => response.json())
      .then((data) => {
        setTotalTrendingNewsData(data?.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTotalNews();
  }, []);

  const filteredTrendingNewsData = trendingNewsData.filter(
    (news) =>
      news.postTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      news.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      new Date(news.createdAt).toLocaleDateString().includes(searchTerm) ||
      (news.status === 1 ? "active" : "inactive").includes(searchTerm)
  );

  const handleAlertClose = () => {
    setAlert({ show: false, message: "", type: "" });
  };

  const displaymethod = (item) => {
    window.open(
      `https://dev.mobilemasala.com/${item.categoryUrl}/${item.postUrl}`,
      "_blank"
    );
  };

  const handleDeleteposts = (item) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (confirmDelete) {
      const postId = item.postId;

      console.log(postId);
      fetch(`${BASE_URL}/mm/delete?type=article&id=${postId}`, {
        method: "POST",
      })
        .then((response) => {
          if (response.ok) {
            setAlert({
              show: true,
              message: "Delete Success",
              type: "success",
            });
            setTimeout(() => {
              setAlert({ show: false, message: "", type: "" });
              fetchNews();
              fetchTotalNews();
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
        setTrendingNewsData(filtered);
      } else {
        fetchNews();
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const filtermethod = (value) => {
    return totalTrendingNewsData.filter(
      (news) =>
        news.postTitle.toLowerCase().includes(value) ||
        news.categoryName.toLowerCase().includes(value) ||
        new Date(news.createdAt).toLocaleDateString().includes(value) ||
        (news.status === 1 ? "active" : "inactive").includes(value)
    );
  };

  const handlePageSizeChange = (e) => {
    setNewsPerPage(e.target.value);
    setCurrentPage(1);
  };

  return (
    <section className="container-fluid m-auto p-auto">
      <div className="row">
        <div className="col-12 shadow m-auto">
          <h3 className="fs-4 m-4">Trending News</h3>

          {/* Search Input and CSV Download Button */}

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
          {loading ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ minHeight: "60vh" }}>
              <FadeLoader size={50} color={"#123abc"} loading={loading} />
              <span className="ms-2">Loading...</span>
            </div>
          ) : (
            <>
              <div className="card shadow  custom-shadow">
                <div className="card-body">
                  <div className="d-flex justify-content-between mb-3">
                    <CSVLink
                      data={trendingNewsData}
                      filename={"trending_news_data.csv"}
                      className="btn btn-outline-success text-dark"
                      target="_blank">
                      Download CSV
                    </CSVLink>
                    <input
                      type="text"
                      className="form-control me-2 w-50"
                      placeholder="Search..."
                      // value={searchTerm}
                      onChange={searchFunction}
                    />
                    {/* <div className="form-group col-4 d-flex align-items-center">
                                <label className="form-label mb-0 me-2 fw-bold">
                                  Rows per page:{" "}
                                </label>
                                <select
                                  className="form-control"
                                  value={newsPerPage}
                                  onChange={handlePageSizeChange}>
                                  <option value={50}>50</option>
                                  <option value={100}>100</option>
                                  <option value={200}>200</option>
                                  <option value={300}>300</option>
                                  <option value={500}>500</option>
                                  <option value={1000}>1000</option>

                                </select>
                              </div> */}
                  </div>
                  {/* <div className="row m-3">
                    <div className="col-12 d-flex justify-content-end fw-bold">
                      Showing {newsPerPage * (currentPage - 1) + 1}-
                      {newsPerPage * currentPage > totalTrendingNewsData.length
                        ? totalTrendingNewsData.length
                        : newsPerPage * currentPage}{" "}
                      of {totalTrendingNewsData.length}
                    </div>
                  </div> */}
                  <div
                    className="table-responsive rounded  shadow"
                    style={{ maxHeight: "70vh", overflowY: "auto" }}>
                    <table className="table table-bordered table-hover">
                      <thead>
                        <tr>
                          <th>S.No</th>
                          <th>CategoryName</th>
                          <th>PostTitle</th>
                          <th>Status</th>
                          <th>Published</th>
                          <th>View</th>
                          {userInfo?.roletype === 0 ? (
                            <th>Action</th>
                          ) : (
                            userInfo?.permissions[3].delete === 1 &&
                            userInfo?.permissions[3].access === 1 && (
                              <th>Action</th>
                            )
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {trendingNewsData.map((news, index) => (
                          <tr key={index}>
                            <td>
                              {index + 1 + (currentPage - 1) * newsPerPage}
                            </td>
                            <td>{news.categoryName}</td>
                            <td className="wrap">{news.postTitle}</td>
                            {/* <td>{news.rssName}</td> */}
                            <td>
                              <div
                                className={`${
                                  news.status === 1 ? "bg-success" : "bg-danger"
                                } badge`}>
                                {news.status === 1 ? "Active" : "Inactive"}
                              </div>
                            </td>
                            <td>
                              {new Date(news.createdAt).toLocaleDateString()}{" "}
                            </td>
                            <td>
                              {/* View button (link to view more details can be added) */}
                              <button
                                className="btn btn-success"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent row click event
                                  displaymethod(news);
                                }}>
                                <i className="bi bi-eye"></i>
                              </button>
                            </td>
                            {userInfo?.roletype === 0 ? (
                              <td
                                className="d-flex"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteposts(news);
                                }}>
                                <button className="btn btn-outline-danger ">
                                  Remove
                                </button>
                              </td>
                            ) : (
                              userInfo?.permissions[3].delete === 1 &&
                              userInfo?.permissions[3].access === 1 && (
                                <td
                                  className="d-flex"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteposts(news);
                                  }}>
                                  <button className="btn btn-outline-danger ">
                                    Remove
                                  </button>
                                </td>
                              )
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* <div className="row">
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
                            currentPage >= Math.ceil(totalTrendingNewsData.length / newsPerPage) - 1
                          }
                          onClick={() =>
                            setCurrentPage((prevPage) => prevPage + 1)
                          }
                          className="btn btn-outline-info px-3">
                          Next
                        </button>
                      </div> */}
                  {/* </div> */}
                  {/* </div> */}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Trending;
