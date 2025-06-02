import { Button, Modal, Select, Image, Card } from "antd";
import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import debounce from "lodash/debounce";
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";

const DewAlbumDetail = () => {
  const [rows, setRows] = useState([]);
  const [customerrows, setCustomerRows] = useState([]);
  const [customer_email, setCustomer_email] = useState("");
  const [customer_id, setCustomer_id] = useState("");
  const [customer_name, setCustomer_name] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage] = useState(10);
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

  const [selectedCount, setSelectedCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const API_URL = window.url + "design/getAllDesign";
  const CustomerAPI_URL = window.url + "customer/getAllCustomers";
  const SEARCH_API_URL = window.url + "design/searchAllDesigns";

  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    const getCustomers = async () => {
      try {
        const response = await axios.get(CustomerAPI_URL, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        setCustomerRows(response.data.data || []);
      } catch (err) {
        handleError(err);
      }
    };

    const getCustomersbyid = async (cusId) => {
      try {
        const response = await axios.get(window.url + `customer/${cusId}`, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        const customerData = response.data.data || {};
        setCustomer_email(customerData.customer_email || "");
        setCustomer_id(customerData.id || "");
        setCustomer_name(customerData.customer_first_name || "");
      } catch (err) {
        setError("Failed to fetch customer data.");
      } finally {
        setLoading(false);
      }
    };

    if (selectedCustomer) {
      getCustomersbyid(selectedCustomer);
    }

    if (!isSearchPending) {
      if (isSearchActive && Object.values(filters).some((val) => val !== "")) {
        debouncedSearch(filters);
      } else {
        fetchOrders();
      }
    }

    getCustomers();
  }, [
    navigate,
    selectedCustomer,
    currentPage,
    rowsPerPage,
    isSearchActive,
    isSearchPending,
  ]);

  const fetchOrders = async () => {
    const savedToken = Cookies.get("authToken");
    setLoading(true);
    try {
      const response = await axios.post(
        API_URL,
        { type: "dew", page: currentPage, pageSize: rowsPerPage },
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );
      setRows(response.data.data || []);
      setTotalRecords(response.data.totalRecords || 0);
      setIsSearchActive(false);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
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
          {
            type: "dew",
            designNo: searchFilters.designNo,
            category: searchFilters.category,
            subCategory: searchFilters.subCategory,
            metal_color: searchFilters.metal_color,
            metal: searchFilters.metal,
          },
          { headers: { Authorization: `Bearer ${savedToken}` } }
        );
        const data = response.data.data || [];
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      const hasFilters = Object.values(newFilters).some((val) => val !== "");

      if (hasFilters && isFilterVisible) {
        setIsSearchPending(true);
        setCurrentPage(1);
        debouncedSearch(newFilters);
        setIsSearchActive(true);
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

    const dataToSend = {
      customer: {
        customer_first_name: customer_name,
        customer_email: customer_email,
        id: customer_id,
      },
      designs: selectedRows.map((row) => ({
        id: row.id,
        createdAt: new Date().toLocaleDateString("en-GB"),
        designNo: row.designNo,
        imageUrls: row.imageUrls || [],
        category: row.category,
        subcategory: row.subcategory,
        productType: row.productType,
        expectedGrossWt: row.expectedGrossWt,
        brand: row.brand,
        metal: row.metal,
        metalColor: row.metalColor,
      })),
      designPageLink: `https://melodious-platypus-44a510.netlify.app/album/${customer_id}`,
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
      const response = await axios.post(
        window.url + "design/sendDesignEmail",
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Design Sent To Customer Successfully!",
      });

      navigate(`/album/${customer_id}`, { state: { customer_id } });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: error.response
          ? JSON.stringify(error.response.data)
          : error.message,
      });
    }
  };

  const handleConfirm = () => {
    if (!selectedCustomer) {
      alert("Please select a customer before confirming.");
    } else {
      setIsModalOpen(false);
      handleSubmit();
    }
  };

  const handleRowSelection = (e, row) => {
    if (e.target.checked) {
      setSelectedRows((prev) => [...prev, row]);
    } else {
      setSelectedRows((prev) =>
        prev.filter((selectedRow) => selectedRow.id !== row.id)
      );
    }
  };

  useEffect(() => {
    setSelectedCount(selectedRows.length);
  }, [selectedRows]);

  return (
    <>
      <div className="page-header d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold">Dew Album</h3>
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

      {selectedCount > 0 && (
        <div className="col-md-3">
          <Button
            className="form-control w-100"
            onClick={() => setIsModalOpen(true)}
            style={{ background: "#2a2f5b", color: "#fff" }}
          >
            Send {selectedCount} Items to Customer
          </Button>
        </div>
      )}
      <br />
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
                          <th>Select</th>
                          <th>Design No</th>
                          <th>Category</th>
                          <th>Subcategory</th>
                          <th>Image</th>
                          <th>ProductType</th>
                          <th>Expected Gross Wt</th>
                          <th>Brand</th>
                          <th>Metal</th>
                          <th>Metal Color</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.length > 0 ? (
                          rows.map((row) => (
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
                                {Array.isArray(row.imageUrls) &&
                                row.imageUrls.length > 0 ? (
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
                                  <Image
                                    src={row.imageUrls}
                                    width="100%"
                                    alt="single-image"
                                  />
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
                          ))
                        ) : (
                          <tr>
                            <td colSpan="10" className="text-center">
                              {isSearchActive
                                ? "No matching designs found"
                                : "No designs available"}
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
                              disabled={
                                currentPage === totalPages || totalRecords === 0
                              }
                            >
                              <FaChevronRight />
                            </button>
                          </li>
                        </ul>
                      </nav>
                    </div>
                  )}
                  {isSearchActive && (
                    <div className="pagination-info text-muted mt-4">
                      Showing {rows.length} matching records
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Send Item To Customer"
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
              background:
                selectedRows.length && selectedCustomer ? "#2a2f5b" : "#b0b0b0",
              color: "#fff",
              cursor:
                selectedRows.length && selectedCustomer
                  ? "pointer"
                  : "not-allowed",
            }}
            disabled={!selectedRows.length || !selectedCustomer}
          >
            Confirm
          </Button>,
        ]}
      >
        <div style={{ textAlign: "center" }}>
          {selectedRows.map((row) => (
            <Card
              key={row.id}
              title={`Design No: ${row.designNo || "No Design No"}`}
              style={{ marginBottom: "10px", border: "1px solid #ddd" }}
            >
              <p>
                <strong>Category:</strong> {row.category || "No Category"}
              </p>
              <p>
                <strong>Subcategory:</strong>{" "}
                {row.subcategory || "No Subcategory"}
              </p>
              <p>
                <strong>Product Type:</strong> {row.productType || "N/A"}
              </p>
              <p>
                <strong>Expected Gross Wt:</strong>{" "}
                {row.expectedGrossWt || "N/A"}
              </p>
              <p>
                <strong>Brand:</strong> {row.brand || "N/A"}
              </p>
              <p>
                <strong>Metal:</strong> {row.metal || "N/A"}
              </p>
              <p>
                <strong>Metal Color:</strong> {row.metalColor || "N/A"}
              </p>
              <Image.PreviewGroup>
                {Array.isArray(row.imageUrls) && row.imageUrls.length > 0 ? (
                  row.imageUrls.map((img, index) => (
                    <Image
                      key={index}
                      src={img}
                      width="30%"
                      alt={`image-${index}`}
                    />
                  ))
                ) : (
                  <p>No Images Available</p>
                )}
              </Image.PreviewGroup>
            </Card>
          ))}
          <div className="form-group">
            <label htmlFor="customer">Customer</label>
            <select
              className="form-select pd-select"
              id="customer"
              value={selectedCustomer}
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

export default DewAlbumDetail;
