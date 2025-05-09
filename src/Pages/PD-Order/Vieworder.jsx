import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom'; 
import axios from 'axios';
import Footer from '../../Components/Footer';
import Header from '../../Components/Header';
import Content from '../../Components/Content';
import Cookies from 'js-cookie';

import Swal from "sweetalert2";
import "./Vieworder.css"; 
import jsPDF from 'jspdf';
import { FaPrint } from 'react-icons/fa';
function Vieworder() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // const sideBarState = useSelector(state => state?.sidebar?.sideBar);
    const API_URL = window.url + `order/getOrderById`;

    useEffect(() => {
        const savedToken = Cookies.get("authToken");
        if (!savedToken) {
            navigate("/");
            return;
        }

        const fetchOrderData = async () => {
            setLoading(true);
            try {
                const response = await axios.post(API_URL, { orderId: id }, {
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

    if (loading) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;
    if (!orderData) return null;

     
    
    const handlePrint = async () => {
        console.log("handlePrint started");
        console.log(orderData);
        try {
            if (!orderData || typeof orderData !== "object") {
                throw new Error("Invalid order data");
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
                yPos = margin;
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
                pdf.setDrawColor(...primaryColor);
                yPos += 25;
            };
    
            const addFooter = () => {
                pdf.setLineWidth(0.2);
                pdf.setDrawColor(...lineColor);
                pdf.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
                pdf.setFontSize(8);
                pdf.setTextColor(150);
                pdf.setFont("helvetica", "normal");
                pdf.text(`Generated on: ${new Date().toLocaleString()}`, margin, pageHeight - 10);
                pdf.text(`Page ${pdf.internal.getNumberOfPages()}`, pageWidth - margin - 10, pageHeight - 10, { align: "right" });
            };
    
            const addSectionHeading = (title) => {
                if (yPos > pageHeight - 40) {
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
                const stringValue = value ?? "N/A";
                const splitText = pdf.splitTextToSize(stringValue, pageWidth - margin - 50);
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
                        resolve(canvas.toDataURL("image/jpeg"));
                    };
                    img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
                    img.src = `${url}?nocache=${Date.now()}`;
                });
            };
    
            const addImages = async () => {
                const imageUrls = Array.isArray(orderData.imageUrls) ? orderData.imageUrls : [];
                addSectionHeading("Order Images");
                
                if (imageUrls.length === 0) {
                    pdf.setFontSize(11);
                    pdf.setTextColor(...textColor);
                    pdf.text("No images available", margin, yPos);
                    yPos += 10;
                    return;
                }
    
                const imgWidth = 50;
                const imgHeight = 50;
                const imgSpacing = 10;
                const maxImagesPerRow = Math.floor((pageWidth - 2 * margin) / (imgWidth + imgSpacing));
                let xPos = margin;
    
                for (const url of imageUrls) {
                    if (yPos + imgHeight > pageHeight - 30) {
                        addFooter();
                        pdf.addPage();
                        addHeader();
                        yPos = margin + 20;
                        xPos = margin;
                    }
    
                    try {
                        const imgData = await getBase64Image(url);
                        pdf.setDrawColor(...primaryColor);
                        pdf.setLineWidth(0.2);
                        pdf.rect(xPos - 2, yPos - 2, imgWidth + 4, imgHeight + 4);
                        pdf.addImage(imgData, "JPEG", xPos, yPos, imgWidth, imgHeight);
                        
                        xPos += imgWidth + imgSpacing;
                        if (xPos + imgWidth > pageWidth - margin) {
                            yPos += imgHeight + 15;
                            xPos = margin;
                        }
                    } catch (error) {
                        console.error(error.message);
                        pdf.setFontSize(11);
                        pdf.setTextColor(...textColor);
                        pdf.text("Image unavailable", xPos, yPos + 5);
                        xPos += imgWidth + imgSpacing;
                        if (xPos + imgWidth > pageWidth - margin) {
                            yPos += imgHeight + 15;
                            xPos = margin;
                        }
                    }
                }
                yPos += imgHeight + 15;
            };
    
            addHeader();
    
            addSectionHeading("Order Information");
            const orderDetails = [
                { key: "Order No", value: orderData.orderNo },
                { key: "Date", value: orderData.orderDate },
                { key: "Status", value: orderData.status },
                { key: "Promise Date", value: orderData.promiseDate },
            ];
            orderDetails.forEach(({ key, value }) => addKeyValue(key, value));
            yPos += 5;
    
            addSectionHeading("Metal Type");
            const metalDetails = [
                { key: "Type", value: orderData["MetalType.metal_type"] },
                { key: "Color", value: orderData["MetalColor.metal_color_name"] },
                { key: "Diamond Range", value: orderData.diamondRange ? `${orderData.diamondRange} carat` : undefined },
                { key: "Expected Gross Weight", value: orderData.expectedGrossWt },
            ];
            metalDetails.forEach(({ key, value }) => addKeyValue(key, value));
            yPos += 10;
    
            addSectionHeading("Product Details");
            const productDetails = [
                { key: "Type", value: orderData["ProductType.product_types"] },
                { key: "Gender", value: orderData["Gender.gender"] },
                { key: "Style", value: orderData["Style.style_name"] },
                { key: "Occasion", value: orderData["Occasion.occasion"] },
            ];
            productDetails.forEach(({ key, value }) => addKeyValue(key, value));
            yPos += 5;
    
            addSectionHeading("Customer Details");
            const customerDetails = [
                { key: "Name", value: orderData["Customer.customer_first_name"] },
                { key: "Address", value: orderData["Customer.address"] },
            ];
            customerDetails.forEach(({ key, value }) => addKeyValue(key, value));
            yPos += 7;
    
            
            await addImages();
            addFooter();
            pdf.save(`Order_${orderData.orderNo || orderData.id || "Unknown"}.pdf`);
    
        } catch (error) {
            console.error("Error generating PDF:", error);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to generate PDF. Please try again.",
            });
        }
    };

    return (
        <main className="main-content">
   
        <Content>
            <div className="main-panel">
                {/* <Header /> */}
                <div className="vieworder-container">
                <h4 className="vieworder-heading">{orderData["categoryGroup.category_group_name"]}</h4>
                <button onClick={handlePrint} className="btn btn-primary print-btn">
                    <FaPrint /> Print PDF
                  </button>
                  <br></br>
                    <div className="vieworder-cards">
                        {/* Image Card */}
                        <div className="vieworder-card image-card">
                        {orderData.imageUrls ? (
                            <img src={orderData.imageUrls} alt="Selected Preview" width="100%" height="auto" />
                        ) : (
                            <div className="no-image-found">No Image Found</div>
                        )}
                        </div>
                        
                        {/* Order Details Card */}
                        <div className="vieworder-card">
                            <h3>Order Details</h3>
                            <p><strong>ID:</strong> {orderData.orderNo}</p>
                            <p><strong>Date:</strong> {orderData.orderDate}</p>
                            <p><strong>Status:</strong> {orderData.status}</p>
                            <p><strong>Promise Date:</strong> {orderData.promiseDate}</p>
                        </div>

                        {/* Metal Type Card */}
                        <div className="vieworder-card">
                            <h3>Metal Type</h3>
                            <p><strong>Type:</strong> {orderData["MetalType.metal_type"]}</p>
                            <p><strong>Color:</strong> {orderData["MetalColor.metal_color_name"]}</p>
                            <p><strong>Diamond Range:</strong> {orderData.diamondRange}</p>
                            <p><strong>Expected Gross Weight:</strong> {orderData.expectedGrossWt}</p>
                        </div>

                        {/* Product Type Card */}
                        <div className="vieworder-card">
                            <h3>Product Details</h3>
                            <p><strong>Type:</strong> {orderData["ProductType.product_types"]}</p>
                            <p><strong>Gender:</strong> {orderData["Gender.gender"]}</p>
                            <p><strong>Occasion:</strong> {orderData["Occasion.occasion"]}</p>
                            <p><strong>Style:</strong> {orderData["Style.style_name"]}</p>
                        </div>

                        {/* Customer Details Card */}
                        <div className="vieworder-card">
                            <h3>Customer Details</h3>
                            <p><strong>Name:</strong> {orderData["Customer.customer_first_name"]}</p>
                            <p><strong>Address:</strong> {orderData["Customer.address"]}</p>
                        </div>
                    </div>
                </div>
                
            </div>
         </Content>
    <Footer />
  </main>
    );
}

export default Vieworder;
