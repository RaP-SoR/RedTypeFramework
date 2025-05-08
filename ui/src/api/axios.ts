import axios, { type AxiosInstance } from "axios";
import { API_BASE_URL, API_TIMEOUT } from "../config";

const api: AxiosInstance = axios.create({
   baseURL: API_BASE_URL,
   timeout: API_TIMEOUT,
});

export default api;
