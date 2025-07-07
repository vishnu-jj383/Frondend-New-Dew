import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import Footer from "../../../Components/Footer";
import Content from "../../../Components/Content";
import Cookies from "js-cookie";
// import { useSelector } from "react-redux";
import debounce from "lodash/debounce";
import "./Designerreport.css";

const DesignerReports = () => {
  const API_URL = window.url + "design/designerReport";
  const SEARCH_API_URL = window.url + "design/searchDesignerReport";
  // const sideBarState = useSelector((state) => state?.sidebar?.sideBar);
  
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    designerName: "",
    designation: "",
    type: "",
  });

  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    if (!isSearchPending) {
      if (isSearchActive && Object.values(filters).some(val => val !== "")) {
        debouncedSearch(filters);
      } else {
        fetchOrders();
      }
    }
  }, [navigate, currentPage, rowsPerPage, isSearchActive, isSearchPending]);

  const fetchOrders = async () => {
    const savedToken = Cookies.get("authToken");
    
    try {
      const response = await axios.post(
        API_URL,
        { page: currentPage, pageSize: rowsPerPage },
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );
      setRows(response.data.data || []);
      setTotalRecords(response.data.totalCount || 0);
      // alert(response.data.totalCount || 0)
      setIsSearchActive(false);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
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
      const hasFilters = Object.values(newFilters).some(val => val !== "");

      if (hasFilters) {
        setIsSearchPending(true);
        setCurrentPage(1);
        debouncedSearch(newFilters);
        setIsSearchActive(true);
      } else {
        setIsSearchPending(false);
        setIsSearchActive(false);
        setCurrentPage(1);
        fetchOrders();
      }
      return newFilters;
    });
  };

  const handleClearFilter = () => {
    setFilters({
      designerName: "",
      designation: "",
      type: "",
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
              <h3 className="fw-bold mb-3">Employee Report</h3>
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

            {isFilterVisible && (
              <div className="row mb-4">
                <div className="col-md-12">
                  <div className="card">
                    <div className="card-body filter-section">
                      <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                          <label className="form-label">Designer Name</label>
                          <input
                            type="text"
                            name="designerName"
                            className="form-control"
                            value={filters.designerName}
                            onChange={handleFilterChange}
                            placeholder="Search by Designer Name"
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Designation</label>
                          <input
                            type="text"
                            name="designation"
                            className="form-control"
                            value={filters.designation}
                            onChange={handleFilterChange}
                            placeholder="Search by Designation"
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Type</label>
                          <select
                            name="type"
                            className="form-control"
                            value={filters.type}
                            onChange={handleFilterChange}
                          >
                            <option value="">Select Type</option>
                            <option value="all">All</option>
                            <option value="sketch">Sketch</option>
                            <option value="cad">CAD</option>
                            <option value="render">Render</option>
                          </select>
                        </div>
                        <div className="col-md-3 text-end">
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
                          <table id="basic-datatables" className="display table table-striped table-hover">
                            <thead>
                              <tr>
                                <th rowSpan="2" style={{ width: "10%" }}>Designer<br />Name</th>
                                <th rowSpan="2" style={{ width: "15%" }}>Email</th>
                                <th rowSpan="2" style={{ width: "10%" }}>Designation</th>
                                <th rowSpan="2" style={{ width: "10%" }}>Role</th>
                                <th colSpan="3" className="text-center sketch-section">Sketches</th>
                                <th colSpan="3" className="text-center cad-section">CAD</th>
                                <th colSpan="3" className="text-center render-section">Renders</th>
                              </tr>
                              <tr>
                                <th className="text-left sketch-section">Created</th>
                                <th className="text-left sketch-section">Selected<br />for<br />Customer</th>
                                <th className="text-left sketch-section">Selected<br />for<br />Dew</th>
                                <th className="text-left cad-section">Created</th>
                                <th className="text-left cad-section">Selected<br />for<br />Customer</th>
                                <th className="text-left cad-section">Selected<br />for<br />Dew</th>
                                <th className="text-left render-section">Created</th>
                                <th className="text-left render-section">Selected<br />for<br />Customer</th>
                                <th className="text-left render-section">Selected<br />for<br />Dew</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.length > 0 ? (
                                rows.map((row) => (
                                  <tr key={row.id}>
                                    <td>{row.name}</td>
                                    <td>{row.email}</td>
                                    <td>{row.designation || "N/A"}</td>
                                    <td>{row.Role?.type || "N/A"}</td>
                                    <td className="sketch-section">{row.createdSketches}</td>
                                    <td className="sketch-section">{row.selectedSketchesCustomer}</td>
                                    <td className="sketch-section">{row.selectedSketchesOwn}</td>
                                    <td className="cad-section">{row.createdCads}</td>
                                    <td className="cad-section">{row.selectedCadsCustomer}</td>
                                    <td className="cad-section">{row.selectedCadsOwn}</td>
                                    <td className="render-section">{row.createdRenders}</td>
                                    <td className="render-section">{row.selectedRendersCustomer}</td>
                                    <td className="render-section">{row.selectedRendersOwn}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="13" className="text-center">
                                    {isSearchActive ? "No data found" : "No designers found"}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {!isSearchActive && totalRecords > 0 && (
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
                                <li className={`page-item ${currentPage === totalPages || totalRecords === 0 ? "disabled" : ""}`}>
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
};

export default DesignerReports;