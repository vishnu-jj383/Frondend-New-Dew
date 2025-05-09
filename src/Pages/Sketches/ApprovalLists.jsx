import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import Footer from "../../Components/Footer";
// import Header from "../Header";
import Content from "../../Components/Content";
// import SideBar from "../SideBar";
import Cookies from "js-cookie";
// import { useSelector } from "react-redux";
import {
  FaEdit,
  FaTrash,
  FaEllipsisV,
  FaFilter, // Added FaFilter for the toggle button
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Swal from "sweetalert2";
import { IoEye } from "react-icons/io5";
import "../globalTable.css";
import debounce from "lodash/debounce";

const ApprovalLists = () => {
  // const sideBarState = useSelector((state) => state?.sidebar?.sideBar);
  const [filteredRows, setFilteredRows] = useState([]);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  // Filters State
  const [designer_name_array, setDesigner_name_array] = useState([]);
  const [filters, setFilters] = useState({
    userId: "",
    status: "",
    sketchBriefDateStart: "",
    sketchBriefDateEnd: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [designerName, setDesignerName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedRowId, setSelectedRowId] = useState(null);
  const [tasksavedId, setTasksavedId] = useState(null);

  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false); // New state for filter visibility

  const API_URL = window.url + "sketch";
  const getDesignername_Url = window.url + "auth/getUsersByRoleType";
  const SEARCH_API_URL = window.url + "sketch/searchSketches";

  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }
    getDesigner_Data();
    if (!isSearchPending) {
      if (isSearchActive) {
        debouncedSearch(filters);
      } else {
        fetchOrders();
      }
    }
  }, [navigate, currentPage, rowsPerPage, isSearchActive, isSearchPending]);

  const fetchOrders = async () => {
    const savedToken = Cookies.get("authToken");
    // setLoading(true);
    try {
      const response = await axios.post(
        `${API_URL}/getAllSketches`,
        { page: currentPage, pageSize: rowsPerPage },
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );
      setRows(response.data.data || []);
      setTotalRecords(response.data.totalRecords || 0);
      setIsSearchActive(false);
    } catch (err) {
      handleError(err);
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
    }
  };
  const handleError = (err) => {
    const message = err.response?.data?.message || err.message;
    setError(`Failed to fetch data: ${message}`);
    if (message === "Token expired, please login again") {
      Cookies.remove("authToken");
      navigate("/");
    }
  };

  const handleApprovalChange = async (id, value) => {
    let reason = "";
    if (value === "Approved") {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do You Want To Approve This Sketch?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Approve It!",
        cancelButtonText: "No, Cancel!",
      });
      if (!result.isConfirmed) return;
    }
    if (value === "Rejected") {
      const { value: inputReason } = await Swal.fire({
        title: "Reason for Rejection",
        input: "text",
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
        window.url + "sketch/updateSketchStatus",
        {
          sketchId: id,
          status: value,
          ...(value === "Rejected" && { reason }),
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
        }
      );
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id
            ? { ...row, status: value, ...(value === "Rejected" && { reason }) }
            : row
        )
      );
      Swal.fire({
        icon: "success",
        title: "Approved!",
        text: "Sketch status updated successfully.",
      })
      
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message ===
          "Cannot approve sketch. Assign Sketcher and upload sketch image."
      ) {
        Swal.fire({
          icon: "warning",
          title: "No Images Found!",
          text: "No Images Were Found In The Sketch. Please Check And Try again.",
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

  const handleMoveToSkitch = async (id) => {
    const confirmMove = await Swal.fire({
      title: "Do you want to move?",
      text: "This action will update the sketch status to CAD.",
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
        window.url + "sketch/moveToCad",
        { sketchId: id },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
        }
      );
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id ? { ...row, sketchStatus: "cad" } : row
        )
      );
      Swal.fire({
        icon: "success",
        title: "Moved Successfully!",
        text: "The sketch status has been updated to CAD.",
      });
    } catch (error) {
      console.error("Error moving to Sketch:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to move the sketch. Please try again.",
      });
    }
  };

  const handleAddDesignerClick = (rowId) => {
    setSelectedRowId(rowId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setDesignerName("");
    setStartDate("");
    setEndDate("");
  };

  const handleViewsketch = (customerId) => {
    navigate(`/viewsketch/${customerId}`);
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
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
      type: "sketch",
    };
    
    try {
      const response = await axios.put(
        window.url + "sketch/addSketcher",
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
        title: "Sketch Designer Created",
        text: "Sketch Designer Created",
      });
      
      await fetchOrders();
      
      setDesignerName("");
      setStartDate("");
      setEndDate("");
      setIsModalOpen(false);
      
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
    navigate(`/sketch_designer/${orderId}`);
  };

  // Filtering Logic
  const debouncedSearch = useCallback(
    debounce(async (searchFilters) => {
      const savedToken = Cookies.get("authToken");
      setLoading(true);
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
        handleError(err);
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
  return (
    <main className="main-content">
    <br/>   <br/>   
      <Content>
        <div className="">
          <div className="page-inner">
            <div className="page-header d-flex justify-content-between align-items-center">
              <h3 className="fw-bold mb-3">Sketch Approval List</h3>
              <button
                className="btn btn-link p-0"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                aria-label={isFilterVisible ? "Hide Filters" : "Show Filters"}
                title={isFilterVisible ? "Hide Filters" : "Show Filters"}
              >
                <FaSearch
                  size={25}
                  className={isFilterVisible ? "text-primary" : "text-muted"}
                />
              </button>
            </div>
            {/* Filter Section - Conditionally Rendered */}
            {isFilterVisible && (
              <div className="row mb-4">
                <div className="col-md-12">
                  <div className="card">
                    <div className="card-body filter-section">
                      <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                          <label className="form-label">Sketcher Name</label>
                          <select
                            name="userId"
                            className="form-select"
                            value={filters.userId}
                            onChange={handleFilterChange}
                          >
                            <option value="">All Sketchers</option>
                            {designer_name_array.map((designer) => (
                              <option key={designer.id} value={designer.id}>
                                {designer.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-3">
                          <label className="form-label">
                            Start Date (From)
                          </label>
                          <input
                            type="date"
                            name="sketchBriefDateStart"
                            className="form-control"
                            value={filters.sketchBriefDateStart}
                            onChange={handleFilterChange}
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label">Start Date (To)</label>
                          <input
                            type="date"
                            name="sketchBriefDateEnd"
                            className="form-control"
                            value={filters.sketchBriefDateEnd}
                            onChange={handleFilterChange}
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label">Status</label>
                          <select
                            name="status"
                            className="form-select"
                            value={filters.status}
                            onChange={handleFilterChange}
                          >
                            <option value="">All Statuses</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>

                        <div className="col-md-12 text-end mt-3">
                          <button
                            className="btn btn-outline-primary me-2"
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
                                {/* <th>id</th> */}
                                <th>Sketch No</th>
                                <th>Concept ID</th>
                                <th>
                                  Sketcher <br /> Name
                                </th>
                                <th>
                                  sketch <br /> Brief Date
                                </th>
                                <th>
                                  sketch <br /> Completed <br /> Date
                                </th>
                                <th>
                                  Request <br /> Sketch <br /> Count
                                </th>
                                <th>Status</th>
                                <th style={{ whiteSpace: "nowrap" }}>
                                  Add Designer
                                </th>
                                <th style={{ whiteSpace: "nowrap" }}>
                                  View Designer
                                </th>
                                <th>Approval</th>
                                <th style={{ whiteSpace: "nowrap" }}>
                                  Move To CAD
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.length > 0 ? (
                                rows.map((row) => (
                                  <tr key={row.id}>
                                    <td>
                                      <IoEye
                                       className="action-icon"
                                        onClick={() => handleViewsketch(row.id)}
                                      />
                                    </td>
                                    {/* <td>{row.id}</td> */}
                                    <td>{row.sketchNo}</td>
                                    <td>{row.orderNo}</td>
                                    <td>
                                      {row.sketchers &&
                                      Array.isArray(row.sketchers) &&
                                      row.sketchers.length > 0 ? (
                                        row.sketchers.map((sketcher, index) => (
                                          <div key={index}>{sketcher.name}</div>
                                        ))
                                      ) : (
                                        <div>No sketchers available</div>
                                      )}
                                    </td>
                                    <td>{row.sketchBriefDate}</td>
                                    <td>{row.sketchCompletedDate}</td>
                                    <td>{row.reqSketchCount}</td>
                                    <td>{row.status}</td>
                                    <td
                                      style={{
                                        minWidth: "200px",
                                        whiteSpace: "pre-line",
                                      }}
                                    >
                                      <div>
                                        <button
                                          onClick={() => handleAddDesignerClick(row.id)}
                                          className="btn btn-sm"
                                          style={{
                                            backgroundColor: "#2E1A47",
                                            color: "white",
                                          }}
                                          disabled={
                                            row.status === "Approved" ||
                                            row.status === "Rejected"
                                          }
                                        >
                                          Add Designer
                                        </button>
                                        {isModalOpen && (
                                          <div className="custom-modal-overlay">
                                            <div className="custom-modal">
                                              <div className="modal-header">
                                                <h5>Add Sketch Designer</h5>
                                              </div>
                                              <form onSubmit={handleFormAndImageUpload}>
                                                <div className="modal-body">
                                                  <div className="row">
                                                    <div className="col-md-6">
                                                      <div className="form-group">
                                                        <label>Designer Name</label>
                                                        <select
                                                          className="form-select pd-select"
                                                          id="settingType"
                                                          value={designerName}
                                                          onChange={(e) =>
                                                            setDesignerName(e.target.value)
                                                          }
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
                                                          onChange={(e) =>
                                                            setStartDate(e.target.value)
                                                          }
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
                                                          onChange={(e) =>
                                                            setEndDate(e.target.value)
                                                          }
                                                          required
                                                        />
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                                <div className="modal-footer">
                                                  <button type="submit" className="btn btn-success">
                                                    Submit
                                                  </button>{" "}
                                                  &nbsp;
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
                                    <td
                                      style={{
                                        minWidth: "200px",
                                        whiteSpace: "pre-line",
                                      }}
                                    >
                                      <div>
                                        <button
                                          onClick={() => ViewDesignerButton(row.id)}
                                          className="btn btn-sm"
                                          style={{
                                            backgroundColor: "#342D7E",
                                            color: "white",
                                          }}
                                        >
                                          Add Image
                                        </button>
                                      </div>
                                    </td>
                                    <td
                                      style={{
                                        minWidth: "200px",
                                        whiteSpace: "pre-line",
                                      }}
                                    >
                                      <select
                                        value={row.status}
                                        onChange={(e) =>
                                          handleApprovalChange(row.id, e.target.value)
                                        }
                                        className="form-select"
                                        disabled={
                                          row.status === "Approved" ||
                                          row.status === "Rejected"
                                        }
                                      >
                                        <option value="Pending" disabled>
                                          Pending
                                        </option>
                                        <option value="Approved">Approved</option>
                                        <option value="Rejected">Rejected</option>
                                      </select>
                                    </td>
                                    <td
                                      style={{
                                        minWidth: "200px",
                                        whiteSpace: "pre-line",
                                        color:"black"
                                      }}
                                    >
                                      <button
                                      style={{color:"black"}}
                                        onClick={() => handleMoveToSkitch(row.id)}
                                        disabled={
                                          row.sketchStatus !== "sketch" ||
                                          row.status !== "Approved"
                                        }
                                        className={`btn btn-sm ${
                                          row.sketchStatus !== "sketch"
                                            ? "btn-secondary"
                                            : "btn-success"
                                        }`}
                                      >
                                        {row.sketchStatus !== "sketch"
                                          ?"btn-secondary" && "Moved to CAD"
                                          :  "btn-secondary" && "Move to CAD"}
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
                                    No sketches found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        {/* Original Pagination Controls */}
                        {/* Pagination - Only shown when search is not active */}
                        {!isSearchActive && (
                          <div className="pagination-container mt-4">
                            <div className="pagination-info text-muted">
                              Showing {rows.length} of {totalRecords} records
                            </div>
                            <nav aria-label="Page navigation">
                              <ul className="pagination justify-content-end">
                                <li
                                  className={`page-item ${
                                    currentPage === 1 ? "disabled" : ""
                                  }`}
                                >
                                  <button
                                    className="page-link"
                                    onClick={() =>
                                      handlePageChange(currentPage - 1)
                                    }
                                    disabled={currentPage === 1}
                                    aria-label="Previous"
                                  >
                                    <FaChevronLeft />
                                  </button>
                                </li>

                                {renderPageNumbers()}

                                <li
                                  className={`page-item ${
                                    currentPage === totalPages ||
                                    totalRecords === 0
                                      ? "disabled"
                                      : ""
                                  }`}
                                >
                                  <button
                                    className="page-link"
                                    onClick={() =>
                                      handlePageChange(currentPage + 1)
                                    }
                                    disabled={
                                      currentPage === totalPages ||
                                      totalRecords === 0
                                    }
                                    aria-label="Next"
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
};

export default ApprovalLists;
