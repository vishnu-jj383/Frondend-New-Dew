import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  FaEdit,
  FaTrash,
  FaEllipsisV,
  FaFilter, // Added FaFilter for the toggle button
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Footer from "../../Components/Footer";
import Content from "../../Components/Content";
// import Header from "../Header";
// import SideBar from "../SideBar";
import Cookies from "js-cookie";
// import { useSelector } from "react-redux";
import { IoEye } from "react-icons/io5";
import "../globalTable.css";
import debounce from "lodash/debounce";

const SketchList = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const API_URL = window.url + "sketch";
  const SEARCH_API_URL = window.url + "sketch/searchSketches";
  const getDesignername_Url = window.url + "auth/getUsersByRoleType";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false); // New state for filter visibility
  const navigate = useNavigate();

  // Filters State
  const [designer_name_array, setDesigner_name_array] = useState([]);
  const [filters, setFilters] = useState({
    userId: "",
    status: "",
    sketchBriefDateStart: "",
    sketchBriefDateEnd: "",
  });

  // const sideBarState = useSelector((state) => state?.sidebar?.sideBar);

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
      const response = await axios.post(
        getDesignername_Url,
        { type: "productDevelopment" },
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setDesigner_name_array(response.data.data || []);
    } catch (err) {
      console.error(`Failed to fetch designer data: ${err.message}`);
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

  const handleEdit = (customerId) => navigate(`/edit/${customerId}`);
  const handleViewsketch = (customerId) =>
    navigate(`/viewsketch/${customerId}`);

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
      <Content>
        <div className="">
          <div className="page-inner">
            <div className="page-header d-flex justify-content-between align-items-center">
              <h3 className="fw-bold mb-3">Sketch List</h3>
              <div className="d-flex justify-content-end mb-3">
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
                            className="form-control"
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
                            className="form-control"
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

            {/* Table Section */}
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-body">
                    {loading && (
                      <div className="text-center py-4">
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    )}
                    {error && <p className="text-danger">{error}</p>}
                    {!loading && !error && (
                      <>
                        <div className="table-responsive">
                          <table className="display table table-striped table-hover customer-table">
                            <thead>
                              <tr>
                                <th></th>
                                {/* <th>ID</th> */}
                                <th>Sketch ID</th>
                                <th>Concept ID</th>
                                <th>Sketcher Name</th>
                                <th>Start Date</th>
                                <th>Completed Date</th>
                                <th>Status</th>
                                <th>Actions</th>
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
                                      {row.sketchers?.length > 0
                                        ? row.sketchers.map((s) => (
                                            <div key={s.id}>{s.name}</div>
                                          ))
                                        : "N/A"}
                                    </td>
                                    <td>{row.sketchBriefDate || "N/A"}</td>
                                    <td>{row.sketchCompletedDate || "N/A"}</td>
                                    <td>{row.status}</td>
                                    <td>
                                      <FaEdit
                                        className={`action-icon ${
                                          row.status === "Approved" ||
                                          row.status === "Rejected"
                                            ? "text-muted opacity-50"
                                            : ""
                                        }`}
                                        onClick={() =>
                                          row.status !== "Approved" &&
                                          row.status !== "Rejected" &&
                                          handleEdit(row.id)
                                        }
                                      />
                                    </td>
                                  </tr>
                                ))
                              ) : isSearchActive ? (
                                <tr>
                                  <td colSpan="9" className="text-center">
                                    No data found
                                  </td>
                                </tr>
                              ) : (
                                <tr>
                                  <td colSpan="9" className="text-center">
                                    No sketches found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

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

export default SketchList;
