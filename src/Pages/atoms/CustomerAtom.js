// atoms/customerAtom.js
import { atom,useSetAtom } from 'jotai';
import {useState,  useEffect } from 'react';
import { useNavigate } from "react-router";
import axios from "axios";
import Cookies from "js-cookie";

// Atom to store customer list
export const customerListAtom = atom([]);

// Custom hook to fetch customers
export const useFetchCustomers = () => {
  const setCustomers = useSetAtom(customerListAtom);
  const CustomerAPI_URL = window.url + "customer/getAllCustomers";
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


    fetchCustomers();
  }, [setCustomers]); // Run once on mount
};