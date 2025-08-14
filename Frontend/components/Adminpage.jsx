import React, { useState, useEffect } from "react";
import api from "../pages/Feedsense/apiService";

import EmotionChart from "../charts/EmotionChart";
import FeedbackGraph from "../charts/FeedbackGraph";
import Feedbackloc from "../charts/Feedbackloc";




const Adminpage = () => {
    const [loading, setLoading] = useState(true);
    const [FeedbackData, setFeedbackData] = useState([]);

    const [ratingSummary, setRatingSummary] = useState({
        "😡": 0,
        "😕": 0,
        "😐": 0,
        "🙂": 0,
        "😍": 0,
        total: 0,
    });

    useEffect(() => {
        const fetchRatings = async () => {
            try {
                const res = await api.get("/api/feedback/ratings-summary");
                setRatingSummary(res.data);
            } catch (err) {
                console.error("Error fetching ratings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchRatings();
    }, []);

    const cards = [
        { label: "Very Bad", icon: "😡", color: "bg-red" },
        { label: "Bad", icon: "😕", color: "bg-orange" },
        { label: "Neutral", icon: "😐", color: "bg-yellow" },
        { label: "Good", icon: "🙂", color: "bg-green" },
        { label: "Excellent", icon: "😍", color: "bg-purple" },
        { label: "Total", icon: "📊", color: "bg-blue" },
    ];

    return (
        <div className="page-body">
            <div className="container-fluid">
                {/* Small subheading */}
                <div className="row mb-1">
                    <div className="col">
                        <h6 className="text-muted mb-0">Overall Rating</h6>
                    </div>
                </div>

                {/* Cards */}
                <div className="row">
                    {cards.map((c, idx) => (
                        <div key={idx} className="col-sm-6 col-lg-2 mb-2">
                            <div className="card card-sm p-2">
                                <div className="card-body p-2">
                                    <div className="row align-items-center">
                                        <div className="col-auto">
                                            <span className={`${c.color} text-white avatar`}>
                                                {c.icon}
                                            </span>
                                        </div>
                                        <div className="col">
                                            <div className="font-weight-medium">
                                                {loading
                                                    ? "Loading..."
                                                    : idx === 5
                                                        ? ratingSummary.total
                                                        : ratingSummary[c.icon]}
                                            </div>
                                            <div className="text-secondary">{c.label}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            <div className="row" style={{ alignItems: "stretch" }}>
                {/* Emotions Card */}
                <div className="col-lg-6" style={{ display: "flex" }}>
                    <div className="card" style={{ flex: 1 }}>
                        <div className="card-body" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <h3 className="card-title">Emotions</h3>
                            </div>
                            <div className="ratio ratio-21x9" style={{ flexGrow: 1 }}>
                                <EmotionChart />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feedback Activity Card */}
                <div className="col-lg-6" style={{ display: "flex" }}>
                    <div className="card" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        <div className="card-header border-0">
                            <div className="card-title">Feedback Activity</div>
                        </div>
                        <div className="position-relative" style={{ flexShrink: 0 }}>
                            <div className="position-absolute top-0 left-0 px-3 mt-1 w-75">
                                <div className="row g-2">
                                    <div className="col-auto">
                                        <div
                                            className="chart-sparkline chart-sparkline-square"
                                            id="sparkline-activity"
                                        />
                                    </div>
                                </div>
                            </div>
                            <FeedbackGraph setFeedbackData={setFeedbackData} />
                        </div>

                        {/* Scrollable Table */}
                        <div
                            className="card-table table-responsive"
                            style={{
                                flexGrow: 1,
                                overflowY: "auto",
                                maxHeight: "100%",
                            }}
                        >
                            <table className="table table-vcenter">
                                <thead>
                                    <tr>
                                        <th></th>
                                        <th>User</th>
                                        <th>Count</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {FeedbackData && FeedbackData.length > 0 ? (
                                        FeedbackData.map((sale, index) => (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td className="td-truncate">
                                                    <div className="text-truncate">
                                                        {sale.name || "System Entry"}
                                                    </div>
                                                </td>
                                                <td className="text-nowrap text-secondary">
                                                    {sale.total_count}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="4" className="text-center text-secondary">
                                                No Feedbacks
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
  <div className="col-lg-12">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <h3 className="card-title">FeedBack Locations</h3>
                </div>
                <div className="ratio ratio-21x9">
                  <Feedbackloc />
                </div>
              </div>
            </div>
          </div>



        </div>
    );
};

export default Adminpage;
