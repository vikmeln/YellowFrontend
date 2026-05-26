import { useEffect, useState } from "react";
import {
  getCart,
  removeFromCart,
  updateCartQuantity,
  createOrder,
} from "../services/cart";
import "./CartModal.css";

export default function CartModal({ onClose }: any) {
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const data = await getCart();
      setCartItems(data);
    } catch (error) {
      alert("Ошибка при получении данных корзины");
    }
  };

  const handleQuantityChange = async (productId: number, quantity: number) => {
    if (quantity < 1) return;

    try {
      await updateCartQuantity(productId, quantity);
      fetchCart();
    } catch (error) {
      alert("Ошибка при обновлении количества товара");
    }
  };

  const handleRemove = async (productId: number) => {
    try {
      await removeFromCart(productId);
      fetchCart();
    } catch (error) {
      alert("Ошибка при удалении товара из корзины");
    }
  };

  const calculateTotal = (cartItems: any[]) => {
    let total = 0;
    cartItems.forEach((item) => {
      total += item.price * item.quantity;
    });
    return total.toFixed(2);
  };

  const handleOrder = async () => {
    try {
      await createOrder();
      alert("Заказ оформлен успешно!");
      onClose();
    } catch (error) {
      alert("Ошибка при оформлении заказа");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Корзина</h2>
        {cartItems.length === 0 ? (
          <p>Ваша корзина пуста</p>
        ) : (
          cartItems.map((item: any) => (
            <div className="cart-item" key={item.productId}>
              <div className="cart-item-info">
                <h3 className="cart-item-title">{item.name}</h3>
                <p className="cart-item-price">{item.price} $</p>
              </div>
              <div className="cart-item-quantity">
                <button
                  onClick={() =>
                    handleQuantityChange(item.productId, item.quantity - 1)
                  }
                >
                  -
                </button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) =>
                    handleQuantityChange(
                      item.productId,
                      Math.max(parseInt(e.target.value) || 1, 1),
                    )
                  }
                />
                <button
                  onClick={() =>
                    handleQuantityChange(item.productId, item.quantity + 1)
                  }
                >
                  +
                </button>
              </div>
              <button
                onClick={() => handleRemove(item.productId)}
                className="remove-btn"
              >
                ✖
              </button>
            </div>
          ))
        )}
        <div className="total">
          <h3>Общая сумма: {calculateTotal(cartItems)} $</h3>
        </div>
        {cartItems.length > 0 && (
          <button onClick={handleOrder} className="order-btn">
            Оформить заказ
          </button>
        )}
        <button onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}
