import axios from "axios";
import React, { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../Accounts/Login.css";
import dewicon from "../Accounts/dew-icon.webp";
import { Card, Button, Form, Input } from "antd";

const Login = () => {
  const [form] = Form.useForm();
  // const url = import.meta.env.VITE_API_URL;
  const [warningMessage, setWarningMessage] = useState("");
  const navigate=useNavigate()
  const handleSubmit = async (values) => {
    try {
      console.log("Form Values: ", values);
      const response = await axios.post(window.url +"/login", {
        email: values.email,
        password: values.password,
      });
      console.log("Login response:", response.data.token);
      const username = response.data.user;
      const umail= response.data.email;
      // alert(username)
      Cookies.set("username", username, { expires: 1 });
      Cookies.set("user_mail", umail, { expires: 1 });

      Cookies.set("authToken", response.data.token, { expires: 1 });
      navigate("/")
      window.location.reload();
    } catch (error) {
      if (error.response) {
        setWarningMessage("Invalid login credentials");
      } else if (error.request) {
        setWarningMessage("No response from server. Please try again.");
      } else {
        setWarningMessage("An error occurred. Please try again.");
      }
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="col-6 image-container">
            <img alt="Logo" src={dewicon} className="login-image" />
          </div>
          <div className="col-6 form-container">
            <Card hoverable className="card">
              <br></br>
              <h3 className="login-title">Welcome Back</h3>
              <div className="warning-container">
                {warningMessage && (
                  <div className="alert alert-danger" role="alert">
                    {warningMessage}
                  </div>
                )}
              </div>
              <Form
                form={form}
                name="login_form"
                onFinish={handleSubmit}
                layout="vertical"
              >
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: "Please enter your email!" },
                    { type: "email", message: "Please enter a valid email!" },
                  ]}
                >
                  <Input placeholder="Enter Email" className="login-input" />
                </Form.Item>

                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: "Please enter your password!" },
                  ]}
                >
                  <Input.Password
                    placeholder="Enter Password"
                    className="login-input"
                  />
                </Form.Item>

                <Form.Item>
                  <Button
                    type="primary"
                    block
                    htmlType="submit"
                    className="login-btn"
                  >
                    Login
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;