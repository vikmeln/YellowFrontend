import { useEffect, useMemo, useState } from "react";
import "./CartModal.css";
import { cartApi, getErrorMessage, orderApi } from "../services/api";

export default function CartModal({ onClose, onOrderCreated }: any) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const total = useMemo(() => {
    return items.reduce((sum, item) => {
      return sum + (item.total || item.price * item.quantity);
    }, 0);
  }, [items]);

  function formatPrice(value: number) {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value || 0);
  }

  async function loadCart() {
    setError("");
    setLoading(true);
    try {
      const data: any = await cartApi.get();
      setItems(data || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCart();
  }, []);

  async function updateQuantity(productId: number, quantity: number) {
    const nextQuantity = Math.max(1, quantity);
    setActionLoading(true);
    try {
      await cartApi.updateQuantity(productId, nextQuantity);
      await loadCart();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setActionLoading(false);
    }
  }

  async function removeItem(productId: number) {
    setActionLoading(true);
    try {
      await cartApi.remove(productId);
      await loadCart();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setActionLoading(false);
    }
  }

  async function clearCart() {
    setActionLoading(true);
    try {
      await cartApi.clear();
      await loadCart();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setActionLoading(false);
    }
  }

  async function checkout() {
    setActionLoading(true);
    try {
      await orderApi.create();
      await loadCart();

      if (onOrderCreated) {
        onOrderCreated();
      }
      onClose();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal wide-modal">
        <div className="modal-header">
          <h2>Корзина</h2>

          <button className="icon-button" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <p className="error-box">{error}</p>}

        {loading && <p>Загрузка...</p>}

        {!loading && !items.length && (
          <div className="empty-state">Корзина пустая.</div>
        )}

        {items.length > 0 && (
          <div className="stack">
            {items.map((item) => (
              <div className="cart-row" key={item.productId}>
                <div>
                  <strong>{item.name}</strong>
                  <p className="muted">{formatPrice(item.price)} за 1 шт.</p>
                </div>

                <div className="quantity-control">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                  >
                    −
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                  >
                    +
                  </button>
                </div>

                <strong>
                  {formatPrice(item.total || item.price * item.quantity)}
                </strong>

                <button
                  className="danger"
                  type="button"
                  disabled={actionLoading}
                  onClick={() => removeItem(item.productId)}
                >
                  Удалить
                </button>
              </div>
            ))}

            <div className="modal-footer">
              <button
                className="secondary"
                type="button"
                disabled={actionLoading}
                onClick={clearCart}
              >
                Очистить
              </button>

              <div className="cart-total">Итого: {formatPrice(total)}</div>

              <button
                className="primary"
                type="button"
                disabled={actionLoading || !items.length}
                onClick={checkout}
              >
                Оформить заказ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
