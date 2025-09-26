import axios from 'axios';

const API_URL = 'http://192.168.0.101:3000';

const axiosInstance = axios.create({
    baseURL: API_URL,
    timeout: 5000,
})

export async function getUser(id, token) {
  if (!id) throw new Error("Missing user id");
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const res = await axiosInstance.get(`/users/${id}`, { headers });
  return res.data;
}

export async function updateUser(id, data, token) {
  if (!id) throw new Error("Missing user id");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  const res = await axiosInstance.patch(`/users/${id}`, data, { headers });
  return res.data;
}


