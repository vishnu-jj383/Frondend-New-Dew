import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Footer from "../../Components/Footer";
import Content from "../../Components/Content";

import Cookies from "js-cookie";
import Swal from "sweetalert2";

function Imageupload() {
  const { designerId } = useParams();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [taskId, setTaskId] = useState("");
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [approvedForDew, setApprovedForDew] = useState(false);
  const [approvedForCustomer, setApprovedForCustomer] = useState(false);
  // const [specialInstruction, setSpecialInstruction] = useState("");

  const API_URL = window.url + `tasks/getTaskById/${designerId}`;

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

        setTaskId(customerData.taskId || "");
        setName(customerData.Employee.name || "");
        setStartDate(customerData.startDate || "");
        setEndDate(customerData.endDate || "");
        setImageUrls(customerData.imageUrls || "");
        // setApprovedForCustomer(customerData.isApprovedCustomer || "")
        // setApprovedForDew(customerData.isApprovedOwn || "")
      } catch (err) {
        setError("Failed to fetch customer data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [navigate, designerId]); // Added customerId dependency

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImageUrls(file);

    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(null);
    }
  };
  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageUpload = async (e) => {
    e.preventDefault();

    const savedToken = Cookies.get("authToken");

    // Create the data object with the necessary fields (e.g., id)
    const formData = new FormData();
    // alert(parseInt(tasksavedId))
    formData.append("images", imageUrls);
    formData.append("taskId", designerId);

    try {
      // Show a loading alert or initial message
      Swal.fire({
        icon: "info",
        title: "Processing Image...",
        text: "Your image is being uploaded, please wait.",
        showConfirmButton: false,
        allowOutsideClick: false, // Prevent closing the modal until action is complete
      });

      const response = await axios.post(
        window.url + "tasks/uploadImage",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Correct header for file upload
            Authorization: `Bearer ${savedToken}`,
          },
        }
      );

      // Close the info alert once the process is complete
      Swal.close();

      // Show success alert
      Swal.fire({
        icon: "success",
        title: "Image Saved",
        text: "Sketch Image Has Been Saved Successfully.",
      });

      // Navigate to the desired page after successful image upload
      navigate("/sketchApproval");
      //  navigate(`/render_designer_edit/${designerId}`);
    } catch (error) {
      // Close the info alert if there is an error
      Swal.close();

      console.error(
        "Error uploading image:",
        error.response ? error.response.data : error.message
      );

      // Show error alert
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          "Error: " +
          (error.response
            ? JSON.stringify(error.response.data)
            : error.message),
      });
    }
  };
  const CustomerApprove = async (e) => {
    e.preventDefault();

    const savedToken = Cookies.get("authToken");

    // Ensure token exists before making the request
    if (!savedToken) {
      Swal.fire({
        icon: "error",
        title: "Authentication Failed",
        text: "Authentication token not found. Please log in.",
      });
      return;
    }

    // Create the data object with properly formatted fields
    const dataToSend = {
      taskId: designerId,
      isApproved: Boolean(approvedForCustomer),
    };

    console.log("Sending data:", dataToSend); // Debugging log

    try {
      const response = await axios.post(
        window.url + "tasks/customerApprove",
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Show success alert
      // Swal.fire({
      //   icon: "success",
      //   title: "Design Approved",
      //   text: "The design has been successfully approved for the customer.",
      // });

      // Redirect after saving
      navigate("/sketchApproval");
      //   navigate(`/render_designer_edit/${designerId}`);
    } catch (error) {
      console.error(
        "Error approving design:",
        error.response ? error.response.data : error.message
      );

      // Show error alert
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          "Error: " +
          (error.response
            ? JSON.stringify(error.response.data)
            : error.message),
      });
    }
  };
  const DewApprove = async (e) => {
    e.preventDefault();

    const savedToken = Cookies.get("authToken");

    // Ensure token exists before making the request
    if (!savedToken) {
      Swal.fire({
        icon: "error",
        title: "Authentication Failed",
        text: "Authentication token not found. Please log in.",
      });
      return;
    }

    // Create the data object with properly formatted fields
    const dataToSend = {
      taskId: designerId,
      isApproved: Boolean(approvedForDew),
    };

    console.log("Sending data:", dataToSend); // Debugging log

    try {
      const response = await axios.post(
        window.url + "tasks/ownApprove",
        dataToSend,
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Show success alert
      // Swal.fire({
      //   icon: "success",
      //   title: "Design Approved",
      //   text: "The design has been successfully approved for dew.",
      // });

      // Redirect after saving
      //   navigate(`/render_designer_edit/${designerId}`);
      navigate("/sketchApproval");
    } catch (error) {
      console.error(
        "Error approving design:",
        error.response ? error.response.data : error.message
      );

      // Show error alert
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          "Error: " +
          (error.response
            ? JSON.stringify(error.response.data)
            : error.message),
      });
    }
  };

  const handleFormAndImageUpload = async (e) => {
    // First, handle the form submission
    await handleImageUpload(e);

    // After form submission completes, handle the image upload

    await CustomerApprove(e);
    await DewApprove(e);
  };

  return (
    <main className="main-content">
      <Content>
        <div className="">
          <div className="page-inner">
            <div className="page-header">
              {/* <h3 className="fw-bold mb-3">CAD Edit</h3> */}
              <ul className="breadcrumbs mb-3">
                <li className="separator">
                  <i className="icon-arrow-right"></i>
                </li>
                <li className="nav-item">
                  <a href={`/sketchList`}>Sketch List</a>
                </li>
                <li className="separator">
                  <i className="icon-arrow-right"></i>
                </li>
                <li className="nav-item">
                  {/* <a href="/cad_metal">Metal & Material</a> */}
                  <a href={`/sketchApproval`}>Sketch Approval List</a>
                </li>
              </ul>
            </div>

            {/* Order Form */}
            <div className="card">
              <div className="card-header  text-white">
                <center>
                  <h5 style={{ color: "black" }}>Designer Image Upload</h5>
                </center>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Customer Selection */}
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="customerSelect">Task Id</label>
                      <input
                        disabled
                        type="text"
                        className="form-control"
                        id="emailInput"
                        value={taskId}
                        onChange={(e) => setTaskId(e.target.value)}
                        placeholder="Enter taskId"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="emailInput">Name</label>
                      <input
                        disabled
                        type="text"
                        className="form-control"
                        id="emailInput"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter OrderId"
                      />
                    </div>
                  </div>
                </div>
                <br />
                <div className="form-group">
                  <input
                    type="file"
                    accept="image/*" // Limit file types to images
                    onChange={handleFileChange} // Handle the file change event
                  />
                </div>
                {imagePreview && (
                  <div className="form-group">
                    <label>Image Preview:</label>
                    <div style={{ marginTop: "10px" }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          maxWidth: "200px",
                          maxHeight: "200px",
                          objectFit: "contain",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  </div>
                )}
                {/* Action Buttons */}
                <br></br>
                <div className="row">
                  <div className="col-md-6">
                    <input
                      type="checkbox"
                      checked={approvedForDew}
                      onChange={(e) => setApprovedForDew(e.target.checked)}
                      className="custom-checkbox"
                    />
                    &nbsp;&nbsp;&nbsp;
                    <label>Select for Dew</label>
                  </div>
                  <div className="col-md-6">
                    <input
                      type="checkbox"
                      checked={approvedForCustomer}
                      onChange={(e) => setApprovedForCustomer(e.target.checked)}
                      className="custom-checkbox"
                    />
                    &nbsp;&nbsp;&nbsp;
                    <label>Select for Customer</label>
                  </div>
                </div>
              </div>
              <div className="card-action">
                <center>
                  <button
                    className="btn"
                    style={{ backgroundColor: "#2E1A47", color: "white" }}
                    onClick={handleFormAndImageUpload}
                  >
                    Submit
                  </button>{" "}
                  &nbsp;&nbsp;&nbsp;
                </center>
                <br/>
              </div>
            </div>
          </div>
        </div>
      </Content>
      <Footer />
    </main>
  );
}

export default Imageupload;
