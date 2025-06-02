import { Button, Modal, Image, Card } from "antd";
import React, { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import debounce from "lodash/debounce";
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";

const DesignBankTable = () => {
  const [rows, setRows] = useState([]);
  const [customerrows, setCustomerRows] = useState([]);
  const [customer_email, setCustomer_email] = useState("");
  const [customer_id, setCustomer_id] = useState("");
  const [customer_name, setCustomer_name] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [filters, setFilters] = useState({
    designNo: "",
    category: "",
    subCategory: "",
    metal_color: "",
    metal: "",
  });

  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [albumName, setAlbumName] = useState("");

  const API_URL = window.url + "design/getAllDesign";
  const CustomerAPI_URL = window.url + "customer/getAllCustomers";
  const SEARCH_API_URL = window.url + "design/searchAllDesigns";

  // Memoize filters to avoid unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [
    filters.designNo,
    filters.category,
    filters.subCategory,
    filters.metal_color,
    filters.metal,
  ]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchFilters) => {
      const savedToken = Cookies.get("authToken");
      setLoading(true);
      try {
        const response = await axios.post(
          SEARCH_API_URL,
          { type: "others", ...searchFilters },
          { headers: { Authorization: `Bearer ${savedToken}` } }
        );
        if (response.data) {
          setRows(response.data.data || []);
          setTotalRecords(response.data.totalRecords || 0);
          setIsSearchActive(true);
        }
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: `Failed to fetch search data: ${err.response?.data?.message || err.message}`,
        });
        if (
          err.response?.data?.message === "Token expired, please login again" ||
          err.message === "Token expired, please login again"
        ) {
          Cookies.remove("authToken");
          navigate("/");
        }
      } finally {
        setLoading(false);
        setIsSearchPending(false);
      }
    }, 500),
    []
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Main data fetching effect
  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }
    if (!isSearchPending) {
      if (isSearchActive && Object.values(memoizedFilters).some((val) => val !== "")) {
        debouncedSearch(memoizedFilters);
      } else {
        fetchOrders();
      }
    }
    getCustomers();
  }, [navigate, currentPage, rowsPerPage, isSearchActive, isSearchPending, memoizedFilters]);

  // Fetch customer details when selectedCustomer changes
  useEffect(() => {
    if (selectedCustomer) {
      getCustomersbyid(selectedCustomer);
    }
  }, [selectedCustomer]);

  const getCustomers = async () => {
    try {
      const response = await axios.get(CustomerAPI_URL, {
        headers: {
          Authorization: `Bearer ${Cookies.get("authToken")}`,
        },
      });
      setCustomerRows(response.data.data || []);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to fetch customers: ${err.response?.data?.message || err.message}`,
      });
      if (
        err.response?.data?.message === "Token expired, please login again" ||
        err.message === "Token expired, please login again"
      ) {
        Cookies.remove("authToken");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const getCustomersbyid = async (cusId) => {
    const savedToken = Cookies.get("authToken");
    try {
      const response = await axios.get(window.url + `customer/${cusId}`, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
        },
      });
      const customerData = response.data.data || {};
      setCustomer_email(customerData.customer_email || "");
      setCustomer_id(customerData.id || "");
      setCustomer_name(customerData.customer_first_name || "");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to fetch customer data.",
      });
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
        { type: "others", page: currentPage, pageSize: rowsPerPage },
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        }
      );
      if (response.data) {
        setRows(response.data.data || []);
        setTotalRecords(response.data.totalRecords || 0);
        setIsSearchActive(false);
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to fetch orders: ${err.response?.data?.message || err.message}`,
      });
      if (
        err.response?.data?.message === "Token expired, please login again" ||
        err.message === "Token expired, please login again"
      ) {
        Cookies.remove("authToken");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      const hasFilters = Object.values(newFilters).some((val) => val !== "");

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
      designNo: "",
      category: "",
      subCategory: "",
      metal_color: "",
      metal: "",
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      Swal.fire({
        icon: "warning",
        title: "Authentication Required",
        text: "Authentication token not found. Please log in.",
      });
      return;
    }
    if (selectedRows.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Selection Required",
        text: "Please select at least one design.",
      });
      return;
    }
    if (!selectedCustomer) {
      Swal.fire({
        icon: "warning",
        title: "Customer Required",
        text: "Please select a customer.",
      });
      return;
    }

    const imageUrls = selectedRows.flatMap((row) =>
      Array.isArray(row.imageUrls) ? row.imageUrls : [row.imageUrls].filter(Boolean)
    );
    const designIds = selectedRows.map((row) => row.id);

    const dataToSend = {
      customerId: parseInt(selectedCustomer),
      imageUrls: imageUrls,
      albumName: albumName,
      designIds: designIds,
    };

    Swal.fire({
      title: "Sending...",
      text: "Please wait while we send the design to the customer.",
      icon: "info",
      allowOutsideClick: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    try {
      const response = await axios.post(window.url + "album/createAlbum", dataToSend, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
      });
      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Design Sent To Customer Successfully!",
      });
      navigate(`/album/${selectedCustomer}`, { state: { customer_id: selectedCustomer } });
    } catch (error) {
      if (error.response?.data?.message === `albumName (${albumName}) already exists.`) {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Album Name Already Exists. Try Another Name",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: error.response ? JSON.stringify(error.response.data) : error.message,
        });
      }
    }
  };

  const handleSendToCustomer = () => {
    setAlbumName("");
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const handleConfirm = () => {
    if (!selectedCustomer) {
      Swal.fire({
        icon: "warning",
        title: "Customer Required",
        text: "Please select a customer.",
      });
    } else if (!albumName) {
      Swal.fire({
        icon: "warning",
        title: "Album Name Required",
        text: "Please enter an album name.",
      });
    } else {
      setIsModalOpen(false);
      handleSubmit();
    }
  };

  const handleRowSelection = (e, row) => {
    if (e.target.checked) {
      setSelectedRows((prev) => [...prev, row]);
    } else {
      setSelectedRows((prev) => prev.filter((selectedRow) => selectedRow.id !== row.id));
    }
  };

  return (
    <>
      <div className="page-header d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold">Create Album</h3>
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
        <div className="row mb-3">
          <div className="col-md-12">
            <div className="card">
              <div className="card-body filter-section">
                <div className="row g-3 align-items-end">
                  <div className="col-md-4">
                    <label>Design No</label>
                    <input
                      type="text"
                      name="designNo"
                      className="form-control"
                      value={filters.designNo}
                      onChange={handleFilterChange}
                      placeholder="Search by Design No"
                    />
                  </div>
                  <div className="col-md-4">
                    <label>Category</label>
                    <input
                      type="text"
                      name="category"
                      className="form-control"
                      value={filters.category}
                      onChange={handleFilterChange}
                      placeholder="Search by Category"
                    />
                  </div>
                  <div className="col-md-4">
                    <label>SubCategory</label>
                    <input
                      type="text"
                      name="subCategory"
                      className="form-control"
                      value={filters.subCategory}
                      onChange={handleFilterChange}
                      placeholder="Search by SubCategory"
                    />
                  </div>
                  <div className="col-md-4">
                    <label>Metal Color</label>
                    <input
                      type="text"
                      name="metal_color"
                      className="form-control"
                      value={filters.metal_color}
                      onChange={handleFilterChange}
                      placeholder="Search by Metal Color"
                    />
                  </div>
                  <div className="col-md-4">
                    <label>Metal</label>
                    <input
                      type="text"
                      name="metal"
                      className="form-control"
                      value={filters.metal}
                      onChange={handleFilterChange}
                      placeholder="Search by Metal"
                    />
                  </div>
                  <div className="col-md-3">
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

      {selectedRows.length > 0 && (
        <div className="row mb-3">
          <div className="col-md-12 d-flex justify-content-end">
            <Button
              className="w-auto"
              onClick={handleSendToCustomer}
              style={{ background: "#2a2f5b", color: "#fff" }}
            >
              Create {selectedRows.length} Items Album
            </Button>
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
                    <table
                      id="basic-datatables"
                      className="display table table-striped table-hover customer-table"
                    >
                      <thead>
                        <tr>
                          <th style={{ whiteSpace: "nowrap" }}>Select</th>
                          <th style={{ whiteSpace: "nowrap" }}>Design No</th>
                          <th style={{ whiteSpace: "nowrap" }}>Category</th>
                          <th style={{ whiteSpace: "nowrap" }}>Subcategory</th>
                          <th>Image</th>
                          <th>ProductType</th>
                          <th style={{ whiteSpace: "nowrap" }}>Expected Gross Wt</th>
                          <th style={{ whiteSpace: "nowrap" }}>Brand</th>
                          <th style={{ whiteSpace: "nowrap" }}>Metal</th>
                          <th>Metal Color</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((row) => (
                          <tr key={row.id}>
                            <td>
                              <input
                                type="checkbox"
                                onChange={(e) => handleRowSelection(e, row)}
                              />
                            </td>
                            <td>{row.designNo}</td>
                            <td>{row.category}</td>
                            <td>{row.subcategory}</td>
                            <td>
                              {Array.isArray(row.imageUrls) && row.imageUrls.length > 0 ? (
                                <Image.PreviewGroup>
                                  {row.imageUrls.map((img, index) => (
                                    <Image
                                      key={index}
                                      src={img}
                                      width="60%"
                                      alt={`image-${index}`}
                                    />
                                  ))}
                                </Image.PreviewGroup>
                              ) : row.imageUrls ? (
                                <Image src={row.imageUrls} width="100%" alt="single-image" />
                              ) : (
                                <p>No Image Available</p>
                              )}
                            </td>
                            <td>{row.productType}</td>
                            <td>{row.expectedGrossWt}</td>
                            <td>{row.brand}</td>
                            <td>{row.metal}</td>
                            <td>{row.metalColor}</td>
                          </tr>
                        ))}
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
                            className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                          >
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(currentPage - 1)}
                              disabled={currentPage === 1}
                            >
                              <FaChevronLeft />
                            </button>
                          </li>
                          {renderPageNumbers()}
                          <li
                            className={`page-item ${
                              currentPage === totalPages || totalRecords === 0
                                ? "disabled"
                                : ""
                            }`}
                          >
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

      <Modal
        title="Create Album"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalOpen(false)}>
            Cancel
          </Button>,
          <Button
            key="confirm"
            type="primary"
            onClick={handleConfirm}
            style={{
              background: selectedCustomer && albumName ? "#2a2f5b" : "#b0b0b0",
              color: "#fff",
              cursor: selectedCustomer && albumName ? "pointer" : "not-allowed",
            }}
            disabled={!selectedCustomer || !albumName}
          >
            Confirm
          </Button>,
        ]}
      >
        <div style={{ textAlign: "center" }}>
          <div className="form-group mb-3">
            <label htmlFor="albumName">Album Name</label>
            <input
              type="text"
              className="form-control"
              id="albumName"
              value={albumName}
              onChange={(e) => setAlbumName(e.target.value)}
              placeholder="Enter album name"
            />
          </div>
          <div className="form-group">
            <label htmlFor="customer">Customer</label>
            <select
              className="form-select pd-select"
              id="customer"
              value={selectedCustomer || ""}
              onChange={(e) => setSelectedCustomer(e.target.value)}
            >
              <option value="">Select</option>
              {customerrows.length > 0 ? (
                customerrows.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.customer_first_name} {customer.customer_last_name}
                  </option>
                ))
              ) : (
                <option disabled>No Customers Available</option>
              )}
            </select>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DesignBankTable;