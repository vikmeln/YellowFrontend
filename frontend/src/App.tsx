import { useState } from "react";
import "./App.css";
import Header from "./components/Header";
import AuthModal from "./components/AuthModal";
import CartModal from "./components/CartModal";
import OrdersModal from "./components/OrdersModal";
import Home from "./pages/Home";
import Admin from "./pages/Admin";

import {
  clearToken,
  getSession,
  isAdminSession,
  isCustomerSession,
} from "./utils/auth";

export default function App() {
  const savedSession = getSession();
  const [session, setSession] = useState<any>(() => savedSession);
  const [view, setView] = useState<"catalog" | "admin">(() => {
    if (savedSession && isAdminSession(savedSession)) {
      return "admin";
    }
    return "catalog";
  });

  const [authOpen, setAuthOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0);

  function logout() {
    clearToken();
    setSession(null);
    setView("catalog");
    setCartOpen(false);
    setOrdersOpen(false);
  }

  function changeView(nextView: "catalog" | "admin") {
    if (nextView === "admin") {
      if (!session || !isAdminSession(session)) {
        setAuthOpen(true);
        return;
      }
    }
    setView(nextView);
  }

  function openCart() {
    if (!session) {
      setAuthOpen(true);
      return;
    }
    if (!isCustomerSession(session)) {
      return;
    }
    setCartOpen(true);
  }

  function openOrders() {
    if (!session) {
      setAuthOpen(true);
      return;
    }
    if (!isCustomerSession(session)) {
      return;
    }
    setOrdersOpen(true);
  }

  return (
    <div className="app">
      <Header
        session={session}
        view={view}
        onViewChange={changeView}
        onLoginClick={() => setAuthOpen(true)}
        onLogout={logout}
        onCartClick={openCart}
        onOrdersClick={openOrders}
      />
      {view === "admin" && session && isAdminSession(session) ? (
        <Admin session={session} />
      ) : (
        <Home session={session} onRequireAuth={() => setAuthOpen(true)} />
      )}

      {authOpen && (
        <AuthModal
          onClose={() => setAuthOpen(false)}
          onSuccess={(newSession: any) => {
            setSession(newSession);
            if (isAdminSession(newSession)) {
              setView("admin");
            } else {
              setView("catalog");
            }
          }}
        />
      )}

      {cartOpen && (
        <CartModal
          onClose={() => setCartOpen(false)}
          onOrderCreated={() => setOrdersRefreshKey((key) => key + 1)}
        />
      )}

      {ordersOpen && (
        <OrdersModal
          onClose={() => setOrdersOpen(false)}
          refreshKey={ordersRefreshKey}
        />
      )}
    </div>
  );
}
