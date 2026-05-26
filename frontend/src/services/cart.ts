import api from "../services/axios";
import API_URLS from "./api";

export const addToCart = (productId: number, quantity: number) =>
  api.post(`${API_URLS.cart}/cart`, { productId, quantity });

export const getCart = async () => {
  const res = await api.get(`${API_URLS.cart}/cart`);
  return res.data;
};

export const removeFromCart = (productId: number) =>
  api.delete(`${API_URLS.cart}/cart/${productId}`);

export const updateCartQuantity = (productId: number, quantity: number) =>
  api.patch(`${API_URLS.cart}/cart/${productId}?quantity=${quantity}`);

export const clearCart = () => api.delete(`${API_URLS.cart}/cart`);

export const createOrder = async () => {
  const res = await api.post(`${API_URLS.order}/orders`);
  return res.data;
};
