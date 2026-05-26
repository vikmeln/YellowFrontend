import "./ProductCard.css";
import { addToCart } from "../services/cart";

export default function ProductCard({ product }: any) {
  const handleAdd = async () => {
    try {
      await addToCart(product.id, 1);
      alert("Добавлено в корзину");
    } catch {
      alert("Нужно войти");
    }
  };

  return (
    <div className="card">
      <div className="image-wrapper">
        <img src={product.imageUrl} alt={product.name} />
      </div>

      <div className="card-content">
        <h3 className="title">{product.name}</h3>

        <p className="description">{product.description}</p>

        <div className="bottom">
          <div className="price">{product.price} $</div>

          <button onClick={handleAdd} className="buy-btn">
            В корзину
          </button>
        </div>
      </div>
    </div>
  );
}
