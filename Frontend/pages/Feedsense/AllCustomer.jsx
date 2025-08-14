import React, { useState, useEffect } from "react";
import { FaFilter, FaFileExcel, FaSearch } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import * as XLSX from "xlsx";
import DataTable from "react-data-table-component";
import "react-toastify/dist/ReactToastify.css";
import api from "./apiService";

export default function AllCustomer() {
  const [users, setUsers] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/api/customers", {
        params: { fromdate: fromDate, todate: toDate },
      });

      if (Array.isArray(res.data) && res.data.length > 0) {
        setUsers(res.data);
        setFilteredResults(res.data);
      } else {
        setUsers([]);
        setFilteredResults([]);
        toast.warning("No users found", { position: "top-center" });
      }
    } catch (err) {
      toast.error("Error fetching users", { position: "top-center" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (!query) {
      setFilteredResults(users);
    } else {
      setFilteredResults(
        users.filter((u) =>
          [u.Name, u.Mobile, u.Email, u.Username]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase())
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
      "User ID": row.UserId,
      Name: row.Name,
      Mobile: row.Mobile,
      Email: row.Email,
      Username: row.Username,
      "Created At": new Date(new Date(row.CreatedAt).getTime() + (5 * 60 + 30) * 60000).toLocaleString(),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Customers");
    XLSX.writeFile(wb, `Customer_Report_${Date.now()}.xlsx`);
  };

  const columns = [
    { name: "User ID", selector: (row) => row.UserId, sortable: true, width: "90px" },
    { name: "Name", selector: (row) => row.Name, sortable: true },
    { name: "Mobile", selector: (row) => row.Mobile },
    { name: "Email", selector: (row) => row.Email, wrap: true },
    { name: "Username", selector: (row) => row.Username },
  {
  name: "Created At",
  selector: (row) =>
    new Date(new Date(row.CreatedAt).getTime() + (5 * 60 + 30) * 60000).toLocaleString(),
  sortable: true,
},
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="card shadow-sm mb-3 p-3">
        <h4>Customer Report</h4>
        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
          {/* Search */}
          <div className="w-100 w-md-50">
            <div className="input-group">
              <span className="input-group-text bg-primary text-white">
                <FaSearch />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search customers..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
          </div>
          {/* Actions */}
          <div className="d-flex flex-wrap justify-content-end gap-2 w-100 w-md-auto">
            <button
              className="btn btn-outline-primary"
              data-bs-toggle="modal"
              data-bs-target="#filterModal"
            >
              <FaFilter className="me-1" /> Filters
            </button>
            <button className="btn btn-outline-success" onClick={exportToExcel}>
              <FaFileExcel className="me-1" /> Excel
            </button>
          </div>
        </div>
      </div>

      {/* Filter Modal */}
      <div className="modal fade" id="filterModal" tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-md">
          <div className="modal-content">
            <div className="modal-header bg-light">
              <h5 className="modal-title text-primary">
                <FaFilter className="me-2" /> Customer Report Filters
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
            </div>
            <div className="modal-footer bg-light">
              <button className="btn btn-secondary" data-bs-dismiss="modal">
                Cancel
              </button>
              <button
                className="btn btn-primary"
                data-bs-dismiss="modal"
                onClick={fetchUsers}
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
