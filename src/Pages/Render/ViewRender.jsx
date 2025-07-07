import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Footer from "../../Components/Footer";
import Content from "../../Components/Content";
import Cookies from "js-cookie";
// import { useSelector } from 'react-redux';
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import { FaPrint } from "react-icons/fa";
import "./Vieworder.css";

function ViewRender() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // const sideBarState = useSelector(state => state?.sidebar?.sideBar);
  const API_URL = window.url + `render/getRenderById/${id}`;

  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    const fetchOrderData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(API_URL, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        setOrderData(response.data.data || {});
      } catch (err) {
        setError("Failed to fetch order data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderData();
  }, [id, navigate]);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!orderData) return null;

  const order = orderData.Order || {};

  const handlePrint = async () => {
    console.log("handlePrint started");
    console.log(orderData);
    try {
      if (
        !order ||
        typeof order !== "object" ||
        !orderData ||
        typeof orderData !== "object"
      ) {
        throw new Error("Order data is invalid");
      }

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 15;
      let yPos = margin;

      const primaryColor = [0, 51, 102];
      const accentColor = [224, 213, 193];
      const textColor = [50, 50, 50];
      const headText = [6, 156, 151];
      const lineColor = [200, 200, 200];

      const addHeader = () => {
        yPos = margin; // Reset yPos to the top margin for consistency
        pdf.setFillColor(...accentColor);
        pdf.rect(0, 0, pageWidth, 30, "F");
        pdf.setFontSize(20);
        pdf.setTextColor(...headText);
        pdf.setFont("helvetica", "bold");
        pdf.text("Dew Diamonds", pageWidth / 2, yPos + 8, { align: "center" });
        pdf.setFontSize(10);
        pdf.setTextColor(100);
        pdf.setFont("helvetica", "italic");
        pdf.text("Crafting Timeless Elegance", pageWidth / 2, yPos + 14, {
          align: "center",
        });
        pdf.setLineWidth(0.5);
        pdf.setDrawColor(...primaryColor);
        //pdf.line(margin, yPos + 20, pageWidth - margin, yPos + 20);
        yPos += 25; // Move yPos down after header is drawn
      };

      const addFooter = () => {
        pdf.setLineWidth(0.2);
        pdf.setDrawColor(...lineColor);
        pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.setFont("helvetica", "normal");
        pdf.text(
          `Generated on: ${new Date().toLocaleString()}`,
          margin,
          pageHeight - 10
        );
        pdf.text(
          `Page ${pdf.internal.getNumberOfPages()}`,
          pageWidth - margin - 10,
          pageHeight - 10,
          { align: "right" }
        );
      };

      const addSectionHeading = (title) => {
        if (yPos > pageHeight - 40) {
          addFooter();
          pdf.addPage();
          addHeader();
          yPos = margin + 20;
        }

        // Set text styling first (font must be set before measuring width)
        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...primaryColor);

        // Calculate the width of the text with current font settings
        const textWidth = pdf.getTextWidth(title);
        const pageWidth = pdf.internal.pageSize.getWidth();
        const xPos = (pageWidth - textWidth) / 2; // Center point

        // Draw centered text
        pdf.text(title, xPos, yPos);

        // Draw underline matching exact text width
        pdf.setLineWidth(0.3);
        pdf.setDrawColor(...accentColor);
        pdf.line(xPos, yPos + 1, xPos + textWidth, yPos + 1);

        yPos += 10;
      };

      const addKeyValue = (key, value) => {
        if (yPos > pageHeight - 30) {
          addFooter();
          pdf.addPage();
          addHeader();
          yPos = margin + 20;
        }
        pdf.setFontSize(11);
        pdf.setTextColor(...textColor);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${key}:`, margin, yPos);
        pdf.setFont("helvetica", "normal");
        const stringValue =
          value !== undefined && value !== null ? value.toString() : "N/A";
        const splitText = pdf.splitTextToSize(
          stringValue,
          pageWidth - margin - 50
        );
        pdf.text(splitText, margin + 45, yPos);
        yPos += splitText.length * 6;
      };

      const getBase64Image = (url) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = "Anonymous";
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL("image/jpeg");
            resolve(dataURL);
          };
          img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
          img.src = `${url}?nocache=${Date.now()}`;
        });
      };

      const addImages = async () => {
        if (orderData.imageUrls?.length > 0) {
          addSectionHeading("Render Images");
          const imgWidth = 50;
          const imgHeight = 50;
          const imgSpacing = 10;
          const maxImagesPerRow = Math.floor(
            (pageWidth - 2 * margin) / (imgWidth + imgSpacing)
          );
          let xPos = margin;
          let rowStartY = yPos;

          for (let i = 0; i < orderData.imageUrls.length; i++) {
            if (yPos + imgHeight > pageHeight - 30) {
              addFooter();
              pdf.addPage();
              addHeader();
              yPos = margin + 20;
              xPos = margin;
              rowStartY = yPos;
            }

            try {
              const imgData = await getBase64Image(orderData.imageUrls[i]);
              pdf.setDrawColor(...primaryColor);
              pdf.setLineWidth(0.2);
              pdf.rect(xPos - 2, yPos - 2, imgWidth + 4, imgHeight + 4);
              pdf.addImage(imgData, "JPEG", xPos, yPos, imgWidth, imgHeight);

              xPos += imgWidth + imgSpacing;
              if (
                (i + 1) % maxImagesPerRow === 0 ||
                i === orderData.imageUrls.length - 1
              ) {
                yPos += imgHeight + 15;
                xPos = margin;
                rowStartY = yPos;
              }
            } catch (error) {
              console.error(error.message);
              pdf.setFontSize(11);
              pdf.setTextColor(...textColor);
              pdf.text("Image unavailable", xPos, yPos + 5);
              xPos += imgWidth + imgSpacing;
              if (
                (i + 1) % maxImagesPerRow === 0 ||
                i === orderData.imageUrls.length - 1
              ) {
                yPos += imgHeight + 15;
                xPos = margin;
                rowStartY = yPos;
              }
            }
          }
        } else {
          addSectionHeading("Render Images");
          pdf.setFontSize(11);
          pdf.setTextColor(...textColor);
          pdf.text("No images available", margin, yPos);
          yPos += 10;
        }
      };

      addHeader();

      addSectionHeading("Order Information");
      const orderDetails = [
        { key: "Order No", value: order.orderNo },
        { key: "Render No", value: orderData.renderNo },
        { key: "CAD No", value: orderData.Cad?.cadNo },
        {
          key: "Sketch No",
          value: orderData.Sketch ? orderData.Sketch.sketchNo : "N/A",
        },
        {
          key: "Date",
          value: order.orderDate ? order.orderDate : "N/A",
        },
        { key: "Status", value: order.status },
        {
          key: "Promise Date",
          value: order.promiseDate ? order.promiseDate : "N/A",
        },
      ];
      orderDetails.forEach(({ key, value }) => addKeyValue(key, value));
      yPos += 5;

      addSectionHeading("Metal Type");
      const metalDetails = [
        { key: "Type", value: order.MetalType?.metal_type },
        { key: "Color", value: order.MetalColor?.metal_color_name },
        {
          key: "Diamond Range",
          value: order.diamondRange ? `${order.diamondRange} carat` : "N/A",
        },
        { key: "Expected Gross Weight", value: order.expectedGrossWt },
      ];
      metalDetails.forEach(({ key, value }) => addKeyValue(key, value));
      yPos += 10;

      addSectionHeading("Product Details");
      const productDetails = [
        { key: "Type", value: order.ProductType?.product_types },
        { key: "Gender", value: order.Gender?.gender },
        { key: "Style", value: order.Style?.style_name },
        { key: "Occasion", value: order.Occasion?.occasion },
      ];
      productDetails.forEach(({ key, value }) => addKeyValue(key, value));
      yPos += 5;

      addSectionHeading("Customer Details");
      const customerDetails = [
        { key: "Name", value: order.Customer?.customer_first_name },
        { key: "Address", value: order.Customer?.address },
      ];
      customerDetails.forEach(({ key, value }) => addKeyValue(key, value));
      yPos += 7;

      addSectionHeading("Assigned Employees");
      if (orderData.employee?.length > 0) {
        pdf.setFontSize(11);
        pdf.setTextColor(...textColor);
        orderData.employee.forEach((emp) => {
          if (yPos > pageHeight - 30) {
            addFooter();
            pdf.addPage();
            addHeader();
            yPos = margin + 20;
          }
          const empText = `${emp.name || "N/A"} - ${emp.roleName || "N/A"}`;
          pdf.text(empText, margin, yPos);
          yPos += 6;
        });
      } else {
        pdf.setFontSize(11);
        pdf.setTextColor(...textColor);
        pdf.text("No employees assigned", margin, yPos);
        yPos += 10;
      }

      await addImages();

      /* addSectionHeading("Design Description");
      pdf.setFontSize(11);
      pdf.setTextColor(...textColor);
      pdf.setFont("helvetica", "italic");
      const designDesc =
        "Twinkling Star Pendant: A minimalist 1.5 cm five-pointed star pendant in 18K pink gold, drawn as a single continuous line with rounded edges. Features a 0.1-carat bezel-set diamond at the center, polished for a shiny finish, perfect for a child’s party wear.";
      const splitText = pdf.splitTextToSize(designDesc, pageWidth - margin * 2);
      pdf.text(splitText, margin, yPos);
      yPos += splitText.length * 6 + 5; */

      addFooter();
      pdf.save(`Render_${order.id || "Order"}.pdf`);
    } catch (error) {
      console.error("Error in handlePrint:", error.message, error.stack);
      alert("Failed to generate PDF. Check console for details.");
    }
  };

  return (
    <main className="main-content">
      <br /> <br />
      <Content>
        <div className="main-panel">
          <div className="vieworder-container">
            <div className="vieworder-header">
              <button
                onClick={handlePrint}
               className="btn btn-link p-0 me-2"
                 title="Download PDF"
              >
                <FaPrint size={25} className="text-muted"  /> 
              </button>
              <h4 className="vieworder-heading">
                {order.categoryGroup?.category_group_name || "Order Details"}
              </h4>
            </div>

            <div className="vieworder-cards" id="printContent">
              <div className="vieworder-card image-card">
                <h3>Render Images</h3>
                {orderData.imageUrls?.length > 0 ? (
                  <div className="image-grid">
                    {orderData.imageUrls.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Render ${index + 1}`}
                        width="100"
                        height="100"
                      />
                    ))}
                  </div>
                ) : (
                  <p>No image Available</p>
                )}
              </div>

              <div className="vieworder-card">
                <h3>Order Details</h3>
                <p>
                  <strong>Order No:</strong> {order.orderNo || "N/A"}
                </p>
                <p>
                  <strong>Render No:</strong> {orderData?.renderNo || "N/A"}
                </p>
                <p>
                  <strong>CAD No:</strong> {orderData.Cad?.cadNo || "N/A"}
                </p>
                <p>
                  <strong>Sketch No:</strong>{" "}
                  {orderData.Sketch?.sketchNo || "N/A"}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {order.orderDate
                    ? new Date(order.orderDate).toLocaleDateString()
                    : "N/A"}
                </p>
                <p>
                  <strong>Status:</strong> {order.status || "N/A"}
                </p>
                <p>
                  <strong>Promise Date:</strong>{" "}
                  {order.promiseDate
                    ? new Date(order.promiseDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              <div className="vieworder-card">
                <h3>Metal Type</h3>
                <p>
                  <strong>Type:</strong> {order.MetalType?.metal_type || "N/A"}
                </p>
                <p>
                  <strong>Color:</strong>{" "}
                  {order.MetalColor?.metal_color_name || "N/A"}
                </p>
                <p>
                  <strong>Diamond Range:</strong> {order.diamondRange || "N/A"}
                </p>
                <p>
                  <strong>Expected Gross Weight:</strong>{" "}
                  {order.expectedGrossWt || "N/A"}
                </p>
              </div>

              <div className="vieworder-card">
                <h3>Product Details</h3>
                <p>
                  <strong>Type:</strong>{" "}
                  {order.ProductType?.product_types || "N/A"}
                </p>
                <p>
                  <strong>Gender:</strong> {order.Gender?.gender || "N/A"}
                </p>
                <p>
                  <strong>Style:</strong> {order.Style?.style_name || "N/A"}
                </p>
                <p>
                  <strong>Occasion:</strong> {order.Occasion?.occasion || "N/A"}
                </p>
              </div>

              <div className="vieworder-card">
                <h3>Customer Details</h3>
                <p>
                  <strong>Name:</strong>{" "}
                  {order.Customer?.customer_first_name || "N/A"}
                </p>
                <p>
                  <strong>Address:</strong> {order.Customer?.address || "N/A"}
                </p>
              </div>

              <div className="vieworder-card">
                <h3>Assigned Employees</h3>
                {orderData.employee?.length > 0 ? (
                  <ul>
                    {orderData.employee.map((emp) => (
                      <li key={emp.id}>
                        <strong>{emp.name || "N/A"}</strong> -{" "}
                        {emp.roleName || "N/A"}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No employees assigned</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Content>
      <Footer />
    </main>
  );
}

export default ViewRender;
