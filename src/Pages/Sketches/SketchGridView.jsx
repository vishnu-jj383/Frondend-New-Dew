import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button, Card } from "antd";
import Footer from "../../Components/Footer";
import Content from "../../Components/Content";
import Cookies from "js-cookie";

import "./Grid.css";
import { FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import debounce from "lodash/debounce";

const { Meta } = Card;

const SketchGridView = () => {
  const API_URL = window.url + "tasks/getTaskImagesByType";
  const SEARCH_API_URL = window.url + "tasks/searchTaskImagesByType";
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const rowsPerPage = 12;
  const navigate = useNavigate();
  

  const [filters, setFilters] = useState({
    status: "",
    sketchNo: "",
  });

  // Fetch all sketches with pagination
  const getAllSketches = async () => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        API_URL,
        { type: "sketch", page: currentPage, pageSize: rowsPerPage },
        {
          headers: { Authorization: `Bearer ${savedToken}`, "Content-Type": "application/json" },
        }
      );
      setRows(response.data.data || []);
      setTotalRecords(response.data.totalRecords || 0);
      setIsSearchActive(false);
    } catch (err) {
      setError(`Failed to fetch sketches: ${err.response?.data?.message || err.message}`);
      if (err.response?.data?.message === "Token expired, please login again") {
        Cookies.remove("authToken");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchFilters) => {
      const savedToken = Cookies.get("authToken");
      if (!savedToken) {
        navigate("/");
        return;
      }

      // setLoading(true);
      try {
        const response = await axios.post(
          SEARCH_API_URL,
          { type: "sketch", ...searchFilters },
          { headers: { Authorization: `Bearer ${savedToken}` } }
        );
        const data = response.data.data || [];
        setRows(data);
        setTotalRecords(data.length); // Assuming search doesn't return totalRecords
        setIsSearchActive(true);
      } catch (err) {
        setError(`Failed to search sketches: ${err.response?.data?.message || err.message}`);
        if (err.response?.data?.message === "Token expired, please login again") {
          Cookies.remove("authToken");
          navigate("/");
        }
      } finally {
        setLoading(false);
        setIsSearchPending(false);
      }
    }, 500),
    []
  );

  // Load data based on filters or pagination
  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }
    if (!isSearchPending) {
      if (isSearchActive && (filters.status || filters.sketchNo)) {
        debouncedSearch(filters);
      } else {
        getAllSketches();
      }
    }
  }, [navigate, currentPage, isSearchActive, isSearchPending]);

  // Handle filter changes
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
        setIsSearchActive(false);
        getAllSketches();
      }
      return newFilters;
    });
  };

  // Clear filters and reload full data
  const handleClearFilter = () => {
    setFilters({ status: "", sketchNo: "" });
    setCurrentPage(1);
    setIsSearchActive(false);
    setIsSearchPending(false);
    getAllSketches();
  };

  // Pagination navigation
  const handlePageChange = (page) => {
    if (page >= 1 && page <= Math.ceil(totalRecords / rowsPerPage)) {
      setCurrentPage(page);
    }
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  // Render page numbers
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
        <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
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
          <button className="page-link" onClick={() => handlePageChange(totalPages)}>
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
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h3 className="fw-bold">Sketch Grid View</h3>
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

            {/* Filter Section */}
            {isFilterVisible && (
              <div className="row mb-4">
                <div className="col-md-12">
                  <div className="card">
                    <div className="card-body">
                      <div className="row g-3">
                        <div className="col-md-3">
                          <label className="form-label">Sketch No</label>
                          <input
                            type="text"
                            name="sketchNo"
                            className="form-control"
                            value={filters.sketchNo}
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
                       
                        <div className="col-md-3">
                        <br/><br/>
                          <button
                            className="btn btn-outline-primary"
                            onClick={handleClearFilter}
                            disabled={!filters.status && !filters.sketchNo}
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

            {/* Cards Display */}
            <div className="sketch-card-container">
              {loading && (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              )}
              {error && <p style={{ color: "red" }}>{error}</p>}
              {!loading && !error && (
                <>
                  {rows.length > 0 ? (
                    <div className="card-grid">
                      {rows.map((design, index) => (
                        <div className="card-item" key={index}>
                          <Card
                            hoverable
                            style={{ cursor: "default" }}
                            cover={
                              design.imageUrls?.[0] ? (
                                <img
                                  alt="Design Preview"
                                  src={design.imageUrls[0]}
                                  className="card-image"
                                  onError={(e) => (e.target.style.display = "none")}
                                />
                              ) : (
                                <div className="card-image no-image-message">
                                  No Image Found
                                </div>
                              )
                            }
                          >
                            <Meta title={`Sketch No: ${design.sketchNo || "N/A"}`} />
                            <Meta description={`Created Date: ${design.createdAt || "N/A"}`} />
                            <Button
                              className={`antd_btn ${
                                design.sketchStatus === "Approved"
                                  ? "btn-approved"
                                  : design.sketchStatus === "Rejected"
                                  ? "btn-rejected"
                                  : "btn-pending"
                              }`}
                              style={{
                                backgroundColor:
                                  design.sketchStatus === "Approved"
                                    ? "green"
                                    : design.sketchStatus === "Rejected"
                                    ? "red"
                                    : "orange",
                                color: "white",
                                cursor: "default",
                              }}
                            >
                              {design.sketchStatus === "Approved"
                                ? "✔ Approved"
                                : design.sketchStatus === "Rejected"
                                ? "✖ Rejected"
                                : "Pending"}
                            </Button>
                          </Card>
                        </div>
                      ))}
                    </div>
                  ) : isSearchActive ? (
                    <div className="no-data-found text-center py-4">
                      <p>No data found</p>
                    </div>
                  ) : (
                    <div className="no-data-found text-center py-4">
                      <p>No sketches found</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Pagination - Only shown when not searching */}
            {!isSearchActive && (
              <div className="pagination-container mt-4">
                <div className="pagination-info text-muted">
                  Showing {rows.length} of {totalRecords} records
                </div>
                <nav>
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
          </div>
        </div>
        </Content>
    <Footer />
  </main>
  );
};

export default SketchGridView;