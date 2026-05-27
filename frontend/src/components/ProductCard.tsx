import "./ProductCard.css";

export default function ProductCard({ product, categories, onAddToCart }: any) {
  const categoryName =
    categories.find((category: any) => category.id === product.categoryId)
      ?.name || "Без категории";

  function formatPrice(value: number) {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value || 0);
  }

  return (
    <article className="product-card">
      <div className="product-image-wrap">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <span>Нет фото</span>
        )}
      </div>

      <div className="product-content">
        <div>
          <p className="badge">{categoryName}</p>
          <h3>{product.name}</h3>

          <p className="muted">
            {product.description || "Описание пока не добавлено"}
          </p>
        </div>

        <div className="product-footer">
          <strong>{formatPrice(product.price)}</strong>

          <button
            className="primary"
            type="button"
            onClick={() => onAddToCart(product)}
          >
            В корзину
          </button>
        </div>
      </div>
    </article>
  );
}
