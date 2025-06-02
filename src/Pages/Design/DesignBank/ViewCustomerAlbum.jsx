import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
// import { useSelector } from "react-redux";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { FaChevronLeft, FaChevronRight, FaSearch } from "react-icons/fa";
import Footer from "../../../Components/Footer";
import Content from "../../../Components/Content";
import debounce from "lodash/debounce";
import "./ViewcustomerAlbum.css";

function ViewCustomerAlbum() {
  const navigate = useNavigate();
  const { customer_id } = useParams();
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAlbums, setSelectedAlbums] = useState([]);
  // const sideBarState = useSelector((state) => state?.sidebar?.sideBar);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage] = useState(6);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const [filters, setFilters] = useState({
    albumName: "",
    albumNo: "",
    isAlbumSent: "", // "" for all, "true" for sent, "false" for not sent
  });

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
  }, [customer_id, navigate, currentPage, rowsPerPage, isSearchActive, isSearchPending]);

  const fetchOrders = async () => {
    const savedToken = Cookies.get("authToken");
    setLoading(true);
    try {
      const response = await axios.post(
        `${window.url}album/getAlbumsByCustomerId/${customer_id}`,
        { page: currentPage, pageSize: rowsPerPage },
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );

      const customerData = Array.isArray(response.data) ? response.data : response.data.data || [];
      setDesigns(customerData);
      setTotalRecords(response.data.totalItems || customerData.length);
      setIsSearchActive(false);
      if (customerData.length === 0 && !isSearchActive) {
        setError("No albums found for this customer.");
      } else {
        setError(null);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    debounce(async (searchFilters) => {
      const savedToken = Cookies.get("authToken");
      setLoading(true);
      try {
        const searchPayload = {
          ...searchFilters,
          customerId:customer_id,
          // page: currentPage,
          // pageSize: rowsPerPage,

          isAlbumSent: searchFilters.isAlbumSent !== "" ? searchFilters.isAlbumSent === "true" : undefined
        };

        const response = await axios.post(
          `${window.url}album/searchAlbumsOfCustomer`,
          searchPayload,
          { headers: { Authorization: `Bearer ${savedToken}` } }
        );
        
        const data = Array.isArray(response.data) ? response.data : response.data.data || [];
        setDesigns(data);
        setTotalRecords(response.data.totalCount || data.length);
        setIsSearchActive(true);
        if (data.length === 0) {
          setError("No matching albums found.");
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
    [customer_id, currentPage, rowsPerPage]
  );

  const handleError = (err) => {
    setError(
      `Failed to fetch album data: ${err.response?.data?.message || err.message}`
    );
    if (
      err.response?.data?.message === "Token expired, please login again" ||
      err.message === "Token expired, please login again"
    ) {
      Cookies.remove("authToken");
      navigate("/");
    }
  };

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
      albumName: "",
      albumNo: "",
      isAlbumSent: "",
    });
    setCurrentPage(1);
    setIsSearchActive(false);
    setIsSearchPending(false);
    fetchOrders();
  };

  const handleSelectAll = () => {
    if (selectedAlbums.length === designs.length) {
      setSelectedAlbums([]);
    } else {
      setSelectedAlbums(designs.map(design => design.id));
    }
  };

  const handleSelectAlbum = (id) => {
    setSelectedAlbums(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handlePostAlbums = async () => {
    if (selectedAlbums.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Selection",
        text: "Please select at least one album to proceed.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    const savedToken = Cookies.get("authToken");
    const postData = {
      albumId: selectedAlbums,
      designPageLink: `https://melodious-platypus-44a510.netlify.app/album/${customer_id}`
    };

    try {
      setLoading(true);
      const response = await axios.post(
        `${window.url}album/sendAlbumByEmail`,
        postData,
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      await Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Albums sent successfully to customer!",
        confirmButtonColor: "#3085d6",
      });
      
      fetchOrders();
      setSelectedAlbums([]);
      
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: `Failed to send albums: ${err.response?.data?.message || err.message}`,
        confirmButtonColor: "#d33",
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
              <h3 className="fw-bold mb-3">Customer Albums</h3>
              <button
                className="btn btn-link p-0"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
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
                          <label className="form-label">Album Name</label>
                          <input
                            type="text"
                            name="albumName"
                            className="form-control"
                            value={filters.albumName}
                            onChange={handleFilterChange}
                            placeholder="Search by Album Name"
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Album No</label>
                          <input
                            type="text"
                            name="albumNo"
                            className="form-control"
                            value={filters.albumNo}
                            onChange={handleFilterChange}
                            placeholder="Search by Album No"
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Status</label>
                          <select
                            name="isAlbumSent"
                            className="form-control"
                            value={filters.isAlbumSent}
                            onChange={handleFilterChange}
                          >
                            <option value="">All</option>
                            <option value="true">Sent</option>
                            <option value="false">Not Sent</option>
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

            <div className="view-customer-album">
              <div className="control-panel">
                <div className="control-left">
                  <button 
                    className="btn btn-primary me-3"
                    onClick={handleSelectAll}
                    disabled={loading || designs.length === 0}
                  >
                    {selectedAlbums.length === designs.length ? "Deselect All" : "Select All"}
                  </button>
                  <span className="selection-count">
                    Selected: <strong>{selectedAlbums.length}</strong> / {designs.length}
                  </span>
                </div>
                <div className="control-right">
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={handlePostAlbums}
                    disabled={loading || selectedAlbums.length === 0}
                  >
                    {loading ? "Sending..." : "Send Albums To Customer"}
                  </button>
                </div>
              </div>

              {loading && (
                <div className="text-center py-4">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p>Loading albums...</p>
                </div>
              )}
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}
              {!loading && !error && designs.length === 0 && (
                <div className="alert alert-info" role="alert">
                  {isSearchActive ? "No matching albums found." : "No albums available."}
                </div>
              )}

              {!loading && designs.length > 0 && (
                <div className="design-grid">
                  {designs.map((design) => (
                    <div className="design-card" key={design.id}>
                      <div className="card-checkbox">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={selectedAlbums.includes(design.id)}
                            onChange={() => handleSelectAlbum(design.id)}
                          />
                          <span className="checkmark"></span>
                        </label>
                      </div>
                      <div className="card-header">
                        <h5 className="design-heading">
                          {design.albumName || `Album ${design.albumNo}`}
                        </h5>
                      </div>
                      <img
                        alt={`Album ${design.albumNo}`}
                        src={design.imageUrls?.[0] || "/placeholder.jpg"}
                        className="design-image"
                      />
                      <div className="design-info">
                        <p className="mb-1">
                          <strong>Album No:</strong> {design.albumNo || "N/A"}
                        </p>
                        <p className="mb-1">
                          <strong>Customer:</strong> {design.customer?.name || "N/A"}
                        </p>
                        <p className="mb-1">
                          <strong>Email:</strong> {design.customer?.email || "N/A"}
                        </p>
                        <p className="mb-1">
                          <strong>Created:</strong> {design.createdDate || "N/A"}
                        </p>
                        <div className="status-container">
                          <strong>Status:</strong>
                          <span className={`status-badge ${design.isAlbumSent ? "sent" : "not-sent"}`}>
                            {design.isAlbumSent ? "Sent" : "Not Sent"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {totalRecords > 0 && (
                <div className="pagination-container mt-4">
                  <div className="pagination-info text-muted">
                    Showing {designs.length} of {totalRecords} records
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
            </div>
          </div>
        </div>
       </Content>
    <Footer/>
  </main>
  );
}

export default ViewCustomerAlbum;