import api from "../services/axios";
import API_URLS from "./api";

export const getProducts = async () => {
  try {
    const res = await api.get(`${API_URLS.product}/products`);
    return res.data;
  } catch (error) {
    console.error("Ошибка при получении продуктов:", error);
    throw error;
  }
};
