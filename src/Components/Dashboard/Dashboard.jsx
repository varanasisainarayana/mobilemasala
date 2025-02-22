import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../config";
import { useAuth } from "../../Context/AuthContext";
import { useStores } from "../../store";
import { FadeLoader } from "react-spinners";
import { useObserver } from "mobx-react";

const Dashboard = () => {
  const [counts, setCounts] = useState({});
  const { userInfo } = useAuth();
  const { AuthStore } = useStores();

  useEffect(() => {
    AuthStore.setUser(userInfo);

    if (!AuthStore.loading) {
      const queryParam =
        AuthStore.user?.roletype === 1 || userInfo?.roletype === 1
          ? `?type=${AuthStore.user?.username || userInfo.username}`
          : "?type=admin";

      fetch(`${BASE_URL}/mm/getallcounts${queryParam}`)
        .then((res) => res.json())
        .then((data) => setCounts(data?.data))
        .catch((error) => console.error(error));
    }
  }, [AuthStore.loading, userInfo, AuthStore]);

  const renderCard = (title, count, bgColor, imgSrc) => (
    <div className="col-md-3 col-sm-6 mb-3">
      <div
        className={`rounded-2 p-3 text-light shadow ${bgColor} d-flex justify-content-between align-items-center`}>
        <img
          src={imgSrc}
          alt="logo"
          style={{ height: "50px", width: "50px" }}
        />
        <div>
          <h4 className="text-center">{title}</h4>
          <h5 className="text-center">{count}</h5>
        </div>
      </div>
    </div>
  );

  return useObserver(() => (
    <>
      {AuthStore.loading || !counts ? (
        <div
          className="d-flex justify-content-center align-items-center"
          style={{ minHeight: "60vh" }}>
          <FadeLoader size={50} color={"#123abc"} loading={AuthStore.loading} />
          <span className="ms-2">Loading...</span>
        </div>
      ) : (
        <div className="container my-5">
          <div className="mb-4">
            <h3 className="fs-4">Dashboard</h3>
            <p>Welcome to Mobile Masala</p>
          </div>
          <div className="row">
            {userInfo?.roletype === 0 || AuthStore.user?.roletype === 0 ? (
              <>
                {renderCard(
                  "Posts",
                  counts?.postsCount,
                  "bg-warning",
                  "../01.png"
                )}
                {renderCard(
                  "Videos",
                  counts?.videosCount,
                  "bg-primary",
                  "../01.png"
                )}
                {renderCard(
                  "Visual Stories",
                  counts?.visualStoriesCount,
                  "bg-info",
                  "../02.png"
                )}
                {renderCard(
                  "Rss Details",
                  counts?.rssCount,
                  "bg-success",
                  "../02.png"
                )}
                {renderCard(
                  "Categories",
                  counts?.categoryCount,
                  "bg-danger",
                  "../02.png"
                )}
                {renderCard(
                  "Polls",
                  counts?.pollsCount,
                  "bg-secondary",
                  "../02.png"
                )}
              </>
            ) : (
              <>
                {(AuthStore.user?.permissions[0]?.add === 1 ||
                  AuthStore.user?.permissions[0]?.edit === 1 ||
                  AuthStore.user?.permissions[0]?.delete === 1 ||
                  AuthStore.user?.permissions[0]?.access === 1 ||
                  userInfo?.permissions[0]?.add === 1 ||
                  userInfo?.permissions[0]?.edit === 1 ||
                  userInfo?.permissions[0]?.delete === 1 ||
                  userInfo?.permissions[0]?.access === 1) &&
                  renderCard(
                    "Posts",
                    counts?.postsCount,
                    "bg-warning",
                    "../01.png"
                  )}
                {(AuthStore.user?.permissions[4]?.add === 1 ||
                  AuthStore.user?.permissions[4]?.edit === 1 ||
                  AuthStore.user?.permissions[4]?.delete === 1 ||
                  AuthStore.user?.permissions[4]?.access === 1 ||
                  userInfo?.permissions[4]?.add === 1 ||
                  userInfo?.permissions[4]?.edit === 1 ||
                  userInfo?.permissions[4]?.delete === 1 ||
                  userInfo?.permissions[4]?.access === 1) &&
                  renderCard(
                    "Videos",
                    counts?.videosCount,
                    "bg-primary",
                    "../01.png"
                  )}
                {(AuthStore.user?.permissions[2]?.add === 1 ||
                  AuthStore.user?.permissions[2]?.edit === 1 ||
                  AuthStore.user?.permissions[2]?.delete === 1 ||
                  AuthStore.user?.permissions[2]?.access === 1 ||
                  userInfo?.permissions[2]?.add === 1 ||
                  userInfo?.permissions[2]?.edit === 1 ||
                  userInfo?.permissions[2]?.delete === 1 ||
                  userInfo?.permissions[2]?.access === 1) &&
                  renderCard(
                    "Visual Stories",
                    counts?.visualStoriesCount,
                    "bg-info",
                    "../02.png"
                  )}
                {(AuthStore.user?.permissions[1]?.add === 1 ||
                  AuthStore.user?.permissions[1]?.edit === 1 ||
                  AuthStore.user?.permissions[1]?.delete === 1 ||
                  AuthStore.user?.permissions[1]?.access === 1 ||
                  userInfo?.permissions[1]?.add === 1 ||
                  userInfo?.permissions[1]?.edit === 1 ||
                  userInfo?.permissions[1]?.delete === 1 ||
                  userInfo?.permissions[1]?.access === 1) &&
                  renderCard(
                    "Rss Details",
                    counts?.rssCount,
                    "bg-success",
                    "../02.png"
                  )}
                {(AuthStore.user?.permissions[5]?.add === 1 ||
                  AuthStore.user?.permissions[5]?.edit === 1 ||
                  AuthStore.user?.permissions[5]?.delete === 1 ||
                  AuthStore.user?.permissions[5]?.access === 1 ||
                  userInfo?.permissions[5]?.add === 1 ||
                  userInfo?.permissions[5]?.edit === 1 ||
                  userInfo?.permissions[5]?.delete === 1 ||
                  userInfo?.permissions[5]?.access === 1) &&
                  renderCard(
                    "Categories",
                    counts?.categoryCount,
                    "bg-danger",
                    "../02.png"
                  )}
                {(AuthStore.user?.permissions[6]?.add === 1 ||
                  AuthStore.user?.permissions[6]?.edit === 1 ||
                  AuthStore.user?.permissions[6]?.delete === 1 ||
                  AuthStore.user?.permissions[6]?.access === 1 ||
                  userInfo?.permissions[6]?.add === 1 ||
                  userInfo?.permissions[6]?.edit === 1 ||
                  userInfo?.permissions[6]?.delete === 1 ||
                  userInfo?.permissions[6]?.access === 1) &&
                  renderCard(
                    "Polls",
                    counts?.pollsCount,
                    "bg-secondary",
                    "../02.png"
                  )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  ));
};

export default Dashboard;
