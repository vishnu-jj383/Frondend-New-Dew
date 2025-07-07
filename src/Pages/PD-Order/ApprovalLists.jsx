import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import Footer from "../../Components/Footer";
import Header from "../../Components/Header";
import Content from "../../Components/Content";
import Cookies from "js-cookie";
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
// import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { IoEye } from "react-icons/io5";

import debounce from "lodash/debounce";
const ApprovalLists = () => {
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

  const handleVieworder = (customerId) => {
    navigate(`/vieworder/${customerId}`);
  };

  const handleApprovalChange = async (id, value) => {
    let reason = "";
    if (value === "Approved") {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to Approve this order?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, approve it!",
        cancelButtonText: "No, cancel!",
      });
      if (!result.isConfirmed) return;
    } else if (value === "Rejected") {
      const { value: inputReason } = await Swal.fire({
        title: "Reason for Rejection",
        input: "textarea",
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
        window.url + "order/updateOrderStatus",
        { orderId: id, status: value, ...(value === "Rejected" && { reason }) },
        { headers: { Authorization: `Bearer ${Cookies.get("authToken")}` } }
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
        title: "Success!",
        text: "Order status updated successfully.",
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to update Order status. Please try again.",
      });
    }
  };

  const handleMoveToSkitch = async (id) => {
    const confirmMove = await Swal.fire({
      title: "Do you want to move?",
      text: "This action will update the order status.",
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
        window.url + "order/sketchStatus",
        { orderId: id },
        { headers: { Authorization: `Bearer ${Cookies.get("authToken")}` } }
      );
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === id ? { ...row, orderStatus: "sketch" } : row
        )
      );
      Swal.fire({
        icon: "success",
        title: "Moved Successfully!",
        text: "The order status has been updated.",
      });
    } catch (error) {
      console.error("Error moving to Sketch:", error);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Failed to move the order. Please try again.",
      });
    }
  };

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
    getCustomer();
  }, [navigate, currentPage, rowsPerPage, isSearchActive, isSearchPending]);

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
      setLoading(true);
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
      const hasFilters = Object.values(newFilters).some((val) => val !== "");

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
              <h3 className="fw-bold mb-3">PD Approval List</h3>
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
                              <option key={cus.id} value={cus.id}>
                                {cus.customer_first_name}
                              </option>
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
                          <table className="table table-striped customer-table">
                            <thead>
                              <tr>
                                <th className="sticky-column"></th>
                                {/* <th>ID</th> */}
                                <th className="sticky-column">Concept ID</th>
                                <th>Customer Name</th>
                                <th>Order Date</th>
                                <th>Category</th>
                                <th>Promise Date</th>
                                <th>Status</th>
                                <th>Order Status</th>
                                <th>Approval</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.length > 0 ? (
                                rows.map((row) => (
                                  <tr key={row.id}>
                                    <td >
                                      <IoEye
                                        className="action-icon"
                                        onClick={() => handleVieworder(row.id)}
                                      />
                                    </td>
                                    {/* <td>{row.id}</td> */}
                                    <td >
                                      {row.orderNo}
                                    </td>
                                    <td>
                                      {row["Customer.customer_first_name"]}
                                    </td>
                                    <td>{row.orderDate}</td>
                                    <td>{row.categoryName}</td>
                                    <td>{row.promiseDate}</td>
                                    <td>{row.status}</td>
                                    <td>{row.orderStatus}</td>
                                    <td
                                      style={{
                                        minWidth: "200px",
                                        whiteSpace: "pre-line",
                                      }}
                                    >
                                      <select
                                        value={row.status}
                                        onChange={(e) =>
                                          handleApprovalChange(
                                            row.id,
                                            e.target.value
                                          )
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
                                        <option value="Approved">
                                          Approved
                                        </option>
                                        <option value="Rejected">
                                          Rejected
                                        </option>
                                      </select>
                                    </td>
                                    <td
                                      style={{
                                        minWidth: "200px",
                                        whiteSpace: "pre-line",
                                      }}
                                    >
                                      <button
                                        onClick={() =>
                                          handleMoveToSkitch(row.id)
                                        }
                                         className="btn btn-sm"
                                         style={{
                                          backgroundColor:
                                            row.orderStatus !== "order"
                                              ? "#0056b3"
                                              : "orange",
                                          animation:
                                            row.orderStatus === "order" &&
                                            row.status === "Approved"
                                              ? "blink 1s infinite"
                                              : "none",
                                          color: "white",
                                        }}
                                        disabled={
                                          row.orderStatus !== "order" ||
                                          row.status !== "Approved"
                                        }
                                        // className={`btn btn-sm ${
                                        //   row.sketchStatus !== "sketch"
                                        //     ? "btn-secondary"
                                        //     : "btn-success"
                                        // }`}
                                      >
                                        {row.orderStatus !== "order"
                                          ? "btn-success" && "Moved to Sketch"
                                          : "btn-info" && "Move to Sketch"}
                                       
                                      </button>
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
