import React, { useState, useEffect } from "react";
import axios from "axios";
import Footer from "../../../Components/Footer";
import Content from "../../../Components/Content";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import Swal from "sweetalert2";
import Select from "react-select";
import "./ModelStyle.css";


function Add_CAD() {
  const getCustomer_Url = window.url + "customer/getAllCustomers";
  const getDesign_Url = window.url + "design/getDesignsByCustomerId";
  const addSketch_Url = window.url + "cad/addCadFromDesign";

  const navigate = useNavigate();

  const [customerList, setCustomerList] = useState([]);
  const [designList, setDesignList] = useState([]);
  const [customerId, setCustomerId] = useState(null);
  const [orderId, setOrderId] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [designerList, setDesignerList] = useState([]);
  const [showModal, setShowModal] = useState(true); // Modal opens on page load

  useEffect(() => {
    const savedToken = Cookies.get("authToken");
    if (!savedToken) {
      navigate("/");
      return;
    }

    const fetchCustomers = async () => {
      try {
        const response = await axios.get(getCustomer_Url, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
            "Content-Type": "application/json",
          },
        });

        if (response.data.data) {
          const customers = response.data.data.map((customer) => ({
            value: customer.id,
            label: customer.customer_first_name,
          }));
          setCustomerList(customers);
        }
      } catch (err) {
        console.error("Failed to fetch customers:", err);
      }
    };

    fetchCustomers();
  }, [navigate]);

  useEffect(() => {
    if (!customerId) return;

    const fetchDesigns = async () => {
      try {
        const savedToken = Cookies.get("authToken");
        const response = await axios.post(
          getDesign_Url,
          { customerId: customerId.value },
          {
            headers: {
              Authorization: `Bearer ${savedToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.data.data) {
          const designs = response.data.data.map((design) => ({
            value: design.id,
            label: design.designNo,
          }));
          setDesignList(designs);
        }
      } catch (err) {
        console.error("Failed to fetch designs:", err);
      }
    };

    fetchDesigns();
  }, [customerId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!orderId) {
      Swal.fire("Error", "All fields are required!", "error");
      return;
    }

    const savedToken = Cookies.get("authToken");
    const requestData = {
      designId: orderId.value,
      // employeeId: selectedEmployee
    };

    try {
      await axios.post(addSketch_Url, requestData, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
      });
      Swal.fire("Success", "Add successfully!", "success");
      navigate("/cadlist");
      // handleCloseModal();
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
      <Content>
        <div className="">
          <div className="page-inner">
            {showModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h2 className="modal-title">Add New CAD</h2>
                  <form onSubmit={handleSubmit}>
                    {/* Customer Select Box */}
                    <label className="form-label">Customer Name:</label>
                    <Select
                      options={customerList}
                      value={customerId}
                      onChange={setCustomerId}
                      placeholder="Select Customer..."
                      isSearchable
                      className="form-select"
                    />

                    {/* Design Number Select Box */}
                    <label className="form-label mt-3">Design No:</label>
                    <Select
                      options={designList}
                      value={orderId}
                      onChange={setOrderId}
                      placeholder="Select Design No..."
                      isSearchable
                      className="form-select"
                      isDisabled={!customerId}
                    />

                    <div className="modal-footer mt-4">
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

export default Add_CAD;
