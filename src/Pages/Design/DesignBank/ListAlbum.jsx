import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { IoEye } from "react-icons/io5";
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import Footer from "../../../Components/Footer";
import Content from "../../../Components/Content";
import Cookies from "js-cookie";
// import { useSelector } from "react-redux";
import debounce from "lodash/debounce";
import "../../globalTable.css";

function ListAlbum() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage] = useState(10);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  
  const CUSTOMERS_API_URL = window.url + "customer/getAllCustomers";
  const API_URL = window.url + "album/getAllAlbum";
  const SEARCH_API_URL = window.url + "album/searchAlbumsByCustomer";
  
  const navigate = useNavigate();
  // const sideBarState = useSelector((state) => state?.sidebar?.sideBar);
  const [customerOptions, setCustomerOptions] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [filteredEmails, setFilteredEmails] = useState([]);
  
  const [filters, setFilters] = useState({
    customerName: "",
    customerEmail: "",
  });
  
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isEmailDropdownOpen, setIsEmailDropdownOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  
  const customerDropdownRef = useRef(null);
  const emailDropdownRef = useRef(null);

  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    const handleClickOutside = (event) => {
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target)) {
        setIsCustomerDropdownOpen(false);
      }
      if (emailDropdownRef.current && !emailDropdownRef.current.contains(event.target)) {
        setIsEmailDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    
    if (!isSearchPending) {
      if (isSearchActive && Object.values(filters).some(val => val !== "")) {
        debouncedSearch(filters);
      } else {
        fetchOrders();
      }
    }
    fetchCustomers();

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [navigate, currentPage, rowsPerPage, isSearchActive, isSearchPending]);

  const fetchCustomers = async () => {
    const savedToken = Cookies.get("authToken");
    setLoading(true);
    try {
      const response = await axios.get(CUSTOMERS_API_URL, {
        headers: { Authorization: `Bearer ${savedToken}` },
      });
      const customers = response.data.data || [];
      console.log("Customer API Response:", customers); // Debug log
      setCustomerOptions(customers);
      setFilteredCustomers(customers);
      const validEmails = [...new Set(customers
        .map(c => c.customer_email)
        .filter(email => email !== null && email !== ""))];
      setFilteredEmails(validEmails);
    } catch (err) {
      // handleError(err, "customers");
      console.error(`Failed to fetch designer data: ${err.message}`)
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    const savedToken = Cookies.get("authToken");
    setLoading(true);
    try {
      const response = await axios.post(
        API_URL,
        { page: currentPage, pageSize: rowsPerPage },
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );
      console.log("Fetch Orders Response:", response.data); // Debug log
      setRows(response.data.albums || []);
      setTotalRecords(response.data.totalRecords || 0);
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
    if (message === "Token expired, please login again") {
      Cookies.remove("authToken");
      navigate("/");
    }
  };

  const debouncedSearch = useCallback(
    debounce(async (searchFilters) => {
      const savedToken = Cookies.get("authToken");
     
      console.log("Search Filters Sent:", searchFilters); // Debug log
      try {
        const response = await axios.post(
          SEARCH_API_URL,
          { ...searchFilters },
          { headers: { Authorization: `Bearer ${savedToken}` } }
        );
        console.log("Search API Response:", response.data); // Debug log
        const data = response.data.albums || [];
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

  const handleCustomerSearch = (e) => {
    const value = e.target.value;
    setCustomerSearch(value);
    setFilteredCustomers(
      customerOptions.filter(customer =>
        customer.customer_first_name.toLowerCase().includes(value.toLowerCase())
      )
    );
    setIsCustomerDropdownOpen(true);
  };

  const handleEmailSearch = (e) => {
    const value = e.target.value;
    setEmailSearch(value);
    setFilteredEmails(
      customerOptions
        .map(c => c.customer_email)
        .filter(email => email && email.toLowerCase().includes(value.toLowerCase()))
    );
    setIsEmailDropdownOpen(true);
  };

  const handleCustomerSelect = (customerName) => {
    setFilters(prev => ({ ...prev, customerName }));
    setCustomerSearch(customerName);
    setIsCustomerDropdownOpen(false);
    setIsSearchPending(true);
    setCurrentPage(1);
    debouncedSearch({ customerName }); // Only send customerName
    setIsSearchActive(true);
  };

  const handleEmailSelect = (customerEmail) => {
    setFilters(prev => ({ ...prev, customerEmail }));
    setEmailSearch(customerEmail);
    setIsEmailDropdownOpen(false);
    setIsSearchPending(true);
    setCurrentPage(1);
    debouncedSearch({ customerEmail }); // Only send customerEmail
    setIsSearchActive(true);
  };

  const handleClearFilter = () => {
    setFilters({
      customerName: "",
      customerEmail: "",
    });
    setCustomerSearch("");
    setEmailSearch("");
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

  const handelViewdesign = (customerId) => {
    navigate(`/view_customer_album/${customerId}`);
  };

  return (
    <main className="main-content">
   
    <Content>
        <div className="">
          <div className="page-inner">
            <div className="page-header d-flex justify-content-between align-items-center">
              <h3 className="fw-bold mb-3">Customer Album List</h3>
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
                        <div className="col-md-4 position-relative" ref={customerDropdownRef}>
                          <label className="form-label">Customer Name</label>
                          <input
                            type="text"
                            className="form-control"
                            value={customerSearch}
                            onChange={handleCustomerSearch}
                            onFocus={() => setIsCustomerDropdownOpen(true)}
                            placeholder="Search customers..."
                          />
                          {isCustomerDropdownOpen && (
                            <div className="dropdown-menu show w-100" style={{ maxHeight: "200px", overflowY: "auto" }}>
                              {filteredCustomers.length > 0 ? (
                                filteredCustomers.map((customer) => (
                                  <button
                                    key={customer.id}
                                    className="dropdown-item"
                                    onClick={() => handleCustomerSelect(customer.customer_first_name)}
                                  >
                                    {customer.customer_first_name}
                                  </button>
                                ))
                              ) : (
                                <div className="dropdown-item text-muted">No customers found</div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="col-md-4 position-relative" ref={emailDropdownRef}>
                          <label className="form-label">Customer Email</label>
                          <input
                            type="text"
                            className="form-control"
                            value={emailSearch}
                            onChange={handleEmailSearch}
                            onFocus={() => setIsEmailDropdownOpen(true)}
                            placeholder="Search emails..."
                          />
                          {isEmailDropdownOpen && (
                            <div className="dropdown-menu show w-100" style={{ maxHeight: "200px", overflowY: "auto" }}>
                              {filteredEmails.length > 0 ? (
                                filteredEmails.map((email) => (
                                  <button
                                    key={email}
                                    className="dropdown-item"
                                    onClick={() => handleEmailSelect(email)}
                                  >
                                    {email}
                                  </button>
                                ))
                              ) : (
                                <div className="dropdown-item text-muted">
                                  No valid emails available
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="col-md-4 text-end">
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
                                <th></th>
                                <th style={{ whiteSpace: "nowrap" }}>Customer Name</th>
                                <th style={{ whiteSpace: "nowrap" }}>Customer Email</th>
                                <th style={{ whiteSpace: "nowrap" }}>Album Count</th>
                                <th>Latest Album Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.length > 0 ? (
                                rows.map((row) => (
                                  <tr key={row.customerId}>
                                    <td>
                                      <IoEye className="action-icon" onClick={() => handelViewdesign(row.customerId)} />
                                    </td>
                                    <td>{row.customerName}</td>
                                    <td>{row.customerEmail || "N/A"}</td>
                                    <td>{row.albumCount}</td>
                                    <td>{row.latestAlbumOn}</td>
                                  </tr>
                                ))
                              ) : isSearchActive ? (
                                <tr>
                                  <td colSpan="5" className="text-center">
                                    No data found
                                  </td>
                                </tr>
                              ) : (
                                <tr>
                                  <td colSpan="5" className="text-center">
                                    No albums found
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
    <Footer/>
  </main>
  );
}

export default ListAlbum;