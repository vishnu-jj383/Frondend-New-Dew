import React, { useEffect, useState, useRef } from "react";
import Footer from "../../Components/Footer";
import Header from "../../Components/Header";
import Content from "../../Components/Content";

import {
  changeInputs,
  createPdOrder,
  deleteOrder,
  getItemsFromApi,
  uploadImage,
} from "./services";
import moment from "moment";
import Swal from "sweetalert2";
// import './createPd.css'

const CreatePdOrder = () => {
  // const sideBarState = useSelector((state) => state?.sidebar?.sideBar);

  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubtegories] = useState([]);
  const [file, setFile] = useState(null);
  const [pdFetchItems, setPdFetchItems] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [pdItems, setPdItems] = useState({
    promiseDate: "",
    orderDate: "",
    requiredDesignCount: null,
    customerId: null,
    productTypeId: null,
    genderId: null,
    categoryGroupId: null,
    categoryId: null,
    subcategoryId: null,
    brandId: null,
    styleId: null,
    occasionId: null,
    metalTypeId: null,
    metalColorId: null,
    status: "Pending",
    expectedGrossWt: null,
    expectedNetWt: null,
    remarks: "",
    diamondRange: "",
    colorStoneRange: "",
    priority: "",
    isItemReceived: "No",
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    getItemsFromApi(setPdFetchItems);
  }, []);

  useEffect(() => {
    changeInputs(
      setPdItems,
      pdItems,
      setSelectedCustomer,
      setCategories,
      setSubtegories
    );
  }, [pdItems?.customerId, pdItems?.categoryGroupId, pdItems?.categoryId]);

  useEffect(() => {
    if (selectedCustomer) {
      setPdItems((prev) => ({
        ...prev,
        orderDate: moment().format("YYYY-MM-DD"),
      }));
    }
  }, [selectedCustomer]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPdItems((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
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

  const handleDateChange = (e) => {
    const selectedDate = moment(e.target.value);
    const currentDate = moment().startOf("day");
    if (selectedDate.isBefore(currentDate)) {
      alert("Promise Date cannot be earlier than the current date.");
      setPdItems((prev) => ({ ...prev, promiseDate: "" }));
    } else {
      setPdItems((prev) => ({
        ...prev,
        promiseDate: selectedDate.format("YYYY-MM-DD"),
      }));
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await createPdOrder(pdItems);
      if (file && response?.data?.id) {
        const data = await uploadImage(file, response?.data?.id);
        if (data?.status === 200) {
          Swal.fire({
            title: "Success!",
            text: "Order created successfully.",
            icon: "success",
            confirmButtonText: "OK",
          }).then(() => {
            window.location.reload();
          });
        } else if (data?.status === 422) {
          Swal.fire({
            title: "Order failed!",
            text: data.data.message,
            icon: "error",
            confirmButtonText: "OK",
          });
          await deleteOrder(response?.data?.id);
        }
      } else if (response?.data?.id) {
        Swal.fire({
          title: "Success!",
          text: "Order created successfully.",
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => {
          window.location.reload();
        });
      }
    } catch (error) {
      console.error("An error occurred during the process:", error.response);
    }
  };

  return (
    <main className="main-content">
       
      <Content>
      
        <div className="">
          <div className="page-inner">
            <div className="page-header">
              <h3 className="fw-bold mb-3">PD/Concept</h3>
            </div>

            <form onSubmit={onSubmit}>
              <div className="card with-border">
                <div className="card-body">
                  {/* Row 1 */}
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Customer <span style={{ color: "red" }}>*</span>
                        </label>
                        <select
                          className="form-control"
                          name="customerId"
                          value={pdItems.customerId || ""}
                          onChange={handleChange}
                          required
                          // style={{ height: "38px", fontSize: "14px" }}
                        >
                          <option value="">Select Customer</option>
                          {pdFetchItems?.customerData?.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.customer_first_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Email</label>
                        <input
                          type="email"
                          className="form-control"
                          value={selectedCustomer?.customer_email || "NIL"}
                          disabled
                          // style={{ height: "38px", fontSize: "14px" }}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Mobile</label>
                        <input
                          type="number"
                          className="form-control"
                          value={selectedCustomer?.phone_number || "NIL"}
                          disabled
                          // style={{ height: "38px", fontSize: "14px" }}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Customer Code</label>
                        <input
                          type="text"
                          className="form-control"
                          value={
                            selectedCustomer
                              ? `CU${selectedCustomer.id}`
                              : "NIL"
                          }
                          disabled
                          // style={{ height: "38px", fontSize: "14px" }}
                        />
                      </div>
                    </div>
                  </div>
                  <br />

                  {/* Row 2 */}
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Date</label>
                        <input
                          type="text"
                          className="form-control"
                          value={moment().format("YYYY-MM-DD")}
                          disabled
                          // style={{ height: "38px", fontSize: "14px" }}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Promised Date <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          name="promiseDate"
                          value={pdItems.promiseDate || ""}
                          onChange={handleDateChange}
                          min={moment().format("YYYY-MM-DD")}
                          required
                          // style={{ height: "38px", fontSize: "14px" }}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Required Count <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          name="requiredDesignCount"
                          value={pdItems.requiredDesignCount || ""}
                          onChange={handleChange}
                          min="1"
                          required
                          // style={{ height: "38px", fontSize: "14px" }}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Product Type <span style={{ color: "red" }}>*</span>
                        </label>
                        <select
                          className="form-control"
                          name="productTypeId"
                          value={pdItems.productTypeId || ""}
                          onChange={handleChange}
                          required
                          // style={{ height: "38px", fontSize: "14px" }}
                        >
                          <option value="">Select Product Type</option>
                          {pdFetchItems?.productTypeData?.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.product_types}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <br />
                  {/* Row 3 */}
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Category Group <span style={{ color: "red" }}>*</span>
                        </label>
                        <select
                          className="form-control"
                          name="categoryGroupId"
                          value={pdItems.categoryGroupId || ""}
                          onChange={handleChange}
                          required
                          // style={{ height: "38px", fontSize: "14px" }}
                        >
                          <option value="">Select Category Group</option>
                          {pdFetchItems?.categoryGroupData?.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.category_group_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Category</label>
                        <select
                          className="form-control"
                          name="categoryId"
                          value={pdItems.categoryId || ""}
                          onChange={handleChange}
                          // style={{ height: "38px", fontSize: "14px" }}
                        >
                          <option value="">Select Category</option>
                          {categories?.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.category_name || "NO Data"}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Subcategory</label>
                        <select
                          className="form-control"
                          name="subcategoryId"
                          value={pdItems.subcategoryId || ""}
                          onChange={handleChange}
                          // style={{ height: "38px", fontSize: "14px" }}
                        >
                          <option value="">Select Subcategory</option>
                          {subCategories?.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.subcategory_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Brand <span style={{ color: "red" }}>*</span>
                        </label>
                        <select
                          className="form-control"
                          name="brandId"
                          value={pdItems.brandId || ""}
                          onChange={handleChange}
                          required
                          // style={{ height: "38px", fontSize: "14px" }}
                        >
                          <option value="">Select Brand</option>
                          {pdFetchItems?.brandData?.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.brand_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <br />
                  {/* Row 4 */}
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Style <span style={{ color: "red" }}>*</span>
                        </label>
                        <select
                          className="form-control"
                          name="styleId"
                          value={pdItems.styleId || ""}
                          onChange={handleChange}
                          required
                          // style={{ height: "38px", fontSize: "14px" }}
                        >
                          <option value="">Select Style</option>
                          {pdFetchItems?.styleData?.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.style_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Occasion <span style={{ color: "red" }}>*</span>
                        </label>
                        <select
                          className="form-control"
                          name="occasionId"
                          value={pdItems.occasionId || ""}
                          onChange={handleChange}
                          required
                          // style={{ height: "38px", fontSize: "14px" }}
                        >
                          <option value="">Select Occasion</option>
                          {pdFetchItems?.occasionData?.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.occasion}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Metal Type <span style={{ color: "red" }}>*</span>
                        </label>
                        <select
                          className="form-control"
                          name="metalTypeId"
                          value={pdItems.metalTypeId || ""}
                          onChange={handleChange}
                          required
                          // style={{ height: "38px", fontSize: "14px" }}
                        >
                          <option value="">Select Metal Type</option>
                          {pdFetchItems?.materialTypeData?.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.material_class}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Metal Color <span style={{ color: "red" }}>*</span>
                        </label>
                        <select
                          className="form-control"
                          name="metalColorId"
                          value={pdItems.metalColorId || ""}
                          onChange={handleChange}
                          required
                          // style={{ height: "38px", fontSize: "14px" }}
                        >
                          <option value="">Select Metal Color</option>
                          {pdFetchItems?.materialColorData?.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.metal_color_name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                  <br />
                  {/* Row 5 */}
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Gender <span style={{ color: "red" }}>*</span>
                        </label>
                        <select
                          className="form-control"
                          name="genderId"
                          value={pdItems.genderId || ""}
                          onChange={handleChange}
                          required
                          // style={{ height: "38px", fontSize: "14px" }}
                        >
                          <option value="">Select Gender</option>
                          {pdFetchItems?.genderData?.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.gender}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Expected Gross Weight{" "}
                          <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          name="expectedGrossWt"
                          value={pdItems.expectedGrossWt || ""}
                          onChange={handleChange}
                          min="1"
                          required
                          // style={{ height: "38px", fontSize: "14px" }}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Diamond Range <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="diamondRange"
                          value={pdItems.diamondRange || ""}
                          onChange={handleChange}
                          required
                          // style={{ height: "38px", fontSize: "14px" }}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Color Stone Range{" "}
                          <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          name="colorStoneRange"
                          value={pdItems.colorStoneRange || ""}
                          onChange={handleChange}
                          required
                          // style={{ height: "38px", fontSize: "14px" }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 6 */}
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Expected Net Weight{" "}
                          <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          name="expectedNetWt"
                          value={pdItems.expectedNetWt || ""}
                          onChange={handleChange}
                          min="1"
                          required
                          // style={{ height: "38px", fontSize: "14px" }}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Priority <span style={{ color: "red" }}>*</span>
                        </label>
                        <select
                          className="form-control"
                          name="priority"
                          value={pdItems.priority || ""}
                          onChange={handleChange}
                          required
                          // style={{ height: "38px", fontSize: "14px" }}
                        >
                          <option value="">Select Priority</option>
                          <option value="low">Low</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Choose Image File{" "}
                          <span style={{ color: "red" }}>*</span>
                        </label>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                          required
                          // style={{ height: "38px", fontSize: "14px" }}
                        />
                        {imagePreview && (
                          <div style={{ marginTop: "5px" }}>
                            <img
                              src={imagePreview}
                              alt="Selected preview"
                              style={{
                                maxWidth: "100%",
                                maxHeight: "100px",
                                objectFit: "contain",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="form-group">
                      {/* Empty column for alignment */}
                    </div>
                  </div>

                  {/* Full-width Comment and Submit */}
                  <div className="row">
                    <div className="col-md-12 form-group">
                      <label>Comment</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        name="remarks"
                        value={pdItems.remarks || ""}
                        onChange={handleChange}
                        placeholder="Enter your comment"
                        style={{ fontSize: "14px" }}
                      />
                    </div>
                  </div>
                  <br />
                  <div className="row">
                    {/* <div className="col-md-2 form-group">
                </div>
                <div className="col-md-3 form-group">
                </div> */}
                    <center>
                      <div className="col-md-2 form-group">
                        <button
                          type="submit"
                          className="btn"
                          style={{ backgroundColor: "#2E1A47", color: "white" }}
                        >
                          Submit
                        </button>
                      </div>
                    </center>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Content>
      <Footer />
    </main>
  );
};

export default CreatePdOrder;
