import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { FaPrint } from "react-icons/fa";
import Footer from "../../../Components/Footer";
import Content from "../../../Components/Content";
import Cookies from "js-cookie";
import jsPDF from "jspdf";
import "./Categoryreport.css"; // Import the CSS file

function CategoryReport() {
  const API_URL = window.url + "design/totaldesigncountReport"; // Ensure window.url is defined
  const navigate = useNavigate();

  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [rangeColumns, setRangeColumns] = useState([]);
  const [subRangeColumns, setSubRangeColumns] = useState({});

  // Define colors for each range (for PDF generation)
  const rangeColors = {
    "Below 0.5": { pdf: [255, 235, 238] }, // Light Red
    "0.5-1": { pdf: [232, 245, 233] }, // Light Green
    "1-1.5": { pdf: [255, 253, 231] }, // Light Yellow
    "1.5-2": { pdf: [227, 242, 253] }, // Light Blue
    "2-2.5": { pdf: [252, 228, 236] }, // Light Pink
    "Above 2.5": { pdf: [243, 229, 245] }, // Light Purple
  };

  // Transform the API response to the expected format
  const transformResponseData = (apiData) => {
    if (!apiData?.reportData) {
      return { transformedData: [], ranges: [], subRanges: {} };
    }

    const transformedData = [];
    const ranges = new Set();
    const subRanges = {
      "Below 0.5": [],
      "0.5-1": ["0.5-0.75", "0.75-1.00"],
      "1-1.5": ["1-1.25", "1.25-1.5"],
      "1.5-2": ["1.5-1.75", "1.75-2"],
      "2-2.5": ["2-2.25", "2.25-2.5"],
      "Above 2.5": [],
    };

    const rangeMapping = {
      "Below 0.50": "Below 0.5",
      "0.5-0.7": "0.5-1",
      "0.7-1": "0.5-1",
      "0.5-1": "0.5-1",
      "1-1.5": "1-1.5",
      "1.5-2": "1.5-2",
      "2-2.5": "2-2.5",
      "Above 2.5": "Above 2.5",
    };

    // Mapping API ranges to sub-ranges
    const apiRangeToSubRange = {
      "0.5-0.7": "0.5-0.75",
      "0.7-1": "0.75-1.00",
      "0.5-1": ["0.5-0.75", "0.75-1.00"],
      "1-1.5": "1-1.25",
      "1.5-2": "1.5-1.75",
      "2-2.5": "2-2.25",
    };

    Object.entries(apiData.reportData).forEach(([categoryGroup, categories]) => {
      Object.entries(categories).forEach(([category, subcategories]) => {
        Object.entries(subcategories).forEach(([subcategory, counts]) => {
          const row = {
            categoryGroup,
            category,
            subcategory,
          };
          let rowTotal = 0;

          Object.entries(counts).forEach(([apiRange, count]) => {
            const effectiveCount = count === null ? 0 : count;
            if (apiRange !== null && effectiveCount !== null) {
              const mainRange = rangeMapping[apiRange] || apiRange;
              ranges.add(mainRange);

              row[mainRange] = (row[mainRange] || 0) + effectiveCount;
              rowTotal += effectiveCount;

              if (subRanges[mainRange]?.length > 0) {
                const subRangeMapping = apiRangeToSubRange[apiRange];
                if (Array.isArray(subRangeMapping)) {
                  const subCount = Math.floor(effectiveCount / subRangeMapping.length);
                  const remainder = effectiveCount % subRangeMapping.length;
                  subRangeMapping.forEach((subRange, index) => {
                    row[subRange] = (row[subRange] || 0) + subCount + (index < remainder ? 1 : 0);
                  });
                } else if (subRangeMapping) {
                  row[subRangeMapping] = (row[subRangeMapping] || 0) + effectiveCount;
                }
                subRanges[mainRange].forEach((sr) => {
                  if (!row[sr]) {
                    row[sr] = 0;
                  }
                });
              }
            }
          });

          row.total = rowTotal;
          transformedData.push(row);
        });
      });
    });

    const sortedRanges = Array.from(ranges).sort((a, b) => {
      const rangeOrder = [
        "Below 0.5",
        "0.5-1",
        "1-1.5",
        "1.5-2",
        "2-2.5",
        "Above 2.5",
      ];
      return rangeOrder.indexOf(a) - rangeOrder.indexOf(b);
    });

    const completeSubRanges = {};
    sortedRanges.forEach((range) => {
      completeSubRanges[range] = subRanges[range] || [];
    });

    return { transformedData, ranges: sortedRanges, subRanges: completeSubRanges };
  };

  const calculateTotals = () => {
    const totals = { grandTotal: 0 };
    rangeColumns.forEach((range) => {
      totals[range] = reportData.reduce((sum, row) => sum + (row[range] || 0), 0);
      totals.grandTotal += totals[range];
      const subRanges = subRangeColumns[range] || [];
      subRanges.forEach((subRange) => {
        totals[subRange] = reportData.reduce((sum, row) => sum + (row[subRange] || 0), 0);
      });
    });
    return totals;
  };

  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    const fetchReport = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          API_URL,
          
          {
            headers: { Authorization: `Bearer ${savedToken}` },
          }
        );

        const { transformedData, ranges, subRanges } = transformResponseData(response.data);
        setReportData(transformedData);
        setRangeColumns(ranges);
        setSubRangeColumns(subRanges);
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
    };

    fetchReport();
  }, [navigate]);

  const handlePrint = async () => {
    try {
      if (!reportData || !Array.isArray(reportData) || reportData.length === 0) {
        throw new Error("No report data available");
      }

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;

      const primaryColor = [0, 51, 102];
      const accentColor = [224, 213, 193];
      const textColor = [50, 50, 50];
      const headText = [6, 156, 151];
      const borderColor = [150, 150, 150];
      const totalColumnColor = [245, 245, 220];

      const addHeader = (yPos) => {
        pdf.setFillColor(...accentColor);
        pdf.rect(0, 0, pageWidth, 25, "F");
        pdf.setFontSize(18);
        pdf.setTextColor(...headText);
        pdf.setFont("helvetica", "bold");
        pdf.text("Category Wise Report", pageWidth / 2, yPos + 8, { align: "center" });
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.setFont("helvetica", "italic");
        pdf.text("Detailed Summary", pageWidth / 2, yPos + 15, { align: "center" });
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(...primaryColor);
        pdf.line(margin, yPos + 20, pageWidth - margin, yPos + 20);
        return yPos + 25;
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

      const addSectionHeading = (yPos, title) => {
        if (yPos > pageHeight - 30) {
          addFooter();
          pdf.addPage();
          yPos = margin;
          yPos = addHeader(yPos);
        }
        pdf.setFontSize(14);
        pdf.setTextColor(...primaryColor);
        pdf.setFont("helvetica", "bold");
        const textWidth = pdf.getTextWidth(title);
        const xPos = (pageWidth - textWidth) / 2;
        pdf.text(title, xPos, yPos);
        pdf.setLineWidth(0.3);
        pdf.setDrawColor(...accentColor);
        pdf.line(xPos, yPos + 1, xPos + textWidth, yPos + 1);
        return yPos + 10;
      };

      const drawCell = (text, x, y, width, height, isHeader = false, align = "left", range = null, isTotal = false, isFooter = false, rotate = false) => {
        if (x + width > pageWidth - margin) {
          return false; // Indicate that the cell was not drawn
        }

        if (!isHeader && !isFooter) {
          if (isTotal) {
            pdf.setFillColor(...totalColumnColor);
          } else if (range && rangeColors[range]?.pdf) {
            pdf.setFillColor(...rangeColors[range].pdf);
          } else {
            pdf.setFillColor(255, 255, 255);
          }
          pdf.rect(x, y, width, height, "F");
        }

        pdf.setLineWidth(isHeader || isFooter ? 0.3 : 0.1);
        pdf.setDrawColor(...borderColor);
        pdf.rect(x, y, width, height);

        pdf.setLineWidth(isHeader || isFooter ? 0.5 : 0.2);
        pdf.setDrawColor(120, 120, 120);
        pdf.line(x, y + height, x + width, y + height);

        pdf.setLineWidth(isHeader || isFooter ? 0.3 : 0.2);
        pdf.setDrawColor(120, 120, 120);
        pdf.line(x + width, y, x + width, y + height);

        pdf.setFontSize(isHeader ? 8 : 9); // Smaller font for headers
        pdf.setTextColor(...textColor);
        pdf.setFont("helvetica", isHeader || isFooter ? "bold" : "normal");

        const maxWidth = width - 4;
        let displayText = text.toString();

        if (rotate) {
          pdf.saveGraphicsState();
          pdf.setTextColor(...textColor);
          pdf.setFontSize(8);
          pdf.setFont("helvetica", "bold");
          pdf.transform(0.707, -0.707, 0.707, 0.707, x + width / 2, y + height / 2 + 2);
          pdf.text(displayText, 0, 0, { align: "center" });
          pdf.restoreGraphicsState();
        } else if (align === "center" || align === "right") {
          while (pdf.getTextWidth(displayText) > maxWidth) {
            displayText = displayText.slice(0, -1);
          }
          let textX = align === "center" ? x + (width - pdf.getTextWidth(displayText)) / 2 : x + width - pdf.getTextWidth(displayText) - 2;
          pdf.text(displayText, textX, y + 5.5);
        } else {
          const words = displayText.split(" ");
          let currentLine = "";
          let lineY = y + 5.5;
          let lines = [];
          for (let word of words) {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            if (pdf.getTextWidth(testLine) <= maxWidth) {
              currentLine = testLine;
            } else {
              if (currentLine) lines.push(currentLine);
              currentLine = word;
            }
          }
          if (currentLine) lines.push(currentLine);
          const totalTextHeight = lines.length * 4;
          lineY = y + (height - totalTextHeight) / 2 + 3.5;
          lines.forEach((line, index) => {
            if (lineY + index * 4 <= y + height - 2) {
              pdf.text(line, x + 2, lineY + index * 4);
            }
          });
        }
        return true; // Indicate that the cell was drawn
      };

      const addTable = (startY) => {
        // Define fixed widths based on browser table proportions (approximated)
        const fixedWidths = {
          categoryGroup: 25, // ~15%
          category: 20,      // ~10%
          subcategory: 35,   // ~20%
          total: 10,         // ~5%
        };

        // Calculate total width of fixed columns (excluding Total for now)
        const fixedColumnsWidth = fixedWidths.categoryGroup + fixedWidths.category + fixedWidths.subcategory;

        // Calculate total number of sub-columns
        let totalSubColumns = 0;
        rangeColumns.forEach((range) => {
          totalSubColumns += (subRangeColumns[range] || []).length || 1;
        });

        // Split columns into two pages if necessary
        const maxColumnsPerPage = 7; // Approximate number of columns that fit comfortably
        const allDynamicColumns = [];
        rangeColumns.forEach((range) => {
          const subRanges = subRangeColumns[range] || [];
          if (subRanges.length > 0) {
            subRanges.forEach((subRange) => {
              allDynamicColumns.push({ range, subRange });
            });
          } else {
            allDynamicColumns.push({ range, subRange: null });
          }
        });

        // Include "Total" column as the last column
        const totalColumns = totalSubColumns + 1; // +1 for Total
        const pageGroups = [];
        for (let i = 0; i < totalColumns; i += maxColumnsPerPage - 3) { // -3 to account for fixed columns
          const group = allDynamicColumns.slice(i, i + (maxColumnsPerPage - 3));
          if (i + (maxColumnsPerPage - 3) >= totalSubColumns) {
            // Last group, include Total column
            pageGroups.push({ columns: group, includeTotal: true });
          } else {
            pageGroups.push({ columns: group, includeTotal: false });
          }
        }

        let currentPage = 0;
        let yPos = startY;
        const rowHeight = 8;

        for (const group of pageGroups) {
          if (currentPage > 0) {
            addFooter();
            pdf.addPage();
            yPos = margin;
            yPos = addHeader(yPos);
            yPos = addSectionHeading(yPos, `Report Summary (Part ${currentPage + 1})`);
          }

          const dynamicColumns = group.columns;
          const includeTotal = group.includeTotal;
          const dynamicColumnCount = dynamicColumns.length;
          const totalFixedWidthThisPage = fixedColumnsWidth + (includeTotal ? fixedWidths.total : 0);
          const availableWidth = pageWidth - 2 * margin - totalFixedWidthThisPage;
          const colWidth = dynamicColumnCount > 0 ? availableWidth / dynamicColumnCount : 0;
          const minDynamicColWidth = 10;
          const dynamicColWidth = Math.max(minDynamicColWidth, colWidth);

          const startX = margin;
          let startYForPage = yPos;

          const rowsPerPage = Math.floor((pageHeight - yPos - 20) / rowHeight) - 3;
          let currentRow = 0;

          // First Header Row (Main Ranges)
          let xPos = startX;
          drawCell("Category Group", xPos, startYForPage, fixedWidths.categoryGroup, rowHeight, true, "center");
          xPos += fixedWidths.categoryGroup;
          drawCell("Category", xPos, startYForPage, fixedWidths.category, rowHeight, true, "center");
          xPos += fixedWidths.category;
          drawCell("Subcategory", xPos, startYForPage, fixedWidths.subcategory, rowHeight, true, "center");
          xPos += fixedWidths.subcategory;

          const mainHeaderPositions = [];
          dynamicColumns.forEach(({ range, subRange }) => {
            const subRanges = subRangeColumns[range] || [];
            const colSpan = subRanges.length > 0 ? subRanges.filter(sr => dynamicColumns.some(dc => dc.subRange === sr)).length : 1;
            const width = dynamicColWidth * colSpan;
            mainHeaderPositions.push({ x: xPos, width, range });
            drawCell(range, xPos, startYForPage, width, rowHeight, true, "center");
            xPos += width;
          });
          if (includeTotal) {
            drawCell("Total", xPos, startYForPage, fixedWidths.total, rowHeight, true, "center", null, true);
          }
          yPos += rowHeight;
          currentRow++;

          // Second Header Row (Sub Ranges)
          xPos = startX;
          drawCell("", xPos, yPos, fixedWidths.categoryGroup, rowHeight, true, "center");
          xPos += fixedWidths.categoryGroup;
          drawCell("", xPos, yPos, fixedWidths.category, rowHeight, true, "center");
          xPos += fixedWidths.subcategory;
          drawCell("", xPos, yPos, fixedWidths.subcategory, rowHeight, true, "center");
          xPos += fixedWidths.subcategory;
          dynamicColumns.forEach(({ range, subRange }) => {
            const subRanges = subRangeColumns[range] || [];
            if (subRanges.length > 0 && subRange) {
              drawCell(subRange, xPos, yPos, dynamicColWidth, rowHeight, true, "center", null, false, true);
              xPos += dynamicColWidth;
            } else if (!subRange) {
              drawCell("", xPos, yPos, dynamicColWidth, rowHeight, true, "center");
              xPos += dynamicColWidth;
            }
          });
          if (includeTotal) {
            drawCell("", xPos, yPos, fixedWidths.total, rowHeight, true, "center", null, true);
          }
          yPos += rowHeight;
          currentRow++;

          // Body
          reportData.forEach((row) => {
            if (currentRow >= rowsPerPage || yPos > pageHeight - 30) {
              addFooter();
              pdf.addPage();
              yPos = margin;
              yPos = addHeader(yPos);
              yPos = addSectionHeading(yPos, `Report Summary (Part ${currentPage + 1})`);
              startYForPage = yPos;
              xPos = startX;
              drawCell("Category Group", xPos, startYForPage, fixedWidths.categoryGroup, rowHeight, true, "center");
              xPos += fixedWidths.categoryGroup;
              drawCell("Category", xPos, startYForPage, fixedWidths.category, rowHeight, true, "center");
              xPos += fixedWidths.category;
              drawCell("Subcategory", xPos, startYForPage, fixedWidths.subcategory, rowHeight, true, "center");
              xPos += fixedWidths.subcategory;
              mainHeaderPositions.forEach(({ x, width, range }) => {
                drawCell(range, x, startYForPage, width, rowHeight, true, "center");
              });
              if (includeTotal) {
                drawCell("Total", xPos, startYForPage, fixedWidths.total, rowHeight, true, "center", null, true);
              }
              yPos += rowHeight;
              xPos = startX;
              drawCell("", xPos, yPos, fixedWidths.categoryGroup, rowHeight, true, "center");
              xPos += fixedWidths.categoryGroup;
              drawCell("", xPos, yPos, fixedWidths.category, rowHeight, true, "center");
              xPos += fixedWidths.category;
              drawCell("", xPos, yPos, fixedWidths.subcategory, rowHeight, true, "center");
              xPos += fixedWidths.subcategory;
              dynamicColumns.forEach(({ range, subRange }) => {
                const subRanges = subRangeColumns[range] || [];
                if (subRanges.length > 0 && subRange) {
                  drawCell(subRange, xPos, yPos, dynamicColWidth, rowHeight, true, "center", null, false, true);
                  xPos += dynamicColWidth;
                } else if (!subRange) {
                  drawCell("", xPos, yPos, dynamicColWidth, rowHeight, true, "center");
                  xPos += dynamicColWidth;
                }
              });
              if (includeTotal) {
                drawCell("", xPos, yPos, fixedWidths.total, rowHeight, true, "center", null, true);
              }
              yPos += rowHeight;
              currentRow = 2;
            }
            xPos = startX;
            drawCell(row.categoryGroup || "N/A", xPos, yPos, fixedWidths.categoryGroup, rowHeight, false, "left");
            xPos += fixedWidths.categoryGroup;
            drawCell(row.category || "N/A", xPos, yPos, fixedWidths.category, rowHeight, false, "left");
            xPos += fixedWidths.category;
            drawCell(row.subcategory || "N/A", xPos, yPos, fixedWidths.subcategory, rowHeight, false, "left");
            xPos += fixedWidths.subcategory;
            dynamicColumns.forEach(({ range, subRange }) => {
              const subRanges = subRangeColumns[range] || [];
              if (subRanges.length > 0 && subRange) {
                drawCell(row[subRange] || 0, xPos, yPos, dynamicColWidth, rowHeight, false, "right", range);
                xPos += dynamicColWidth;
              } else if (!subRange) {
                drawCell(row[range] || 0, xPos, yPos, dynamicColWidth, rowHeight, false, "right", range);
                xPos += dynamicColWidth;
              }
            });
            if (includeTotal) {
              drawCell(row.total || 0, xPos, yPos, fixedWidths.total, rowHeight, false, "right", null, true);
            }
            yPos += rowHeight;
            currentRow++;
          });

          // Footer (Grand Total)
          if (currentRow >= rowsPerPage || yPos > pageHeight - 30) {
            addFooter();
            pdf.addPage();
            yPos = margin;
            yPos = addHeader(yPos);
            yPos = addSectionHeading(yPos, `Report Summary (Part ${currentPage + 1})`);
            startYForPage = yPos;
            xPos = startX;
            drawCell("Category Group", xPos, startYForPage, fixedWidths.categoryGroup, rowHeight, true, "center");
            xPos += fixedWidths.categoryGroup;
            drawCell("Category", xPos, startYForPage, fixedWidths.category, rowHeight, true, "center");
            xPos += fixedWidths.category;
            drawCell("Subcategory", xPos, startYForPage, fixedWidths.subcategory, rowHeight, true, "center");
            xPos += fixedWidths.subcategory;
            mainHeaderPositions.forEach(({ x, width, range }) => {
              drawCell(range, x, startYForPage, width, rowHeight, true, "center");
            });
            if (includeTotal) {
              drawCell("Total", xPos, startYForPage, fixedWidths.total, rowHeight, true, "center", null, true);
            }
            yPos += rowHeight;
            xPos = startX;
            drawCell("", xPos, yPos, fixedWidths.categoryGroup, rowHeight, true, "center");
            xPos += fixedWidths.categoryGroup;
            drawCell("", xPos, yPos, fixedWidths.category, rowHeight, true, "center");
            xPos += fixedWidths.category;
            drawCell("", xPos, yPos, fixedWidths.subcategory, rowHeight, true, "center");
            xPos += fixedWidths.subcategory;
            dynamicColumns.forEach(({ range, subRange }) => {
              const subRanges = subRangeColumns[range] || [];
              if (subRanges.length > 0 && subRange) {
                drawCell(subRange, xPos, yPos, dynamicColWidth, rowHeight, true, "center", null, false, true);
                xPos += dynamicColWidth;
              } else if (!subRange) {
                drawCell("", xPos, yPos, dynamicColWidth, rowHeight, true, "center");
                xPos += dynamicColWidth;
              }
            });
            if (includeTotal) {
              drawCell("", xPos, yPos, fixedWidths.total, rowHeight, true, "center", null, true);
            }
            yPos += rowHeight;
            currentRow = 2;
          }
          xPos = startX;
          const totals = calculateTotals();
          drawCell("Grand Total", xPos, yPos, fixedWidths.categoryGroup + fixedWidths.category + fixedWidths.subcategory, rowHeight, true, "center", null, false, true);
          xPos += fixedWidths.categoryGroup + fixedWidths.category + fixedWidths.subcategory;
          dynamicColumns.forEach(({ range, subRange }) => {
            const subRanges = subRangeColumns[range] || [];
            if (subRanges.length > 0 && subRange) {
              drawCell(totals[subRange] || 0, xPos, yPos, dynamicColWidth, rowHeight, true, "right", null, false, true);
              xPos += dynamicColWidth;
            } else if (!subRange) {
              drawCell(totals[range] || 0, xPos, yPos, dynamicColWidth, rowHeight, true, "right", null, false, true);
              xPos += dynamicColWidth;
            }
          });
          if (includeTotal) {
            drawCell(totals.grandTotal, xPos, yPos, fixedWidths.total, rowHeight, true, "right", null, true, true);
          }
          yPos += rowHeight;

          currentPage++;
        }

        return yPos;
      };

      let yPos = margin;
      yPos = addHeader(yPos);
      yPos = addSectionHeading(yPos, "Report Summary (Part 1)");
      yPos = addTable(yPos);
      addFooter();
      pdf.save("Category_Wise_Report.pdf");
    } catch (error) {
      console.error("Error in handlePrint:", error.message, error.stack);
      alert("Failed to generate PDF. Check console for details.");
    }
  };

  const totals = calculateTotals();

  const getRangeClass = (range) => {
    return range.toLowerCase().replace(/\./g, '-').replace(/\s+/g, '-');
  };

  return (
    <main className="main-content">
      <Content>
        <div className="page-inner">
          <div className="page-header d-flex justify-content-between align-items-center">
            <h3 className="fw-bold mb-3">Design Category Wise Report</h3>
            <div>
              <button
                className="btn btn-link p-0 me-2"
                onClick={handlePrint}
                aria-label="Print Report"
                title="Download PDF"
                disabled={reportData.length === 0}
              >
                <FaPrint size={25} className="text-muted" />
              </button>
            </div>
          </div>

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
                    <div className="table-responsive category-report-page">
                      <table className="display table table-striped table-hover category-report-table">
                        <thead>
                          <tr>
                            <th className="category-group-column" rowSpan={2}>Category Group</th>
                            <th className="category-column" rowSpan={2}>Category</th>
                            <th className="subcategory-column" rowSpan={2}>Subcategory</th>
                            {rangeColumns.map((range, index) => (
                              <th
                                key={index}
                                className="range-column"
                                colSpan={(subRangeColumns[range] || []).length || 1}
                              >
                                {range}
                              </th>
                            ))}
                            <th className="total-column" rowSpan={2}>Total</th>
                          </tr>
                          <tr>
                            {rangeColumns.map((range, index) => (
                              <React.Fragment key={index}>
                                {(subRangeColumns[range] || []).length > 0 ? (
                                  subRangeColumns[range].map((subRange, subIndex) => (
                                    <th
                                      key={subIndex}
                                      className="range-column"
                                    >
                                      {subRange}
                                    </th>
                                  ))
                                ) : (
                                  <th className="range-column"></th>
                                )}
                              </React.Fragment>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {reportData.length > 0 ? (
                            reportData.map((row, index) => (
                              <tr key={index}>
                                <td className="category-group-column">{row.categoryGroup || "N/A"}</td>
                                <td className="category-column">{row.category || "N/A"}</td>
                                <td className="subcategory-column">{row.subcategory || "N/A"}</td>
                                {rangeColumns.map((range, rangeIndex) => (
                                  <React.Fragment key={rangeIndex}>
                                    {(subRangeColumns[range] || []).length > 0 ? (
                                      subRangeColumns[range].map((subRange, subIndex) => (
                                        <td
                                          key={subIndex}
                                          className={`range-column ${getRangeClass(range)}`}
                                        >
                                          {row[subRange] || 0}
                                        </td>
                                      ))
                                    ) : (
                                      <td
                                        className={`range-column ${getRangeClass(range)}`}
                                      >
                                        {row[range] || 0}
                                      </td>
                                    )}
                                  </React.Fragment>
                                ))}
                                <td className="total-column">{row.total || 0}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={
                                  rangeColumns.reduce(
                                    (sum, range) => sum + ((subRangeColumns[range] || []).length || 1),
                                    0
                                  ) + 4
                                }
                                className="text-center"
                              >
                                No report data found
                              </td>
                            </tr>
                          )}
                        </tbody>
                        {reportData.length > 0 && (
                          <tfoot>
                            <tr>
                              <th colSpan={3}>Grand Total</th>
                              {rangeColumns.map((range, index) => (
                                <React.Fragment key={index}>
                                  {(subRangeColumns[range] || []).length > 0 ? (
                                    subRangeColumns[range].map((subRange, subIndex) => (
                                      <th
                                        key={subIndex}
                                        className="range-column"
                                      >
                                        {totals[subRange] || 0}
                                      </th>
                                    ))
                                  ) : (
                                    <th
                                      className="range-column"
                                    >
                                      {totals[range] || 0}
                                    </th>
                                  )}
                                </React.Fragment>
                              ))}
                              <th className="total-column">{totals.grandTotal}</th>
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

export default CategoryReport;