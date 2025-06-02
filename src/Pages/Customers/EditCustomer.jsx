import React, { useState, useEffect } from "react";
import axios from "axios";
import Footer from "../../Components/Footer";
import Content from "../../Components/Content";
import { useNavigate, useParams } from "react-router";
import Cookies from "js-cookie";
import Swal from "sweetalert2";

function EditCustomer() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [customerUsername, setCustomerUsername] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerFirstName, setCustomerFirstName] = useState("");
  const [customerLastName, setCustomerLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [pincode, setPincode] = useState("");
  const [customerCountry, setCustomerCountry] = useState("");
  const [country_subsidiary, setCountry_subsidiary] = useState("");
  const [customer_fax, setCustomer_fax] = useState("");
  const [customer_type, setCustomer_type] = useState("");
  const [errors, setErrors] = useState({});

  // Validation function
  const validateForm = () => {
    let newErrors = {};
    if (!customerFirstName.trim()) {
      newErrors.customer_first_name = "First Name is required";
    }
    // Uncomment if last name is required
    // if (!customerLastName.trim()) {
    //   newErrors.customer_last_name = "Last Name is required";
    // }
    if (!customerUsername.trim()) {
      newErrors.customer_username = "Username is required";
    }
    if (!customer_type) {
      newErrors.customer_type = "Customer Type is required";
    }
    if (!customer_fax.trim()) {
      newErrors.customer_fax = "Customer Fax  is required";
    } else if (!/^\d{6}$/.test(customer_fax)) {
      newErrors.customer_fax = "Customer Fax must be a 6-digit number";
    }
    // if (!customer_fax || isNaN(customer_fax) || customer_fax.length !== 6) {
    //   newErrors.customer_fax = "Customer Fax must be a 6-digit number";
    // }
    if (!country_subsidiary.trim()) {
      newErrors.country_subsidiary = "Country Subsidiary is required";
    }
    if (!customerEmail.trim()) {
      newErrors.customer_email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      newErrors.customer_email = "Invalid email format";
    }
    if (!phoneNumber.trim()) {
      newErrors.phone_number = "Phone number is required";
    } else if (!/^\d{10}$/.test(phoneNumber)) {
      newErrors.phone_number = "Phone number must be 10 digits";
    }
    if (!pincode.trim()) {
      newErrors.pincode = "Pin Code is required";
    } else if (!/^\d{6}$/.test(pincode)) {
      newErrors.pincode = "Pin Code must be 6 digits";
    }
    if (!customerCountry.trim()) {
      newErrors.customer_country = "Country is required";
    }
    if (!address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors); // Store errors in state
    return Object.keys(newErrors).length === 0; // Return true if no errors
  };

  // Real-time validation for specific fields
  const validateField = (name, value) => {
    let fieldError = "";
    switch (name) {
      case "customer_first_name":
        if (!value.trim()) fieldError = "First Name is required";
        break;
      case "customer_username":
        if (!value.trim()) fieldError = "Username is required";
        break;
      case "customer_type":
        if (!value) fieldError = "Customer Type is required";
        break;
         case "customer_fax":
        if (!value.trim()) {
          fieldError = "Customer Fax is required";
        } else if (!/^\d{6}$/.test(value)) {
          fieldError = "Customer Fax must be 6 digits";
        }
        break;
      // case "customer_fax":
      //   if (!value || isNaN(value) || value.length !== 6)
      //     fieldError = "Customer Fax must be a 6-digit number";
      //   break;
      case "country_subsidiary":
        if (!value.trim()) fieldError = "Country Subsidiary is required";
        break;
      case "customer_email":
        if (!value.trim()) {
          fieldError = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          fieldError = "Invalid email format";
        }
        break;
      case "phone_number":
        if (!value.trim()) {
          fieldError = "Phone number is required";
        } else if (!/^\d{10}$/.test(value)) {
          fieldError = "Phone number must be 10 digits";
        }
        break;
      case "pincode":
        if (!value.trim()) {
          fieldError = "Pin Code is required";
        } else if (!/^\d{6}$/.test(value)) {
          fieldError = "Pin Code must be 6 digits";
        }
        break;
      case "customer_country":
        if (!value.trim()) fieldError = "Country is required";
        break;
      case "address":
        if (!value.trim()) fieldError = "Address is required";
        break;
      default:
        break;
    }
    setErrors((prev) => ({ ...prev, [name]: fieldError }));
  };

  const API_URL = window.url + `customer/${customerId}`;
  useEffect(() => {
    const savedToken = Cookies.get("authToken");

    if (!savedToken) {
      navigate("/"); // Redirect if no token
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
        setCustomerUsername(customerData.customer_username || "");
        setCustomerEmail(customerData.customer_email || "");
        setCustomerFirstName(customerData.customer_first_name || "");
        setCustomerLastName(customerData.customer_last_name || "");
        setPhoneNumber(customerData.phone_number || "");
        setAddress(customerData.address || "");
        setPincode(customerData.pincode || "");
        setCustomerCountry(customerData.customer_country || "");
        setCountry_subsidiary(customerData.country_subsidiary || "");
        setCustomer_type(customerData.customer_type || "");
        setCustomer_fax(customerData.customer_fax || "");
      } catch (err) {
        setError("Failed to fetch customer data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, [navigate, customerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        icon: "error",
        title: "Validation Error",
        text: "Please fix the errors in the form before submitting.",
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

      const response = await axios.put(
        window.url + `/customer/editCustomer/${customerId}`,
        {
          customer_username: customerUsername,
          customer_email: customerEmail,
          customer_first_name: customerFirstName,
          customer_last_name: customerLastName,
          phone_number: phoneNumber,
          address: address,
          pincode: pincode,
          customer_country: customerCountry,
          customer_fax: customer_fax,
          customer_type: customer_type,
          country_subsidiary: country_subsidiary,
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
        title: "Customer Updated",
        text: "Customer information has been updated successfully.",
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
              title: "Error Updating Customer",
              text: "Username already exists. Try another username.",
              showConfirmButton: true,
            });
          } else if (errorMessage.includes("email")) {
            Swal.fire({
              icon: "error",
              title: "Error Updating Customer",
              text: "Email already exists. Try another email.",
              showConfirmButton: true,
            });
          } else if (errorMessage.includes("phone number")) {
            Swal.fire({
              icon: "error",
              title: "Error Updating Customer",
              text: "Phone number already exists. Try another phone number.",
              showConfirmButton: true,
            });
          } else {
            console.error(
              "Error Update Customer:",
              error.response ? error.response.data : error.message
              );
      
            Swal.fire({
              icon: "error",
              title: "Error Update Customer",
              text: `An error occurred: ${errorMessage}`,
              showConfirmButton: true,
            });
          }
        }
      };

  // Input change handler with real-time validation
  const handleInputChange = (setter, fieldName) => (e) => {
    const value = e.target.value;
    setter(value);
    validateField(fieldName, value);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <main className="main-content">
      <Content>
        <div className="">
          <div className="page-inner">
            <div className="page-header"></div>
            <div className="card">
              <div className="card-header text-white">
                <center>
                  <h5 style={{ color: "black" }}>Edit Customer</h5>
                </center>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                          type="text"
                          className="form-control"
                          name="customer_first_name"
                          value={customerFirstName}
                          onChange={handleInputChange(
                            setCustomerFirstName,
                            "customer_first_name"
                          )}
                          onBlur={() =>
                            validateField("customer_first_name", customerFirstName)
                          }
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
                          value={customerLastName}
                          onChange={handleInputChange(
                            setCustomerLastName,
                            "customer_last_name"
                          )}
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
                          value={customerEmail}
                          onChange={handleInputChange(
                            setCustomerEmail,
                            "customer_email"
                          )}
                          onBlur={() => validateField("customer_email", customerEmail)}
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
                          value={customerUsername}
                          onChange={handleInputChange(
                            setCustomerUsername,
                            "customer_username"
                          )}
                          onBlur={() =>
                            validateField("customer_username", customerUsername)
                          }
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
                          type="text"
                          className="form-control"
                          name="phone_number"
                          value={phoneNumber}
                          onChange={handleInputChange(setPhoneNumber, "phone_number")}
                          onBlur={() => validateField("phone_number", phoneNumber)}
                          maxLength="10"
                          placeholder="Enter mobile number"
                        />
                        {errors.phone_number && (
                          <span className="text-danger">{errors.phone_number}</span>
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
                          value={customerCountry}
                          onChange={handleInputChange(
                            setCustomerCountry,
                            "customer_country"
                          )}
                          onBlur={() =>
                            validateField("customer_country", customerCountry)
                          }
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
                          type="text"
                          className="form-control"
                          name="customer_fax"
                           value={customer_fax}
                          onChange={handleInputChange(setCustomer_fax, "customer_fax")}
                          onBlur={() => validateField("customer_fax", customer_fax)}
                          maxLength="6"
                          placeholder="Enter Customer Fax"
                        />
                        {errors.customer_fax && (
                          <span className="text-danger">{errors.customer_fax}</span>
                        )}
                        {/* <input
                          type="text"
                          className="form-control"
                          name="customer_fax"
                          value={customer_fax}
                          onChange={handleInputChange(
                            setCustomer_fax,
                            "customer_fax"
                          )}
                          onBlur={() => validateField("customer_fax", customer_fax)}
                          maxLength="6"
                          placeholder="Enter Customer Fax"
                        />
                        {errors.customer_fax && (
                          <span className="text-danger">{errors.customer_fax}</span>
                        )} */}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="customer_type">Customer Type</label>
                        <select
                          className="form-control"
                          name="customer_type"
                          value={customer_type}
                          onChange={handleInputChange(
                            setCustomer_type,
                            "customer_type"
                          )}
                          onBlur={() => validateField("customer_type", customer_type)}
                        >
                          <option value="">Select Customer Type</option>
                          <option value="individual">Individual</option>
                          <option value="business">Business</option>
                        </select>
                        {errors.customer_type && (
                          <span className="text-danger">{errors.customer_type}</span>
                        )}
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="form-group">
                        <label htmlFor="country_subsidiary">Country Subsidiary</label>
                        <input
                          type="text"
                          className="form-control"
                          name="country_subsidiary"
                          value={country_subsidiary}
                          onChange={handleInputChange(
                            setCountry_subsidiary,
                            "country_subsidiary"
                          )}
                          onBlur={() =>
                            validateField("country_subsidiary", country_subsidiary)
                          }
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
                          type="text"
                          className="form-control"
                          name="pincode"
                          value={pincode}
                          onChange={handleInputChange(setPincode, "pincode")}
                          onBlur={() => validateField("pincode", pincode)}
                          maxLength="6"
                          placeholder="Enter Pincode"
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
                          value={address}
                          onChange={handleInputChange(setAddress, "address")}
                          onBlur={() => validateField("address", address)}
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
                        type="submit"
                        className="btn"
                        style={{ backgroundColor: "#2E1A47", color: "white" }}
                      >
                        Submit
                      </button>
                    </div>
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

export default EditCustomer; 