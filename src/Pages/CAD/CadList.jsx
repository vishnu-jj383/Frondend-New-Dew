import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  FaEdit,
  FaSearch,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { IoEye } from "react-icons/io5";
import Footer from "../../Components/Footer";
import Content from "../../Components/Content";
import Cookies from "js-cookie";

import "./Grid.css"; // Assuming this exists for styling

function CadList() {
 
  const API_URL = window.url + "cad/getAllCads";
  const SEARCH_API_URL = window.url + "cad/searchCads";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
 const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const navigate = useNavigate();

  // Filter state with corrected keys
  const [filters, setFilters] = useState({
    cadNo: "",
    status: "",
    startDate: "",
    endDate: "",
    startCadCompletedDate: "",
    endCadCompletedDate: "",
  });

  // Fetch all CADs with pagination
  const fetchOrders = async () => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        API_URL,
        { page: currentPage, pageSize: rowsPerPage },
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );
      setRows(response.data.data || []);
      setTotalRecords(response.data.totalRecords || 0);
      setIsSearchActive(false);
    } catch (err) {
      setError(`Failed to fetch CADs: ${err.response?.data?.message || err.message}`);
      if (err.response?.data?.message === "Token expired, please login again") {
        Cookies.remove("authToken");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  // Search CADs based on filters
  const searchCads = async () => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        SEARCH_API_URL,
        { ...filters, type: "cad" }, // Add type if required by API
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );
      setRows(response.data.data || []);
      setTotalRecords(response.data.totalRecords || response.data.data.length);
      setIsSearchActive(true);
    } catch (err) {
      setError(`Failed to search CADs: ${err.response?.data?.message || err.message}`);
      if (err.response?.data?.message === "Token expired, please login again") {
        Cookies.remove("authToken");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  // Load data based on filters or pagination
  useEffect(() => {
    const hasFilters = Object.values(filters).some((val) => val !== "");
    if (hasFilters) {
      searchCads();
    } else {
      fetchOrders();
    }
  }, [currentPage, filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  // Clear filters
  const handleClearFilter = () => {
    setFilters({
      cadNo: "",
      status: "",
      startDate: "",
      endDate: "",
      startCadCompletedDate: "",
      endCadCompletedDate: "",
    });
    setCurrentPage(1);
    setIsSearchActive(false);
  };

  // Navigation handlers
  const handleEdit = (cadId) => {
    navigate(`/cad_edit/${cadId}`);
  };

  const handleViewcad = (cadId) => {
    navigate(`/viewcad/${cadId}`);
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
            <div className="page-header d-flex justify-content-between align-items-center">
              <h3 className="fw-bold mb-3">CAD List</h3>
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
                          <label className="form-label">Start Date (From)</label>
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
                          <label className="form-label">Completed Date (From)</label>
                          <input
                            type="date"
                            name="startCadCompletedDate"
                            className="form-control"
                            value={filters.startCadCompletedDate}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Completed Date (To)</label>
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

            {/* Table */}
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-body">
                    {loading ? (
                      <p>Loading CADs...</p>
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
                                <th>CAD No</th>
                                <th>Concept ID</th>
                                <th>Request CAD Count</th>
                                <th>CAD Designer</th>
                                <th>Start Date</th>
                                <th>Completed Date</th>
                                <th>Status</th>
                                <th>Actions</th>
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
                                  <td>{row.reqCadCount}</td>
                                  <td style={{ minWidth: "250px", whiteSpace: "pre-line" }}>
                                    {row.cadDesigners && Array.isArray(row.cadDesigners) && row.cadDesigners.length > 0 ? (
                                      row.cadDesigners.map((designer, index) => (
                                        <div key={index}>{designer.name}</div>
                                      ))
                                    ) : (
                                      <div>No CAD Designer Available</div>
                                    )}
                                  </td>
                                  <td>{row.promiseDate}</td>
                                  <td>{row.cadCompletedDate}</td>
                                  <td>{row.status}</td>
                                  <td>
                                    <FaEdit
                                      onClick={() => {
                                        if (row.status !== "Approved" && row.status !== "Rejected") {
                                          handleEdit(row.id);
                                        }
                                      }}
                                      className={
                                       
                                        row.status === "Approved" || row.status === "Rejected"
                                          ? "opacity-50 cursor-not-allowed"
                                          : "action-icon"
                                      }
                                    />
                                  </td>
                                </tr>
                              ))
                            ) : isSearchActive ? (
                              <tr>
                                <td colSpan="10" className="text-center">
                                  No data found
                                </td>
                              </tr>
                            ) : (
                              <tr>
                                <td colSpan="10" className="text-center">
                                  No CAD found
                                </td>
                              </tr>
                            )}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination */}
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

export default CadList;