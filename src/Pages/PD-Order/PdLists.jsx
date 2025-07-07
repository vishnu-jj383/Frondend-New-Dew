import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { FaEdit, FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import { IoEye } from "react-icons/io5";
import Content from "../../Components/Content";
import Cookies from "js-cookie";
import debounce from "lodash/debounce";
const PdLists = () => {
  const API_URL = window.url + "order/getAllOrders";
  const SEARCH_API_URL = window.url + "order/searchOrders";
  const CustomerAPI_URL = window.url + "customer/getAllCustomers";

  const [rows, setRows] = useState([]);
  const [customer_rows, setCustomer_Rows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [filters, setFilters] = useState({
    orderId: "",
    customerId: "",
    status: "",
    orderDateStart: "",
    orderDateEnd: "",
    promiseDateStart: "",
    promiseDateEnd: "",
  });

  const navigate = useNavigate();


  const handleEdit = (customerId) => {
    navigate(`/pdedit/${customerId}`);
  };

  const handleVieworder = (customerId) => {
    navigate(`/vieworder/${customerId}`);
  };
 const savedToken = Cookies.get("authToken");
  useEffect(() => {
    // const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/login", { replace: true }); // Use replace to avoid adding to history
    }
    // if (!savedToken) {
     
    //   navigate("/");
    //   return;
    // }

    if (!isSearchPending) {
      if (isSearchActive && Object.values(filters).some(val => val !== "")) {
        debouncedSearch(filters);
      } else {
        fetchOrders();
      }
    }
    getCustomer();
  }, [navigate, savedToken, currentPage, rowsPerPage, isSearchActive, isSearchPending]);
  // if (!savedToken) {
  //   return null; // Or a loading spinner: <div>Loading...</div>
  // }

  const fetchOrders = async () => {
    const savedToken = Cookies.get("authToken");
    setLoading(true);
    try {
      const response = await axios.post(
        API_URL,
        { page: currentPage, pageSize: rowsPerPage },
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );
      setRows(response.data.data || []);
      setTotalRecords(response.data.totalOrders || 0);
      setIsSearchActive(false);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const getCustomer = async () => {
    try {
      const response = await axios.get(CustomerAPI_URL, {
        headers: { Authorization: `Bearer ${Cookies.get("authToken")}` },
      });
      setCustomer_Rows(response.data.data || []);
    } catch (err) {
      // handleError(err);
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
          { ...searchFilters, page: currentPage, pageSize: rowsPerPage },
          { headers: { Authorization: `Bearer ${savedToken}` } }
        );
        setRows(response.data.data || []);
        setTotalRecords(response.data.totalOrders || 0);
        setIsSearchActive(true);
      } catch (err) {
        handleError(err);
      } finally {
        setLoading(false);
        setIsSearchPending(false);
      }
    }, 500),
    [currentPage, rowsPerPage]
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
      } else {
        setIsSearchPending(false);
        setIsSearchActive(false);
        fetchOrders();
      }
      return newFilters;
    });
  };

  const handleClearFilter = () => {
    setFilters({
      orderId: "",
      customerId: "",
      status: "",
      orderDateStart: "",
      orderDateEnd: "",
      promiseDateStart: "",
      promiseDateEnd: "",
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
          <button className="page-link" onClick={() => handlePageChange(1)}>1</button>
        </li>
      );
      if (startPage > 2) {
        pageNumbers.push(<li key="start-ellipsis" className="page-item ellipsis"><span className="page-link">…</span></li>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <li key={i} className={`page-item ${currentPage === i ? "active" : ""}`}>
          <button className="page-link" onClick={() => handlePageChange(i)}>{i}</button>
        </li>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(<li key="end-ellipsis" className="page-item ellipsis"><span className="page-link">…</span></li>);
      }
      pageNumbers.push(
        <li key={totalPages} className="page-item">
          <button className="page-link" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
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
              <h3 className="fw-bold mb-3">PD List</h3>
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
                        <div className="col-md-3">
                          <label>Concept ID</label>
                          <input
                            type="text"
                            name="orderId"
                            className="form-control"
                            value={filters.orderId}
                            onChange={handleFilterChange}
                            placeholder="Search by Concept ID"
                          />
                        </div>
                        <div className="col-md-3">
                          <label>Customer Name</label>
                          <select
                            name="customerId"
                            className="form-control"
                            value={filters.customerId}
                            onChange={handleFilterChange}
                          >
                            <option value="">Select Customer</option>
                            {customer_rows.map((cus) => (
                              <option key={cus.id} value={cus.id}>{cus.customer_first_name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="col-md-3">
                          <label>Order Date (Start)</label>
                          <input
                            type="date"
                            name="orderDateStart"
                            className="form-control"
                            value={filters.orderDateStart}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-md-3">
                          <label>Order Date (End)</label>
                          <input
                            type="date"
                            name="orderDateEnd"
                            className="form-control"
                            value={filters.orderDateEnd}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-md-3">
                          <label>Promised Date (Start)</label>
                          <input
                            type="date"
                            name="promiseDateStart"
                            className="form-control"
                            value={filters.promiseDateStart}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-md-3">
                          <label>Promised Date (End)</label>
                          <input
                            type="date"
                            name="promiseDateEnd"
                            className="form-control"
                            value={filters.promiseDateEnd}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-md-3">
                          <label>Status</label>
                          <select
                            name="status"
                            className="form-control"
                            value={filters.status}
                            onChange={handleFilterChange}
                          >
                            <option value="">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
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
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="spinner-border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </div>
                      </div>
                    ) : error ? (
                      <p className="text-danger">{error}</p>
                    ) : (
                      <>
                        <div className="table-responsive">
                          <table className="display table table-striped table-hover relative customer-table">
                            <thead>
                              <tr>
                                <th></th>
                                {/* <th>ID</th> */}
                                <th>Concept ID</th>
                                <th>Order Date</th>
                                <th>Customer Name</th>
                                <th>Category</th>
                                <th>Promised Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.length > 0 ? (
                                rows.map((row) => (
                                  <tr key={row.id}>
                                    <td><IoEye className="action-icon" onClick={() => handleVieworder(row.id)} /></td>
                                    {/* <td>{row.id}</td> */}
                                    <td>{row.orderNo}</td>
                                    <td>{row.orderDate}</td>
                                    <td>{row["Customer.customer_first_name"]}</td>
                                    <td>{row["Category.category_name"]}</td>
                                    <td>{row.promiseDate}</td>
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
                                  <td colSpan="9" className="text-center">
                                    No data found
                                  </td>
                                </tr>
                              ) : (
                                <tr>
                                  <td colSpan="9" className="text-center">
                                    No data found
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
    </main>
  );
};

export default PdLists;