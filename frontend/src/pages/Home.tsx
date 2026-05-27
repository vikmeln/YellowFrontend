import { useEffect, useMemo, useState } from "react";
import "./Home.css";
import ProductList from "../components/ProductList";
import {
  cartApi,
  categoryApi,
  getErrorMessage,
  productApi,
} from "../services/api";
import { isCustomerSession } from "../utils/auth";

export default function Home({ session, onRequireAuth }: any) {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const filteredProducts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return products.filter((product) => {
      const matchesSearch =
        !normalizedSearch ||
        product.name.toLowerCase().includes(normalizedSearch) ||
        (product.description || "").toLowerCase().includes(normalizedSearch);
      const matchesCategory =
        categoryId === "all" || product.categoryId === Number(categoryId);
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryId]);

  async function loadCatalog() {
    setError("");
    setLoading(true);
    try {
      const [productsData, categoriesData]: any = await Promise.all([
        productApi.getActive(),
        categoryApi.getAll(),
      ]);
      setProducts(productsData || []);
      setCategories(categoriesData || []);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCatalog();
  }, []);

  async function addToCart(product: any) {
    setMessage("");
    setError("");

    if (!session) {
      setMessage("Чтобы добавить товар в корзину, сначала войдите в аккаунт.");
      onRequireAuth();
      return;
    }

    if (!isCustomerSession(session)) {
      setError("Корзина доступна только клиенту.");
      return;
    }

    try {
      await cartApi.add(product.id, 1);
      setMessage(`«${product.name}» добавлен в корзину.`);
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    }
  }

  return (
    <main className="page-shell">
      <section className="toolbar-card">
        <label>
          Поиск
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Название или описание"
          />
        </label>

        <label>
          Категория
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
          >
            <option value="all">Все категории</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </section>

      {message && <p className="success-box">{message}</p>}
      {error && <p className="error-box">{error}</p>}

      {loading && <div className="empty-state">Загрузка каталога...</div>}

      {!loading && (
        <ProductList
          products={filteredProducts}
          categories={categories}
          onAddToCart={addToCart}
        />
      )}
    </main>
  );
}
