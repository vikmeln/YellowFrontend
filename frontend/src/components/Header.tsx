import "./Header.css";
import { isAdminSession, isCustomerSession } from "../utils/auth";

export default function Header({
  session,
  view,
  onViewChange,
  onLoginClick,
  onLogout,
  onCartClick,
  onOrdersClick,
}: any) {
  const isAdmin = isAdminSession(session);
  const isCustomer = isCustomerSession(session);

  return (
    <header className="app-header">
      <div className="brand">Yellow Store</div>

      <nav className="nav-actions">
        <button
          className={view === "catalog" ? "active" : ""}
          type="button"
          onClick={() => onViewChange("catalog")}
        >
          Каталог
        </button>

        {isAdmin && (
          <button
            className={view === "admin" ? "active" : ""}
            type="button"
            onClick={() => onViewChange("admin")}
          >
            Админка
          </button>
        )}

        {isCustomer && (
          <>
            <button type="button" onClick={onCartClick}>
              Корзина
            </button>

            <button type="button" onClick={onOrdersClick}>
              Мои заказы
            </button>
          </>
        )}

        {session ? (
          <>
            <span className="user-pill">{session.role || "User"}</span>

            <button className="secondary" type="button" onClick={onLogout}>
              Выйти
            </button>
          </>
        ) : (
          <button className="primary" type="button" onClick={onLoginClick}>
            Войти
          </button>
        )}
      </nav>
    </header>
  );
}
