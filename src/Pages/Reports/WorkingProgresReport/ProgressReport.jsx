import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import Footer from "../../../Components/Footer";
import Content from "../../../Components/Content";

import Cookies from "js-cookie";

import debounce from "lodash/debounce";
import "../../globalTable.css"; // Assuming you have this CSS file
import { useAtom } from 'jotai';

import { customerListAtom } from "../../atoms/CustomerAtom";
function ProgressReport() {
  const API_URL = window.url + "tasks/workInProgressReport";
  const SEARCH_API_URL = window.url + "tasks/searchWorkInProgress";
  const CustomerAPI_URL = window.url + "customer/getAllCustomers";
  const getDesignername_Url = window.url + "auth/getUsersByRoleType";
 
  const navigate = useNavigate();
  const [customer_rows] = useAtom(customerListAtom);

  const [rows, setRows] = useState([]);
  // const [customer_rows, setCustomer_Rows] = useState([]);
  const [designer_name_array, setDesigner_name_array] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [filters, setFilters] = useState({
    orderStatus: "",
    customerName: "",
    startDate: "",
    endDate: "",
    designer: "",
    orderNo: "", 
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

    // getCustomer();
    getDesigner_Data();
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
      // alert(response.data.totalRecords )
      setTotalRecords(response.data.totalRecords || 0);
      setIsSearchActive(false);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  // const getCustomer = async () => {
  //   try {
  //     const response = await axios.get(CustomerAPI_URL, {
  //       headers: { Authorization: `Bearer ${Cookies.get("authToken")}` },
  //     });
  //     setCustomer_Rows(response.data.data || []);
  //   } catch (err) {
  //     handleError(err);
  //   }
  // };

  const getDesigner_Data = async () => {
    try {
      const requestData = { type: "productDevelopment" };
      const response = await axios.post(getDesignername_Url, requestData, {
        headers: {
          Authorization: `Bearer ${Cookies.get("authToken")}`,
          "Content-Type": "application/json",
        },
      });
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
      orderStatus: "",
      customerName: "",
      startDate: "",
      endDate: "",
      designer: "",
      orderNo: "",
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
              <h3 className="fw-bold mb-3">Working Progress Report</h3>
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
                          <label className="form-label">Order No</label>
                            <input
                          type="text"
                          name="orderNo"
                          className="form-control"
                          value={filters.orderNo}
                          onChange={handleFilterChange}
                          placeholder="Search by Order No"
                        />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Designer</label>
                          <select
                            name="designer"
                            className="form-control"
                            value={filters.designer}
                            onChange={handleFilterChange}
                          >
                            <option value="">Select Designer</option>
                            {designer_name_array.map((designer) => (
                              <option key={designer.id} value={designer.name}>
                                {designer.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Customer</label>
                          <select
                            name="customerName"
                            className="form-control"
                            value={filters.customerName}
                            onChange={handleFilterChange}
                          >
                            <option value="">Select Customer</option>
                            {customer_rows.map((cus) => (
                              <option key={cus.id} value={cus.customer_first_name}>
                                {cus.customer_first_name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Department</label>
                          <select
                            name="orderStatus"
                            className="form-control"
                            value={filters.orderStatus}
                            onChange={handleFilterChange}
                          >
                            <option value="">Select Order Status</option>
                            <option value="order">Order</option>
                            <option value="sketch">Sketch</option>
                            <option value="cad">CAD</option>
                            <option value="render">Render</option>
                            <option value="design">Design</option>
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Start Date</label>
                          <input
                            type="date"
                            name="startDate"
                            className="form-control"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">End Date</label>
                          <input
                            type="date"
                            name="endDate"
                            className="form-control"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                          />
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
                          <table className="display table table-striped table-hover customer-table">
                            <thead>
                              <tr>
                                {/* <th>Task No</th> */}
                                <th>Order No</th>
                                <th>Department</th>
                                <th>Customer Name</th>
                                <th>Start Date</th>
                                <th>End Date</th>
                                <th>No Of Days</th>
                                <th>Designer</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.length > 0 ? (
                                rows.map((row) => (
                                  <tr key={row.id}>
                                    {/* <td>{row.taskNo}</td> */}
                                    <td>{row.orderNo}</td>
                                    <td>{row.orderStatus || "N/A"}</td>
                                    <td>{row.customerName || "N/A"}</td>
                                    <td>{row.startDate || "N/A"}</td>
                                    <td>{row.endDate || "N/A"}</td>
                                    <td>{row.noOfDays || "N/A"}</td>
                                    <td>{row.designer || "N/A"}</td>
                                  </tr>
                                ))
                              ) : isSearchActive ? (
                                <tr>
                                  <td colSpan="8" className="text-center">
                                    No Data Found
                                  </td>
                                </tr>
                              ) : (
                                <tr>
                                  <td colSpan="8" className="text-center">
                                    No Tasks Found
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
}

export default ProgressReport;