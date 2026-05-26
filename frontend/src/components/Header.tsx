import { useState } from "react";
import "./Header.css";
import AuthModal from "./AuthModal";
import CartModal from "./CartModal";
import OrdersModal from "./OrdersModal";
import { getUserRole } from "../utils/auth";

export default function Header() {
  const [showAuth, setShowAuth] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const token = localStorage.getItem("token");
  const role = getUserRole();

  const logout = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  const openCart = () => {
    setShowCartModal(true);
  };

  const closeCart = () => {
    setShowCartModal(false);
  };

  const openOrders = () => {
    setShowOrdersModal(true);
  };

  const closeOrders = () => {
    setShowOrdersModal(false);
  };

  return (
    <>
      <header className="header">
        <div className="logo">yellow</div>
        <input className="search" placeholder="Поиск товаров..." />

        <div className="actions">
          {!token ? (
            <button onClick={() => setShowAuth(true)}>Войти</button>
          ) : (
            <>
              <button onClick={openCart}>Корзина</button>
              <button onClick={openOrders}>Заказы</button>{" "}
              {role === "Admin" && <button>Админ панель</button>}
              <button onClick={logout}>Выйти</button>
            </>
          )}
        </div>
      </header>
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {showCartModal && <CartModal onClose={closeCart} />}
      {showOrdersModal && <OrdersModal onClose={closeOrders} />}
    </>
  );
}
