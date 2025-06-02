import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { FaSearch, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Footer from "../../../Components/Footer";
import Content from "../../../Components/Content";
import Cookies from "js-cookie";
// import { useSelector } from "react-redux";
import { Image } from "antd";
import debounce from "lodash/debounce";

function FeedbackList() {
  // const sideBarState = useSelector((state) => state?.sidebar?.sideBar);
  const API_URL = window.url + "customerAlbums/getAllCustomerFeedback";
  const SEARCH_API_URL = window.url + "customerAlbums/searchCustomerFeedback";
  const customer_URL = window.url + "customer/getAllCustomers";
  
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage] = useState(10);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const navigate = useNavigate();

  // Filters State
  const [filters, setFilters] = useState({
    customerName: "",
    designNo: "",
    startDate: "",
    endDate: "",
  });
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    if (!isSearchActive) {
      fetchOrders();
    }
  }, [navigate, currentPage, rowsPerPage, isSearchActive]);

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
      setTotalRecords(response.data.totalRecords || 0);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (err) => {
    const message = err.response?.data?.message || err.message;
    setError(`Failed to fetch data: ${message}`);
    console.error("Error:", message);
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
        const data = response.data.data || [];
        setRows(data);
        setTotalRecords(data.length);
        setIsSearchActive(true);
        setCurrentPage(1); // Reset to first page, though pagination won't show
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
      console.log("New Filters:", newFilters);
      if (Object.values(newFilters).some(val => val !== "")) {
        debouncedSearch(newFilters);
      } else {
        setIsSearchActive(false);
        fetchOrders();
      }
      return newFilters;
    });
  };

  const handleClearFilter = () => {
    setFilters({
      customerName: "",
      designNo: "",
      startDate: "",
      endDate: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
    setIsSearchActive(false);
    fetchOrders();
  };

  const handleCustomerSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    setFilters(prev => ({ ...prev, customerName: term }));

    if (term) {
      const filtered = customers.filter((customer) =>
        customer.customer_first_name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredCustomers(filtered);
      setIsOpen(true);
      debouncedSearch({ ...filters, customerName: term });
    } else {
      setFilteredCustomers(customers);
      setIsOpen(false);
      setIsSearchActive(false);
      fetchOrders();
    }
  };

  const handleSelect = (customer) => {
    const name = customer.customer_first_name;
    setSearchTerm(name);
    setFilters(prev => ({ ...prev, customerName: name }));
    setIsOpen(false);
    debouncedSearch({ ...filters, customerName: name });
  };

  useEffect(() => {
    axios
      .get(customer_URL, {
        headers: { Authorization: `Bearer ${Cookies.get("authToken")}` },
      })
      .then((response) => {
        setCustomers(response.data.data);
        setFilteredCustomers(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching customers:", error);
      });
  }, []);

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

  return (
   <main className="main-content">
     
         <Content>
        <div className="">
          <div className="page-inner">
            <div className="page-header d-flex justify-content-between align-items-center">
              <h3 className="fw-bold mb-3">Customer Feedback</h3>
              <button
                className="btn btn-link p-0"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
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
                          <label className="form-label">Customer Name</label>
                          <div className="position-relative">
                            <input
                              type="text"
                              className="form-control"
                              value={searchTerm}
                              onChange={handleCustomerSearch}
                              onFocus={() => setIsOpen(true)}
                              placeholder="Search by Customer Name"
                            />
                            {filters.customerName && (
                              <button
                                className="btn btn-sm btn-light position-absolute end-0 top-50 translate-middle-y me-2"
                                onClick={() => {
                                  setSearchTerm("");
                                  setFilters(prev => ({ ...prev, customerName: "" }));
                                  handleClearFilter();
                                }}
                              >
                                ✖
                              </button>
                            )}
                            {isOpen && filteredCustomers.length > 0 && (
                              <div
                                className="position-absolute w-100 bg-white border mt-1"
                                style={{ zIndex: 1000, maxHeight: "200px", overflowY: "auto" }}
                              >
                                {filteredCustomers.map((customer) => (
                                  <div
                                    key={customer.id}
                                    className="p-2 hover:bg-light cursor-pointer"
                                    onClick={() => handleSelect(customer)}
                                  >
                                    {customer.customer_first_name}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="col-md-3">
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
                        <div className="col-md-3">
                          <label className="form-label">Feedback Date (Start)</label>
                          <input
                            type="date"
                            name="startDate"
                            className="form-control"
                            value={filters.startDate}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Feedback Date (End)</label>
                          <input
                            type="date"
                            name="endDate"
                            className="form-control"
                            value={filters.endDate}
                            onChange={handleFilterChange}
                          />
                         
                        </div>
                        <div className="col-md-3">
                        <button
                            className="btn btn-outline-primary mt-3 w-100"
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
                                <th>Design No</th>
                                <th>Order No.</th>
                                <th>Customer Name</th>
                                <th>Remarks</th>
                                <th>Metal Type</th>
                                <th>Metal Color</th>
                                <th>Image</th>
                                <th>Feedback Date</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.length > 0 ? (
                                rows.map((row) => (
                                  <tr key={row.id}>
                                    <td>{row.designNo}</td>
                                    <td>{row.Order?.orderNo || "N/A"}</td>
                                    <td>{row.customer_name}</td>
                                    <td>{row.remarks}</td>
                                    <td>{row.MetalType?.metal_type || "N/A"}</td>
                                    <td>{row.MetalColor?.metal_color_name || "N/A"}</td>
                                    <td>
                                      {Array.isArray(row.imageUrls) && row.imageUrls.length > 0 ? (
                                        <Image.PreviewGroup>
                                          {row.imageUrls.map((img, index) => (
                                            <Image
                                              key={index}
                                              src={img}
                                              width="70%"
                                              alt={`image-${index}`}
                                            />
                                          ))}
                                        </Image.PreviewGroup>
                                      ) : row.imageUrls ? (
                                        <Image src={row.imageUrls} width="100%" alt="single-image" />
                                      ) : (
                                        "No Image"
                                      )}
                                    </td>
                                    <td>{row.createdAt}</td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="8" className="text-center">
                                    {isSearchActive ? "No data found" : "No feedback found"}
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Show pagination only when not in search mode */}
                        {!isSearchActive && totalRecords > rowsPerPage && (
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
                                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                                  <button
                                    className="page-link"
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
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
                            Showing {rows.length} search results
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

export default FeedbackList;