import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Footer from "../../../Components/Footer";
import Content from "../../../Components/Content";

import Cookies from "js-cookie";

function InsiteReport() {
  const API_URL = window.url + "design/FeedbackInsightReport";
  const SEARCH_API_URL = window.url + "design/searchDesignReport"; // Separate API for search

  const [rows, setRows] = useState([]);
  const [filteredRows, setFilteredRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();

  // Filters State

  const [startcreatedate, setStartcreatedDate] = useState("");
  const [endcreateddate, setEndcreateddate] = useState("");
  const [designNo, setDesignNo] = useState("");

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
          {
            headers: {
              Authorization: `Bearer ${Cookies.get("authToken")}`,
            },
          }
        );
        if (response.data) {
          setRows(response.data.data || []);
          setTotalRecords(response.data.totalCount || 0); // Ensure you use the correct field from the API
        }
      } catch (err) {
        setError(
          `Failed to fetch Order data: ${
            err.response?.data?.message || err.message
          }`
        );
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

    fetchOrders();
  }, [navigate, currentPage, rowsPerPage]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= Math.ceil(totalRecords / rowsPerPage)) {
      setCurrentPage(page);
    }
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  return (
     <main className="main-content">
      
      <Content>
        <div className="">
          <div className="page-inner">
            <div className="page-header">
              <h3 className="fw-bold mb-3">Feedback Insight Report</h3>
            </div>

            <div className="row mt-3">
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
                          <table className="display table table-striped table-hover customer-table">
                            <thead>
                              <tr>
                                {/* <th>ID</th> */}
                                <th>design No</th>
                                <th>design/Sent Count</th>
                                <th>feedback Count</th>
                                <th>
                                  metalType Change <br /> Requests
                                </th>
                                <th>
                                  metalColor Change <br /> Requests
                                </th>
                                <th>
                                  weight Change <br /> Requests
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map((row) => (
                                <tr key={row.id}>
                                  {/*  <td>{row.id}</td> */}
                                  <td>{row.designNo}</td>
                                  <td>{row.designSentCount}</td>
                                  <td>{row.feedbackCount}</td>
                                  <td>
                                    {row.metalTypeChangeRequests || "N/A"}
                                  </td>
                                  <td>
                                    {row.metalColorChangeRequests || "N/A"}
                                  </td>
                                  <td>{row.weightChangeRequests || "N/A"}</td>
                                </tr>
                              ))}
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

export default InsiteReport;
