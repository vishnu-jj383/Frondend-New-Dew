import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Footer from "../../../Components/Footer";
import Content from "../../../Components/Content";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { FaArrowLeft } from "react-icons/fa"; // Import the back arrow icon
// Utility function to format date to YYYY-MM-DD in local timezone
const formatDateToLocal = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function EditDesigner() {
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
  const [cadId, setCadid] = useState("");

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
          // Normalize dates to local timezone
        setStartDate(formatDateToLocal(customerData.startDate));
        setEndDate(formatDateToLocal(customerData.endDate));
        setImageUrls(customerData.imageUrls || "");
        setApprovedForCustomer(customerData.isApprovedCustomer || "");
        setApprovedForDew(customerData.isApprovedOwn || "");
        setCadid(customerData.cadId || "");
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

    // Date validation
        const hasStartDate = startDate && startDate.trim() !== "";
        const hasEndDate = endDate && endDate.trim() !== "";
    
        if ((hasStartDate || hasEndDate) && !(hasStartDate && hasEndDate)) {
          Swal.fire({
            icon: "warning",
            title: "Dates Required",
            text: "Both Start Date and End Date are required if one is provided.",
          });
          return;
        }
    
        if (hasStartDate && hasEndDate && new Date(endDate) < new Date(startDate)) {
          Swal.fire({
            icon: "error",
            title: "Invalid Dates",
            text: "End Date cannot be before Start Date. Please correct the dates.",
          });
          return;
        }

    // Check if the image field is empty
    if (imageUrls.length <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Image Required",
        text: "Please upload an image before submitting.",
      });
      return; // Stop submission
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

      const response = await axios.put(
        window.url + `tasks/updateTask/${designerId}`,
        payload,
        // {
        //   startDate,
        //   endDate,
        //   isApprovedCustomer: Boolean(approvedForCustomer),
        //   isApprovedOwn: Boolean(approvedForDew),
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
        // navigate("/cad_approval_list");
         navigate(`/cad_designer/${cadId}`);
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
        text: "Render image has been saved successfully.",
      });

      // Navigate to the desired page after successful image upload
      // navigate("/cad_approval_list");
       navigate(`/cad_designer/${cadId}`);
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
    navigate(`/cad_designer/${customerId}`);
  };

  return (
   <main className="main-content">
      
      <Content>
        <div className="">
          <button className="btn  mb-3" onClick={() => handleBack(cadId)}>
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
                      <label htmlFor="customerSelect">TaskId</label>
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
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="startDateInput">Start Date</label>
                      <input
                        type="date"
                        className="form-control"
                        id="startDateInput"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        placeholder="Select a date"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="endDateInput">End Date</label>
                      <input
                        type="date"
                        className="form-control"
                        id="endDateInput"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate}
                        disabled={!startDate}
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
                        top: "-5px",
                        right: "5px",
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

export default EditDesigner;
