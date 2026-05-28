import { useEffect, useState } from "react";
import "./OrderModal.css";
import { getErrorMessage, orderApi, statusLabel } from "../services/api";

export default function OrdersModal({ onClose, refreshKey }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function formatPrice(value: number) {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value || 0);
  }

  async function loadOrders() {
    setError("");
    setLoading(true);
    try {
      const data: any = await orderApi.my();
      setOrders(data || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, [refreshKey]);

  async function cancelOrder(id: number) {
    try {
      await orderApi.cancel(id);
      await loadOrders();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal wide-modal">
        <div className="modal-header">
          <h2>Мои заказы</h2>

          <button className="icon-button" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <p className="error-box">{error}</p>}

        {loading && <p>Загрузка...</p>}

        {!loading && !orders.length && (
          <div className="empty-state">Заказов пока нет.</div>
        )}

        <div className="stack">
          {orders.map((order) => {
            const currentStatus = statusLabel(order.status);
            const canCancel =
              currentStatus === "Created" || currentStatus === "Paid";

            return (
              <article className="order-card" key={order.id}>
                <div className="order-head">
                  <div>
                    <h3>Заказ</h3>

                    <p className="muted">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleString("ru-RU")
                        : "Дата не указана"}
                    </p>
                  </div>

                  <span className="badge">{currentStatus}</span>
                </div>

                <div className="modal-footer">
                  <strong>
                    Сумма: {formatPrice(order.totalPrice || order.total || 0)}
                  </strong>

                  {canCancel && (
                    <button
                      className="danger"
                      type="button"
                      onClick={() => cancelOrder(order.id)}
                    >
                      Отменить
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
