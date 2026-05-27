import { useEffect, useMemo, useState } from "react";
import type { SyntheticEvent } from "react";
import "./Admin.css";
import {
  categoryApi,
  getErrorMessage,
  orderApi,
  orderStatuses,
  productApi,
  statusLabel,
  statusToNumber,
  userApi,
} from "../services/api";
import { isAdminSession } from "../utils/auth";

const emptyProductForm = {
  id: undefined,
  name: "",
  description: "",
  price: "1",
  stock: "0",
  imageUrl: "",
  categoryId: "",
  isActive: true,
};

export default function Admin({ session }: any) {
  const [tab, setTab] = useState<
    "products" | "categories" | "orders" | "users"
  >("products");
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [productForm, setProductForm] = useState<any>(emptyProductForm);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const isAdmin = isAdminSession(session);

  const categoryById = useMemo(() => {
    return new Map(categories.map((category) => [category.id, category.name]));
  }, [categories]);

  function formatPrice(value: number) {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    }).format(value || 0);
  }

  async function loadAdminData() {
    if (!isAdmin) {
      return;
    }
    setError("");
    setLoading(true);
    try {
      const [productsData, categoriesData, ordersData, usersData]: any =
        await Promise.all([
          productApi.getAdmin(),
          categoryApi.getAll(),
          orderApi.all(),
          userApi.getAll(),
        ]);
      setProducts(productsData || []);
      setCategories(categoriesData || []);
      setOrders(ordersData || []);
      setUsers(usersData || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, [isAdmin]);

  if (!isAdmin) {
    return (
      <main className="page-shell">
        <div className="empty-state">
          Админ-панель доступна только пользователю с ролью Admin.
        </div>
      </main>
    );
  }

  function createProductPayload() {
    return {
      name: productForm.name.trim(),
      description: productForm.description.trim() || null,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      imageUrl: productForm.imageUrl.trim() || null,
      categoryId: Number(productForm.categoryId),
    };
  }

  async function saveProduct(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const payload = createProductPayload();
      if (!payload.name) {
        throw new Error("Введите название товара.");
      }
      if (payload.price <= 0) {
        throw new Error("Цена должна быть больше 0.");
      }
      if (payload.stock < 0) {
        throw new Error("Количество не может быть отрицательным.");
      }
      if (!payload.categoryId) {
        throw new Error("Выберите категорию товара.");
      }
      if (productForm.id) {
        await productApi.update(productForm.id, {
          ...payload,
          isActive: productForm.isActive,
        });
        setMessage("Товар обновлён.");
      } else {
        await productApi.create(payload);
        setMessage("Товар добавлен.");
      }
      setProductForm(emptyProductForm);
      await loadAdminData();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  function editProduct(product: any) {
    setProductForm({
      id: product.id,
      name: product.name || "",
      description: product.description || "",
      price: String(product.price || 1),
      stock: String(product.stock || 0),
      imageUrl: product.imageUrl || "",
      categoryId: product.categoryId ? String(product.categoryId) : "",
      isActive: Boolean(product.isActive),
    });
    setTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function toggleProductActive(product: any) {
    setError("");
    setMessage("");
    try {
      if (product.isActive) {
        await productApi.deactivate(product.id);
        setMessage("Товар деактивирован.");
      } else {
        await productApi.activate(product.id);
        setMessage("Товар активирован.");
      }
      await loadAdminData();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function saveCategory(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    try {
      const name = categoryName.trim();
      if (!name) {
        throw new Error("Введите название категории.");
      }
      if (editingCategory) {
        await categoryApi.update(editingCategory.id, name);
        setMessage("Категория обновлена.");
      } else {
        await categoryApi.create(name);
        setMessage("Категория добавлена.");
      }
      setCategoryName("");
      setEditingCategory(null);
      await loadAdminData();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  async function updateOrderStatus(orderId: number, status: string) {
    setError("");
    setMessage("");
    try {
      await orderApi.updateStatus(orderId, Number(status));
      setMessage(`Статус заказа #${orderId} обновлён.`);
      await loadAdminData();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  return (
    <main className="page-shell">
      <div className="tabbar">
        <button
          className={tab === "products" ? "active" : ""}
          type="button"
          onClick={() => setTab("products")}
        >
          Товары
        </button>

        <button
          className={tab === "categories" ? "active" : ""}
          type="button"
          onClick={() => setTab("categories")}
        >
          Категории
        </button>

        <button
          className={tab === "orders" ? "active" : ""}
          type="button"
          onClick={() => setTab("orders")}
        >
          Заказы
        </button>

        <button
          className={tab === "users" ? "active" : ""}
          type="button"
          onClick={() => setTab("users")}
        >
          Пользователи
        </button>
      </div>

      {loading && <div className="empty-state">Загрузка...</div>}
      {message && <p className="success-box">{message}</p>}
      {error && <p className="error-box">{error}</p>}

      {tab === "products" && (
        <section className="admin-grid">
          <form className="panel form-grid" onSubmit={saveProduct}>
            <h2>{productForm.id ? "Редактировать товар" : "Добавить товар"}</h2>

            <label>
              Название
              <input
                required
                value={productForm.name}
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    name: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Описание
              <textarea
                value={productForm.description}
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    description: event.target.value,
                  })
                }
              />
            </label>

            <div className="two-columns">
              <label>
                Цена
                <input
                  required
                  min="0.01"
                  step="0.01"
                  type="number"
                  value={productForm.price}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      price: event.target.value,
                    })
                  }
                />
              </label>

              <label>
                Остаток
                <input
                  required
                  min="0"
                  type="number"
                  value={productForm.stock}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      stock: event.target.value,
                    })
                  }
                />
              </label>
            </div>

            <label>
              Изображение
              <input
                value={productForm.imageUrl}
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    imageUrl: event.target.value,
                  })
                }
              />
            </label>

            <label>
              Категория
              <select
                required
                value={productForm.categoryId}
                onChange={(event) =>
                  setProductForm({
                    ...productForm,
                    categoryId: event.target.value,
                  })
                }
              >
                <option value="">Выберите категорию</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            {productForm.id && (
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={productForm.isActive}
                  onChange={(event) =>
                    setProductForm({
                      ...productForm,
                      isActive: event.target.checked,
                    })
                  }
                />
                Активный товар
              </label>
            )}

            <div className="button-row">
              <button className="primary" type="submit">
                Сохранить
              </button>

              {productForm.id && (
                <button
                  className="secondary"
                  type="button"
                  onClick={() => setProductForm(emptyProductForm)}
                >
                  Отмена
                </button>
              )}
            </div>
          </form>

          <div className="panel table-wrap">
            <h2>Все товары</h2>

            <table>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Категория</th>
                  <th>Цена</th>
                  <th>Остаток</th>
                  <th>Статус</th>
                  <th>Действия</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>

                    <td>
                      {product.categoryId
                        ? categoryById.get(product.categoryId) ||
                          product.categoryId
                        : "—"}
                    </td>

                    <td>{formatPrice(product.price)}</td>
                    <td>{product.stock ?? "—"}</td>
                    <td>{product.isActive ? "Активен" : "Неактивен"}</td>

                    <td>
                      <div className="button-row compact">
                        <button
                          type="button"
                          onClick={() => editProduct(product)}
                        >
                          Редактировать
                        </button>

                        <button
                          className={product.isActive ? "danger" : "primary"}
                          type="button"
                          onClick={() => toggleProductActive(product)}
                        >
                          {product.isActive ? "Деактивировать" : "Активировать"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!products.length && (
                  <tr>
                    <td colSpan={6}>Товаров пока нет.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {tab === "categories" && (
        <section className="admin-grid narrow">
          <form className="panel form-grid" onSubmit={saveCategory}>
            <h2>
              {editingCategory
                ? "Редактировать категорию"
                : "Добавить категорию"}
            </h2>

            <label>
              Название
              <input
                value={categoryName}
                onChange={(event) => setCategoryName(event.target.value)}
              />
            </label>

            <div className="button-row">
              <button className="primary" type="submit">
                Сохранить
              </button>

              {editingCategory && (
                <button
                  className="secondary"
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setCategoryName("");
                  }}
                >
                  Отмена
                </button>
              )}
            </div>
          </form>

          <div className="panel">
            <h2>Категории</h2>

            <div className="stack">
              {categories.map((category) => (
                <div className="list-row" key={category.id}>
                  <strong>{category.name}</strong>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingCategory(category);
                      setCategoryName(category.name);
                    }}
                  >
                    Редактировать
                  </button>
                </div>
              ))}

              {!categories.length && (
                <p className="muted">Категорий пока нет.</p>
              )}
            </div>
          </div>
        </section>
      )}

      {tab === "orders" && (
        <section className="panel table-wrap">
          <h2>Все заказы</h2>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Дата</th>
                <th>Сумма</th>
                <th>Статус</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>#{order.id}</td>

                  <td>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString("ru-RU")
                      : "—"}
                  </td>

                  <td>{formatPrice(order.totalPrice || order.total || 0)}</td>

                  <td>
                    <select
                      value={String(statusToNumber(order.status))}
                      onChange={(event) =>
                        updateOrderStatus(order.id, event.target.value)
                      }
                    >
                      {orderStatuses.map((status) => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>

                    <p className="muted small">
                      Сейчас: {statusLabel(order.status)}
                    </p>
                  </td>
                </tr>
              ))}

              {!orders.length && (
                <tr>
                  <td colSpan={5}>Заказов пока нет.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {tab === "users" && (
        <section className="panel table-wrap">
          <h2>Пользователи</h2>

          <table>
            <thead>
              <tr>
                <th>Имя пользователя</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user, index) => (
                <tr key={user.id || user.userName || index}>
                  <td>{user.userName || user.UserName || "—"}</td>
                </tr>
              ))}

              {!users.length && (
                <tr>
                  <td>Пользователей пока нет.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
