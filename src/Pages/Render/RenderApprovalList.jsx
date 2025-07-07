import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import Footer from "../../Components/Footer";
import Content from "../../Components/Content";
import Cookies from "js-cookie";
import {
  FaEdit,
  FaTrash,
  FaEllipsisV,
  FaChevronLeft,
  FaChevronRight,
  FaSearch,
} from "react-icons/fa";
// import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import { IoEye } from "react-icons/io5";
import "../globalTable.css"; // Assuming you have this CSS file
import debounce from "lodash/debounce";
import AddRenderDesigner from "./RenderDesigner/AddRenderDesigner";

function RenderApprovalList() {
  const [rows, setRows] = useState([]);
  const [render_imagerows, setRender_image_Rows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeRowId, setActiveRowId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isSearchPending, setIsSearchPending] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const navigate = useNavigate();
  // const sideBarState = useSelector((state) => state?.sidebar?.sideBar);
  const [totalRecords, setTotalRecords] = useState(0);
  const [designerName, setDesignerName] = useState("");
  const [designerEmail, setDesignerEmail] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [approvedForDew, setApprovedForDew] = useState(false);
  const [approvedForCustomer, setApprovedForCustomer] = useState(false);
  const [designer_name_array, setDesigner_name_array] = useState([]);
  const [selectedRowId, setSelectedRowId] = useState(null);

  const [filters, setFilters] = useState({
    renderNo: "",
    status: "",
    startRenderCompletedDate: "",
    endRenderCompletedDate: "",
  });
  const API_URL = window.url + "render/";
  const getrender_API_URL = window.url + "tasks/getTasksByOrderIdOrType";
  const SEARCH_API_URL = window.url + "render/searchRenders";
  const getDesignername_Url = window.url + "auth/getUsersByRoleType";

  // Define fetchOrders outside useEffect
  const fetchOrders = async () => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${API_URL}getAllRenders`,
        { page: currentPage, pageSize: rowsPerPage },
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        }
      );

      if (!response.data || !response.data.data) {
        throw new Error("Invalid API response structure");
      }

      if (response.data) {
        setRows(response.data.data || []);
        setTotalRecords(response.data.totalRecords || 0);
        setIsSearchActive(false);
      }
    } catch (err) {
      setError(
        `Failed to fetch Order data: ${
          err.response?.data?.message || err.message
        }`
      );
      if (err.response?.data?.message === "Token expired, please login again") {
        Cookies.remove("authToken");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprovalChange = async (id, value) => {
    let reason = "";

    if (value === "Approved") {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to Approve this Render?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Approve it!",
        cancelButtonText: "No, Cancel!",
      });

      if (!result.isConfirmed) {
        return;
      }
    } else if (value === "Rejected") {
      const { value: inputReason } = await Swal.fire({
        title: "Reason for Rejection",
        input: "textarea",
        inputPlaceholder: "Enter the reason for rejection...",
        showCancelButton: true,
        confirmButtonText: "Submit",
        cancelButtonText: "Cancel",
      });

      if (!inputReason) {
        return;
      }
      reason = inputReason;
    }

    try {
      const response = await axios.put(
        window.url + "render/updateRenderStatus",
        {
          renderId: id,
          status: value,
          ...(value === "Rejected" && { reason }),
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
        }
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
        title: "Approved!",
        text: "Render status updated successfully.",
      });
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message ===
          "Cannot approve Render. Assign Render designer and upload Render image."
      ) {
        Swal.fire({
          icon: "warning",
          title: "No Images Found!",
          text: "No Images Were Found. Please Check And Try again.",
        });
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.message === "Token expired, please login again"
      ) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Token Expired, Please Login Again.",
        });
      } else {
        console.error("Error moving to Design:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Something went wrong. Please try again.",
        });
      }
    }
  };

  const handleMoveToDesign = async (id) => {
    const confirmMove = await Swal.fire({
      title: "Do you want to move to Design?",
      text: "This action will update the render status.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Move",
      cancelButtonText: "Cancel",
    });

    if (!confirmMove.isConfirmed) {
      return;
    }

    try {
      const response = await axios.put(
        window.url + "render/updateRenderStatusToDesign",
        { renderId: id },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("authToken")}`,
          },
        }
      );

      if (
        response.data &&
        response.data.message === "No images found in render"
      ) {
        Swal.fire({
          icon: "warning",
          title: "No Images Found!",
          text: "No images were found in the render. Please check and try again.",
        });
      } else {
        setRows((prevRows) =>
          prevRows.map((row) =>
            row.id === id ? { ...row, renderStatus: "design" } : row
          )
        );
        Swal.fire({
          icon: "success",
          title: "Moved Successfully!",
          text: "Render status updated to design.",
        });
      }
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message === "No images found in render"
      ) {
        Swal.fire({
          icon: "warning",
          title: "No Images Found!",
          text: "No images were found in the render. Please check and try again.",
        });
      } else if (
        error.response &&
        error.response.data &&
        error.response.data.message === "Token expired, please login again"
      ) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Token Expired, Please Login Again.",
        });
      } else {
        console.error("Error moving to Design:", error);
        Swal.fire({
          icon: "error",
          title: "Error!",
          text: "Something went wrong. Please try again.",
        });
      }
    }
  };

  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    const getDesigner_Data = async () => {
      try {
        const requestData = { type: "productDevelopment" };
        const response = await axios.post(getDesignername_Url, requestData, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "Content-Type": "application/json",
          },
        });
        setDesigner_name_array(response.data.data || []);
      } catch (err) {
        console.error(`Failed to fetch setting types: ${err.message}`);
      }
    };

    fetchOrders();
    getDesigner_Data();
  }, [navigate, currentPage, rowsPerPage]);

  // Search renders based on filters
  const searchRenders = async () => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(
        SEARCH_API_URL,
        { ...filters },
        { headers: { Authorization: `Bearer ${savedToken}` } }
      );
      setRows(response.data.data || []);
      setTotalRecords(response.data.totalRecords || response.data.data.length);
      setIsSearchActive(true);
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

  // Load data based on filters or pagination
  useEffect(() => {
    const hasFilters = Object.values(filters).some((val) => val !== "");
    if (hasFilters) {
      searchRenders();
    } else {
      fetchOrders();
    }
  }, [currentPage, filters]); // Trigger on page change or filter change

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCurrentPage(1); // Reset to page 1 on filter change
  };

  const handleClearFilter = () => {
    setFilters({
      renderNo: "",
      status: "",
      startRenderCompletedDate: "",
      endRenderCompletedDate: "",
    });
    setCurrentPage(1);
    setIsSearchActive(false);
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

  const handleAddDesignerClick = (rowId) => {
    setSelectedRowId(rowId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setDesignerName("");
    setDesignerEmail("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const savedToken = Cookies.get("authToken");

    if (!savedToken) {
      Swal.fire({
        icon: "error",
        title: "Authentication Error",
        text: "Authentication token not found. Please log in.",
      });
      return;
    }

    if (!designerName || !startDate || !endDate) {
      Swal.fire({
        icon: "warning",
        title: "Missing Fields",
        text: "Please fill all required fields.",
      });
      return;
    }
    // Add date comparison
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Date Range",
        text: "End date must be equal to or greater than start date.",
      });
      return;
    }

    const dataToSend = {
      id: selectedRowId,
      empId: designerName,
      startDate: new Date(startDate).toISOString().split("T")[0],
      endDate: new Date(endDate).toISOString().split("T")[0],
      type: "render",
    };

    try {
      const response = await axios.put(
        window.url + "render/addRenderDesigner",
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
        title: "Render Designer Created",
        text: `Render Designer created successfully`,
      });
      await fetchOrders();

      setDesignerName("");
      setStartDate("");
      setEndDate("");
      setIsModalOpen(false);
      // navigate("/renderApproval__list");
    } catch (error) {
      console.error(
        "Error creating Render Designer:",
        error.response ? error.response.data : error.message
      );
      Swal.fire({
        icon: "error",
        title: "Error Creating Render Designer",
        text: "Something went wrong. Please try again.",
      });
    }
  };

  const handleFormAndImageUpload = async (e) => {
    await handleSubmit(e);
  };

  const ViewDesignerButton = (orderId) => {
    navigate(`/render_designer/${orderId}`);
  };

  const handleViewrender = (customerId) => {
    navigate(`/viewrender/${customerId}`);
  };

  return (
    <main className="main-content">
      <Content>
        <div className="">
          <div className="page-inner">
            <div className="page-header d-flex justify-content-between align-items-center">
              <h3 className="fw-bold mb-3">Render Approval List</h3>
              <div className="d-flex justify-content-end mb-3">
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
            </div>

            {/* Filter Section */}
            {isFilterVisible && (
              <div className="row mb-4">
                <div className="col-md-12">
                  <div className="card">
                    <div className="card-body filter-section">
                      <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                          <label className="form-label">Render No</label>
                          <input
                            type="text"
                            name="renderNo"
                            className="form-control"
                            value={filters.renderNo}
                            onChange={handleFilterChange}
                            placeholder="Search by Render No"
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">
                            Completed Date (From)
                          </label>
                          <input
                            type="date"
                            name="startRenderCompletedDate"
                            className="form-control"
                            value={filters.startRenderCompletedDate}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">
                            Completed Date (To)
                          </label>
                          <input
                            type="date"
                            name="endRenderCompletedDate"
                            className="form-control"
                            value={filters.endRenderCompletedDate}
                            onChange={handleFilterChange}
                          />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label">Status</label>
                          <select
                            name="status"
                            className="form-control"
                            value={filters.status}
                            onChange={handleFilterChange}
                          >
                            <option value="">Select Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>
                        <div className="col-md-12 text-end mt-3">
                          <button
                            className="btn btn-outline-primary me-2"
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
                      <p>Loading orders...</p>
                    ) : error ? (
                      <p style={{ color: "red" }}>{error}</p>
                    ) : (
                      <>
                        <div className="table-responsive">
                          <table className="display table table-striped table-hover relative customer-table">
                            <thead>
                              <tr>
                                <th></th>
                                {/* <th>ID</th> */}
                                <th>Render No</th>
                                <th>Concept ID</th>
                                <th>
                                  Required <br /> Render Count
                                </th>
                                <th style={{ whiteSpace: "nowrap" }}>
                                  render <br /> Start Date
                                </th>
                                <th style={{ whiteSpace: "nowrap" }}>
                                  render <br /> Completed Date
                                </th>
                                <th>Sketcher</th>
                                <th>Status</th>
                                <th style={{ whiteSpace: "nowrap" }}>
                                  Add Designer
                                </th>
                                <th style={{ whiteSpace: "nowrap" }}>
                                  View Designer
                                </th>
                                <th>Approval</th>
                                <th style={{ whiteSpace: "nowrap" }}>
                                  Move To Design
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.length > 0 ? (
                                rows.map((row) => (
                                  <React.Fragment key={row.id}>
                                    {activeRowId === row.id && (
                                      <tr className="absolute w-full bg-gray-100 border-b border-gray-300">
                                        <td colSpan="13" className="p-2"></td>
                                      </tr>
                                    )}
                                    <tr>
                                      <td>
                                        <IoEye
                                          className="action-icon"
                                          onClick={() =>
                                            handleViewrender(row.id)
                                          }
                                        />
                                      </td>
                                      {/* <td>{row.id}</td> */}
                                      <td>{row.renderNo}</td>
                                      <td>{row.orderNo}</td>
                                      <td>{row.reqRenderCount}</td>
                                      <td>{row.renderBriefDate}</td>
                                      <td>{row.renderCompletedDate}</td>
                                      <td
                                        style={{
                                          minWidth: "250px",
                                          whiteSpace: "pre-line",
                                        }}
                                      >
                                        {row.renderDesigners &&
                                        Array.isArray(row.renderDesigners) &&
                                        row.renderDesigners.length > 0 ? (
                                          row.renderDesigners.map(
                                            (renderDesigner, index) => (
                                              <div key={index}>
                                                {renderDesigner.name}
                                              </div>
                                            )
                                          )
                                        ) : (
                                          <div>
                                            No Render Designer Available
                                          </div>
                                        )}
                                      </td>
                                      <td>{row.status}</td>
                                      <td
                                        style={{
                                          minWidth: "200px",
                                          whiteSpace: "pre-line",
                                        }}
                                      >
                                        <button
                                          onClick={() =>
                                            handleAddDesignerClick(row.id)
                                          }
                                          className="btn btn-sm"
                                          style={{
                                            backgroundColor: "#2E1A47",
                                            color: "white",
                                          }}
                                          disabled={
                                            row.status === "Approved" ||
                                            row.status === "Rejected"
                                          }
                                        >
                                          Add Designer
                                        </button>
                                      </td>
                                      <td
                                        style={{
                                          minWidth: "200px",
                                          whiteSpace: "pre-line",
                                        }}
                                      >
                                        <button
                                          onClick={() =>
                                            ViewDesignerButton(row.id)
                                          }
                                          className="btn btn-sm"
                                          style={{
                                            backgroundColor: "#342D7E",
                                            color: "white",
                                          }}
                                        >
                                          Add Image
                                        </button>
                                      </td>
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
                                          minWidth: "250px",
                                          whiteSpace: "pre-line",
                                        }}
                                      >
                                        <button
                                          onClick={() =>
                                            handleMoveToDesign(row.id)
                                          }
                                          className="btn btn-sm"
                                          style={{
                                            backgroundColor:
                                              row.renderStatus !== "render"
                                                ? "#0056b3"
                                                : "orange",
                                            animation:
                                              row.renderStatus === "render" &&
                                              row.status === "Approved"
                                                ? "blink 1s infinite"
                                                : "none",
                                            color: "white",
                                          }}
                                          disabled={
                                            row.renderStatus === "design" ||
                                            row.status !== "Approved"
                                          }
                                          //   className={`btn btn-sm ${
                                          //     row.renderStatus !== "render"
                                          //       ? "btn-secondary"
                                          //       : "btn-success"
                                          //   }`}
                                        >
                                          {row.renderStatus === "design"
                                            ? "Moved to Design"
                                            : "Move to Design"}
                                        </button>
                                      </td>
                                    </tr>
                                  </React.Fragment>
                                ))
                              ) : isSearchActive ? (
                                <tr>
                                  <td colSpan="13" className="text-center">
                                    No data found
                                  </td>
                                </tr>
                              ) : (
                                <tr>
                                  <td colSpan="13" className="text-center">
                                    No renders found
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        {isModalOpen && (
                                          <AddRenderDesigner
                                            selectedRowId={selectedRowId}
                                            onClose={() =>
                                              setIsModalOpen(false)
                                            }
                                            onSuccess={fetchOrders}
                                          />
                                        )}

                        {/* Modal should be outside the table */}
                        {/* {isModalOpen && (
                          <div className="custom-modal-overlay">
                            <div className="custom-modal">
                              <div className="modal-header">
                                <h5>Add Render Designer</h5>
                              </div>
                              <form onSubmit={handleFormAndImageUpload}>
                                <div className="modal-body">
                                  <div className="row">
                                    <div className="col-md-6">
                                      <div className="form-group">
                                        <label>Designer Name</label>
                                        <select
                                          className="form-select pd-select"
                                          value={designerName}
                                          onChange={(e) =>
                                            setDesignerName(e.target.value)
                                          }
                                        >
                                          <option value="">Select</option>
                                          {designer_name_array.map((type) => (
                                            <option
                                              key={type.id}
                                              value={type.id}
                                            >
                                              {type.name}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row">
                                    <div className="col-md-6">
                                      <div className="form-group">
                                        <label>Start Date</label>
                                        <input
                                          type="date"
                                          className="form-control"
                                          value={startDate}
                                          onChange={(e) =>
                                            setStartDate(e.target.value)
                                          }
                                          required
                                        />
                                      </div>
                                    </div>
                                    <div className="col-md-6">
                                      <div className="form-group">
                                        <label>End Date</label>
                                        <input
                                          type="date"
                                          className="form-control"
                                          value={endDate}
                                          onChange={(e) =>
                                            setEndDate(e.target.value)
                                          }
                                          required
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="modal-footer">
                                  <button
                                    type="submit"
                                    className="btn btn-success"
                                  >
                                    Submit
                                  </button>{" "}
                                  &nbsp;&nbsp;&nbsp;
                                  <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={handleCloseModal}
                                  >
                                    Close
                                  </button>
                                </div>
                              </form>
                            </div>
                          </div>
                        )} */}

                        {/* Pagination - Only shown when not in search mode */}
                        {!isSearchActive && (
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
                                    aria-label="Previous"
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
                                    aria-label="Next"
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
}

export default RenderApprovalList;
