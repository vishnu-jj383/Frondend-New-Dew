import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Footer from "../../../Components/Footer";
import Content from "../../../Components/Content";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import { FaArrowLeft } from "react-icons/fa";

// Utility function to format date to YYYY-MM-DD in local timezone
const formatDateToLocal = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function EditSketchDesigner() {
  const { designerId } = useParams();
   const { orderId } = useParams();
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
  const [sketchId, setSketchid] = useState("");

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
        setName(customerData.Employee?.name || "");
        // Normalize dates to local timezone
        setStartDate(formatDateToLocal(customerData.startDate));
        setEndDate(formatDateToLocal(customerData.endDate));
        setImageUrls(customerData.imageUrls || "");
        setApprovedForCustomer(customerData.isApprovedCustomer || false);
        setApprovedForDew(customerData.isApprovedOwn || false);
        setSketchid(customerData.sketchId || "");
      } catch (err) {
        setError("Failed to fetch customer data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [navigate, designerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if the image field is empty
    if (imageUrls.length <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Image Required",
        text: "Please upload an image before submitting.",
      });
      return;
    }

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

      const payload = {
        isApprovedCustomer: Boolean(approvedForCustomer),
        isApprovedOwn: Boolean(approvedForDew),
      };

      if (hasStartDate) {
        payload.startDate = startDate; // Send YYYY-MM-DD as is
      }
      if (hasEndDate) {
        payload.endDate = endDate; // Send YYYY-MM-DD as is
      }

      const response = await axios.put(
        window.url + `tasks/updateTask/${designerId}`,
        payload,
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
        // navigate("/sketch_approvalLists");
         navigate(`/sketch_designer/${orderId}`);
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: error.response
          ? JSON.stringify(error.response.data)
          : "An error occurred while updating the customer.",
      });
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

      const dataToSend = {
        taskId: designerId,
        imageUrls: imageUrls,
      };

      const response = await axios.delete(window.url + "tasks/deleteImages", {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
        data: dataToSend,
      });

      Swal.fire({
        icon: "success",
        title: "Image Deleted",
        text: "The image has been successfully deleted.",
      });

      setImageUrls("");
      setImagePreview(null);
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

    const formData = new FormData();
    formData.append("images", imageUrls);
    formData.append("taskId", designerId);

    try {
      Swal.fire({
        icon: "info",
        title: "Processing Image...",
        text: "Your image is being uploaded, please wait.",
        showConfirmButton: false,
        allowOutsideClick: false,
      });

      const response = await axios.post(window.url + "tasks/uploadImage", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${savedToken}`,
        },
      });

      Swal.close();

      Swal.fire({
        icon: "success",
        title: "Image Saved",
        text: "Sketch image has been saved successfully.",
      });

      navigate(`/sketch_designer/${orderId}`);
    } catch (error) {
      Swal.close();

      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response
          ? JSON.stringify(error.response.data)
          : error.message,
      });
    }
  };

  const handleFormAndImageUpload = async (e) => {
    e.preventDefault();
    if (imageUrls && imageUrls instanceof File) {
      await handleImageUpload(e);
    }
    await handleSubmit(e);
  };

  const handleBack = () => {
    navigate(`/sketch_designer/${orderId}`);
  };

  return (
    <main className="main-content">
      <Content>
        <div className="">
          <button className="btn mb-3" onClick={handleBack}>
            <FaArrowLeft className="me-2" size={25} />
          </button>
          <div className="page-inner">
            <div className="page-header"></div>
            <div className="card">
              <div className="card-header text-white">
                <center>
                  <h5 style={{ color: "black" }}>Designer Edit</h5>
                </center>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="taskIdInput">Task No</label>
                      <input
                        disabled
                        type="text"
                        className="form-control"
                        id="taskIdInput"
                        value={taskId}
                        onChange={(e) => setTaskId(e.target.value)}
                        placeholder="Enter taskId"
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="nameInput">Name</label>
                      <input
                        disabled
                        type="text"
                        className="form-control"
                        id="nameInput"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter Name"
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
                {imageUrls.length > 0 && (
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
                    <button
                      onClick={handleDeleteImage}
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
                )}
                <div className="form-group" style={{ marginTop: "10px" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="form-control"
                    disabled={imageUrls.length > 0}
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
                <br />
                <div className="row">
                  <div className="col-md-6">
                    <input
                      type="checkbox"
                      checked={approvedForDew}
                      onChange={(e) => setApprovedForDew(e.target.checked)}
                      className="custom-checkbox"
                    />
                    &nbsp; &nbsp;<label>Select for abc</label>
                  </div>
                  <div className="col-md-6">
                    <input
                      type="checkbox"
                      checked={approvedForCustomer}
                      onChange={(e) => setApprovedForCustomer(e.target.checked)}
                      className="custom-checkbox"
                    />
                    &nbsp; &nbsp; <label>Select for Customer</label>
                  </div>
                </div>
              </div>
              <br />
              <div className="card-action">
                <center>
                  <button
                    className="btn"
                    style={{ backgroundColor: "#2E1A47", color: "white" }}
                    onClick={handleFormAndImageUpload}
                  >
                    Submit
                  </button>
                </center>
                <br />
              </div>
            </div>
          </div>
        </div>
      </Content>
      <Footer />
    </main>
  );
}

export default EditSketchDesigner;