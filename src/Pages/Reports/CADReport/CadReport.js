import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { FaSearch, FaPrint } from "react-icons/fa";
import Footer from "../../../Components/Footer";
import Content from "../../../Components/Content";
import Cookies from "js-cookie";
import debounce from "lodash/debounce";
import jsPDF from "jspdf";
import "./CadReport.css";

function CadReport() {
  const API_URL = window.url + "design/orderProductTypeReport";
  const navigate = useNavigate();

  const [reportData, setReportData] = useState([]);
  const [productTypes, setProductTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [filters, setFilters] = useState({
    month: "",
    startDate: "",
    endDate: "",
  });
  const [warningMessage, setWarningMessage] = useState("");

  const calculateTotals = () => {
    const columnTotals = {};
    productTypes.forEach((type) => {
      columnTotals[type] = reportData.reduce((sum, row) => {
        return sum + ((row.productTypes && row.productTypes[type]) || 0);
      }, 0);
    });
    const grandTotal = Object.values(columnTotals).reduce((sum, val) => sum + val, 0);
    return { columnTotals, grandTotal };
  };

  const { columnTotals, grandTotal } = calculateTotals();

  useEffect(() => {
    const types = new Set();
    reportData.forEach((row) => {
      if (row.productTypes && typeof row.productTypes === "object") {
        Object.keys(row.productTypes).forEach((type) => types.add(type));
      }
    });
    setProductTypes([...types].sort());
  }, [reportData]);

  const fetchReport = debounce(async (filterParams) => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    setLoading(true);
    
    try {
      const cleanedFilters = Object.fromEntries(
        Object.entries(filterParams).filter(([_, v]) => v !== "")
      );

      if (Object.keys(cleanedFilters).length === 0) {
        setReportData([]);
        setLoading(false);
        return;
      }

      const response = await axios.post(API_URL, cleanedFilters, {
        headers: { Authorization: `Bearer ${savedToken}` },
      });
      const data = Array.isArray(response.data?.data) ? response.data.data[0]?.diamondRanges || [] : [];
      setReportData(data);
      setError(null);
    } catch (err) {
      const message = err.response?.data?.message || err.message || "Unknown error occurred";
      setError(`Failed to fetch report: ${message}`);
      if (message.includes("Token expired")) {
        Cookies.remove("authToken");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  }, 500);

  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
    }
  }, [navigate]);

  const validateFilters = (newFilters) => {
    const { month, startDate, endDate } = newFilters;
    
    // If month is selected, no need for startDate/endDate validation
    if (month) {
      return "";
    }
    
    // If startDate is selected without endDate
    if (startDate && !endDate) {
      return "Please select an end date to fetch the report.";
    }
    
    // If endDate is selected without startDate
    if (!startDate && endDate) {
      return "Please select a start date to fetch the report.";
    }
    
    // If both startDate and endDate are selected, check date order
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      return "Error: End date cannot be earlier than start date.";
    }
    
    return "";
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => {
      const newFilters = { ...prev, [name]: value };
      
      // Validate filters
      const validationMsg = validateFilters(newFilters);
      setWarningMessage(validationMsg);
      
      // Only fetch if validation passes (no warning/error) or month is selected
      if (!validationMsg || newFilters.month) {
        fetchReport(newFilters);
      } else {
        // Clear report data if filters are invalid to prevent showing stale data
        setReportData([]);
      }
      
      return newFilters;
    });
  };

  const handleClearFilter = () => {
    setFilters({
      month: "",
      startDate: "",
      endDate: "",
    });
    setReportData([]);
    setError(null);
    setWarningMessage("");
  };

  const handlePrint = async () => {
    try {
      if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
        throw new Error("No report data available");
      }

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      let yPos = margin;

      const primaryColor = [0, 51, 102];
      const accentColor = [224, 213, 193];
      const textColor = [50, 50, 50];
      const headText = [6, 156, 151];
      const borderColor = [150, 150, 150];
      const rangeColumnColor = [240, 248, 255]; // Light blue for Range column
      const totalColumnColor = [245, 245, 220]; // Beige for Total column

      const addHeader = () => {
        yPos = margin;
        pdf.setFillColor(...accentColor);
        pdf.rect(0, 0, pageWidth, 25, "F");
        pdf.setFontSize(18);
        pdf.setTextColor(...headText);
        pdf.setFont("helvetica", "bold");
        pdf.text("CAD Report: Completed Tasks", pageWidth / 2, yPos + 8, { align: "center" });
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.setFont("helvetica", "italic");
        pdf.text("Product Type Summary", pageWidth / 2, yPos + 15, { align: "center" });
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(...primaryColor);
        pdf.line(margin, yPos + 20, pageWidth - margin, yPos + 20);
        yPos += 25;
      };

      const addFooter = () => {
        pdf.setLineWidth(0.2);
        pdf.setDrawColor(...borderColor);
        pdf.line(margin, pageHeight - 15, pageWidth - margin, pageHeight - 15);
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.setFont("helvetica", "normal");
        pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, pageHeight - 8);
        pdf.text(`Page ${pdf.internal.getNumberOfPages()}`, pageWidth - margin - 10, pageHeight - 8, { align: "right" });
      };

      const addSectionHeading = (title) => {
        if (yPos > pageHeight - 30) {
          addFooter();
          pdf.addPage();
          addHeader();
          yPos = margin + 20;
        }
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...primaryColor);
        const textWidth = pdf.getTextWidth(title);
        const xPos = (pageWidth - textWidth) / 2;
        pdf.text(title, xPos, yPos);
        pdf.setLineWidth(0.3);
        pdf.setDrawColor(...accentColor);
        pdf.line(xPos, yPos + 1, xPos + textWidth, yPos + 1);
        yPos += 10;
      };

      const addTable = () => {
        const colCount = productTypes.length + 2;
        const colWidth = (pageWidth - 2 * margin) / colCount;
        const rowHeight = 8;
        const maxWidth = colWidth - 4;
        const startX = margin;
        let startY = yPos;

        const drawCell = (text, x, y, width, height, isHeader = false, align = "left", isRange = false, isTotal = false) => {
          if (!isHeader) {
            if (isRange) {
              pdf.setFillColor(...rangeColumnColor);
            } else if (isTotal) {
              pdf.setFillColor(...totalColumnColor);
            } else {
              pdf.setFillColor(255, 255, 255);
            }
            pdf.rect(x, y, width, height, "F");
          }
          
          pdf.setLineWidth(0.1);
          pdf.setDrawColor(...borderColor);
          pdf.rect(x, y, width, height);
          pdf.setFontSize(10);
          pdf.setTextColor(...textColor);
          pdf.setFont("helvetica", isHeader ? "bold" : "normal");
          
          let displayText = text.toString();
          while (pdf.getTextWidth(displayText) > maxWidth) {
            displayText = displayText.slice(0, -1);
          }
          
          let textX = x + 2;
          if (align === "center") {
            textX = x + (width - pdf.getTextWidth(displayText)) / 2;
          } else if (align === "right") {
            textX = x + width - pdf.getTextWidth(displayText) - 2;
          }
          pdf.text(displayText, textX, y + 5.5);
        };

        const rowsPerPage = Math.floor((pageHeight - yPos - 20) / rowHeight) - 2;
        let currentRow = 0;

        // Header
        if (yPos > pageHeight - 30) {
          addFooter();
          pdf.addPage();
          addHeader();
          yPos = margin + 20;
          startY = yPos;
        }
        drawCell("Range", startX, startY, colWidth, rowHeight, true, "center", true);
        let xPos = startX + colWidth;
        productTypes.forEach((type) => {
          drawCell(type, xPos, startY, colWidth, rowHeight, true, "center");
          xPos += colWidth;
        });
        drawCell("Total", xPos, startY, colWidth, rowHeight, true, "center", false, true);
        yPos += rowHeight;
        currentRow++;

        // Body
        reportData.forEach((row) => {
          if (currentRow >= rowsPerPage || yPos > pageHeight - 30) {
            addFooter();
            pdf.addPage();
            addHeader();
            yPos = margin + 20;
            startY = yPos;
            drawCell("Range", startX, startY, colWidth, rowHeight, true, "center", true);
            xPos = startX + colWidth;
            productTypes.forEach((type) => {
              drawCell(type, xPos, startY, colWidth, rowHeight, true, "center");
              xPos += colWidth;
            });
            drawCell("Total", xPos, startY, colWidth, rowHeight, true, "center", false, true);
            yPos += rowHeight;
            currentRow = 1;
          }
          xPos = startX;
          drawCell(row.diamondRange || "N/A", xPos, yPos, colWidth, rowHeight, false, "center", true);
          xPos += colWidth;
          productTypes.forEach((type) => {
            drawCell((row.productTypes && row.productTypes[type]) || 0, xPos, yPos, colWidth, rowHeight, false, "center");
            xPos += colWidth;
          });
          drawCell(row.totalCount || 0, xPos, yPos, colWidth, rowHeight, false, "right", false, true);
          yPos += rowHeight;
          currentRow++;
        });

        // Footer (Totals)
        if (currentRow >= rowsPerPage || yPos > pageHeight - 30) {
          addFooter();
          pdf.addPage();
          addHeader();
          yPos = margin + 20;
          startY = yPos;
          drawCell("Range", startX, startY, colWidth, rowHeight, true, "center", true);
          xPos = startX + colWidth;
          productTypes.forEach((type) => {
            drawCell(type, xPos, startY, colWidth, rowHeight, true, "center");
            xPos += colWidth;
          });
          drawCell("Total", xPos, startY, colWidth, rowHeight, true, "center", false, true);
          yPos += rowHeight;
          currentRow = 1;
        }
        xPos = startX;
        drawCell("Total", xPos, yPos, colWidth, rowHeight, true, "center", true);
        xPos += colWidth;
        productTypes.forEach((type) => {
          drawCell(columnTotals[type] || 0, xPos, yPos, colWidth, rowHeight, true, "right");
          xPos += colWidth;
        });
        drawCell(grandTotal, xPos, yPos, colWidth, rowHeight, true, "right", false, true);
        yPos += rowHeight;
      };

      addHeader();
      addSectionHeading("Report Summary");
      addTable();
      addFooter();
      pdf.save("CAD_Report.pdf");
    } catch (error) {
      console.error("Error in handlePrint:", error.message, error.stack);
      alert("Failed to generate PDF. Check console for details.");
    }
  };

  return (
    <main className="main-content">
      <Content>
        <div className="page-inner">
          <div className="page-header d-flex justify-content-between align-items-center">
            <h3 className="fw-bold mb-3">CAD Report: Completed Tasks</h3>
            <div>
              <button
                className="btn btn-link p-0 me-2"
                onClick={handlePrint}
                aria-label="Print Report"
                title="Download PDF"
              >
                <FaPrint size={25} className="text-muted" />
              </button>
              <button
                className="btn btn-link p-0"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
                aria-label={isFilterVisible ? "Hide Filters" : "Show Filters"}
              >
                <FaSearch size={25} className={isFilterVisible ? "text-primary" : "text-muted"} />
              </button>
            </div>
          </div>

          {isFilterVisible && (
            <div className="row mb-4">
              <div className="col-md-12">
                <div className="card">
                  <div className="card-body filter-section">
                    {warningMessage && (
                      <div className={`alert ${warningMessage.startsWith("Error") ? "alert-danger" : "alert-warning"} mb-3`} role="alert">
                        {warningMessage}
                      </div>
                    )}
                    <div className="row g-3 align-items-end">
                      <div className="col-md-3">
                        <label className="form-label">Month</label>
                        <input
                          type="month"
                          name="month"
                          className="form-control uniform-input"
                          value={filters.month}
                          onChange={handleFilterChange}
                          placeholder="Select Month (YYYY-MM)"
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Start Date</label>
                        <input
                          type="date"
                          name="startDate"
                          className="form-control uniform-input"
                          value={filters.startDate}
                          onChange={handleFilterChange}
                          disabled={filters.month}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">End Date</label>
                        <input
                          type="date"
                          name="endDate"
                          className="form-control uniform-input"
                          value={filters.endDate}
                          onChange={handleFilterChange}
                          disabled={filters.month}
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
                    <div className="table-responsive">
                      <table className="display table table-striped table-hover">
                        <thead>
                          <tr>
                            <th className="range-column" style={{ backgroundColor: '#f0f8ff' }}>Range</th>
                            {productTypes.map((type) => (
                              <th key={type}>{type}</th>
                            ))}
                            <th className="total-column" style={{ backgroundColor: '#f5f5dc' }}>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.length > 0 ? (
                            reportData.map((row, index) => (
                              <tr key={index}>
                                <td className="range-column" style={{ backgroundColor: '#f0f8ff' }}>{row.diamondRange || "N/A"}</td>
                                {productTypes.map((type) => (
                                  <td key={type}>{(row.productTypes && row.productTypes[type]) || 0}</td>
                                ))}
                                <td className="total-column" style={{ backgroundColor: '#f5f5dc' }}>{row.totalCount || 0}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={productTypes.length + 2} className="text-center">
                                No report data found
                              </td>
                            </tr>
                          )}
                        </tbody>
                        {reportData.length > 0 && (
                          <tfoot>
                            <tr>
                              <th className="range-column" style={{ backgroundColor: '#f0f8ff' }}>Total</th>
                              {productTypes.map((type) => (
                                <th key={type}>{columnTotals[type] || 0}</th>
                              ))}
                              <th className="total-column" style={{ backgroundColor: '#f5f5dc' }}>{grandTotal}</th>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  )}
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

export default CadReport;