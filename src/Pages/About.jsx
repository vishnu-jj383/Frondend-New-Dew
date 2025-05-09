import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from '../Components/Header';
import Content from '../Components/Content';
import Footer from '../Components/Footer';
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
// import { useSelector } from "react-redux";
import Swal from "sweetalert2";
function About() {
  const navigate = useNavigate();
    // const sideBarState = useSelector(state => state?.sidebar?.sideBar);
    const getRole_Url = window.url+"auth/getAllRoles";
    const emp_URL = window.url+"auth/getAllUsers";
   const[role_array,setRole_array]=useState([])
   const[emp_array,setEmp_array]=useState([])
    const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
      name: "",
      email: "",
      password: "",
      emp_id: "",
      emp_subsidiary: "",
      designation: "",
      role: "",
      department: "",
      emp_mobile_no: "",
      supervisor_name: "",
      date_of_joining: "",
      isLogin: true,
      roleCategory: "admin",
      access: {
        dashboard: true,
        pd: true,
        pdList: true,
        pdApprovalList: true,
        sketches: true,
        sketchesList: true,
        sketchApprovalList: true,
        sketchGridView: true,
        cad: true,
        cadList: true,
        cadApprovalList: true,
        render: true,
        renderList: true,
        renderApprovalList: true,
        design: true,
        designBank: true,
        designMaster: true,
        reports: true,
        designReports: true,
        designerReport: true,
        albums: true,
        sendToCustomer: true,
        dewAlbum: true,
      },
    });
  
    const [errors, setErrors] = useState({});
  
    useEffect(() => {
      const savedToken = Cookies.get("authToken");
      if (!savedToken) {
        navigate("/"); // Redirect if no token
      }
       const getUserserRole = async () => {
           
            try {
              // const requestData = { type: "productDevelopment" };
              const response = await axios.post(getRole_Url, {}, {
                  headers: {
                      Authorization: `Bearer ${savedToken}`,
                      "Content-Type": "application/json"
                  }
              });
              setRole_array(response.data.data || []);
              // console.log(materialType_array);
              // alert(response.data.data)
             
            } catch (err) {
              console.error(`Failed to fetch setting types: ${err.message}`);
              if (err.response?.data?.message === "Token expired, please login again" || err.message === "Token expired, please login again") {
                        Cookies.remove("authToken"); // Remove the expired token
                        navigate("/"); // Redirect to login
                      }
            }
          };
  
           const fetchEmployee = async () => {
                      
                       try {
                         const response = await axios.post(
                           `${emp_URL}`,
                           { },
                           { headers: { Authorization: `Bearer ${savedToken}` } }
                         );
                   
                           console.log("Full API Response:", response);
                           // alert(response.data.data.length)
                           
                           if (!response.data || !response.data.data) {
                               throw new Error("Invalid API response structure");
                           }
                   
                           if (response.data) {
                             setEmp_array(response.data.data || []);
                            
                           }
                       } catch (err) {
                           setError(`Failed to fetch Order data: ${err.response?.data?.message || err.message}`);
                           if (err.response?.data?.message === "Token expired, please login again" || err.message === "Token expired, please login again") {
                                     Cookies.remove("authToken"); // Remove the expired token
                                     navigate("/"); // Redirect to login
                                   }
                       } finally {
                           setLoading(false);
                       }
                   };
                 
                    
          getUserserRole()
          fetchEmployee()
    }, [navigate]);
  
    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      if (type === "checkbox") {
        setFormData({
          ...formData,
          access: { ...formData.access, [name]: checked },
        });
      } else {
        setFormData({ ...formData, [name]: value });
      }
    };
  
    const validateForm = () => {
      let newErrors = {};
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = "Invalid email format";
      }
      if (!formData.password.trim()) newErrors.password = "Password is required";
      if (!formData.emp_id.trim()) newErrors.emp_id = "Employee ID is required";
      if (!formData.emp_subsidiary.trim()) newErrors.emp_subsidiary = "Subsidiary is required";
      if (!formData.designation.trim()) newErrors.designation = "Designation is required";
      if (!formData.department.trim()) newErrors.department = "Department is required";
      if (!formData.emp_mobile_no.trim()) {
        newErrors.emp_mobile_no = "Mobile number is required";
      } else if (!/^\d{10}$/.test(formData.emp_mobile_no)) {
        newErrors.emp_mobile_no = "Mobile number must be 10 digits";
      }
      if (!formData.supervisor_name.trim()) newErrors.supervisor_name = "Supervisor Name is required";
      if (!formData.date_of_joining.trim()) newErrors.date_of_joining = "Date of joining is required";
  
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      if (!validateForm()) return;
  
      const savedToken = Cookies.get("authToken");
  
      try {
        await axios.post(
          window.url + "auth/addUser",
          formData, // Sending formData with the updated structure
          {
            headers: {
              Authorization: `Bearer ${savedToken}`,
              "Content-Type": "application/json",
            },
          }
        );
  // Reset the form fields after successful submission
  setFormData({
    name: "",
    email: "",
    password: "",
    emp_id: "",
    emp_subsidiary: "",
    designation: "",
    role: 1,
    department: "",
    emp_mobile_no: "",
    supervisor_name: "",
    date_of_joining: "",
    isLogin: true,
    roleCategory: "admin",
    access: {
      dashboard: true,
      pd: true,
      pdList: true,
      pdApprovalList: true,
      sketches: true,
      sketchesList: true,
      sketchApprovalList: true,
      sketchGridView: true,
      cad: true,
      cadList: true,
      cadApprovalList: true,
      render: true,
      renderList: true,
      renderApprovalList: true,
      design: true,
      designBank: true,
      designMaster: true,
      reports: true,
      designReports: true,
      designerReport: true,
      albums: true,
      sendToCustomer: true,
      dewAlbum: true,
    },
  });
        Swal.fire({
          icon: "success",
          title: "Employee Created!",
          text: `Employee has been created successfully!`,
          showConfirmButton: false,
          timer: 1500,
        });
  
        navigate("/employeeLists");
      } catch (error) {
        console.error("Error creating employee:", error.response ? error.response.data : error.message);
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: `Error: ${error.response ? JSON.stringify(error.response.data) : error.message}`,
          showConfirmButton: true,
        });
      }
    };
  
  return (
    <main className="main-content">
    <Header title="Add Employee" subtitle="Create a new employee record" />
    <Content>
      <div className="container">
        <div className="page-inner">
          <div className="page-header"></div>
          <div className="card">
            <div className="card-header text-white">
              <center>
                <h5 style={{ color: "black" }}>Add Employee</h5>
              </center>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter Name"
                    />
                    {errors.name && <span className="text-danger">{errors.name}</span>}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="text"
                      className="form-control"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter Email"
                    />
                    {errors.email && <span className="text-danger">{errors.email}</span>}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                      type="password"
                      className="form-control"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter Password"
                    />
                    {errors.password && <span className="text-danger">{errors.password}</span>}
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="emp_id">Employee ID</label>
                    <input
                      type="text"
                      className="form-control"
                      name="emp_id"
                      value={formData.emp_id}
                      onChange={handleChange}
                      placeholder="Enter Employee ID"
                    />
                    {errors.emp_id && <span className="text-danger">{errors.emp_id}</span>}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="emp_subsidiary">Subsidiary</label>
                    <input
                      type="text"
                      className="form-control"
                      name="emp_subsidiary"
                      value={formData.emp_subsidiary}
                      onChange={handleChange}
                      placeholder="Enter Subsidiary"
                    />
                    {errors.emp_subsidiary && <span className="text-danger">{errors.emp_subsidiary}</span>}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="designation">Designation</label>
                    <input
                      type="text"
                      className="form-control"
                      name="designation"
                      value={formData.designation}
                      onChange={handleChange}
                      placeholder="Enter Designation"
                    />
                    {errors.designation && <span className="text-danger">{errors.designation}</span>}
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="department">Department</label>
                    <input
                      type="text"
                      className="form-control"
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      placeholder="Enter Department"
                    />
                    {errors.department && <span className="text-danger">{errors.department}</span>}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="emp_mobile_no">Mobile</label>
                    <input
                      type="text"
                      className="form-control"
                      name="emp_mobile_no"
                      value={formData.emp_mobile_no}
                      onChange={handleChange}
                      placeholder="Enter Mobile Number"
                    />
                    {errors.emp_mobile_no && <span className="text-danger">{errors.emp_mobile_no}</span>}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="supervisor_name">Supervisor Name</label>
                    <select
                      className="form-control"
                      name="supervisor_name"
                      value={formData.supervisor_name}
                      onChange={handleChange}
                    >
                      <option value="">Select Supervisor</option>
                      {emp_array.map((emp) => (
                        <option key={emp.id} value={emp.name}>
                          {emp.name}
                        </option>
                      ))}
                    </select>
                    {errors.supervisor_name && <span className="text-danger">{errors.supervisor_name}</span>}
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="date_of_joining">Date of Joining</label>
                    <input
                      type="date"
                      className="form-control"
                      name="date_of_joining"
                      value={formData.date_of_joining}
                      onChange={handleChange}
                    />
                    {errors.date_of_joining && <span className="text-danger">{errors.date_of_joining}</span>}
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="form-group">
                    <label htmlFor="role">Select Role</label>
                    <select
                      className="form-control"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="">Select Role</option>
                      {role_array.map((role) => (
                        <option key={role.id} value={role.id}>{role.roleName}</option>
                      ))}
                    </select>
                    {errors.role && <span className="text-danger">{errors.role}</span>}
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

export default About;