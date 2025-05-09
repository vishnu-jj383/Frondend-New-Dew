import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Footer from "../Footer";
import Header from "../Header";
import SideBar from "../SideBar";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";
import { FaArrowLeft } from "react-icons/fa"; // Import the back arrow icon
function EditSketchDesigner() {
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
  const [sketchId, setSketchid] = useState("");

  const API_URL = window.url + `tasks/getTaskById/${designerId}`;

  useEffect(() => {
    const savedToken = Cookies.get("authToken");

    if (!savedToken) {
      navigate("/");
      return;
    }

    const fetchCustomers = async () => {
      // try {
      // const requestData = { orderId: orderId ,type:"cad"};
      // const response = await axios.post(API_URL, requestData, {
      //     headers: {
      //         Authorization: `Bearer ${savedToken}`,
      //         "Content-Type": "application/json"
      //     }
      // });
      try {
        const response = await axios.get(API_URL, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        const customerData = response.data.data || {};

        setTaskId(customerData.taskId || "");
        setName(customerData.Employee.name || "");
        const briefDate = customerData.startDate
          ? new Date(customerData.startDate).toISOString().split("T")[0]
          : "";
        const completedDate = customerData.endDate
          ? new Date(customerData.endDate).toISOString().split("T")[0]
          : "";
        setStartDate(briefDate);
        setEndDate(completedDate);
        setImageUrls(customerData.imageUrls || "");
        setApprovedForCustomer(customerData.isApprovedCustomer || "");
        setApprovedForDew(customerData.isApprovedOwn || "");
        setSketchid(customerData.sketchId || "");
      } catch (err) {
        setError("Failed to fetch customer data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [navigate, designerId]); // Added customerId dependency

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the image field is empty
    if (imageUrls.length <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Image Required",
        text: "Please upload an image before submitting.",
      });
      return; // Stop submission
    }

    // Date validation
    const hasStartDate = startDate && startDate.trim() !== "";
    const hasEndDate = endDate && endDate.trim() !== "";

    // If either date is provided, both become required
    if ((hasStartDate || hasEndDate) && !(hasStartDate && hasEndDate)) {
      Swal.fire({
        icon: "warning",
        title: "Dates Required",
        text: "Both Start Date and End Date are required if one is provided.",
      });
      return;
    }

    // If both dates are provided, check if endDate is before startDate
    if (hasStartDate && hasEndDate && new Date(endDate) < new Date(startDate)) {
      Swal.fire({
        icon: "error",
        title: "Invalid Dates",
        text: "End Date cannot be before Start Date. Please correct the dates.",
      });
      return;
    }
    try {
      const savedToken = Cookies.get("authToken");

      if (!savedToken) {
        Swal.fire({
          icon: "error",
          title: "Authorization Error",
          text: "Authorization token not found.",
        });
        return;
      }
      // Dynamically build the payload, excluding null/undefined/empty startDate and endDate
      const payload = {
        isApprovedCustomer: Boolean(approvedForCustomer),
        isApprovedOwn: Boolean(approvedForDew),
      };

      if (hasStartDate) {
        payload.startDate = startDate;
      }
      if (hasEndDate) {
        payload.endDate = endDate;
      }
      // alert(payload.isApprovedCustomer)
      // alert(payload.isApprovedOwn)
      const response = await axios.put(
        window.url + `tasks/updateTask/${designerId}`,
        payload,
        // {
        //   payload,
        // },
        {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Updated Successfully",
        text: "The task has been updated successfully.",
      }).then(() => {
        navigate("/sketchApproval");
      });
    } catch (error) {
      if (error.response) {
        console.error("Error Response:", error.response.data);
        Swal.fire({
          icon: "error",
          title: "Update Failed",
          text:
            "Error updating customer: " + JSON.stringify(error.response.data),
        });
      } else {
        console.error("Error Message:", error.message);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "An error occurred while updating the customer.",
        });
      }
    }
  };
  const handleDeleteImage = async () => {
    const confirmDelete = await Swal.fire({
      title: "Are you sure?",
      text: "Do you really want to delete this image?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!confirmDelete.isConfirmed) {
      return; // Stop execution if the user cancels
    }

    try {
      const savedToken = Cookies.get("authToken");

      if (!savedToken) {
        alert("Authorization token not found.");
        return;
      }

      const dataToSend = {
        taskId: designerId,
        imageUrls: imageUrls, // Send the image URL to delete
      };

      const response = await axios.delete(window.url + "tasks/deleteImages", {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
        data: dataToSend, // For DELETE requests, data should be passed here
      });

      Swal.fire({
        icon: "success",
        title: "Image Deleted",
        text: "The image has been successfully deleted.",
      });

      setImageUrls(""); // Clear the image after successful deletion
      setImagePreview(null); // Clear the preview as well
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete image: " + error.message,
      });
    }
  };
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
        text: "Sketch image has been saved successfully.",
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

  const handleFormAndImageUpload = async (e) => {
    if (imageUrls && imageUrls instanceof File) {
      await handleImageUpload(e); // Call handleImageUpload if valid file is selected
    }

    // After form submission completes, handle the image upload
    // await CustomerApprove(e);
    // await DewApprove(e);
    await handleSubmit(e);
  };

  const handleBack = (customerId) => {
    navigate(`/sketch_designer/${customerId}`);
  };

  return (
    <div className="wrapper">
      {/* Sidebar */}
      <SideBar />

      {/* Main Panel */}
      <div className="main-panel">
        <Header />
        <div className="container">
          <button className="btn  mb-3" onClick={() => handleBack(sketchId)}>
            <FaArrowLeft className="me-2" size={25} />{" "}
            {/* Icon with margin-end */}
          </button>
          <div className="page-inner">
            <div className="page-header"></div>

            {/* Order Form */}
            <div className="card">
              <div className="card-header  text-white">
                <center>
                  <h5 style={{ color: "black" }}>Designer Edit</h5>
                </center>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Customer Selection */}
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="customerSelect">Task No</label>
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

                <div className="row">
                  {/* Date Input */}
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="dateInput">Start Date</label>

                      <input
                        type="date"
                        className="form-control"
                        value={startDate}
                        // onFocus={(e) => (e.target.type = "datetime-local")} // Change to date picker when focused
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="Select a date"
                        required
                      />
                    </div>
                  </div>

                  {/* Promised Date Input */}
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="promisedDateInput">End Date</label>

                      {/* <input
                        type="text"
                        className="form-control"
                        onFocus={(e) => (e.target.type = "datetime-local")} // Change to date picker when focused
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        placeholder="Select a date"
                        required
                      /> */}
                      <input
                        type="date"
                        className="form-control"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate} // Restrict to dates after start date
                        disabled={!startDate} // Disable until start date is selected
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Show image preview only if imageUrls has a valid value */}
                {imageUrls.length > 0 ? (
                  <div
                    style={{
                      position: "relative",
                      width: "200px",
                      marginTop: "10px",
                      border: "1px solid #ccc",
                      padding: "10px",
                      borderRadius: "8px",
                    }}
                  >
                    <img
                      src={imageUrls}
                      alt="Selected Preview"
                      width="100%"
                      height="auto"
                    />
                    {/* Close button for deleting image */}
                    <button
                      onClick={() => {
                        handleDeleteImage();
                      }}
                       title="Delete"
                      style={{
                        position: "absolute",
                        top: "-15px",
                        right: "-15px",
                        background: "transparent",
                        border: "none",
                        color: "red",
                        fontSize: "18px",
                        cursor: "pointer",
                      }}
                    >
                      X
                    </button>
                  </div>
                ) : null}

                {/* File Upload input, enabled only if no image exists */}
                <div className="form-group" style={{ marginTop: "10px" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="form-control"
                    disabled={imageUrls.length > 0} // Disable if image exists
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
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default EditSketchDesigner;
