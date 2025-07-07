// atoms/customerAtom.js
import { atom,useSetAtom } from 'jotai';
import {useState,  useEffect } from 'react';
import { useNavigate } from "react-router";
import axios from "axios";
import Cookies from "js-cookie";

// Atom to store customer list
export const customerListAtom = atom([]);
export const designerListAtom = atom([]);

// Custom hook to fetch customers
export const useFetchCustomers = () => {
  const setCustomers = useSetAtom(customerListAtom);
  const setDesigners = useSetAtom(designerListAtom);
  const CustomerAPI_URL = window.url + "customer/getAllCustomers";
  const DesignerAPI_URL = window.url + "auth/getUsersByRoleType"; // Adjust endpoint as needed
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const handleError = (err) => {
      const message = err.response?.data?.message || err.message;
      setError(`Failed to fetch data: ${message}`);
      if (message === "Token expired, please login again") {
        Cookies.remove("authToken");
        navigate("/");
      }
    };
  useEffect(() => {
    const fetchCustomers = async () => {
     try {
      const response = await axios.get(CustomerAPI_URL, {
        headers: { Authorization: `Bearer ${Cookies.get("authToken")}` },
      });
      setCustomers(response.data.data || []);
     
    } catch (err) {
      handleError(err);
    }
  };
  const fetchDesigners = async () => {
       const savedToken = Cookies.get("authToken");
    try {
      const requestData = { type: "productDevelopment" };
      const response = await axios.post(DesignerAPI_URL, requestData, {
        headers: {
          Authorization: `Bearer ${savedToken}`,
          "Content-Type": "application/json",
        },
      });
      setDesigners(response.data.data || []);
    } catch (err) {
      console.error(`Failed to fetch setting types: ${err.message}`);
    }
    };


    fetchCustomers();
    fetchDesigners();
  }, [setCustomers,setDesigners]); // Run once on mount
};