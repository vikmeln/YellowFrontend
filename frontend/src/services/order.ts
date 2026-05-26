import api from "../services/axios";
import API_URLS from "./api";

export const createOrder = async () => {
  const res = await api.post(`${API_URLS.order}/orders`);
  return res.data;
};

export const getOrders = async () => {
  const res = await api.get(`${API_URLS.order}/orders/my`);
  return res.data;
};

export const cancelOrder = async (orderId: number) => {
  const res = await api.patch(`${API_URLS.order}/orders/${orderId}/cancel`);
  return res.data;
};
