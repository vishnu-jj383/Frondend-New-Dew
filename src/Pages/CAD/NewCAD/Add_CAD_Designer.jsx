import React, { useState, useEffect } from "react";
import axios from "axios";
import Footer from "../../../Components/Footer";

import Content from "../../../Components/Content";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import Select from "react-select";
import "./ModelStyle.css"; // Import CSS file


function Add_CAD_Designer() {
  const getDesignername_Url = window.url + "auth/getUsersByRoleType";
  const getOrder_Url = window.url + "order/getAllOrderNos";
  const addSketch_Url = window.url + "cad/addCad";
 
  const navigate = useNavigate();
  const [designerList, setDesignerList] = useState([]);
  const [orderList, setOrderList] = useState([]);
  const [orderId, setOrderId] = useState(null); // Using null for react-select
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch Designers
        const designerResponse = await axios.post(
          getDesignername_Url,
          { type: "productDevelopment" },
          {
            headers: {
              Authorization: `Bearer ${savedToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        setDesignerList(designerResponse.data.data || []);

        // Fetch Orders
        const orderResponse = await axios.post(
          getOrder_Url,
          {},
          {
            headers: {
              Authorization: `Bearer ${savedToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const orderOptions = orderResponse.data.data.map((order) => ({
          value: order.id,
          label: order.orderNo,
        }));
        setOrderList(orderOptions);
      } catch (err) {
        console.error(`Failed to fetch data: ${err.message}`);
      }
    };

    fetchData();
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!orderId || !selectedEmployee) {
      Swal.fire("Error", "All fields are required!", "error");
      return;
    }
    const savedToken = Cookies.get("authToken");
    const requestData = {
      orderId: orderId.value, // react-select returns an object, so we use orderId.value
      empIds: [Number(selectedEmployee)],
    };

    try {
      await axios.post(addSketch_Url, requestData, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
      });
      Swal.fire("Success", "Added successfully!", "success");
      navigate("/cadlist");
      // setShowModal(false);
    } catch (err) {
      Swal.fire("Error", `Failed to add : ${err.message}`, "error");
    }
  };
  const handleCloseModal = () => {
    setShowModal(false);
    navigate("/view_cad_Model"); // Navigate back when modal is closed
  };

  return (
    <main className="main-content">
      <br /> <br />
      <Content>
        <div className="">
          <div className="page-inner">
            {showModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h2 className="modal-title">Add CAD Designer</h2>
                  <form onSubmit={handleSubmit}>
                    {/* Auto-complete Order Selection */}
                    <label className="form-label">Order No:</label>
                    <Select
                      options={orderList}
                      value={orderId}
                      onChange={setOrderId}
                      placeholder="Search Order..."
                      isSearchable
                      className="form-select"
                    />

                    {/* Employee Dropdown */}
                    <label className="form-label">Select Employee:</label>
                    <select
                      className="form-select"
                      onChange={(e) => setSelectedEmployee(e.target.value)}
                      value={selectedEmployee}
                    >
                      <option value="">Select Employee</option>
                      {designerList.map((designer) => (
                        <option key={designer.id} value={designer.id}>
                          {designer.name}
                        </option>
                      ))}
                    </select>

                    <div className="modal-footer">
                      <button type="submit" className="btn-submit">
                        Submit
                      </button>
                      &nbsp;&nbsp;&nbsp;
                      <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleCloseModal}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </Content>
      <Footer />
    </main>
  );
}

export default Add_CAD_Designer;
