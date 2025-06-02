import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Card, Image, Button, Form, Input, Select } from "antd";
import OIP from "../DewAlbum/OIP.jpg";
import OTP from "../DewAlbum/otp2.png";
import "../DewAlbum/Feedback.css";
import dewicon from "../DewAlbum/dew-icon.webp";
import Swal from "sweetalert2";

function Feedback() {
  const location = useLocation();
  const navigate = useNavigate();
  const { customer_id } = useParams();
  const [design, setDesign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const MeratiType_Url = window.url + "/materialItems/metalType";
  const Color_URL = window.url + "materialItems/metalColor";
  const [material_array, setMaterialType] = useState([]);
  const [color_array, SetColorArray] = useState([]);
  const [selectedMetalType, setSelectedMetalType] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [form] = Form.useForm(); // Access the form instance

  useEffect(() => {
    if (!customer_id) return;

    // const savedToken = Cookies.get("authToken");
    // if (!savedToken) {
    //   navigate("/");
    //   return;
    // }

    const fetchDesign = async () => {
      try {
        const response = await axios.get(
          `${window.url}customerAlbums/getDesignById/${customer_id}`,
          {
            // headers: {
            //   Authorization: `Bearer ${savedToken}`,
            // },
          }
        );

        const customerData = response.data.data;
        if (!customerData) {
          setError("No design found for this customer.");
        } else {
          setDesign(customerData);
        }
      } catch (err) {
        setError("Failed to fetch customer data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const getMetalType_Data = async () => {
      try {
        const response = await axios.get(MeratiType_Url, {
          // headers: {
          //   Authorization: `Bearer ${Cookies.get("authToken")}`,
          // },
        });
        setMaterialType(response.data.data || []);
      } catch (err) {
        console.error(`Failed to fetch material types: ${err.message}`);
      }
    };

    const getColorData = async () => {
      try {
        const response = await axios.get(Color_URL, {
          // headers: {
          //   Authorization: `Bearer ${Cookies.get("authToken")}`,
          // },
        });
        SetColorArray(response.data.data || []);
      } catch (err) {
        console.error(`Failed to fetch colors data: ${err.message}`);
      }
    };

    fetchDesign();
    getMetalType_Data();
    getColorData();
  }, [customer_id, navigate]);

  const handleMetalTypeChange = (value) => {
    setSelectedMetalType(value);
  };

  const handleColorChange = (value) => {
    setSelectedColor(value);
  };

  const onFinish = async (values) => {
    const data = {
      orderId: design?.Order?.id,
      cadId: design?.Cad?.id,
      sketchId: design?.Sketch?.id,
      renderId: 5,
      designId: design?.id,
      customerId: design?.Order?.customerId,
      imageUrls: design?.imageUrls || [],
      remarks: values.feedback,
      metalTypeId: selectedMetalType,
      metalColorId: selectedColor,
    };

    try {
      const response = await axios.post(
        `${window.url}customerAlbums/addCustomerFeedback`,
        data,
        {
          // headers: {
          //   Authorization: `Bearer ${Cookies.get("authToken")}`,
          //   "Content-Type": "application/json",
          // },
        }
      );
      console.log("Response:", response.data);
      Swal.fire({
        icon: "success",
        title: "Feedback Submitted",
        text: "Your feedback has been submitted successfully!",
      });
      // Reset the form
      form.resetFields();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Submission Failed",
        text: "Failed to submit feedback. Please try again later.",
      });
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div style={{ backgroundColor: "#080808", minHeight: "100vh", padding: "20px" }}>
      <Image alt="Customer Design" src={dewicon} style={{ width: "15%" }} />
      <div className="container">
        <div className="row">
          {/* Column 1: Image Box */}
          <div className="col-12 col-md-6">
            <Card
              hoverable
              cover={<Image alt="Customer Design" src={design?.imageUrls[0] || OIP} />}
              style={{ width: "80%", textAlign: "center" }}
            >
              <h3>Design No: {design?.designNo}</h3>
            </Card>
          </div>

          {/* Column 2: Feedback Form */}
          <div className="col-12 col-md-6">
            <Card className="feedback-card">
              <h3 className="feedback-title">💬 Leave Your Feedback</h3>
              <Form name="feedback" initialValues={{ remember: true }} onFinish={onFinish} form={form} className="feedback-form">
                <Form.Item label="Metal Type" name="metalType" rules={[{ required: true, message: "Please select a metal type!" }]} className="feedback-form-item">
                  <Select defaultValue={design?.Order?.MetalType?.name} className="feedback-select" onChange={handleMetalTypeChange}>
                    {material_array.map((item) => (
                      <Select.Option key={item.id} value={item.name}>
                        {item.metal_type}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label="Color" name="color" rules={[{ required: true, message: "Please select a color!" }]} className="feedback-form-item">
                  <Select defaultValue={design?.Order?.MetalColor?.name} className="feedback-select" onChange={handleColorChange}>
                    {color_array.map((item) => (
                      <Select.Option key={item.id} value={item.name}>
                        {item.metal_color_name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item label="Your Feedback" name="feedback" rules={[{ required: true, message: "Please input your feedback!" }]} className="feedback-form-item">
                  <Input.TextArea rows={4} className="feedback-textarea" placeholder="Share your thoughts..." />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" htmlType="submit" block className="feedback-button">
                    🚀 Submit Feedback
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        </div>

        {/* Specifications Section */}
        <div className="specifications-container">
          <h3>Specifications</h3>
          <p>
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry’s standard dummy text ever since the 1500s.
          </p>
        </div>

        {/* Order Details Table */}
        <div className="row mt-4">
          <div className="col-12">
            <Card title="Order Details">
              <div className="table-wrapper">
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Order No</th>
                      <th>Order Date</th>
                      <th>Category</th>
                      <th>Subcategory</th>
                      <th>Expected NetWt</th>
                      <th>Brand</th>
                      <th>Metal Type</th>
                      <th>Metal Color</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td data-label="Order No">{design?.Order?.orderNo}</td>
                      <td data-label="Order Date">{new Date(design?.Order?.orderDate).toLocaleDateString()}</td>
                      <td data-label="Category">{design?.Order?.Category?.name}</td>
                      <td data-label="Subcategory">{design?.Order?.Subcategory?.name}</td>
                      <td data-label="Subcategory">{design?.Order?.expectedNetWt}</td>
                      <td data-label="Brand">{design?.Order?.Brand?.name}</td>
                      <td data-label="Metal Type">{design?.Order?.MetalType?.name}</td>
                      <td data-label="Metal Color">{design?.Order?.MetalColor?.name}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Feedback;
