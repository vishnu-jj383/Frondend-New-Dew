import React, { useState, useEffect } from "react";
import axios from "axios";
import Footer from "../../Components/Footer";
import { Content } from "antd/es/layout/layout";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
// import { useSelector } from "react-redux";
import Swal from "sweetalert2";
import "./createCustomer.css";

function CreateCustomer() {
  const navigate = useNavigate();
  // const sideBarState = useSelector((state) => state?.sidebar?.sideBar);
  const [formData, setFormData] = useState({
    customer_username: "",
    customer_email: "",
    customer_first_name: "",
    customer_last_name: "",
    phone_number: "",
    address: "",
    pincode: "",
    customer_country: "",
    country_subsidiary: "",
    customer_fax: "",
    customer_type: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    let newErrors = {};
    if (!formData.customer_first_name.trim())
      newErrors.customer_first_name = "First Name is required";
    if (!formData.customer_type.trim())
      newErrors.customer_type = "Customer Type is required";

    // Uncomment and add validation for customer_fax if it’s required
    // if (!formData.customer_fax.trim()) {
    //   newErrors.customer_fax = "Customer Fax is required";
    // } else if (!/^\d{6}$/.test(formData.customer_fax)) {
    //   newErrors.customer_fax = "Customer Fax must be 6 digits";
    // }

    if (!formData.customer_email.trim()) {
      newErrors.customer_email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customer_email)) {
      newErrors.customer_email = "Invalid email format";
    }
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone_number)) {
      newErrors.phone_number = "Phone number must be 10 digits";
    }
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pin Code is required";
    } else if (formData.pincode.length !== 6) {
      newErrors.pincode = "Pin Code must be 6 digits";
    }
    if (!formData.customer_country.trim())
      newErrors.customer_country = "Country is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    const savedToken = Cookies.get("authToken");

    if (!savedToken) {
      navigate("/"); // Redirect if no token
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone_number") {
      if (value.length <= 10 && /^\d*$/.test(value)) {
        setFormData({ ...formData, [name]: value });
        setErrors({
          ...errors,
          phone_number:
            value.length === 10 ? "" : "Phone number must be 10 digits",
        });
      }
    } else if (name === "pincode") {
      if (value.length <= 6 && /^\d*$/.test(value)) {
        setFormData({ ...formData, [name]: value });
        setErrors({
          ...errors,
          pincode: value.length === 6 ? "" : "Pin Code must be 6 digits",
        });
      }
    } else if (name === "customer_fax") {
      if (value.length <= 6 && /^\d*$/.test(value)) {
        setFormData({ ...formData, [name]: value });
        setErrors({
          ...errors,
          customer_fax:
            value.length === 6 ? "" : "Customer Fax must be 6 digits",
        });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;
  const savedToken = Cookies.get("authToken");

  try { 
    const response = await axios.post(
      window.url + "customer/addCustomer",
      formData,
      {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data);

    Swal.fire({
      icon: "success",
      title: "Customer Created!",
      text: `Customer has been created successfully!`,
      showConfirmButton: false,
      timer: 1500,
    });

    navigate("/customer__list");
  } catch (error) {
    console.log(error.response ? error.response.data : error.message);
    
    const errorMessage = error.response?.data?.message || error.message;

    if (errorMessage.includes("username")) {
      Swal.fire({
        icon: "error",
        title: "Error Creating Customer",
        text: "Username already exists. Try another username.",
        showConfirmButton: true,
      });
    } else if (errorMessage.includes("email")) {
      Swal.fire({
        icon: "error",
        title: "Error Creating Customer",
        text: "Email already exists. Try another email.",
        showConfirmButton: true,
      });
    } else if (errorMessage.includes("phone number")) {
      Swal.fire({
        icon: "error",
        title: "Error Creating Customer",
        text: "Phone number already exists. Try another phone number.",
        showConfirmButton: true,
      });
    } else {
      console.error(
        "Error creating customer:",
        error.response ? error.response.data : error.message
        );

      Swal.fire({
        icon: "error",
        title: "Error Creating Customer",
        text: `An error occurred: ${errorMessage}`,
        showConfirmButton: true,
      });
    }
  }
};

  return (
    <main className="main-content">
      <Content>
        <div className="">
          <div className="page-inner">
            <div className="card with-border">
              <div className="card-header text-white">
                <center>
                  <h5 style={{ color: "black" }}>Create Customer</h5>
                </center>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="firstName">First Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="customer_first_name"
                        onChange={handleChange}
                        placeholder="Enter First Name"
                      />
                      {errors.customer_first_name && (
                        <span className="text-danger">
                          {errors.customer_first_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="lastName">Last Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="customer_last_name"
                        onChange={handleChange}
                        placeholder="Enter Last Name"
                      />
                      {errors.customer_last_name && (
                        <span className="text-danger">
                          {errors.customer_last_name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="email">Email</label>
                      <input
                        type="text"
                        className="form-control"
                        name="customer_email"
                        onChange={handleChange}
                        placeholder="Enter email"
                      />
                      {errors.customer_email && (
                        <span className="text-danger">
                          {errors.customer_email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <br />
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="username">Username</label>
                      <input
                        type="text"
                        className="form-control"
                        name="customer_username"
                        onChange={handleChange}
                        placeholder="Enter Username"
                      />
                      {errors.customer_username && (
                        <span className="text-danger">
                          {errors.customer_username}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="phone">Mobile</label>
                      <input
                        type="number"
                        className="form-control"
                        name="phone_number"
                        onChange={handleChange}
                        value={formData.phone_number}
                        placeholder="Enter mobile number"
                        maxLength="10"
                        min="0"
                        title="Please enter a 10-digit mobile number"
                      />
                      {errors.phone_number && (
                        <span className="text-danger">
                          {errors.phone_number}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="country">Country</label>
                      <input
                        type="text"
                        className="form-control"
                        name="customer_country"
                        onChange={handleChange}
                        placeholder="Enter Country"
                      />
                      {errors.customer_country && (
                        <span className="text-danger">
                          {errors.customer_country}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
 <br />
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="customer_fax">Customer Fax</label>
                      <input
                        type="number"
                        className="form-control"
                        name="customer_fax"
                        onChange={handleChange}
                        value={formData.customer_fax}
                        placeholder="Enter Customer Fax"
                        maxLength="6"
                        min="0"
                        title="Please enter a 6-digit fax number"
                      />
                      {errors.customer_fax && (
                        <span className="text-danger">
                          {errors.customer_fax}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="customer_type">Customer Type</label>
                      <select
                        className="form-control"
                        name="customer_type"
                        onChange={handleChange}
                        value={formData.customer_type || ""}
                      >
                        <option value="">Select Customer Type</option>
                        <option value="individual">Individual</option>
                        <option value="business">Business</option>
                      </select>
                      {errors.customer_type && (
                        <span className="text-danger">
                          {errors.customer_type}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="country_subsidiary">
                        Country Subsidiary
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        name="country_subsidiary"
                        onChange={handleChange}
                        placeholder="Enter Country Subsidiary"
                      />
                      {errors.country_subsidiary && (
                        <span className="text-danger">
                          {errors.country_subsidiary}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
 <br />
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="pincode">Pin Code</label>
                      <input
                        type="number"
                        className="form-control"
                        name="pincode"
                        onChange={handleChange}
                        value={formData.pincode}
                        placeholder="Enter Pincode"
                        maxLength="6"
                        min="0"
                        title="Please enter a 6-digit pincode"
                      />
                      {errors.pincode && (
                        <span className="text-danger">{errors.pincode}</span>
                      )}
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="address">Address</label>
                      <textarea
                        className="form-control"
                        name="address"
                        onChange={handleChange}
                        placeholder="Enter Address"
                      />
                      {errors.address && (
                        <span className="text-danger">{errors.address}</span>
                      )}
                    </div>
                  </div>
                </div>

                <br />
                <center>
                  <div className="card-action">
                    <button
                      className="btn"
                      style={{ backgroundColor: "#2E1A47", color: "white" }}
                      onClick={handleSubmit}
                    >
                      Submit
                    </button>
                  </div>
                </center>
              </div>
            </div>
          </div>
        </div>
      </Content>
      <Footer />
    </main>
  );
}

export default CreateCustomer;
