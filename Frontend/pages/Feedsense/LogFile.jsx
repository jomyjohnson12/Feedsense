import React, { useState, useEffect } from "react";
import { FaFileExcel } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import * as XLSX from "xlsx";
import DataTable from "react-data-table-component";
import "react-toastify/dist/ReactToastify.css";
import api from "./apiService";

export default function LogFile() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/api/login_logs");
      setLogs(res.data || []);
    } catch {
      toast.error("Error fetching logs", { position: "top-center" });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToExcel = () => {
    if (logs.length === 0) {
      toast.warning("No data to export", { position: "top-center" });
      return;
    }

    const exportData = logs.map(row => ({
      LogId: row.LogId,
      EmployeeName: row.EmployeeName,
      LoginUserName: row.LoginUserName,
      IPAddress: row.IPAddress,
      UserAgent: row.UserAgent,
      GeoPlace: row.GeoPlace,
      LoginAt: new Date(
        new Date(row.CreatedAt).getTime() + (5 * 60 + 30) * 60000
      ).toLocaleString()
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Login Logs");
    XLSX.writeFile(wb, `Login_Logs_${Date.now()}.xlsx`);
  };

  const columns = [
    { name: "Log ID", selector: row => row.LogId, sortable: true, width: "90px" },
    { name: "Employee Name", selector: row => row.EmployeeName, wrap: true },
    { name: "Login User Name", selector: row => row.LoginUserName },
    { name: "IP Address", selector: row => row.IPAddress },
    { name: "User Agent", selector: row => row.UserAgent, wrap: true },
    { name: "Geo Place", selector: row => row.GeoPlace, wrap: true },
    {
      name: "Login At",
      selector: row => new Date(
        new Date(row.CreatedAt).getTime() + (5 * 60 + 30) * 60000
      ).toLocaleString(),
      sortable: true
    }
  ];

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="card shadow-sm mb-3 p-3 d-flex flex-row justify-content-between align-items-center">
        <h4 className="m-0">Login Logs</h4>
        <button className="btn btn-outline-success" onClick={exportToExcel}>
          <FaFileExcel className="me-1" /> Export Excel
        </button>
      </div>

      {/* Table */}
      <div className="card shadow border-0 rounded">
        <DataTable
          columns={columns}
          data={logs}
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
