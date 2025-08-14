import React, { useState, useEffect } from "react";
import { FaFilter, FaFileExcel, FaSearch } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import * as XLSX from "xlsx";
import DataTable from "react-data-table-component";
import "react-toastify/dist/ReactToastify.css";
import api from "./apiService";

export default function Allfeedback() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterName, setFilterName] = useState("");
  const [filterEmotion, setFilterEmotion] = useState("");
  const [nameOptions, setNameOptions] = useState([]);
  const [emotionOptions, setEmotionOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/api/feedback/allfeedback", {
        params: { from_date: fromDate, to_date: toDate },
      });

      if (res.data.success && res.data.data.length > 0) {
        let data = res.data.data;

        // Populate dropdown options (unique names & emotions)
        const uniqueNames = [...new Set(data.map((f) => f.name).filter(Boolean))];
        const uniqueEmotions = [
          ...new Set(data.map((f) => f.emotion).filter(Boolean)),
        ];

        setNameOptions(uniqueNames);
        setEmotionOptions(uniqueEmotions);

        // Apply filters if set
        if (filterName) {
          data = data.filter((f) =>
            f.name?.toLowerCase().includes(filterName.toLowerCase())
          );
        }
        if (filterEmotion) {
          data = data.filter(
            (f) => f.emotion?.toLowerCase() === filterEmotion.toLowerCase()
          );
        }

        setFeedbacks(data);
        setFilteredResults(data);
      } else {
        setFeedbacks([]);
        setFilteredResults([]);
        setNameOptions([]);
        setEmotionOptions([]);
        toast.warning("No feedback records found", { position: "top-center" });
      }
    } catch {
      toast.error("Error fetching report", { position: "top-center" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredResults(feedbacks);
    } else {
      setFilteredResults(
        feedbacks.filter(
          (f) =>
            f.feedback_text?.toLowerCase().includes(query.toLowerCase()) ||
            f.usage_frequency?.toLowerCase().includes(query.toLowerCase()) ||
            f.primary_purpose?.toLowerCase().includes(query.toLowerCase()) ||
            f.name?.toLowerCase().includes(query.toLowerCase()) ||
            f.email?.toLowerCase().includes(query.toLowerCase()) ||
            f.mobile?.toLowerCase().includes(query.toLowerCase()) ||
            f.emotion?.toLowerCase().includes(query.toLowerCase()) // Added emotion
        )
      );
    }
  };

  const exportToExcel = () => {
    if (filteredResults.length === 0) {
      toast.warning("No data to export", { position: "top-center" });
      return;
    }

    const exportData = filteredResults.map((row) => ({
      Date: new Date(
        new Date(row.CreatedAt).getTime() + (5 * 60 + 30) * 60000
      ).toLocaleString(),
      Name: row.name,
      Email: row.email,
      Mobile: row.mobile,
      Frequency: row.usage_frequency,
      Purpose: row.primary_purpose,
      "Ease of Use": row.ease_of_use,
      Speed: row.speed_performance,
      "Feature Quality": row.feature_quality,
      Support: row.customer_support,
      Overall: row.overall_rating,
      Emotion: row.emotion,
      Feedback: row.feedback_text,
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Allfeedback");
    XLSX.writeFile(wb, `Feedback_Report_${Date.now()}.xlsx`);
  };

  const columns = [
    {
      name: "Date",
      selector: (row) =>
        new Date(
          new Date(row.CreatedAt).getTime() + (5 * 60 + 30) * 60000
        ).toLocaleString(),
      sortable: true,
      width: "160px",
    },
    { name: "Name", selector: (row) => row.name, sortable: true, width: "150px" },
    { name: "Email", selector: (row) => row.email, sortable: true, width: "200px" },
    { name: "Mobile", selector: (row) => row.mobile, sortable: true, width: "150px" },
    { name: "Frequency", selector: (row) => row.usage_frequency, width: "120px" },
    { name: "Purpose", selector: (row) => row.primary_purpose, width: "150px" },
    { name: "Ease of Use", selector: (row) => row.ease_of_use, width: "120px" },
    { name: "Speed", selector: (row) => row.speed_performance, width: "100px" },
    { name: "Feature Quality", selector: (row) => row.feature_quality, width: "150px" },
    { name: "Support", selector: (row) => row.customer_support, width: "120px" },
    { name: "Overall", selector: (row) => row.overall_rating, width: "100px" },
    { name: "Emotion", selector: (row) => row.emotion, width: "100px" },
    {
      name: "Feedback",
      selector: (row) => row.feedback_text,
      grow: 3,
      wrap: true,
    },
  ];

  useEffect(() => {
    fetchReport();
  }, []);

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="card shadow-sm mb-3 p-3">
        <h4>All Feedback Report</h4>
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          <div className="w-100 w-md-50">
            <div className="input-group">
              <span className="input-group-text bg-primary text-white">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search feedback..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="d-flex flex-wrap justify-content-end gap-2 w-100 w-md-auto">
            <button
              className="btn btn-outline-primary"
              data-bs-toggle="modal"
              data-bs-target="#filterModal"
            >
              <FaFilter className="me-1" /> Filters
            </button>
            <div className="btn-group">
              <button className="btn btn-outline" onClick={exportToExcel}>
                <FaFileExcel className="me-1" /> Excel
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <div className="modal fade" id="filterModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-md">
          <div className="modal-content">
            <div className="modal-header bg-light">
              <h5 className="modal-title text-primary">
                <FaFilter className="me-2" /> Feedback Report Filters
              </h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">From Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">To Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <select
                  className="form-control"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                >
                  <option value="">All</option>
                  {nameOptions.map((name, idx) => (
                    <option key={idx} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Emotion</label>
                <select
                  className="form-control"
                  value={filterEmotion}
                  onChange={(e) => setFilterEmotion(e.target.value)}
                >
                  <option value="">All</option>
                  {emotionOptions.map((emo, idx) => (
                    <option key={idx} value={emo}>
                      {emo}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer bg-light">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button
                className="btn btn-primary"
                data-bs-dismiss="modal"
                onClick={fetchReport}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card shadow border-0 rounded">
        <DataTable
          columns={columns}
          data={filteredResults}
          progressPending={isLoading}
          highlightOnHover
          striped
          pagination
        />
      </div>

      <ToastContainer />
    </div>
  );
}
