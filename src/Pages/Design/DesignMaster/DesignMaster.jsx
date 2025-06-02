import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import Footer from "../../../Components/Footer";
import Content from "../../../Components/Content";
import Cookies from "js-cookie";
// import { useSelector } from "react-redux";
import { Image } from "antd";
import debounce from "lodash/debounce";
import "../../globalTable.css";

const DesignMaster = () => {
  const API_URL = window.url + "design/getAllDesign";
  const SEARCH_API_URL = window.url + "design/searchAllDesigns";

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage] = useState(10);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const navigate = useNavigate();
  // const sideBarState = useSelector((state) => state?.sidebar?.sideBar);

  const [filters, setFilters] = useState({
    designNo: "",
    category: "",
    subCategory: "",
    metal_color: "",
    metal: "",
  });

  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    if (!isSearchPending) {
      if (isSearchActive && Object.values(filters).some((val) => val !== "")) {
        debouncedSearch(filters);
      } else {
        fetchOrders();
      }
    }
  }, [navigate, currentPage, rowsPerPage, isSearchActive, isSearchPending]);

  const fetchOrders = async () => {
    const savedToken = Cookies.get("authToken");
    setLoading(true);
    try {
      const response = await axios.post(
        API_URL,
        { type: "others", page: currentPage, pageSize: rowsPerPage },
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
          {
            type: "others",
            designNo: searchFilters.designNo,
            category: searchFilters.category,
            subCategory: searchFilters.subCategory,
            metal_color: searchFilters.metal_color,
            metal: searchFilters.metal,
          },
          { headers: { Authorization: `Bearer ${savedToken}` } }
        );
        const data = response.data.data || [];
        setRows(data);
        setTotalRecords(data.length); // No pagination, so totalRecords is the length of results
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
      const hasFilters = Object.values(newFilters).some((val) => val !== "");

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
      designNo: "",
      category: "",
      subCategory: "",
      metal_color: "",
      metal: "",
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
              <h3 className="fw-bold mb-3">Design Master</h3>
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
                        <div className="col-md-2">
                          <label className="form-label">Design No</label>
                          <input
                            type="text"
                            name="designNo"
                            className="form-control"
                            value={filters.designNo}
                            onChange={handleFilterChange}
                            placeholder="Search by Design No"
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">Category</label>
                          <input
                            type="text"
                            name="category"
                            className="form-control"
                            value={filters.category}
                            onChange={handleFilterChange}
                            placeholder="Search by Category"
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">Subcategory</label>
                          <input
                            type="text"
                            name="subCategory"
                            className="form-control"
                            value={filters.subCategory}
                            onChange={handleFilterChange}
                            placeholder="Search by Subcategory"
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">Metal Color</label>
                          <input
                            type="text"
                            name="metal_color"
                            className="form-control"
                            value={filters.metal_color}
                            onChange={handleFilterChange}
                            placeholder="Search by Metal Color"
                          />
                        </div>
                        <div className="col-md-2">
                          <label className="form-label">Metal</label>
                          <input
                            type="text"
                            name="metal"
                            className="form-control"
                            value={filters.metal}
                            onChange={handleFilterChange}
                            placeholder="Search by Metal"
                          />
                        </div>
                        <div className="col-md-2 text-end">
                          <button
                            className="btn btn-outline-primary"
                            onClick={handleClearFilter}
                            disabled={!Object.values(filters).some((val) => val !== "")}
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
                          <table className="display table table-striped table-hover  customer-table">
                            <thead>
                              <tr>
                                <th style={{ whiteSpace: "nowrap" }}>Design No</th>
                                <th style={{ whiteSpace: "nowrap" }}>Category</th>
                                <th style={{ whiteSpace: "nowrap" }}>Subcategory</th>
                                <th>Image</th>
                                <th>Product Type</th>
                                <th>Expected Gross Wt</th>
                                <th style={{ whiteSpace: "nowrap" }}>Brand</th>
                                <th style={{ whiteSpace: "nowrap" }}>Metal</th>
                                <th>Metal Color</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.length > 0 ? (
                                rows.map((row) => (
                                  <tr key={row.id}>
                                    <td>{row.designNo}</td>
                                    <td>{row.category}</td>
                                    <td>{row.subcategory}</td>
                                    <td>
                                      {Array.isArray(row.imageUrls) && row.imageUrls.length > 0 ? (
                                        <Image.PreviewGroup>
                                          {row.imageUrls.map((img, index) => (
                                            <Image key={index} src={img} width="60%" alt={`image-${index}`} />
                                          ))}
                                        </Image.PreviewGroup>
                                      ) : row.imageUrls ? (
                                        <Image src={row.imageUrls} width="100%" alt="single-image" />
                                      ) : (
                                        <p>No Image Available</p>
                                      )}
                                    </td>
                                    <td>{row.productType}</td>
                                    <td>{row.expectedGrossWt}</td>
                                    <td>{row.brand}</td>
                                    <td>{row.metal}</td>
                                    <td>{row.metalColor}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="9" className="text-center">
                                    {isSearchActive ? "No matching designs found" : "No designs available"}
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
                        {isSearchActive && (
                          <div className="pagination-info text-muted mt-4">
                            Showing {rows.length} matching records
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
    <Footer/>
  </main>
  );
};

export default DesignMaster;