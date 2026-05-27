import "./ProductList.css";
import ProductCard from "./ProductCard";

export default function ProductList({
  products,
  categories,
  onAddToCart,
}: any) {
  if (!products.length) {
    return <div className="empty-state">Товары не найдены.</div>;
  }

  return (
    <div className="product-grid">
      {products.map((product: any) => (
        <ProductCard
          key={product.id}
          product={product}
          categories={categories}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}
