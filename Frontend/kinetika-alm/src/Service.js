import axios from "axios";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import Environment from "./environment";
// Base URL for the API
export const API_BASE_URL = Environment.server_url;

export let UserDataFromToken;

let token;
let apiClient;

apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});

export const getToken = () => {
  token = JSON.parse(localStorage.getItem("token"));
  // console.log("token after reload: ", token);

  apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });
};


export const getUserType = () => {
  getUserDetails();
  if (UserDataFromToken) {
    // console.log("UserData: ", UserDataFromToken);

    return UserDataFromToken.type;
  }
};

export const getUserDetails = () => {
  const token = JSON.parse(localStorage.getItem("token"));
  if (token) {
    UserDataFromToken = jwtDecode(token);
    // console.log("User Data: ", UserDataFromToken);
  }

  return UserDataFromToken;
};

export const logout = async () => {
  localStorage.clear();
  toast.success("Logged out successfully!!");
  setTimeout(() => {
    window.location.href = "/";
  }, 500);
};

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
      toast.success(response.message);
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
      toast.success(response.message);
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
    toast.success(response.message);
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
    toast.success(response.message);
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

export const getUserList = async (endpoint) => {
  try {
  //   getToken();
    const response = await apiClient.get(endpoint);

    // console.log("Response is: ", response);
    return response.data;
  } catch (error) {
    errorHandle(error);
  }
};

export const CloudinaryImage = async (endpoint, data) => {
  try {
    // getToken();
    const response = await apiClient.put(endpoint, data);
    toast.success(response.message);
    return response.data;
  } catch (error) {
    errorHandle(error);
    throw error;
  }
};

export const addUser = async (endpoint, data) => {
  try {
  //   getToken();
    const response = await apiClient.post(endpoint, data);
    toast.success(response.message);
    // console.log("Response is: ", response);
    return response.data;
  } catch (error) {
    errorHandle(error);
  }
};