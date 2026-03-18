import { API_BASE_URL } from '../config';

export const fetchProducts = async () => {
  const response = await fetch(`${API_BASE_URL}/api/products`);
  return response.json();
};
