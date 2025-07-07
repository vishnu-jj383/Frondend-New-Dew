import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  FaEdit,
  FaTrash,
  FaEllipsisV,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { FaUpload } from "react-icons/fa";
import Footer from "../../../Components/Footer";
import Content from "../../../Components/Content";
import Cookies from "js-cookie";
import { Modal, Image } from "antd";
// import { useSelector } from "react-redux";
function RenderDesignerList() {
  const API_URL = window.url + "tasks/getTasksByOrderIdOrType";
  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeRowId, setActiveRowId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const navigate = useNavigate();
  const { orderId } = useParams();
  // Filters State

  // const sideBarState = useSelector((state) => state?.sidebar?.sideBar);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }
    const getDesignerdata = async () => {
      setLoading(true);
      try {
        const requestData = {
          // orderId: orderId,
          type: "render",
          id: parseInt(orderId),
          page: currentPage,
          pageSize: rowsPerPage,
        };
        const response = await axios.post(API_URL, requestData, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "Content-Type": "application/json",
          },
        });

        console.log("API Response:", response.data); // Debugging API Response

        if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          setRows(response.data.data || []); // ✅ Corrected the data structure
          setTotalRecords(response.data.totalRecords || 0);
        } else {
          console.error("Unexpected API response format:", response.data);
          setError("Invalid API response format.");
        }
      } catch (err) {
        console.error("API Fetch Error:", err);
        setError(`Failed to fetch Order data: ${err.message}`);
        if (
          err.response?.data?.message === "Token expired, please login again" ||
          err.message === "Token expired, please login again"
        ) {
          Cookies.remove("authToken"); // Remove the expired token
          navigate("/"); // Redirect to login
        }
      } finally {
        setLoading(false);
      }
    };
    getDesignerdata();
  }, [navigate, orderId, currentPage, rowsPerPage]); // Added customerId dependency

  const handleEdit = (designerId) => {
    // Implement your edit logic here
    navigate(`/render_designer_edit/${designerId}`);
  };
  const handleImageUpload = (designerId) => {
    // Implement your edit logic here
    navigate(`/render_image_upload/${designerId}`);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= Math.ceil(totalRecords / rowsPerPage)) {
      setCurrentPage(page);
    }
  };

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  return (
    <main className="main-content">
      <Content>
        <div className="">
          <div className="page-inner">
            <div className="page-header">
              <h3 className="fw-bold mb-3">Render Designer List</h3>
            </div>

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
                          <table className="display table table-striped table-hover relative">
                            <thead>
                              <tr>
                                {/* <th>ID</th> */}
                                <th>Task No</th>
                                <th style={{ whiteSpace: "nowrap" }}>
                                  Order Id
                                </th>
                                <th style={{ whiteSpace: "nowrap" }}>Name</th>

                                <th style={{ whiteSpace: "nowrap" }}>
                                  Start Date
                                </th>
                                <th style={{ whiteSpace: "nowrap" }}>
                                  End Date
                                </th>
                                <th style={{ whiteSpace: "nowrap" }}>Image</th>
                                <th>
                                  Selected <br /> For Dew
                                </th>
                                <th>
                                  Selected <br /> For Customer
                                </th>

                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.length === 0 ? (
                                <tr>
                                  <td colSpan="10" className="text-center">
                                    No Data Available
                                  </td>
                                </tr>
                              ) : (
                                rows.map((row) => (
                                  <tr key={row.id}>
                                    {/* <td>{row.id}</td> */}
                                    <td>{row.taskId}</td>
                                    <td>{row.orderId}</td>
                                    <td>{row.name}</td>
                                    <td>{row.startDate}</td>
                                    <td>{row.endDate}</td>
                                    <td>
                                      {Array.isArray(row.imageUrls) &&
                                      row.imageUrls.length > 0 ? (
                                        <Image.PreviewGroup>
                                          {row.imageUrls.map((img, index) => (
                                            <Image
                                              key={index}
                                              src={img}
                                              width="30%"
                                              alt={`image-${index}`}
                                            />
                                          ))}
                                        </Image.PreviewGroup>
                                      ) : (
                                        <FaUpload
                                          onClick={() => {
                                            handleImageUpload(row.id);
                                          }}
                                          style={{
                                            fontSize: "20px",
                                            cursor: "pointer",
                                            color: "#007bff",
                                          }}
                                          className={
                                            row.renderStatus === "Approved" ||
                                            row.renderStatus === "Rejected"
                                              ? "opacity-50 cursor-not-allowed"
                                              : "cursor-pointer"
                                          }
                                        />
                                      )}
                                    </td>
                                    <td>
                                      {row.isApprovedOwn
                                        ? "Selected"
                                        : "Not Selected"}
                                    </td>
                                    <td>
                                      {row.isApprovedCustomer
                                        ? "Selected"
                                        : "Not Selected"}
                                    </td>
                                    <td>
                                      <FaEdit
                                        onClick={() => {
                                          handleEdit(row.id);
                                        }}
                                        className={
                                          row.renderStatus === "Approved" ||
                                          row.renderStatus === "Rejected"
                                            ? "opacity-50 cursor-not-allowed"
                                            : "cursor-pointer"
                                        }
                                      />
                                      {/* &nbsp;&nbsp;&nbsp;
          <FaTrash
            onClick={() => {
              if (row.status !== "Approved" && row.status !== "Rejected") {
                handleDelete(row.id);
              }
            }}
            className={
              row.status === "Approved" || row.status === "Rejected"
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }
          /> */}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Pagination Controls */}
                        <div
                          className="w-full flex justify-end pr-4 "
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                          }}
                        >
                          <div className="d-flex justify-content-center mt-4">
                            <button
                              onClick={() =>
                                setCurrentPage((prev) => Math.max(prev - 1, 1))
                              }
                              disabled={currentPage === 1}
                              className="btn btn-sm btn-outline-primary"
                            >
                              ◀
                            </button>

                            <button
                              onClick={() => setCurrentPage(1)}
                              className={`btn btn-sm mx-1 ${
                                currentPage === 1
                                  ? "btn-primary"
                                  : "btn-outline-primary"
                              }`}
                            >
                              1
                            </button>

                            {currentPage > 4 && (
                              <span className="mx-1">...</span>
                            )}

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
                                    currentPage === num
                                      ? "btn-primary"
                                      : "btn-outline-primary"
                                  }`}
                                >
                                  {num}
                                </button>
                              ))}

                            {currentPage < totalPages - 3 && (
                              <span className="mx-1">...</span>
                            )}

                            {totalPages > 1 && (
                              <button
                                onClick={() => setCurrentPage(totalPages)}
                                className={`btn btn-sm mx-1 ${
                                  currentPage === totalPages
                                    ? "btn-primary"
                                    : "btn-outline-primary"
                                }`}
                              >
                                {totalPages}
                              </button>
                            )}

                            <button
                              onClick={() =>
                                setCurrentPage((prev) =>
                                  prev < totalPages ? prev + 1 : prev
                                )
                              }
                              disabled={currentPage >= totalPages}
                              className="btn btn-sm btn-outline-primary"
                            >
                              ▶
                            </button>
                          </div>
                        </div>

                        {/* Showing Total Records */}
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
}
export default RenderDesignerList;
