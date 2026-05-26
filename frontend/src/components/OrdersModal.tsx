import { useEffect, useState } from "react";
import { getOrders, cancelOrder } from "../services/order";
import "./OrderModal.css";

export default function OrdersModal({ onClose }: any) {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      alert("Ошибка при получении данных заказов");
    }
  };

  const handleCancelOrder = async (orderId: number) => {
    try {
      await cancelOrder(orderId);
      fetchOrders();
      alert("Заказ отменен успешно!");
    } catch (error) {
      alert("Ошибка при отмене заказа");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Мои Заказы</h2>
        {orders.length === 0 ? (
          <p>У вас нет заказов</p>
        ) : (
          orders.map((order: any) => (
            <div className="order-item" key={order.id}>
              <h3>Заказ</h3>
              <p>Статус: {order.status}</p>
              <p>Дата: {new Date(order.createdAt).toLocaleDateString()}</p>
              <p>Общая сумма: {order.totalPrice} $</p>

              {(order.status === "Created" || order.status === "Paid") && (
                <button
                  onClick={() => handleCancelOrder(order.id)}
                  className="cancel-btn"
                >
                  Отменить заказ
                </button>
              )}
            </div>
          ))
        )}
        <button onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}
