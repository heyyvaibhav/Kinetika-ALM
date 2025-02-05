import axios from "axios";
import { toast } from "react-toastify";
// import { jwtDecode } from "jwt-decode";
// Base URL for the API
const API_BASE_URL = "http://localhost:5000/api/";

//ADD staging url here
// const API_BASE_URL = "";

export let UserDataFromToken;

// let token;
let apiClient;

apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    // Authorization: `Bearer ${token}`,
  },
});

const errorHandle = (error) => {
    if (error.response && error.response.data && error.response.data.message) {
      if (error.response.data.message === "Invalid or expired token.") {
        // console.log("Inside token error");
  
        toast.error("Error occurred: " + error.response.data.message);
        setTimeout(() => {
        //   logout();
        }, 1000);
        // Navigate to login page or wherever necessary
      } else {
        toast.error("Error occurred: " + error.response.data.message);
      }
    } else {
      // Generic error message
      toast.error(
        "An unexpected error occurred:  " + error.response.data.error[0].msg
      );
      // console.log("Error: ", error);
    }
    console.error("Error fetching data: ", error.message);
    // throw error;
};

export const createProject = async (endpoint, data) => {
    try {
    //   getToken();
      const response = await apiClient.post(endpoint, data);
  
      // console.log("Response is: ", response);
      return response.data;
    } catch (error) {
      errorHandle(error);
    }
};

export const getProject = async (endpoint) => {
    try {
    //   getToken();
      const response = await apiClient.get(endpoint);
  
      // console.log("Response is: ", response);
      return response.data;
    } catch (error) {
      errorHandle(error);
    }
};

export const getIssuesByProjectID = async (endpoint) => {
    try {
    //   getToken();
      const response = await apiClient.get(endpoint);
  
      // console.log("Response is: ", response);
      return response.data;
    } catch (error) {
      errorHandle(error);
    }
};

export const updateIssueStatus = async (endpoint, data) => {
    try {
    //   getToken();
      const response = await apiClient.put(endpoint, data);
  
      // console.log("Response is: ", response);
      return response.data;
    } catch (error) {
      errorHandle(error);
    }
};

export const createIssue = async (endpoint, data) => {
  try {
  //   getToken();
    const response = await apiClient.post(endpoint, data);

    // console.log("Response is: ", response);
    return response.data;
  } catch (error) {
    errorHandle(error);
  }
};

export const addComment = async (endpoint, data) => {
  try {
  //   getToken();
    const response = await apiClient.post(endpoint, data);

    // console.log("Response is: ", response);
    return response.data;
  } catch (error) {
    errorHandle(error);
  }
};

export const getComments = async (endpoint) => {
  try {
  //   getToken();
    const response = await apiClient.get(endpoint);

    // console.log("Response is: ", response);
    return response.data;
  } catch (error) {
    errorHandle(error);
  }
};