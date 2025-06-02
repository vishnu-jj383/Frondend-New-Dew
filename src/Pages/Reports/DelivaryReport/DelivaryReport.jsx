import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import Footer from "../../../Components/Footer";
import Content from "../../../Components/Content";
import Cookies from "js-cookie";

import debounce from "lodash/debounce";

function DelivaryReport() {
  const API_URL = window.url + "design/designDeliveryReports";
  const SEARCH_API_URL = window.url + "design/searchDesignDeliveryReport";
  const USERS_API_URL = window.url + "auth/getUsersByRoleType";
  const CUSTOMERS_API_URL = window.url + "customer/getAllCustomers";
  // const sideBarState = useSelector((state) => state?.sidebar?.sideBar);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage] = useState(10);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    customerName: "",
    startDate: "",
    endDate: "",
    designNo: "",
    salesRep: "",
  });

  const [salesRepOptions, setSalesRepOptions] = useState([]);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [customerFilter, setCustomerFilter] = useState("");
  const [salesRepFilter, setSalesRepFilter] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isSalesRepDropdownOpen, setIsSalesRepDropdownOpen] = useState(false);
  const customerDropdownRef = useRef(null);
  const salesRepDropdownRef = useRef(null);

  // Fetch initial data and dropdown options
  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    const fetchSalesReps = async () => {
      try {
        const response = await axios.post(
          USERS_API_URL,
          { type: "marketing" },
          { headers: { Authorization: `Bearer ${savedToken}` } }
        );
        setSalesRepOptions(response.data.data || []);
      } catch (err) {
        handleError(err, "sales reps");
      }
    };

    const fetchCustomers = async () => {
      try {
        const response = await axios.get(CUSTOMERS_API_URL, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        setCustomerOptions(response.data.data || []);
      } catch (err) {
        handleError(err, "customers");
      }
    };

    fetchSalesReps();
    fetchCustomers();
    fetchOrders(); // Initial fetch
  }, [navigate]);

  // Fetch data when page or rowsPerPage changes (only for non-search)
  useEffect(() => {
    if (!isSearchActive) {
      fetchOrders();
    }
  }, [currentPage, rowsPerPage]);

  // Handle clicks outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
        setIsCustomerDropdownOpen(false);
      }
      if (salesRepDropdownRef.current && !salesRepDropdownRef.current.contains(event.target)) {
        setIsSalesRepDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchOrders = async () => {
    const savedToken = Cookies.get("authToken");
    setLoading(true);
    try {
      const response = await axios.post(
        API_URL,
        { page: currentPage, pageSize: rowsPerPage },
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );
      console.log("Fetch Orders Response:", response.data);
      setRows(response.data.data || []);
      setTotalRecords(response.data.totalCount || 0);
      setIsSearchActive(false);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err, context = "data") => {
    const message = err.response?.data?.message || err.message;
    setError(`Failed to fetch ${context}: ${message}`);
    console.error(`Error fetching ${context}:`, err);
    if (message === "Token expired, please login again") {
      Cookies.remove("authToken");
      navigate("/");
    }
  };

  const debouncedSearch = useCallback(
    debounce(async (searchFilters) => {
      const savedToken = Cookies.get("authToken");
      setLoading(true);
      console.log("Search Filters:", searchFilters);
      try {
        const response = await axios.post(
          SEARCH_API_URL,
          searchFilters,
          { headers: { Authorization: `Bearer ${savedToken}` } }
        );
        console.log("Search Response:", response.data);
        setRows(response.data.data || []);
        setTotalRecords(response.data.data?.length || 0);
        setIsSearchActive(true);
        setCurrentPage(1); // Reset to first page for search results
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      console.log("Updated Filters:", newFilters);
      if (Object.values(newFilters).some(val => val !== "")) {
        debouncedSearch(newFilters);
        setIsSearchActive(true);
      } else {
        setIsSearchActive(false);
        fetchOrders();
      }
      return newFilters;
    });

    if (name === "customerName") setCustomerFilter(value);
    if (name === "salesRep") setSalesRepFilter(value);
  };

  const handleCustomerSelect = (customerName) => {
    setFilters(prev => ({ ...prev, customerName }));
    setCustomerFilter(customerName);
    setIsCustomerDropdownOpen(false);
    debouncedSearch({ ...filters, customerName });
    setIsSearchActive(true);
  };

  const handleSalesRepSelect = (repName) => {
    setFilters(prev => ({ ...prev, salesRep: repName }));
    setSalesRepFilter(repName);
    setIsSalesRepDropdownOpen(false);
    debouncedSearch({ ...filters, salesRep: repName });
    setIsSearchActive(true);
  };

  const handleClearFilter = () => {
    setFilters({
      customerName: "",
      startDate: "",
      endDate: "",
      designNo: "",
      salesRep: "",
    });
    setCustomerFilter("");
    setSalesRepFilter("");
    setCurrentPage(1);
    setIsSearchActive(false);
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
          <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
        </li>
      );
      if (startPage > 2) pageNumbers.push(<li key="start-ellipsis" className="page-item ellipsis"><span className="page-link">…</span></li>);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
          <button className="page-link" onClick={() => handlePageChange(i)}>{i}</button>
        </li>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pageNumbers.push(<li key="end-ellipsis" className="page-item ellipsis"><span className="page-link">…</span></li>);
      pageNumbers.push(
        <li key={totalPages} className="page-item">
          <button className="page-link" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
        </li>
      );
    }

    return pageNumbers;
  };

  const filteredCustomers = customerOptions.filter((customer) =>
    customer.customer_first_name.toLowerCase().includes(customerFilter.toLowerCase())
  );

  const filteredSalesReps = salesRepOptions.filter((rep) =>
    rep.name.toLowerCase().includes(salesRepFilter.toLowerCase())
  );

  return (
    <main className="main-content">
         
         <Content>
        <div className="">
          <div className="page-inner">
            <div className="page-header d-flex justify-content-between align-items-center">
              <h3 className="fw-bold mb-3">Design Delivery Report</h3>
              <button
                className="btn btn-link p-0"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                aria-label={isFilterVisible ? "Hide Filters" : "Show Filters"}
              >
                <FaSearch size={25} className={isFilterVisible ? "text-primary" : "text-muted"} />
              </button>
            </div>

            {isFilterVisible && (
              <div className="row mb-4">
                <div className="col-md-12">
                  <div className="card">
                    <div className="card-body filter-section">
                      <div className="row g-3 align-items-end">
                        <div className="col-md-4" ref={customerDropdownRef}>
                          <label className="form-label">Customer Name</label>
                          <div className="position-relative">
                            <input
                              type="text"
                              name="customerName"
                              className="form-control"
                              value={customerFilter}
                              onChange={(e) => {
                                setCustomerFilter(e.target.value);
                                setIsCustomerDropdownOpen(true);
                                handleFilterChange(e);
                              }}
                              onFocus={() => setIsCustomerDropdownOpen(true)}
                              placeholder="Search Customer Name"
                            />
                            {isCustomerDropdownOpen && (
                              <ul className="list-group position-absolute w-100" style={{ maxHeight: "200px", overflowY: "auto", zIndex: 1000, top: "100%", left: 0 }}>
                                {filteredCustomers.length > 0 ? (
                                  filteredCustomers.map((customer) => (
                                    <li
                                      key={customer.id}
                                      className="list-group-item list-group-item-action"
                                      onClick={() => handleCustomerSelect(customer.customer_first_name)}
                                      style={{ cursor: "pointer" }}
                                    >
                                      {customer.customer_first_name}
                                    </li>
                                  ))
                                ) : (
                                  <li className="list-group-item">No customers found</li>
                                )}
                              </ul>
                            )}
                          </div>
                        </div>

                        <div className="col-md-4">
                          <label className="form-label">Send Date (Start)</label>
                          <input
                            type="date"
                            name="startDate"
                            className="form-control"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                          />
                        </div>

                        <div className="col-md-4">
                          <label className="form-label">Send Date (End)</label>
                          <input
                            type="date"
                            name="endDate"
                            className="form-control"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                          />
                        </div>

                        <div className="col-md-4">
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

                        <div className="col-md-4" ref={salesRepDropdownRef}>
                          <label className="form-label">Sales Rep</label>
                          <div className="position-relative">
                            <input
                              type="text"
                              name="salesRep"
                              className="form-control"
                              value={salesRepFilter}
                              onChange={(e) => {
                                setSalesRepFilter(e.target.value);
                                setIsSalesRepDropdownOpen(true);
                                handleFilterChange(e);
                              }}
                              onFocus={() => setIsSalesRepDropdownOpen(true)}
                              placeholder="Search Sales Rep"
                            />
                            {isSalesRepDropdownOpen && (
                              <ul className="list-group position-absolute w-100" style={{ maxHeight: "200px", overflowY: "auto", zIndex: 1000, top: "100%", left: 0 }}>
                                {filteredSalesReps.length > 0 ? (
                                  filteredSalesReps.map((rep) => (
                                    <li
                                      key={rep.id}
                                      className="list-group-item list-group-item-action"
                                      onClick={() => handleSalesRepSelect(rep.name)}
                                      style={{ cursor: "pointer" }}
                                    >
                                      {rep.name}
                                    </li>
                                  ))
                                ) : (
                                  <li className="list-group-item">No Data Found</li>
                                )}
                              </ul>
                            )}
                          </div>
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
                                <th>Design Id</th>
                                <th>Customer Name</th>
                                <th>Sent Date</th>
                                <th>Sales Rep</th>
                                <th>Link Id</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.length > 0 ? (
                                rows.map((row) => (
                                  <tr key={row.id}>
                                    <td>{row.DesignId}</td>
                                    <td>{row.customerName}</td>
                                    <td>{row.sentDate}</td>
                                    <td>{row.salesRep}</td>
                                    <td>
                                      {row.customerId ? (
                                        <a
                                          href={`https://melodious-platypus-44a510.netlify.app/album/${row.customerId}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                        >
                                          View Album
                                        </a>
                                      ) : (
                                        "No Data"
                                      )}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="5" className="text-center">
                                    {isSearchActive ? "No data found" : "No delivery reports found"}
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
                          <div className="mt-4 text-muted">
                            Showing {rows.length} records
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

export default DelivaryReport;