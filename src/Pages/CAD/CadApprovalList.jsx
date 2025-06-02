import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import Cookies from "js-cookie";
import Footer from "../../Components/Footer";
import Content from "../../Components/Content";
import {
  FaEdit,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Swal from "sweetalert2";

import { IoEye } from "react-icons/io5";
import "../globalTable.css";
import debounce from "lodash/debounce";
import styled from 'styled-components';
function CadApprovalList() {
  
  const API_URL = window.url + "cad/getAllCads";
  const getDesignername_Url = window.url + "auth/getUsersByRoleType";
  const SEARCH_API_URL = window.url + "cad/searchCads";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [filteredRows, setFilteredRows] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [designerName, setDesignerName] = useState("");
  const [designerEmail, setDesignerEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [approvedForDew, setApprovedForDew] = useState(false);
  const [approvedForCustomer, setApprovedForCustomer] = useState(false);
  const [image, setImage] = useState(null);
  const [designer_name_array, setDesigner_name_array] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [tasksavedId, setTasksavedId] = useState(null);

  // Search State
  const [cadNo, setCadNo] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("");
  const [prostartDate, setProStartDate] = useState("");
  const [ProendDate, setProEndDate] = useState("");
  const [startCadCompletedDate, setStartCadCompletedDate] = useState("");
  const [endCadCompletedDate, setEndCadCompletedDate] = useState("");

  // New state to track if search is active
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false); // New state for filter visibility

  const [filters, setFilters] = useState({
    cadNo: "",
    status: "",
    startDate: "",
    endDate: "",
    startCadCompletedDate: "",
    endCadCompletedDate: "",
  });

  const navigate = useNavigate();

  const handleViewcad = (customerId) => {
    navigate(`/viewcad/${customerId}`);
  };

  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    if (!isSearchPending) {
      if (isSearchActive) {
        debouncedSearch(filters);
      } else {
        fetchOrders();
      }
    }
  }, [navigate, currentPage, rowsPerPage, isSearchActive, isSearchPending]);
  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }
    fetchOrders();
    getDesigner_Data();
  }, [navigate, currentPage, rowsPerPage]);

  const fetchOrders = async () => {
    const savedToken = Cookies.get("authToken");
    try {
      const response = await axios.post(
        API_URL,
        { page: currentPage, pageSize: rowsPerPage },
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        }
      );
      if (response.data) {
        setRows(response.data.data || []);
        setTotalRecords(response.data.totalRecords || 0);
        setIsSearchActive(false);
      }
    } catch (err) {
      setError(
        `Failed to fetch Order data: ${
          err.response?.data?.message || err.message
        }`
      );
      if (
        err.response?.data?.message === "Token expired, please login again" ||
        err.message === "Token expired, please login again"
      ) {
        Cookies.remove("authToken");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const getDesigner_Data = async () => {
    const savedToken = Cookies.get("authToken");
    try {
      const requestData = { type: "productDevelopment" };
      const response = await axios.post(getDesignername_Url, requestData, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
      });
      setDesigner_name_array(response.data.data || []);
    } catch (err) {
      console.error(`Failed to fetch setting types: ${err.message}`);
      if (
        err.response?.data?.message === "Token expired, please login again" ||
        err.message === "Token expired, please login again"
      ) {
        Cookies.remove("authToken");
        navigate("/");
      }
    }
  };

  const handleApprovalChange = async (id, value) => {
    let reason = "";
    if (value === "Approved") {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do You Want To Approve This Cad?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Approve It!",
        cancelButtonText: "No, Cancel!",
      });
      if (!result.isConfirmed) return;
    } else if (value === "Rejected") {
      const { value: inputReason } = await Swal.fire({
        title: "Reason for Rejection",
        input: "textarea",
        inputPlaceholder: "Enter the reason for rejection...",
        showCancelButton: true,
        confirmButtonText: "Submit",
        cancelButtonText: "Cancel",
      });
      if (!inputReason) return;
      reason = inputReason;
    }
    try {
      const response = await axios.put(
        window.url + "cad/updateCadStatus",
        {
          cadId: id,
          status: value,
          ...(value === "Rejected" && { reason }),
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
        }
      );
      if (
        response.data &&
        response.data.message ===
          "Cannot approve CAD. Assign CAD designer and upload CAD image."
      ) {
        Swal.fire({
          icon: "warning",
          title: "No Images Found!",
          text: "No images were found for this CAD. Please check and try again.",
        });
        return;
      }
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id
            ? { ...row, status: value, ...(value === "Rejected" && { reason }) }
            : row
        )
      );
      Swal.fire({
        icon: "success",
        title: value === "Approved" ? "Approved!" : "Rejected!",
        text: `Cad status updated to ${value.toLowerCase()}.`,
      });
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message ===
          "Cannot approve CAD. Assign CAD designer and upload CAD image."
      ) {
        Swal.fire({
          icon: "warning",
          title: "No Images Found!",
          text: "No images were found in the cad. Please check and try again.",
        });
      } else {
        console.error("Error moving to Design:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Something went wrong. Please try again.",
        });
      }
    }
  };

  const handleMoveToRender = async (id) => {
    const confirmMove = await Swal.fire({
      title: "Do you want to move to Render?",
      text: "This action will update the CAD status to Render.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Move",
      cancelButtonText: "Cancel",
    });
    if (!confirmMove.isConfirmed) return;
    try {
      const response = await axios.put(
        window.url + "cad/moveToRender",
        {
          cadId: id,
          isRender: true,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
        }
      );
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id ? { ...row, cadStatus: "render" } : row
        )
      );
      Swal.fire({
        icon: "success",
        title: "Moved to Render!",
        text: "The CAD status has been updated to Render.",
      });
    } catch (error) {
      console.error("Error moving to Render:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to move to Render. Please try again.",
      });
    }
  };

  const debouncedSearch = useCallback(
    debounce(async (searchFilters) => {
      const savedToken = Cookies.get("authToken");
      // setLoading(true);
      try {
        const response = await axios.post(
          SEARCH_API_URL,
          { ...searchFilters },
          { headers: { Authorization: `Bearer ${savedToken}` } }
        );
        const data = response.data.data || [];
        setRows(data);
        setTotalRecords(data.length);
        setIsSearchActive(true);
      } catch (err) {
       console.log("error")
      } finally {
        setLoading(false);
        setIsSearchPending(false);
      }
    }, 500),
    []
  );

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      if (Object.values(newFilters).some((val) => val !== "")) {
        setIsSearchPending(true);
        setCurrentPage(1);
        debouncedSearch(newFilters);
      } else {
        setIsSearchPending(false);
        fetchOrders();
      }
      return newFilters;
    });
  };

  const handleClearFilter = () => {
    setFilters({
      userId: "",
      status: "",
      sketchBriefDateStart: "",
      sketchBriefDateEnd: "",
    });
    setCurrentPage(1);
    setIsSearchActive(false);
    setIsSearchPending(false);
    fetchOrders();
  };

  // Pagination logic
  const handlePageChange = (page) => {
    if (page >= 1 && page <= Math.ceil(totalRecords / rowsPerPage)) {
      setCurrentPage(page);
    }
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const renderPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    const halfRange = Math.floor(maxPagesToShow / 2);
    let startPage = Math.max(1, currentPage - halfRange);
    let endPage = Math.min(totalPages, currentPage + halfRange);

    if (endPage - startPage + 1 < maxPagesToShow) {
      if (currentPage <= halfRange) {
        endPage = Math.min(totalPages, maxPagesToShow);
      } else if (currentPage > totalPages - halfRange) {
        startPage = Math.max(1, totalPages - maxPagesToShow + 1);
      }
    }

    if (startPage > 1) {
      pageNumbers.push(
        <li key={1} className="page-item">
          <button className="page-link" onClick={() => handlePageChange(1)}>
            1
          </button>
        </li>
      );
      if (startPage > 2) {
        pageNumbers.push(
          <li key="start-ellipsis" className="page-item ellipsis">
            <span className="page-link">…</span>
          </li>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <li
          key={i}
          className={`page-item ${currentPage === i ? "active" : ""}`}
        >
          <button className="page-link" onClick={() => handlePageChange(i)}>
            {i}
          </button>
        </li>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(
          <li key="end-ellipsis" className="page-item ellipsis">
            <span className="page-link">…</span>
          </li>
        );
      }
      pageNumbers.push(
        <li key={totalPages} className="page-item">
          <button
            className="page-link"
            onClick={() => handlePageChange(totalPages)}
          >
            {totalPages}
          </button>
        </li>
      );
    }

    return pageNumbers;
  };

  const handleAddDesignerClick = (rowId) => {
    setSelectedRowId(rowId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setDesignerName("");
    setDesignerEmail("");
    setStartDate("");
    setEndDate("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      Swal.fire({
        icon: "warning",
        title: "Authentication Token Missing",
        text: "Please log in to continue.",
      });
      return;
    }
    if (!designerName || !startDate || !endDate) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields.",
      });
      return;
    }
     // Add date comparison
            const start = new Date(startDate);
            const end = new Date(endDate);
            
            if (end < start) {
              Swal.fire({
                icon: "warning",
                title: "Invalid Date Range",
                text: "End date must be equal to or greater than start date.",
              });
              return;
            }
    const dataToSend = {
      id: selectedRowId,
      empId: designerName,
      startDate: new Date(startDate).toISOString().split("T")[0],
      endDate: new Date(endDate).toISOString().split("T")[0],
      type: "cad",
    };
    try {
      const response = await axios.put(
        window.url + "cad/addCadDesigner",
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      Swal.fire({
        icon: "success",
        title: "Cad Designer Created",
        text: `Cad Designer Created`,
      });
      await fetchOrders();
      setDesignerName("");
      setStartDate("");
      setEndDate("");
      setIsModalOpen(false);
      // navigate("/cad_approval_list");
    } catch (error) {
      console.error(
        "Error creating Cad Designer:",
        error.response ? error.response.data : error.message
      );
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          "Error: " +
          (error.response
            ? JSON.stringify(error.response.data)
            : error.message),
      });
    }
  };

  const handleFormAndImageUpload = async (e) => {
    await handleSubmit(e);
  };

  const ViewDesignerButton = (orderId) => {
    navigate(`/cad_designer/${orderId}`);
  };

 const getButtonStyle = (row) => {
  const isDisabled = row.cadStatus !== "cad" || row.status !== "Approved";
  let backgroundColor, borderColor, color;

  if (isDisabled) {
    if (row.status === "Pending") {
      backgroundColor = "#f97316";
      borderColor = "#ea580c";
    } else if (row.status === "Rejected") {
      backgroundColor = "#dc2626";
      borderColor = "#b91c1c";
    } else if (row.cadStatus !== "cad") {
      backgroundColor = "#007bff";
      borderColor = "#0056b3";
    } else {
      backgroundColor = "#6c757d";
      borderColor = "#5a6268";
    }
  } else {
    backgroundColor = "#28a745";
    borderColor = "#218838";
  }

  color = "#ffffff";

  return {
    backgroundColor,
    borderColor,
    color,
    padding: "0.25rem 0.5rem",
    fontSize: "0.875rem",
    borderRadius: "0.2rem",
    borderWidth: "1px",
    borderStyle: "solid",
    cursor: isDisabled ? "not-allowed" : "pointer",
    opacity: isDisabled ? 0.65 : 1,
    transition: "background-color 0.2s ease, opacity 0.2s ease",
  };
};
  return (
    <main className="main-content">
    
      <Content>
        <div className="">
          <div className="page-inner">
            <div className="page-header d-flex justify-content-between align-items-center">
              <h3 className="fw-bold mb-3" style={{ wordWrap: "break-word" }}>
                CAD Approval List
              </h3>
              <button
                className="btn btn-link p-0"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                aria-label={isFilterVisible ? "Hide Filters" : "Show Filters"}
              >
                <FaSearch
                  size={25}
                  className={isFilterVisible ? "text-primary" : "text-muted"}
                />
              </button>
            </div>
            {/* Filter Section */}
            {isFilterVisible && (
              <div className="row mb-4">
                <div className="col-md-12">
                  <div className="card">
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-3">
                          <label className="form-label">CAD No</label>
                          <input
                            type="text"
                            name="cadNo"
                            className="form-control"
                            value={filters.cadNo}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Status</label>
                          <select
                            name="status"
                            className="form-control"
                            value={filters.status}
                            onChange={handleFilterChange}
                          >
                            <option value="">Select Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">
                            Start Date (From)
                          </label>
                          <input
                            type="date"
                            name="startDate"
                            className="form-control"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Start Date (To)</label>
                          <input
                            type="date"
                            name="endDate"
                            className="form-control"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">
                            Completed Date (From)
                          </label>
                          <input
                            type="date"
                            name="startCadCompletedDate"
                            className="form-control"
                            value={filters.startCadCompletedDate}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">
                            Completed Date (To)
                          </label>
                          <input
                            type="date"
                            name="endCadCompletedDate"
                            className="form-control"
                            value={filters.endCadCompletedDate}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-md-12 text-end mt-3">
                          <button
                            className="btn btn-outline-primary"
                            onClick={handleClearFilter}
                            disabled={!Object.values(filters).some((v) => v)}
                          >
                            Clear Filters
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-body">
                    {loading ? (
                      <p>Loading orders...</p>
                    ) : error ? (
                      <p style={{ color: "red" }}>{error}</p>
                    ) : (
                      <>
                       
                        <div className="table-responsive">
                          <table className="display table table-striped table-hover customer-table">
                            <thead>
                              <tr>
                                <th></th>
                                {/* <th>ID</th> */}
                                <th style={{ whiteSpace: "nowrap" }}>Cad NO</th>
                                <th style={{ whiteSpace: "nowrap" }}>Concept ID</th>
                                <th style={{ whiteSpace: "nowrap" }}>CAD Designer</th>
                                <th style={{ whiteSpace: "nowrap" }}>
                                  Request <br /> Cad Count
                                </th>
                                <th style={{ whiteSpace: "nowrap" }}>
                                  Start <br /> Date
                                </th>
                                <th style={{ whiteSpace: "nowrap" }}>
                                  Completed <br /> Date
                                </th>
                                <th>Status</th>
                                <th style={{ whiteSpace: "nowrap" }}>Add Designer</th>
                                <th style={{ whiteSpace: "nowrap" }}>View Designer</th>
                                <th>Approval</th>
                                <th style={{ whiteSpace: "nowrap" }}>Move To Render</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.length > 0 ? (
                                rows.map((row) => (
                                  <tr key={row.id}
                                   title={`CAD No: ${row.cadNo}`} // Add tooltip with sketchNo
                                  >
                                    <td>
                                      <IoEye  className="action-icon" onClick={() => handleViewcad(row.id)} />
                                    </td>
                                    {/* <td>{row.id}</td> */}
                                    <td>{row.cadNo}</td>
                                    <td>{row.orderNo}</td>
                                    <td style={{ minWidth: "250px", whiteSpace: "pre-line" }}>
                                      {row.cadDesigners &&
                                      Array.isArray(row.cadDesigners) &&
                                      row.cadDesigners.length > 0 ? (
                                        row.cadDesigners.map((cadDesigner, index) => (
                                          <div key={index}>{cadDesigner.name}</div>
                                        ))
                                      ) : (
                                        <div>No CAD Designer Available</div>
                                      )}
                                    </td>
                                    <td>{row.reqCadCount}</td>
                                    <td>{row.promiseDate}</td>
                                    <td>{row.cadCompletedDate}</td>
                                    <td>{row.status}</td>
                                    <td style={{ minWidth: "200px", whiteSpace: "pre-line" }}>
                                      <div>
                                        <button
                                          onClick={() => handleAddDesignerClick(row.id)}
                                          className="btn btn-sm"
                                          style={{ backgroundColor: "#2E1A47", color: "white" }}
                                          disabled={row.status === "Approved" || row.status === "Rejected"}
                                        >
                                          Add Designer
                                        </button> 
                                        {isModalOpen && (
                                          <div className="custom-modal-overlay">
                                            <div className="custom-modal">
                                              <div className="modal-header">
                                                <h5>Add CAD Designer</h5>
                                              </div>
                                              <form onSubmit={handleFormAndImageUpload}>
                                                <div className="modal-body">
                                                  <div className="row">
                                                    <div className="col-md-6">
                                                      <div className="form-group">
                                                        <label>Designer Name</label>
                                                        <select
                                                          className="form-select pd-select"
                                                          value={designerName}
                                                          onChange={(e) => setDesignerName(e.target.value)}
                                                        >
                                                          <option value="">Select</option>
                                                          {designer_name_array.map((type) => (
                                                            <option key={type.id} value={type.id}>
                                                              {type.name}
                                                            </option>
                                                          ))}
                                                        </select>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="row">
                                                    <div className="col-md-6">
                                                      <div className="form-group">
                                                        <label>Start Date</label>
                                                        <input
                                                          type="date"
                                                          className="form-control"
                                                          value={startDate}
                                                          onChange={(e) => setStartDate(e.target.value)}
                                                          required
                                                        />
                                                      </div>
                                                    </div>
                                                    <div className="col-md-6">
                                                      <div className="form-group">
                                                        <label>End Date</label>
                                                        <input
                                                          type="date"
                                                          className="form-control"
                                                          value={endDate}
                                                          onChange={(e) => setEndDate(e.target.value)}
                                                          required
                                                        />
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className="modal-footer">
                                                  <button type="submit" className="btn btn-success">
                                                    Submit
                                                  </button>{" "} &nbsp;
                                                  <button
                                                    type="button"
                                                    className="btn btn-danger"
                                                    onClick={handleCloseModal}
                                                  >
                                                    Close
                                                  </button>
                                                </div>
                                              </form>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                    <td style={{ minWidth: "200px", whiteSpace: "pre-line" }}>
                                      <div>
                                        <button
                                          onClick={() => ViewDesignerButton(row.id)}
                                          className="btn btn-sm"
                                          style={{ backgroundColor: "#342D7E", color: "white" }}
                                        >
                                          Add Image
                                        </button>
                                      </div>
                                    </td>
                                    <td>
                                      <select
                                        value={row.status}
                                        onChange={(e) => handleApprovalChange(row.id, e.target.value)}
                                        className="form-select"
                                        style={{ width: "150px" }}
                                        disabled={row.status === "Approved" || row.status === "Rejected"}
                                      >
                                        <option value="Pending" disabled>Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                      </select>
                                    </td>
                                   
                                    <td style={{ minWidth: "200px", whiteSpace: "pre-line" }}>
                                      <button
                                        onClick={() => handleMoveToRender(row.id)}
                                        disabled={row.cadStatus !== "cad" || row.status !== "Approved"}
                                          style={getButtonStyle(row)}
                                         className={`btn btn-sm ${row.cadStatus === "cad" && row.status === "Approved" ? "blink-animation" : ""}`}
                                      >
                                        {row.cadStatus !== "cad" ? "Moved to Render" : "Move to Render"}
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              ) : isSearchActive ? (
                                <tr>
                                  <td colSpan="13" className="text-center">
                                    No data found
                                  </td>
                                </tr>
                              ) : (
                                <tr>
                                  <td colSpan="13" className="text-center">
                                    No CADs found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        {!isSearchActive && (
                          <div className="pagination-container mt-4">
                            <div className="pagination-info text-muted">
                              Showing {rows.length} of {totalRecords} records
                            </div>
                            <nav aria-label="Page navigation">
                              <ul className="pagination justify-content-end">
                                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                  <button
                                    className="page-link"
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                  >
                                    <FaChevronLeft />
                                  </button>
                                </li>
                                {renderPageNumbers()}
                                <li
                                  className={`page-item ${
                                    currentPage === totalPages || totalRecords === 0 ? "disabled" : ""
                                  }`}
                                >
                                  <button
                                    className="page-link"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages || totalRecords === 0}
                                  >
                                    <FaChevronRight />
                                  </button>
                                </li>
                              </ul>
                            </nav>
                          </div>
                        )}
                      </>
                    )}
                   
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </Content>
      <Footer />
    </main>
  );
}

export default CadApprovalList;
