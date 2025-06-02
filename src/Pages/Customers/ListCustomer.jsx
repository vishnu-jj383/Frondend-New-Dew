import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  FaEdit,
  FaTrash,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
} from "react-icons/fa";
import Footer from "../../Components/Footer";
import Content from "../../Components/Content";
import Cookies from "js-cookie";
// import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { IoEye } from "react-icons/io5";
import debounce from "lodash/debounce";
import "../globalTable.css";

function ListCustomer() {
  const API_URL = window.url + "customer/getCustomers";
  const SEARCH_API_URL = window.url + "customer/searchCustomers";
  const DELETE_URL = window.url + "customer/deleteCustomer";
  // const sideBarState = useSelector((state) => state?.sidebar?.sideBar);
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [filters, setFilters] = useState({
    customerName: "",
    customerEmail: "",
    customerPhoneNo: "",
    customerType: "",
    startDate: "",
    endDate: "",
  });

  const handleEdit = (customerId) => {
    navigate(`/edit-customer/${customerId}`);
  };

  const handleViewCustomer = (customerId) => {
    navigate(`/customerDetails/${customerId}`);
  };

  const handleDelete = async (customerId) => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!",
      });

      if (result.isConfirmed) {
        const savedToken = Cookies.get("authToken");
        await axios.delete(`${DELETE_URL}/${customerId}`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });

        setRows((prevData) =>
          prevData.filter((customer) => customer.id !== customerId)
        );
        setTotalRecords((prev) => prev - 1);

        Swal.fire("Deleted!", "Customer has been deleted.", "success");
      }
    } catch (err) {
      if (err.response && err.response.status === 409) {
        Swal.fire({
          title: "Oops...!",
          text: "Customer Already Used In Another Table.",
          icon: "error",
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: "Failed to delete customer.",
          icon: "error",
        });
      }
      console.error(err);
    }
  };

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
      setTotalRecords(response.data.totalRecords || 0);
      setIsSearchActive(false);
      setError(null);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err) => {
    const message = err.response?.data?.message || err.message;
    setError(` ${message}`);
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
        const data = response.data.data || [];
        setRows(data);
        setTotalRecords(response.data.totalOrders || data.length);
        setIsSearchActive(true);
        if (data.length === 0) {
          setError("No customers found matching the search criteria.");
        } else {
          setError(null);
        }
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
      customerName: "",
      customerEmail: "",
      customerPhoneNo: "",
      customerType: "",
      startDate: "",
      endDate: "",
    });
    setCurrentPage(1);
    setIsSearchActive(false);
    setIsSearchPending(false);
    setError(null);
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
              <h3 className="fw-bold mb-3">Customer List</h3>
              <button
                className="btn btn-link p-0"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                aria-label={isFilterVisible ? "Hide Filters" : "Show Filters"}
                title={isFilterVisible ? "Hide Filters" : "Show Filters"}
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
                          <label className="form-label">Customer Name</label>
                          <input
                            type="text"
                            name="customerName"
                            className="form-control"
                            value={filters.customerName}
                            onChange={handleFilterChange}
                            placeholder="Search by Customer Name"
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Email</label>
                          <input
                            type="text"
                            name="customerEmail"
                            className="form-control"
                            value={filters.customerEmail}
                            onChange={handleFilterChange}
                            placeholder="Search by Email"
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Phone Number</label>
                          <input
                            type="text"
                            name="customerPhoneNo"
                            className="form-control"
                            value={filters.customerPhoneNo}
                            onChange={handleFilterChange}
                            placeholder="Search by Phone"
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Customer Type</label>
                          <select
                            name="customerType"
                            className="form-control"
                            value={filters.customerType}
                            onChange={handleFilterChange}
                          >
                            <option value="">Select Type</option>
                            <option value="individual">Individual</option>
                            <option value="business">Business</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Created Date</label>
                          <div className="d-flex gap-2 align-items-end">
                            <div className="flex-fill">
                              <label className="form-label mb-0">From</label>
                              <input
                                type="date"
                                name="startDate"
                                className="form-control"
                                value={filters.startDate}
                                onChange={handleFilterChange}
                              />
                            </div>
                            <div className="flex-fill">
                              <label className="form-label mb-0">To</label>
                              <input
                                type="date"
                                name="endDate"
                                className="form-control"
                                value={filters.endDate}
                                onChange={handleFilterChange}
                              />
                            </div>
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
                    {error && (
                      <p
                        className={
                          isSearchActive ? "text-black text-center" : "text-danger text-center"
                        }
                      >
                        {error}
                      </p>
                    )}
                    {!loading && !error && (
                      <>
                        <div className="table-responsive">
                          <table className="display table table-striped table-hover customer-table">
                            <thead>
                              <tr>
                                <th></th>
                                {/* <th>id</th> */}
                                <th style={{ whiteSpace: "nowrap" }}>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Address</th>
                                <th>Created Date</th>
                                <th>Pincode</th>
                                <th>Type</th>
                                <th>Fax</th>
                                <th style={{ whiteSpace: "nowrap" }}>Customer Code</th>
                                <th>Subsidiary</th>
                                <th>Country</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.length > 0 ? (
                                rows.map((row) => (
                                  <tr key={row.id}>
                                    <td>
                                      <IoEye
                                        size={15}
                                        className="action-icon"
                                        onClick={() => handleViewCustomer(row.id)}
                                      />
                                    </td>
                                    {/* <td>{row.id}</td> */}
                                    <td style={{ minWidth: "200px", whiteSpace: "pre-line" }}>
                                      {row.customer_first_name}
                                    </td>
                                    <td>{row.customer_email}</td>
                                    <td>{row.phone_number}</td>
                                    <td style={{ minWidth: "250px", whiteSpace: "pre-line" }}>
                                      {row.address}
                                    </td>
                                    <td>{row.created_date}</td>
                                    <td>{row.pincode}</td>
                                    <td>{row.customer_type}</td>
                                    <td>{row.customer_fax}</td>
                                    <td>{row.customercode}</td>
                                    <td>{row.country_subsidiary}</td>
                                    <td>{row.customer_country}</td>
                                    <td>
                                      <FaEdit
                                        className="text-blue-500 action-icon"
                                        onClick={() => handleEdit(row.id)}
                                      />{" "}
                                      <FaTrash
                                        className="text-red-500 action-icon ml-2"
                                        onClick={() => handleDelete(row.id)}
                                      />
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="13" className="text-center">
                                    {isSearchActive ? "No data found" : "No customers found"}
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

export default ListCustomer;