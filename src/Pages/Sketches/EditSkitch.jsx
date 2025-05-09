import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Footer from "../../Components/Footer";
// import Headersk from "./Headersk";
// import SideBar from "../SideBar";
import Cookies from "js-cookie";
// import { useSelector } from "react-redux";
import Content from "../../Components/Content";
import Swal from "sweetalert2";
function EditSkitch() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [sketchNo, setSketchNo] = useState("");
  const [orderId, setorderId] = useState("");
  const [sketchBriefDate, setSketchBriefDate] = useState("");
  const [sketchCompletedDate, setSketchCompletedDate] = useState("");
  const [promiseDate, setPromiseDate] = useState("");
  const [reqSketchCount, setReqSketchCount] = useState("");
  const [selectedSketchCount, setSelectedSketchCount] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  const [loading, setLoading] = useState(false);
  //   const sideBarState = useSelector((state) => state?.sidebar?.sideBar);

  // const steps = [
  //   { label: "Sketch", icon: <Person />, path: `/edit/${id}` },
  //   { label: "Special Instruction", icon: <Comment />, path: "/instruction" },
  //   { label: "Upload Images", icon: <Image />, path: "/editimg" },
  // ];

  const currentStep = `/edit/${id}`;

  const API_URL = window.url + `sketch/getSketch/${id}`;
  useEffect(() => {
    const savedToken = Cookies.get("authToken");

    if (!savedToken) {
      navigate("/"); // Redirect if no token
      return;
    }

    const fetchCustomers = async () => {
      setLoading(true); // Add this line
      try {
        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });
        const customerData = response.data.data || {};
        setSketchNo(customerData.sketchNo || "");
        setorderId(customerData.orderId || "");
        const briefDate = customerData.sketchBriefDate
          ? new Date(customerData.sketchBriefDate).toISOString().split("T")[0]
          : "";
        const completedDate = customerData.sketchCompletedDate
          ? new Date(customerData.sketchCompletedDate)
              .toISOString()
              .split("T")[0]
          : "";
        // setRenderBriefDate(briefDate);
        // setRenderCompletedDate(completedDate);
        setSketchBriefDate(briefDate);
        setSketchCompletedDate(completedDate);
        setPromiseDate(customerData.promiseDate || "");
        setReqSketchCount(customerData.reqSketchCount || "");
        setSelectedSketchCount(customerData.selectedSketchCount || "");
        setSpecialInstructions(customerData.specialInstructions || "");
      } catch (err) {
        setError("Failed to fetch customer data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [id, navigate]);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      console.log("Edited Data:", {
        sketchBriefDate,
        sketchCompletedDate,
        promiseDate,
        reqSketchCount,
        selectedSketchCount,
        specialInstructions,
      });
      setLoading(false);
      navigate("/skitch-list");
    }, 1500);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const savedToken = Cookies.get("authToken");

      const result = await Swal.fire({
        title: "Do you want to save changes?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, save it!",
        cancelButtonText: "No, cancel",
      });

      if (!result.isConfirmed) {
        // If the user cancels, do nothing
        return;
      }

      if (!savedToken) {
        Swal.fire({
          icon: "error",
          title: "Unauthorized",
          text: "Authorization token not found.",
        });
        return;
      }

      const response = await axios.put(
        window.url + `sketch/editSketch/${id}`, // Use PUT for updating
        {
          sketchBriefDate: sketchBriefDate,
          sketchCompletedDate: sketchCompletedDate,
          // promiseDate: promiseDate,
          reqSketchCount: parseInt(reqSketchCount),
          selectedSketchCount: parseInt(selectedSketchCount),
          specialInstructions: specialInstructions,
        },
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "Sketch updated successfully.",
      }).then(() => {
        navigate("/sketchList");
      });
    } catch (error) {
      let errorMessage = "Error updating customer.";
      if (error.response) {
        console.error("Error Response:", error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      } else {
        console.error("Error Message:", error.message);
      }

      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: errorMessage,
      });
    }
  };

  return (
    <main className="main-content">
      <br /> <br />
      <Content>
        <div className="">
          <div className="page-inner">
            <div className="page-header">{/* <h5>Edit Render</h5> */}</div>
            <div className="card">
              {/* Card Header */}
              <div className="card-header">
                <center>
                  <h6>Edit Sketch </h6>
                </center>
              </div>

              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    {/* Order ID */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Sketch Number</label>
                        <input
                          type="text"
                          className="form-control"
                          value={sketchNo}
                          onChange={(e) => setSketchNo(e.target.value)}
                          disabled
                        />
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Concept ID</label>
                        <input
                          type="text"
                          className="form-control"
                          value={orderId}
                          onChange={(e) => setorderId(e.target.value)}
                          disabled
                        />
                      </div>
                    </div>

                    {/* Render Brief Date */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Sketch Brief Date</label>
                        {/* <input
                                                type="date"
                                                className="form-control"
                                                value={sketchBriefDate}
                                                onChange={(e) => setSketchBriefDate(e.target.value)}
                                                required
                                            /> */}
                        <input
                          type="text"
                          className="form-control"
                          value={sketchBriefDate}
                          onFocus={(e) => (e.target.type = "date")} // Change to date picker when focused
                          onChange={(e) => setSketchBriefDate(e.target.value)}
                          placeholder="Select a date"
                          required
                        />
                      </div>
                    </div>
                    {/* Render Brief Date */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label htmlFor="customerCodeInput">
                          Sketch Completed Date
                        </label>
                        {/* <input
                                                
                                                  type="datetime-local" 
                                                  className="form-control"
                                                  id="customerCodeInput"
                                                  value={sketchCompletedDate} 
                                                  onChange={(e) => setSketchCompletedDate(e.target.value)}
                                                  placeholder="Enter Sketch Completed Date"
                                                /> */}
                        {/* <input
                                                    type="text"
                                                    className="form-control"
                                                    value={sketchCompletedDate} 
                                                    onFocus={(e) => (e.target.type = "date")} // Change to date picker when focused
                                                    onChange={(e) => setSketchCompletedDate(e.target.value)}
                                                    placeholder="Select a date"
                                                    required
                                                /> */}

                        <input
                          type="date"
                          className="form-control"
                          value={sketchCompletedDate}
                          onChange={(e) =>
                            setSketchCompletedDate(e.target.value)
                          }
                          min={sketchBriefDate} // Restrict to dates after start date
                          disabled={!sketchBriefDate} // Disable until start date is selected
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    {/* Render Completed Date */}
                    {/* <div className="col-md-3">
                                        <div className="form-group">
                                        <label htmlFor="dateInput">Promise Date</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={promiseDate}
                                            onFocus={(e) => (e.target.type = "date")} // Change to date picker when focused
                                            onChange={(e) => setPromiseDate(e.target.value)}
                                            placeholder="Select a date"
                                            required
                                                />
                                        

                                        </div>
                                    </div> */}

                    {/* Requested Render Count */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label htmlFor="promisedDateInput">
                          Requested Sketch Count
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="promisedDateInput"
                          value={reqSketchCount}
                          min={0}
                          onChange={(e) => setReqSketchCount(e.target.value)}
                          placeholder="Enter Requested Sketch Count"
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label htmlFor="dateInput">Selected Sketch Count</label>
                        <input
                          type="number"
                          className="form-control"
                          id="dateInput"
                          value={selectedSketchCount}
                          min={0}
                          onChange={(e) =>
                            setSelectedSketchCount(e.target.value)
                          }
                          placeholder="Enter Selected Sketch Count"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div className="form-group">
                    <label>Special Instructions</label>
                    <textarea
                      className="form-control"
                      rows="5"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                    />
                  </div>

                  {/* Buttons */}
                  <br></br>
                  <center>
                    <button
                      type="submit"
                      className="btn"
                      style={{ backgroundColor: "#2E1A47", color: "white" }}
                    >
                      Submit
                    </button>
                    &nbsp;&nbsp;&nbsp;
                  </center>
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
export default EditSkitch;
