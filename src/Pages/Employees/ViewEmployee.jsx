import React, { useEffect, useState } from "react";
// import { useSelector } from "react-redux";
import Footer from "../../Components/Footer";
import Content from "../../Components/Content";
import "../Customers/ViewCustomerDetails.css";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import axios from "axios";

function ViewEmployee() {
  const { empId } = useParams();
  // const sideBarState = useSelector((state) => state?.sidebar?.sideBar);
  const employeAPI_URL = window.url + `auth/getUserById/${empId}`;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    const fetchEmployeeData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(employeAPI_URL, {
          headers: { Authorization: `Bearer ${savedToken}` },
        });
        setEmployeeData(response.data.data || {});
        setError(null);
      } catch (err) {
        setError("Failed to fetch employee data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployeeData();
  }, [empId, navigate]);

  if (loading) {
    return (
      <main className="main-content">
        <Content>
          <div className="">
            <div className="page-inner">
              <div className="page-header">
                <h3 className="fw-bold mb-3">Employee Details</h3>
              </div>
              <div className="row">
                <div className="col-md-12">
                  <div className="card">
                    <div className="card-body">
                      <p style={{ textAlign: "center" }}>
                        Loading employee details...
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
                <h3 className="fw-bold mb-3">Employee Details</h3>
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
              <h3 className="fw-bold mb-3">Employee Details</h3>
            </div>
            <div className="row">
              <div className="col-md-12">
                <div className="card row with-border">
                  <div className="card-body">
                    <div className="details-grid">
                      <div className="detail-item">
                        <span className="label">Employee Name:</span>
                        <span className="value">
                          {employeeData?.name || "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Email:</span>
                        <span className="value">
                          {employeeData?.email || "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Employee ID:</span>
                        <span className="value">
                          {employeeData?.emp_id || "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Mobile Number:</span>
                        <span className="value">
                          {employeeData?.emp_mobile_no || "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Designation:</span>
                        <span className="value">
                          {employeeData?.designation || "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Department:</span>
                        <span className="value">
                          {employeeData?.department || "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Role:</span>
                        <span className="value">
                          {employeeData?.Role?.roleName || "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Supervisor:</span>
                        <span className="value">
                          {employeeData?.supervisor_name || "N/A"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Date of Joining:</span>
                        <span className="value">
                          {employeeData?.date_of_joining || "Not specified"}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Subsidiary:</span>
                        <span className="value">
                          {employeeData?.emp_subsidiary || "N/A"}
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
}

export default ViewEmployee;
