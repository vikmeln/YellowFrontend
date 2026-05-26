import { useState, useEffect } from "react";
import ProductCard from "./ProductCard";
import { getProducts } from "../services/product";
import "./ProductList.css";

export default function ProductList() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      alert("Ошибка при получении данных товаров");
    }
  };

  return (
    <div className="grid">
      {products.length === 0 ? (
        <p>Нет товаров</p>
      ) : (
        products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))
      )}
    </div>
  );
}
