import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import {
  FaEdit,
  FaTrash,
  FaEllipsisV,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Footer from "../../Components/Footer";
import Header from "../../Components/Header";
import Content from "../../Components/Content";
import Cookies from "js-cookie";

import { IoEye } from "react-icons/io5";
// import "../globalTable.css";
const EmployeeList = () => {
  const API_URL = window.url + "auth/getAllUsers";
  const SEARCH_API_URL = window.url + "auth/searchUsers"; // Adjust this based on your actual search API endpoint
  
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeRowId, setActiveRowId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [isSearchActive, setIsSearchActive] = useState(false); // Added for search state
  const navigate = useNavigate();

  // Search State
  const [name, setName] = useState(""); // Adjusted from renderNo to name
  const [email, setEmail] = useState(""); // Added email search field
  const [designation, setDesignation] = useState(""); // Added designation search field
  const [startDate, setStartDate] = useState(""); // Renamed for consistency
  const [endDate, setEndDate] = useState(""); // Renamed for consistency

  const handleEdit = (empId) => {
    navigate(`/employee_edit/${empId}`);
  };

  const handleViewrender = (customerId) => {
    navigate(`/viewrender/${customerId}`);
  };

  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await axios.post(
          API_URL,
          { page: currentPage, pageSize: rowsPerPage },
          { headers: { Authorization: `Bearer ${savedToken}` } }
        );

        if (!response.data || !response.data.data) {
          throw new Error("Invalid API response structure");
        }

        setRows(response.data.data || []);
        setTotalRecords(response.data.totalUsers || 0);
        setError(null);
      } catch (err) {
        setError(`Failed to fetch employee data: ${err.response?.data?.message || err.message}`);
        if (err.response?.data?.message === "Token expired, please login again" || 
            err.message === "Token expired, please login again") {
          Cookies.remove("authToken");
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate, currentPage, rowsPerPage]);

  const handleSearch = async () => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        SEARCH_API_URL,
        {
          name,
          email,
          designation,
          startDate,
          endDate,
        },
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );

      if (response.data) {
        const data = response.data.data || [];
        setRows(data);
        setTotalRecords(response.data.totalUsers || 0); // Adjust based on your API response
        setIsSearchActive(true);
        setCurrentPage(1);
        if (data.length === 0) {
          setError("No employees found matching the search criteria.");
        }
      }
    } catch (err) {
      setError(`Failed to fetch search data: ${err.response?.data?.message || err.message}`);
      setIsSearchActive(true);
      if (err.response?.data?.message === "Token expired, please login again" || 
          err.message === "Token expired, please login again") {
        Cookies.remove("authToken");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClearFilter = () => {
    setName("");
    setEmail("");
    setDesignation("");
    setStartDate("");
    setEndDate("");
    setIsSearchActive(false);
    setCurrentPage(1);
    setError(null);
    fetchOrders();
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.post(
        API_URL,
        { page: currentPage, pageSize: rowsPerPage },
        { headers: { Authorization: `Bearer ${Cookies.get("authToken")}` } }
      );

      if (!response.data || !response.data.data) {
        throw new Error("Invalid API response structure");
      }

      setRows(response.data.data || []);
      setTotalRecords(response.data.totalUsers || 0);
      setError(null);
    } catch (err) {
      setError(`Failed to fetch employee data: ${err.response?.data?.message || err.message}`);
      if (err.response?.data?.message === "Token expired, please login again" || 
          err.message === "Token expired, please login again") {
        Cookies.remove("authToken");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  return (
    <main className="main-content">
  <br/>   <br/>   
    <Content>
        <div className="">
          <div className="page-inner">
            <div className="page-header">
              <h3 className="fw-bold mb-3">Employee List</h3>
            </div>

            {/* Filter Section */}
            {/* <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-body filter-section">
                    <div className="row g-3 align-items-end">
                      <div className="col-md-3">
                        <label>Name</label>
                        <div className="position-relative">
                          <input
                            type="text"
                            className="form-control pe-5"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Search by Name"
                          />
                          {name && (
                            <button
                              className="btn btn-sm btn-light position-absolute end-0 top-50 translate-middle-y me-2"
                              onClick={() => setName('')}
                            >
                              ✖
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <label>Email</label>
                        <div className="position-relative">
                          <input
                            type="text"
                            className="form-control pe-5"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Search by Email"
                          />
                          {email && (
                            <button
                              className="btn btn-sm btn-light position-absolute end-0 top-50 translate-middle-y me-2"
                              onClick={() => setEmail('')}
                            >
                              ✖
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <label>Designation</label>
                        <div className="position-relative">
                          <input
                            type="text"
                            className="form-control pe-5"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            placeholder="Search by Designation"
                          />
                          {designation && (
                            <button
                              className="btn btn-sm btn-light position-absolute end-0 top-50 translate-middle-y me-2"
                              onClick={() => setDesignation('')}
                            >
                              ✖
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <label>Created Date (Start)</label>
                        <div className="position-relative">
                          <input
                            type="date"
                            className="form-control pe-5"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                          />
                          {startDate && (
                            <button
                              className="btn btn-sm btn-light position-absolute end-0 top-50 translate-middle-y me-2"
                              onClick={() => setStartDate('')}
                            >
                              ✖
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <label>Created Date (End)</label>
                        <div className="position-relative">
                          <input
                            type="date"
                            className="form-control pe-5"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                          />
                          {endDate && (
                            <button
                              className="btn btn-sm btn-light position-absolute end-0 top-50 translate-middle-y me-2"
                              onClick={() => setEndDate('')}
                            >
                              ✖
                            </button>
                          )}
                        </div>
                      </div>
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
            </div> */}

            <div className="row">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-body">
                    {loading ? (
                      <p style={{ textAlign: "center" }}>Loading employees...</p>
                    ) : error ? (
                      <p style={{ 
                        textAlign: "center", 
                        color: isSearchActive ? "black" : "red" 
                      }}>
                        {error}
                      </p>
                    ) : (
                      <>
                        <div className="table-responsive ">
                          <table
                            id="basic-datatables"
                            className="display table table-striped table-hover customer-table"
                          >
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Designation</th>
                                <th>Created At</th>
                                <th>Role</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((employee) => (
                                <tr key={employee.id}>
                                  <td>{employee.id}</td>
                                  <td>{employee.name}</td>
                                  <td>{employee.email}</td>
                                  <td>{employee.designation || "N/A"}</td>
                                  <td>{employee.formattedCreatedAt || "N/A"}</td>
                                  <td>{employee.Role?.roleName || "N/A"}</td>
                                  <td>
                                    <FaEdit
                                      size={13}
                                      className="action-icon"
                                      onClick={() => handleEdit(employee.id)}
                                    />
                                    {/* <FaTrash
                                      size={13}
                                      className="text-red-500 cursor-pointer ml-2"
                                      onClick={() => handleDelete(employee.id)}
                                    /> */}
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

export default EmployeeList;