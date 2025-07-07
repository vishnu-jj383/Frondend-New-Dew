import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Footer from "../../Components/Footer";
import Header from "../../Components/Header";
import Content from "../../Components/Content";
import Cookies from "js-cookie";
import moment from 'moment'; // Add this import
import Swal from "sweetalert2";

const formatDateToLocal = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function EditPd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [orderNo, setOrderNo] = useState("");
  const [orderDate, setOrderDate] = useState("");
  const [promiseDate, setPromiseDate] = useState("");
  const [requiredDesignCount, setRequiredDesignCount] = useState("");
  const [expectedGrossWt, setExpectedGrossWt] = useState("");
  const [expectedNetWt, setExpectedNetWt] = useState("");
  const [remarks, setRemarks] = useState("");
  const [diamondRange, setDiamondRange] = useState("");
  const [colorStoneRange, setColorStoneRange] = useState("");
  const [priority, setPriority] = useState("");
  const [isItemReceived, setIsItemReceived] = useState("");
  const [status, setStatus] = useState("");
  const [orderStatus, setOrderStatus] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [productType, setProductType] = useState("");
  const [gender, setGender] = useState("");
  const [categoryGroup, setCategoryGroup] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [styleName, setStyleName] = useState("");
  const [occasion, setOccasion] = useState("");
  const [metalType, setMetalType] = useState("");
  const [metalColor, setMetalColor] = useState("");

  const [loading, setLoading] = useState(false);
  // const sideBarState = useSelector((state) => state?.sidebar?.sideBar);
  const [colorStoneColor_Array, setColorStoneColor_Array] = useState([]); // Add this new state
  const API_URL = window.url + `order/getOrderById`;

  // States for select options
  const [productType_Array, setProductTypeArray] = useState([]);
  const [gender_Array, setGenderArray] = useState([]);
  const [categoryGroup_Array, setCategoryGroupArray] = useState([]);
  const [category_Array, setCategoryArray] = useState([]);
  const [brand_Array, setBrandArray] = useState([]);
  const [style_Array, setStyleArray] = useState([]);
  const [occasion_Array, setOccasionArray] = useState([]);
  const [metalType_Array, setMetalTypeArray] = useState([]);
  const [metalColor_Array, setMetalColorArray] = useState([]);

  useEffect(() => {
    const savedToken = Cookies.get("authToken");

    if (!savedToken) {
      navigate("/"); // Redirect if no token
      return;
    }

    // Fetch all dropdown values
    const getColorStoneColorData = async () => {
      try {
        const response = await axios.get(
          window.url + "customer/getAllCustomers",
          {
            headers: { Authorization: `Bearer ${Cookies.get("authToken")}` },
          }
        );
        setColorStoneColor_Array(response.data.data || []);
      } catch (err) {
        console.error(`Failed to fetch shapes data: ${err.message}`);
      }
    };

    const getProductType = async () => {
      try {
        const response = await axios.get(window.url + "misc/productType", {
          headers: { Authorization: `Bearer ${Cookies.get("authToken")}` },
        });
        setProductTypeArray(response.data.data || []);
      } catch (err) {
        console.error(`Failed to fetch product types: ${err.message}`);
      }
    };

    const getCaterory = async () => {
      // alert(categoryGroup)
      try {
        const response = await axios.post(
          window.url + "category/getAllcategories",
          { categoryGroupId: categoryGroup },
          {
            headers: { Authorization: `Bearer ${Cookies.get("authToken")}` },
          }
        );
        setCategoryArray(response.data.data || []);
      } catch (err) {
        console.error(`Failed to fetch product types: ${err.message}`);
      }
    };

    const getGender = async () => {
      try {
        const response = await axios.get(window.url + "misc/gender", {
          headers: { Authorization: `Bearer ${Cookies.get("authToken")}` },
        });
        setGenderArray(response.data.data || []);
      } catch (err) {
        console.error(`Failed to fetch gender: ${err.message}`);
      }
    };

    const getCategoryGroup = async () => {
      try {
        const response = await axios.get(
          window.url + "category/categoryGroup",
          {
            headers: { Authorization: `Bearer ${Cookies.get("authToken")}` },
          }
        );
        setCategoryGroupArray(response.data.data || []);
      } catch (err) {
        console.error(`Failed to fetch category group: ${err.message}`);
      }
    };

    const getBrand = async () => {
      try {
        const response = await axios.get(window.url + "misc/brands", {
          headers: { Authorization: `Bearer ${Cookies.get("authToken")}` },
        });
        setBrandArray(response.data.data || []);
      } catch (err) {
        console.error(`Failed to fetch brands: ${err.message}`);
      }
    };

    const getStyle = async () => {
      try {
        const response = await axios.get(window.url + "misc/styles", {
          headers: { Authorization: `Bearer ${Cookies.get("authToken")}` },
        });
        setStyleArray(response.data.data || []);
      } catch (err) {
        console.error(`Failed to fetch styles: ${err.message}`);
      }
    };

    const getOccasion = async () => {
      try {
        const response = await axios.get(window.url + "misc/occasion", {
          headers: { Authorization: `Bearer ${Cookies.get("authToken")}` },
        });
        setOccasionArray(response.data.data || []);
      } catch (err) {
        console.error(`Failed to fetch occasion: ${err.message}`);
      }
    };

    const getMetalType = async () => {
      try {
        const response = await axios.get(
          window.url + "materialItems/materialType",
          {
            headers: { Authorization: `Bearer ${Cookies.get("authToken")}` },
          }
        );
        setMetalTypeArray(response.data.data || []);
      } catch (err) {
        console.error(`Failed to fetch metal types: ${err.message}`);
      }
    };

    const getMetalColor = async () => {
      try {
        const response = await axios.get(
          window.url + "materialItems/metalColor",
          {
            headers: { Authorization: `Bearer ${Cookies.get("authToken")}` },
          }
        );
        setMetalColorArray(response.data.data || []);
      } catch (err) {
        console.error(`Failed to fetch metal colors: ${err.message}`);
      }
    };

    // Call all functions to fetch data
    getStyle();
    getBrand();
    getCategoryGroup();
    getCaterory();
    getColorStoneColorData();
    getMetalColor();
    getGender();
    getMetalType();
    getOccasion();
    getProductType();
  }, [id, navigate, categoryGroup]);

  useEffect(() => {
    const savedToken = Cookies.get("authToken");

    if (!savedToken) {
      navigate("/"); // Redirect if no token
      return;
    }

    const fetchOrderData = async () => {
      setLoading(true);

      try {
        const response = await axios.post(
          API_URL,
          { orderId: id },
          {
            headers: { Authorization: `Bearer ${savedToken}` },
          }
        );
        const orderData = response.data.data || {};
        // console.log(orderData);

        setOrderNo(orderData.orderNo || "");
        // setOrderDate(orderData.orderDate || "");
         setOrderDate(formatDateToLocal(orderData.orderDate));
        setPromiseDate(formatDateToLocal(orderData.promiseDate));
        setRequiredDesignCount(orderData.requiredDesignCount || "");
        setExpectedGrossWt(orderData.expectedGrossWt || "");
        setExpectedNetWt(orderData.expectedNetWt || "");
        setRemarks(orderData.remarks || "");
        setDiamondRange(orderData.diamondRange || "");
        setColorStoneRange(orderData.colorStoneRange || "");
        setPriority(orderData.priority || "");
        setIsItemReceived(orderData.isItemReceived || "");
        setStatus(orderData.status || "");
        setOrderStatus(orderData.orderStatus || "");
        setCustomerName(orderData["Customer.id"] || "");
        setProductType(orderData["ProductType.id"] || "");
        setGender(orderData["Gender.id"] || "");
        setCategoryGroup(orderData["categoryGroup.id"] || "");
        setCategoryName(orderData["Category.id"] || "");
        setSubcategoryName(orderData["Subcategory.id"] || "");
        setBrandName(orderData["Brand.id"] || "");
        setStyleName(orderData["Style.id"] || "");
        setOccasion(orderData["Occasion.id"] || "");
        setMetalType(orderData["MetalType.id"] || "");
        setMetalColor(orderData["MetalColor.id"] || "");
        console.log(productType);
      } catch (err) {
        setError("Failed to fetch order data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const savedToken = Cookies.get("authToken");

      if (!savedToken) {
        Swal.fire({
          icon: "error",
          title: "Unauthorized",
          text: "Authorization token not found.",
        });
        return;
      }
      const result = await Swal.fire({
              title: "Do You Want To Save Changes?",
              icon: "question",
              showCancelButton: true,
              confirmButtonText: "Yes, Save It!",
              cancelButtonText: "No, Cancel",
            });
      
            if (!result.isConfirmed) {
              // If the user cancels, do nothing
              return;
            }

       // Date validation
          const hasStartDate = orderDate && orderDate.trim() !== "";
          const hasEndDate = promiseDate && promiseDate.trim() !== "";
      
          if ((hasStartDate || hasEndDate) && !(hasStartDate && hasEndDate)) {
            Swal.fire({
              icon: "warning",
              title: "Dates Required",
              text: "Both Order Date and Promise Date are required if one is provided.",
            });
            return;
          }
      
          if (hasStartDate && hasEndDate && new Date(promiseDate) < new Date(orderDate)) {
            Swal.fire({
              icon: "error",
              title: "Invalid Dates",
              text: "Promise Date cannot be before Order Date. Please correct the dates.",
            });
            return;
          }
          

      const payload = {
        orderNo,
        requiredDesignCount: parseFloat(requiredDesignCount) || 0, // Handle float
        expectedGrossWt: parseFloat(expectedGrossWt) || 0,
        expectedNetWt: parseFloat(expectedNetWt) || 0,
        remarks,
        diamondRange,
        colorStoneRange,
        priority,
        isItemReceived,
        status,
        orderStatus,
        customerId: customerName,
        productTypeId: productType,
        genderId: gender,
        categoryGroupId: categoryGroup,
        categoryId: categoryName,
        subcategoryId: subcategoryName,
        brandId: brandName,
        styleId: styleName,
        occasionId: occasion,
        metalTypeId: metalType,
        metalColorId: metalColor,
      };

      if (hasStartDate) {
        payload.orderDate = orderDate; // Already in YYYY-MM-DD
      }
      if (hasEndDate) {
        payload.promiseDate = promiseDate; // Already in YYYY-MM-DD
      }


      const response = await axios.put(
        window.url + `order/editOrder/${id}`,
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
        title: "Success!",
        text: "Order Updated Successfully.",
      }).then(() => {
        navigate("/pdLists");
      });
    } catch (error) {
      let errorMessage = "Error updating order.";
      if (error.response) {
        errorMessage = error.response.data.message || errorMessage;
      }
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: errorMessage,
      });
    }
  };
  const handleSelectChange = (event) => {
    setProductType(event.target.value);
  };

  const disabledPastDates = (orderDate) => {
    // Disable dates before today
    return orderDate && orderDate < moment().startOf("day");
  };
  return (
    <main className="main-content">
   
    <Content>
        <div className="">
          <div className="page-inner">
            <div className="page-header">{/* <h5>Edit Render</h5> */}</div>
            <div className="card">
              {/* Card Header */}
              <div className="card-header">
                <center>
                  <h6>Edit PD </h6>
                </center>
              </div>

              <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}
                {loading ? (
                  <div>Loading...</div>
                ) : (
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      {/* Order No */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Order No</label>
                          <input
                            type="text"
                            className="form-control"
                            value={orderNo}
                            onChange={(e) => setOrderNo(e.target.value)}
                            disabled
                          />
                        </div>
                      </div>

                      {/* Order Date */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Order Date</label>
                           <input
                        type="date"
                        className="form-control"
                        id="startDateInput"
                        value={orderDate}
                        onChange={(e) => setOrderDate(e.target.value)}
                        placeholder="Select a date"
                        disabled
                      />
                          {/* <input
                            type="text"
                            className="form-control"
                            value={orderDate}
                            onFocus={(e) => (e.target.type = "date")} // Change to date picker when focused
                            onChange={(e) => setOrderDate(e.target.value)}
                            placeholder="Select a date"
                            disabled
                          /> */}
                        </div>
                      </div>

                      {/* Promise Date */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Promise Date</label>

                          {/* <input
                                                    type="date"
                                                    className="form-control"
                                                    name="date_of_joining"
                                                    value={promiseDate}
                                                    onChange={handleChange}
                                                /> */}

                          {/* <input
                            type="date"
                            className="form-control"
                            value={promiseDate}
                            onChange={(e) => setPromiseDate(e.target.value)}
                            min={orderDate} // Restrict to dates after start date
                            disabled={!orderDate} // Disable until start date is selected
                            required
                          /> */}
                          <input
                        type="date"
                        className="form-control"
                        id="endDateInput"
                        value={promiseDate}
                        onChange={(e) => setPromiseDate(e.target.value)}
                        min={orderDate}
                        disabled={!orderDate}
                      />
                          {/* <input
                            type="text"
                            className="form-control"
                            value={promiseDate}
                            onFocus={(e) => (e.target.type = "date")} // Change to date picker when focused
                            onChange={(e) => setPromiseDate(e.target.value)}
                            placeholder="Select a date"
                            disabledDate={disabledPastDates}
                            required
                          /> */}
                        </div>
                      </div>

                      {/* Required Design Count */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Required Design Count</label>
                          <input
                            type="number"
                            className="form-control"
                            value={requiredDesignCount}
                            min={1}
                            onChange={(e) =>
                              setRequiredDesignCount(e.target.value)
                            }
                          />
                        </div>
                      </div>

                      {/* Product Type */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Product Type</label>
                          <select
                            className="form-control"
                            value={productType}
                            onChange={handleSelectChange}
                          >
                            <option value="">Select Product Type</option>
                            {productType_Array.map((type) => (
                              <option key={type.id} value={type.id}>
                                {type.product_types}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Gender</label>
                          <select
                            className="form-control"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            required
                          >
                            <option value="">Select Gender</option>
                            {gender_Array.map((gen) => (
                              <option key={gen.id} value={gen.id}>
                                {gen.gender}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Category Group */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Category Group</label>
                          <select
                            className="form-control"
                            value={categoryGroup}
                            onChange={(e) => setCategoryGroup(e.target.value)}
                            required
                          >
                            <option value="">Select Category Group</option>
                            {categoryGroup_Array.map((group) => (
                              <option key={group.id} value={group.id}>
                                {group.category_group_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {/* Category */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Category</label>
                          <select
                            className="form-control"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            required
                          >
                            <option value="">Select Category</option>
                            {category_Array.map((group) => (
                              <option key={group.id} value={group.id}>
                                {group.category_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Style Name */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Style Name</label>
                          <select
                            className="form-control"
                            value={styleName}
                            onChange={(e) => setStyleName(e.target.value)}
                            required
                          >
                            <option value="">Select Style</option>
                            {style_Array.map((style) => (
                              <option key={style.id} value={style.id}>
                                {style.style_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Occasion */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Occasion</label>
                          <select
                            className="form-control"
                            value={occasion}
                            onChange={(e) => setOccasion(e.target.value)}
                            required
                          >
                            <option value="">Select Occasion</option>
                            {occasion_Array.map((occas) => (
                              <option key={occas.id} value={occas.id}>
                                {occas.occasion}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Metal Type */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Metal Type</label>
                          <select
                            className="form-control"
                            value={metalType}
                            onChange={(e) => setMetalType(e.target.value)}
                            required
                          >
                            <option value="">Select Metal Type</option>
                            {metalType_Array.map((metal) => (
                              <option key={metal.id} value={metal.id}>
                                {metal.material_class}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Metal Color */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Metal Color</label>
                          <select
                            className="form-control"
                            value={metalColor}
                            onChange={(e) => setMetalColor(e.target.value)}
                            required
                          >
                            <option value="">Select Metal Color</option>
                            {metalColor_Array.map((color) => (
                              <option key={color.id} value={color.id}>
                                {color.metal_color_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Expected Gross Weight */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Expected Gross Weight</label>
                          <input
                            type="number"
                            className="form-control"
                            value={expectedGrossWt}
                            // min={0}
                            pattern="^\d*\.?\d{0,2}$" // Allows numbers with up to 2 decimal places
                            onChange={(e) => setExpectedGrossWt(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Expected Net Weight */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Expected Net Weight</label>
                          <input
                            type="number"
                            className="form-control"
                            value={expectedNetWt}
                            // min={0}
                            pattern="^\d*\.?\d{0,2}$" // Allows numbers with up to 2 decimal places
                            onChange={(e) => setExpectedNetWt(e.target.value)}
                          />
                        </div>
                      </div>
                      {/* Brand Name */}
                      <div className="col-md-3">
                        <div className="form-group">
                          <label>Brand Name</label>
                          <select
                            className="form-control"
                            value={brandName}
                            onChange={(e) => setBrandName(e.target.value)}
                            required
                          >
                            <option value="">Select Brand</option>
                            {brand_Array.map((brand) => (
                              <option key={brand.id} value={brand.id}>
                                {brand.brand_name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Remarks */}
                      <div className="col-md-12">
                        <div className="form-group">
                          <label>Remarks</label>
                          <textarea
                            className="form-control"
                            rows="3"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                          ></textarea>
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <center>
                      <div className="form-group mt-3">
                        <button
                          className="btn "
                          style={{ backgroundColor: "#2E1A47", color: "white" }}
                          type="submit"
                        >
                          Save Changes
                        </button>
                      </div>
                    </center>
                  </form>
                )}
              </div>
            </div>
           
          </div>
        </div>
        </Content>
    <Footer />
  </main>
  );
}

export default EditPd;
