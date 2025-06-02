import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Footer from "../../Components/Footer";
import Content from "../../Components/Content";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

import { FaArrowRight, FaPlus, FaEye } from "react-icons/fa"; // Import icons from Font Awesome
function EditCad() {

  const { customerId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [cadNo, setCadNo] = useState("");
  const [orderId, setOrderId] = useState("");
  const [reqCadCount, setReqCadCount] = useState("");
  const [selectedCadCount, setSelectedCadCount] = useState("");
  const [cadCompletedDate, setCadCompletedDate] = useState("");
  const [promiseDate, setPromiseDate] = useState("");
  const [specialInstruction, setSpecialInstruction] = useState("");
  // const [specialInstruction, setSpecialInstruction] = useState("");

  const API_URL = window.url + `cad/getCadById/${customerId}`;

  useEffect(() => {
    const savedToken = Cookies.get("authToken");

    if (!savedToken) {
      navigate("/");
      return;
    }

    const fetchCustomers = async () => {
      try {
        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        const customerData = response.data.data || {};

        setCadNo(customerData.cadNo || "");
        setOrderId(customerData.orderId || "");
        setReqCadCount(customerData.reqCadCount || "");
        // Format date for input (YYYY-MM-DD)
        const formatDateForInput = (dateString) => {
          if (!dateString) return "";
          const date = new Date(dateString);
          return isNaN(date) ? "" : date.toISOString().split("T")[0];
        };
        setCadCompletedDate(formatDateForInput(customerData.cadCompletedDate));
        setPromiseDate(formatDateForInput(customerData.promiseDate));
        // const briefDate = customerData.promiseDate
        //   ? new Date(customerData.promiseDate).toISOString().split("T")[0]
        //   : "";
        // const completedDate = customerData.cadCompletedDate
        //   ? new Date(customerData.cadCompletedDate).toISOString().split("T")[0]
        //   : "";
        // setRenderBriefDate(briefDate);
        // setRenderCompletedDate(completedDate);
        // Format dates for the input[type="date"] (needs YYYY-MM-DD format)

        setSelectedCadCount(customerData.selectedCadCount || "");
        // setCadCompletedDate(completedDate);
        // setPromiseDate(briefDate);
        setSpecialInstruction(customerData.specialInstruction || "");
        // alert(customerData.promiseDate)
      } catch (err) {
        setError("Failed to fetch customer data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [navigate, customerId]); // Added customerId dependency

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Swal alert to confirm saving changes
    const result = await Swal.fire({
      title: "Do you want to save changes?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Save It!",
      cancelButtonText: "No, Cancel",
    });

    if (!result.isConfirmed) {
      // If the user cancels, do nothing
      return;
    }

    try {
      const savedToken = Cookies.get("authToken");

      if (!savedToken) {
        alert("Authorization token not found.");
        return;
      }

      const response = await axios.put(
        window.url + `cad/updateCad/${customerId}`,
        {
          reqCadCount: parseInt(reqCadCount),
          selectedCadCount: parseInt(selectedCadCount),
          cadCompletedDate,
          promiseDate,
          specialInstruction,
        },
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // alert("Cad Updated: " + JSON.stringify(response.data));

      // Reload the page after successful submission
      // window.location.reload();
      Swal.fire({
        icon: "success",
        title: "CAD Updated",
        text: "The CAD details have been successfully updated.",
      }).then(() => {
        navigate("/cadlist");
      });
    } catch (error) {
      if (error.response) {
        console.error("Error Response:", error.response.data);
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: "There was an error updating the CAD. Please try again.",
        });
        // alert(
        //   "Error updating customer: " + JSON.stringify(error.response.data)
        // );
      } else { 
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text: "There was an error updating the CAD. Please try again.",
        });
        // console.error("Error Message:", error.message);
        // alert("Error updating customer.");
      }
    }
  };
  const handleMaterialtab = (customerId) => {
    // Implement your edit logic here
    navigate(`/cad_edit/${customerId}`);
  };

  const handleClose = (customerId) => {
    // Implement your edit logic here
    navigate("/cadlist");
  };

  const handleAddMetal = (customerId) => {
    navigate(`/cad_metal/${customerId}`);
  };

  const handleViewMetal = (customerId) => {
    navigate(`/get_metal/${customerId}`);
  };

  return (
    <main className="main-content">
      {/* <br /> <br /> */}
      <Content>
        <div className="">
          <div className="page-inner">
            <div className="page-header">
              {/* <ul className="breadcrumbs mb-3">
                <li className="nav-item"> */}
                <div className="row">
                  <div className="col-3">
                    <button
                    onClick={() => handleAddMetal(customerId)}
                    className="btn btn-dark"
                  >
                    Add Metal & Material
                  </button> 
                  </div>
                   <div className="col-3">
                    <button
                    onClick={() => handleViewMetal(customerId)}
                    className="btn btn-info"
                  >
                    View Metal
                  </button>
                   </div>
                   <div className="col-3"></div>

                </div>
                <br/>
                 
                {/* </li>{" "} */}
                {/* <li className="nav-item"> */}
                  
                {/* </li>
              </ul> */}
            </div>

            <div className="card">
              <div className="card-header text-white">
                <center>
                  <h5 style={{ color: "black" }}>Cad Edit</h5>
                </center>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="customerSelect">Cad Number</label>
                        <input
                          disabled
                          type="text"
                          className="form-control"
                          id="emailInput"
                          value={cadNo}
                          onChange={(e) => setCadNo(e.target.value)}
                          placeholder="Enter Cad Number"
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="emailInput">Concept ID</label>
                        <input
                          disabled
                          type="text"
                          className="form-control"
                          id="emailInput"
                          value={orderId}
                          onChange={(e) => setOrderId(e.target.value)}
                          placeholder="Enter OrderId"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="mobileInput">Required Cad Count</label>
                        <input
                          type="number"
                          className="form-control"
                          id="mobileInput"
                          value={reqCadCount}
                          min={0}
                          onChange={(e) => setReqCadCount(e.target.value)}
                          placeholder="Enter Required Cad Count"
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="customerCodeInput">
                          Selected Cad Count
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="customerCodeInput"
                          value={selectedCadCount}
                          min={0}
                          onChange={(e) => setSelectedCadCount(e.target.value)}
                          placeholder="Enter Selected Cad Count"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="dateInput">Start Date</label>
                        <input
                          type="date"
                          className="form-control"
                          id="dateInput"
                          value={promiseDate}
                          onChange={(e) => setPromiseDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="form-group">
                        <label htmlFor="promisedDateInput">
                          Cad Completed Date
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="promisedDateInput"
                          value={cadCompletedDate}
                          onChange={(e) => setCadCompletedDate(e.target.value)}
                          min={promiseDate}
                          disabled={!promiseDate}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="comment">Special Instructions</label>
                    <textarea
                      className="form-control"
                      value={specialInstruction}
                      // id="comment"
                      rows="5"
                      onChange={(e) => setSpecialInstruction(e.target.value)}
                    />
                  </div>

                  <br />
                  <div className="card-action">
                    <center>
                      <button
                        type="submit"
                        className="btn"
                        style={{ backgroundColor: "#2E1A47", color: "white" }}
                      >
                        Submit
                      </button>{" "}
                    </center>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        </Content>
      <Footer />
    </main>
  );
}

export default EditCad;
