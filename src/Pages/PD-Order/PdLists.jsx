import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { FaEdit, FaTrash } from "react-icons/fa";
import { IoEye } from "react-icons/io5";
import Content from "../../Components/Content";
import Cookies from "js-cookie";

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
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const [orderId, setOrderId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState("");
  const [orderDateStart, setOrderDateStart] = useState("");
  const [orderDateEnd, setOrderDateEnd] = useState("");
  const [promiseDateStart, setPromiseDateStart] = useState("");
  const [promiseDateEnd, setPromiseDateEnd] = useState("");

  const navigate = useNavigate();

  const handleEdit = (orderId) => {
    navigate(`/pdedit/${orderId}`);
  };

  const handleVieworder = (orderId) => {
    navigate(`/vieworder/${orderId}`);
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
          pageSize: rowsPerPage,
        },
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );
      if (response.data) {
        setRows(response.data.data || []);
        setTotalRecords(response.data.totalOrders || 0);
        setIsSearchActive(true);
        setCurrentPage(1);
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
       <br/>   <br/>   
      <Content>
       
        <div className="">
          <div className="page-inner">
            <div className="page-header">
              <h3 className="fw-bold mb-3">PD List</h3>
            </div>

            <div className="row g-0">
              <div className="col-md-12">
                <div className="card">
                  {/* Filter Section */}
                  <div className="card-body filter-section">
                    <div className="row g-3 align-items-end">
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
                              <option key={cus.id} value={cus.id}>
                                {cus.customer_first_name}
                              </option>
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
                      <div className="col-md-3">
                        <button
                          className="btn btn-primary w-100"
                          onClick={isSearchActive ? handleClearFilter : handleSearch}
                        >
                          {isSearchActive ? "Clear Filter" : "Search"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Table Section (No Inner Card) */}
                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                    </div>
                  ) : error ? (
                    <p style={{ color: "red" }}>{error}</p>
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
                              <th scope="col"></th>
                              <th scope="col">ID</th>
                              <th scope="col">Concept ID</th>
                              <th scope="col">Order Date</th>
                              <th scope="col">Customer Name</th>
                              <th scope="col">Category</th>
                              <th scope="col">Promised Date</th>
                              <th scope="col">Status</th>
                              <th scope="col">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map((row) => (
                              <tr key={row.id}>
                                <td>
                                  <IoEye
                                    className="action-icon"
                                    onClick={() => handleVieworder(row.id)}
                                    aria-label={`View order ${row.orderNo}`}
                                  />
                                </td>
                                <td>{row.id}</td>
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
                                        ? "action-icon opacity-50 cursor-not-allowed"
                                        : "action-icon"
                                    }
                                    aria-label={`Edit order ${row.orderNo}`}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div
                        className="w-full flex justify-end pr-4"
                        style={{ display: "flex", justifyContent: "flex-end" }}
                      >
                        <div className="d-flex justify-content-center mt-4">
                          <button
                            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="btn btn-sm btn-outline-primary"
                            aria-label="Previous page"
                          >
                            ◀
                          </button>
                          <button
                            onClick={() => setCurrentPage(1)}
                            className={`btn btn-sm mx-1 ${currentPage === 1 ? "btn-primary" : "btn-outline-primary"}`}
                            aria-label="Page 1"
                          >
                            1
                          </button>
                          {currentPage > 4 && <span className="mx-1">...</span>}
                          {Array.from(
                            { length: Math.min(3, totalPages - 2) },
                            (_, i) => i + Math.max(2, currentPage - 1)
                          )
                            .filter((num) => num < totalPages)
                            .map((num) => (
                              <button
                                key={num}
                                onClick={() => setCurrentPage(num)}
                                className={`btn btn-sm mx-1 ${
                                  currentPage === num ? "btn-primary" : "btn-outline-primary"
                                }`}
                                aria-label={`Page ${num}`}
                              >
                                {num}
                              </button>
                            ))}
                          {currentPage < totalPages - 3 && <span className="mx-1">...</span>}
                          {totalPages > 1 && (
                            <button
                              onClick={() => setCurrentPage(totalPages)}
                              className={`btn btn-sm mx-1 ${
                                currentPage === totalPages ? "btn-primary" : "btn-outline-primary"
                              }`}
                              aria-label={`Page ${totalPages}`}
                            >
                              {totalPages}
                            </button>
                          )}
                          <button
                            onClick={() =>
                              setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))
                            }
                            disabled={currentPage >= totalPages}
                            className="btn btn-sm btn-outline-primary"
                            aria-label="Next page"
                          >
                            ▶
                          </button>
                        </div>
                      </div>

                      <p className="mt-2 text-right text-muted" id="pd-list-info">
                        Showing {rows.length} of {totalRecords} records
                      </p>
                    </>
                  )}
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