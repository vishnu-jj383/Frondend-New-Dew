import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router";
import axios from 'axios';
import Footer from '../../Components/Footer';
import Header from '../../Components/Header';
import Content from '../../Components/Content';
import Cookies from 'js-cookie';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
// import { useSelector } from "react-redux";
import Swal from 'sweetalert2';
import { IoEye } from "react-icons/io5";

const ApprovalLists = () => {
  const [rows, setRows] = useState([]);
  const [customer_rows, setCustomer_Rows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isSearchActive, setIsSearchActive] = useState(false); // Added search state

  // Search State
  const [orderId, setOrderId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("");
  const [orderDateStart, setOrderDateStart] = useState("");
  const [orderDateEnd, setOrderDateEnd] = useState("");
  const [promiseDateStart, setPromiseDateStart] = useState("");
  const [promiseDateEnd, setPromiseDateEnd] = useState("");

  const navigate = useNavigate();
  // const sideBarState = useSelector((state) => state?.sidebar?.sideBar);

  const API_URL = window.url + "order/getAllOrders";
  const SEARCH_API_URL = window.url + "order/searchOrders";
  const CustomerAPI_URL = window.url + "customer/getAllCustomers";

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
          row.id === id ? { ...row, status: value, ...(value === "Rejected" && { reason }) } : row
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
    fetchOrders();
    getCustomer();
  }, [navigate, currentPage, rowsPerPage]);

  const fetchOrders = async () => {
    const savedToken = Cookies.get("authToken");
    setLoading(true);
    try {
      const response = await axios.post(
        API_URL,
        { page: currentPage, pageSize: rowsPerPage },
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );
      if (response.data) {
        setRows(response.data.data || []);
        setTotalRecords(response.data.totalOrders || 0);
      }
    } catch (err) {
      setError(`Failed to fetch Order data: ${err.response?.data?.message || err.message}`);
      if (err.response?.data?.message === "Token expired, please login again" || err.message === "Token expired, please login again") {
        Cookies.remove("authToken");
        navigate("/");
      }
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
      setError(`Failed to fetch Customer data: ${err.message}`);
      if (err.response?.data?.message === "Token expired, please login again" || err.message === "Token expired, please login again") {
        Cookies.remove("authToken");
        navigate("/");
      }
    }
  };

  const handleSearch = async () => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        SEARCH_API_URL,
        {
          orderId,
          customerId,
          status,
          orderDateStart,
          orderDateEnd,
          promiseDateStart,
          promiseDateEnd,
          page: currentPage,
          pageSize: rowsPerPage
        },
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );
      if (response.data) {
        setRows(response.data.data || []);
        setTotalRecords(response.data.totalOrders || 0);
        setIsSearchActive(true);
        setCurrentPage(1); // Reset to first page on new search
      }
    } catch (err) {
      setError(`Failed to fetch search Order data: ${err.response?.data?.message || err.message}`);
      if (err.response?.data?.message === "Token expired, please login again" || err.message === "Token expired, please login again") {
        Cookies.remove("authToken");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilter = () => {
    setOrderId("");
    setCustomerId("");
    setStatus("");
    setOrderDateStart("");
    setOrderDateEnd("");
    setPromiseDateStart("");
    setPromiseDateEnd("");
    setIsSearchActive(false);
    setCurrentPage(1);
    fetchOrders();
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  return (
    <main className="main-content">
   <br/><br/>
    <Content>
        <div className="">
          <div className="page-inner">
            <div className="page-header">
              <h3 className="fw-bold mb-3">PD Approval List</h3>
            </div>

            {/* Filter Section */}
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-body filter-section">
                    <div className="row g-3 align-items-end">
                      {/* Order Number */}
                      <div className="col-md-3">
                        <label>Concept ID</label>
                        <div className="position-relative">
                          <input
                            type="text"
                            className="form-control pr-4"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            placeholder="Search by Concept ID"
                          />
                          {orderId && (
                            <button 
                              className="btn btn-sm btn-light position-absolute end-0 top-50 translate-middle-y me-2"
                              onClick={() => setOrderId("")}
                            >
                              ✖
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Customer Name */}
                      <div className="col-md-3">
                        <label>Customer Name</label>
                        <div className="position-relative">
                          <select
                            className="form-control pr-4"
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                          >
                            <option value="">Select Customer</option>
                            {customer_rows.map((cus) => (
                              <option key={cus.id} value={cus.id}>{cus.customer_first_name}</option>
                            ))}
                          </select>
                          {customerId && (
                            <button 
                              className="btn btn-sm btn-light position-absolute end-0 top-50 translate-middle-y me-2"
                              onClick={() => setCustomerId("")}
                            >
                              ✖
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Order Date (Start) */}
                      <div className="col-md-3">
                        <label>Order Date (Start)</label>
                        <div className="position-relative">
                          <input
                            type="date"
                            className="form-control pr-4"
                            value={orderDateStart}
                            onChange={(e) => setOrderDateStart(e.target.value)}
                          />
                          {orderDateStart && (
                            <button 
                              className="btn btn-sm btn-light position-absolute end-0 top-50 translate-middle-y me-2"
                              onClick={() => setOrderDateStart("")}
                            >
                              ✖
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Order Date (End) */}
                      <div className="col-md-3">
                        <label>Order Date (End)</label>
                        <div className="position-relative">
                          <input
                            type="date"
                            className="form-control pr-4"
                            value={orderDateEnd}
                            onChange={(e) => setOrderDateEnd(e.target.value)}
                          />
                          {orderDateEnd && (
                            <button 
                              className="btn btn-sm btn-light position-absolute end-0 top-50 translate-middle-y me-2"
                              onClick={() => setOrderDateEnd("")}
                            >
                              ✖
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Promised Date (Start) */}
                      <div className="col-md-3">
                        <label>Promised Date (Start)</label>
                        <div className="position-relative">
                          <input
                            type="date"
                            className="form-control pr-4"
                            value={promiseDateStart}
                            onChange={(e) => setPromiseDateStart(e.target.value)}
                          />
                          {promiseDateStart && (
                            <button 
                              className="btn btn-sm btn-light position-absolute end-0 top-50 translate-middle-y me-2"
                              onClick={() => setPromiseDateStart("")}
                            >
                              ✖
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Promised Date (End) */}
                      <div className="col-md-3">
                        <label>Promised Date (End)</label>
                        <div className="position-relative">
                          <input
                            type="date"
                            className="form-control pr-4"
                            value={promiseDateEnd}
                            onChange={(e) => setPromiseDateEnd(e.target.value)}
                          />
                          {promiseDateEnd && (
                            <button 
                              className="btn btn-sm btn-light position-absolute end-0 top-50 translate-middle-y me-2"
                              onClick={() => setPromiseDateEnd("")}
                            >
                              ✖
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Status */}
                      <div className="col-md-3">
                        <label>Status</label>
                        <div className="position-relative">
                          <select
                            className="form-control pr-4"
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                          >
                            <option value="">All</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                          {status && (
                            <button 
                              className="btn btn-sm btn-light position-absolute end-0 top-50 translate-middle-y me-2"
                              onClick={() => setStatus("")}
                            >
                              ✖
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Dynamic Search/Clear Filter Button */}
                      <div className="col-md-3">
                        <button 
                          className="btn btn-primary"
                          onClick={isSearchActive ? handleClearFilter : handleSearch}
                        >
                          {isSearchActive ? "Clear Filter" : "Search"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Section */}
            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-body">
                    {loading ? (
                      <p>Loading orders...</p>
                    ) : error ? (
                      <p className="text-danger">{error}</p>
                    ) : (
                      <>
                         <div className="table-wrapper">
                        <table
                          className="table table-striped table-hover table-bordered"
                          role="grid"
                          aria-describedby="pd-list-info"
                        >
                            <thead>
                              <tr>
                                <th></th>
                                <th>ID</th>
                                <th>Concept ID</th>
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
                              {rows.map((row) => (
                                <tr key={row.id}>
                                  <td><IoEye  className="action-icon" onClick={() => handleVieworder(row.id)} /></td>
                                  <td>{row.id}</td>
                                  <td>{row.orderNo}</td>
                                  <td>{row["Customer.customer_first_name"]}</td>
                                  <td>{row.orderDate}</td>
                                  <td>{row.categoryName}</td>
                                  <td>{row.promiseDate}</td>
                                  <td>{row.status}</td>
                                  <td>{row.orderStatus}</td>
                                  <td style={{ minWidth: "200px", whiteSpace: "pre-line" }}>
                                    <select
                                      value={row.status}
                                      onChange={(e) => handleApprovalChange(row.id, e.target.value)}
                                      className="form-select"
                                      disabled={row.status === "Approved" || row.status === "Rejected"}
                                    >
                                      <option value="Pending" disabled>Pending</option>
                                      <option value="Approved">Approved</option>
                                      <option value="Rejected">Rejected</option>
                                    </select>
                                  </td>
                                  <td style={{ minWidth: "200px", whiteSpace: "pre-line" }}>
                                    <button 
                                      onClick={() => handleMoveToSkitch(row.id)} 
                                      disabled={row.orderStatus !== "order" || row.status !== "Approved"}
                                      className={`btn btn-sm ${row.orderStatus !== "order" ? "btn-secondary" : "btn-success"}`}
                                    >
                                      {row.orderStatus !== "order" && row.status === "Approved" ? "Moved to Sketch" : "Move to Sketch"}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination Controls */}
                        <div className="w-full flex justify-end pr-4" style={{ display: "flex", justifyContent: "flex-end" }}>
                          <div className="d-flex justify-content-center mt-4">
                            <button
                              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                              disabled={currentPage === 1}
                              className="btn btn-sm btn-outline-primary"
                            >
                              ◀
                            </button>
                            <button
                              onClick={() => setCurrentPage(1)}
                              className={`btn btn-sm mx-1 ${currentPage === 1 ? "btn-primary" : "btn-outline-primary"}`}
                            >
                              1
                            </button>
                            {currentPage > 4 && <span className="mx-1">...</span>}
                            {Array.from({ length: Math.min(3, totalPages - 2) }, (_, i) => i + Math.max(2, currentPage - 1))
                              .filter(num => num < totalPages)
                              .map((num) => (
                                <button
                                  key={num}
                                  onClick={() => setCurrentPage(num)}
                                  className={`btn btn-sm mx-1 ${currentPage === num ? "btn-primary" : "btn-outline-primary"}`}
                                >
                                  {num}
                                </button>
                              ))}
                            {currentPage < totalPages - 3 && <span className="mx-1">...</span>}
                            {totalPages > 1 && (
                              <button
                                onClick={() => setCurrentPage(totalPages)}
                                className={`btn btn-sm mx-1 ${currentPage === totalPages ? "btn-primary" : "btn-outline-primary"}`}
                              >
                                {totalPages}
                              </button>
                            )}
                            <button
                              onClick={() => setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))}
                              disabled={currentPage >= totalPages}
                              className="btn btn-sm btn-outline-primary"
                            >
                              ▶
                            </button>
                          </div>
                        </div>

                        <p className="mt-2 text-right text-muted">
                          Showing {rows.length} of {totalRecords} records
                        </p>
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