import axios from "axios";
import Cookies from "js-cookie";

import { addFilteredPdLists, addPdLists } from "../../reducers/pdListReducer";

const token = Cookies.get("authToken");
const url = process.env.REACT_APP_API_KEY;
// const url=window.url
export const getItemsFromApi = async (setPdFetchItems) => {
//  alert(url)
  try {
    const customerResponse = await axios.get(`${url}customer/getAllCustomers`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    setPdFetchItems((prev) => ({
      ...prev,
      customerData: customerResponse?.data?.data,
    }));

    const productResponse = await axios.get(`${url}misc/productType`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    setPdFetchItems((prev) => ({
      ...prev,
      productTypeData: productResponse?.data?.data,
    }));

    const genderResponse = await axios.get(`${url}misc/gender`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    setPdFetchItems((prev) => ({
      ...prev,
      genderData: genderResponse?.data?.data,
    }));

    const categoryGroupResponse = await axios.get(
      `${url}category/categoryGroup`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setPdFetchItems((prev) => ({
      ...prev,
      categoryGroupData: categoryGroupResponse?.data?.data,
    }));

    const brandResponse = await axios.get(`${url}misc/brands`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    setPdFetchItems((prev) => ({
      ...prev,
      brandData: brandResponse?.data?.data,
    }));

    const styleResponse = await axios.get(`${url}misc/styles`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    setPdFetchItems((prev) => ({
      ...prev,
      styleData: styleResponse?.data?.data,
    }));

    const occasionResponse = await axios.get(`${url}misc/occasion`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    setPdFetchItems((prev) => ({
      ...prev,
      occasionData: occasionResponse?.data?.data,
    }));

    const MaterialTypeResponse = await axios.get(
      `${url}materialItems/materialType`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setPdFetchItems((prev) => ({
      ...prev,
      materialTypeData: MaterialTypeResponse?.data?.data,
    }));

    const MaterialColorResponse = await axios.get(
      `${url}materialItems/metalColor`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    setPdFetchItems((prev) => ({
      ...prev,
      materialColorData: MaterialColorResponse?.data?.data,
    }));
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

export const changeInputs = async (
  setPdItems,
  pdItems,
  setSelectedCustomer,
  setCategories,
  setSubtegories
) => {
  try {
    if (pdItems.customerId) {
      const customer = await axios(`${url}customer/${pdItems.customerId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      setSelectedCustomer(customer?.data?.data);
    }
    if (pdItems?.categoryGroupId) {
      const category = await axios.post(
        `${url}category/getAllcategories`,
        { categoryGroupId: pdItems?.categoryGroupId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCategories(category?.data?.data);
    }

    if (pdItems?.categoryId) {
      const subCategories = await axios.post(
        `${url}category/getAllSubcategories`,
        { categoryId: pdItems?.categoryId },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSubtegories(subCategories?.data?.data);
    }
  } catch (err) {
    console.error(err);
  }
};

export const createPdOrder = async (pdItems) => {
  try {
    const response = await axios.post(`${url}order/createOrder`, pdItems, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error; // Rethrow or return a custom error message if necessary
  }
};

export const uploadImage = async (file, id) => {
  const formData = new FormData();
  formData.append("images", file);
  formData.append("orderId", id);

  try {
    const response = await axios.post(`${url}order/uploadImage`, formData, {
      headers: {
        "Content-Type": "multipart/form-data", // Correct header for file upload
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error("Image upload failed", error);
    return error.response;
  }
};

export const deleteOrder = async (id) => {
  try {
    const response = await axios.delete(`${url}order/deleteOrder/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    console.error("Image upload failed", error);
    throw error;
  }
};

// fetching pd lists

export const getPdLists = async (dispatch) => {
  try {
    const response = await axios.post(
      `${url}order/getAllOrders`,
      {
        page: "1",
        pageSize: 30,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    dispatch(addPdLists(response?.data?.data));
    dispatch(addFilteredPdLists(response?.data?.data));
  } catch (err) {
    console.error(err);
  }
};