import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
import Footer from "../../Components/Footer";
import Content from "../../Components/Content";
import "./ViewCustomerDetails.css";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";

const ViewCustomerDetails = () => {
  const { customerId } = useParams();
  // const sideBarState = useSelector((state) => state?.sidebar?.sideBar);
  const API_URL = window.url + `customer/${customerId}`;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Start with true since we're fetching data
  const [error, setError] = useState(null);
  const [customerData, setCustomerData] = useState(null);

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
        setCustomerData(response.data.data || {});
        setError(null);
      } catch (err) {
        setError("Failed to fetch customer data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderData();
  }, [customerId, navigate]);

  if (loading) {
    return (
      <main className="main-content">
        <Content>
          <div className="">
            <div className="page-inner">
              <div className="page-header">
                <h3 className="fw-bold mb-3">Customer Details</h3>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <div className="card">
                    <div className="card-body">
                      <p style={{ textAlign: "center" }}>
                        Loading customer details...
                      </p>
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

  if (error) {
    return (
      <main className="main-content">
        <Content>
          <div className="">
            <div className="page-inner">
              <div className="page-header">
                <h3 className="fw-bold mb-3">Customer Details</h3>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <div className="card">
                    <div className="card-body">
                      <p style={{ textAlign: "center", color: "red" }}>
                        {error}
                      </p>
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

  return (
    <main className="main-content">
      <Content>
        <div className="">
          <div className="page-inner">
            <div className="page-header">
              <h3 className="fw-bold mb-3">Customer Details</h3>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="card row with-border">
                  <div className="card-body">
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="label">Customer Name:</span>
                        <span className="value">
                          {customerData?.customer_first_name || "N/A"}{" "}
                          {customerData?.customer_last_name || ""}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Email:</span>
                        <span className="value">
                          {customerData?.customer_email || "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Status:</span>
                        <span
                          className={`value status ${
                            customerData?.customer_status || ""
                          }`}
                        >
                          {customerData?.customer_status || "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Username:</span>
                        <span className="value">
                          {customerData?.customer_username || "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Phone:</span>
                        <span className="value">
                          {customerData?.phone_number || "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Birth Date:</span>
                        <span className="value">
                          {customerData?.birth_date
                            ? customerData.birth_date
                            : "Not specified"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Address:</span>
                        <span className="value">
                          {customerData?.address || "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Pincode:</span>
                        <span className="value">
                          {customerData?.pincode || "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Customer Type:</span>
                        <span className="value">
                          {customerData?.customer_type || "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Fax:</span>
                        <span className="value">
                          {customerData?.customer_fax || "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Customer Code:</span>
                        <span className="value">
                          {customerData?.customercode || "No Code"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Country:</span>
                        <span className="value">
                          {customerData?.customer_country || "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Country Subsidiary:</span>
                        <span className="value">
                          {customerData?.country_subsidiary || "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Created On:</span>
                        <span className="value">
                          {customerData?.created_date
                            ? customerData.created_date
                            : "N/A"}
                        </span>
                      </div>
                    </div>
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
};

export default ViewCustomerDetails;
