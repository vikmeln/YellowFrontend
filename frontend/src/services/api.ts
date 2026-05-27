import { clearToken, getToken } from "../utils/auth";

export const API_ORIGINS = {
  auth: import.meta.env.VITE_AUTH_API_URL || "http://localhost:5001/api",
  products: import.meta.env.VITE_PRODUCT_API_URL || "http://localhost:5002/api",
  categories:
    import.meta.env.VITE_CATEGORY_API_URL || "http://localhost:5003/api",
  cart: import.meta.env.VITE_CART_API_URL || "http://localhost:5004/api",
  orders: import.meta.env.VITE_ORDER_API_URL || "http://localhost:5005/api",
};

export const orderStatuses = [
  { value: 0, label: "Created" },
  { value: 1, label: "Paid" },
  { value: 2, label: "Shipped" },
  { value: 3, label: "Completed" },
  { value: 4, label: "Cancelled" },
];

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function trimSlash(value: string) {
  return value.replace(/\/$/, "");
}

export function statusLabel(status: any) {
  if (typeof status === "number") {
    return (
      orderStatuses.find((item) => item.value === status)?.label ||
      String(status)
    );
  }

  return status || "Unknown";
}

export function statusToNumber(status: any) {
  if (typeof status === "number") {
    return status;
  }

  const found = orderStatuses.find((item) => item.label === status);
  return found?.value ?? 0;
}

export function getErrorMessage(error: any) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Неизвестная ошибка";
}

export function authHeaders() {
  const token = getToken();

  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function apiRequest<T = any>(
  baseUrl: string,
  path: string,
  options: any = {},
): Promise<T> {
  const url = `${trimSlash(baseUrl)}/${path.replace(/^\//, "")}`;
  const headers = new Headers(options.headers);

  Object.entries(authHeaders()).forEach(([key, value]) => {
    headers.set(key, String(value));
  });

  const hasBody = typeof options.body !== "undefined";

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, {
    ...options,
    headers,
    body: hasBody ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401) {
    clearToken();
  }

  const contentType = response.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  const payload = isJson
    ? await response.json().catch(() => null)
    : await response.text().catch(() => "");

  if (!response.ok) {
    const message =
      typeof payload === "string" && payload.trim()
        ? payload
        : payload?.message ||
          payload?.title ||
          payload?.errors?.[0]?.description ||
          `Ошибка запроса: ${response.status}`;

    throw new ApiError(message, response.status);
  }

  return (payload || null) as T;
}

export const authApi = {
  login(payload: any) {
    return apiRequest(API_ORIGINS.auth, "/auth/login", {
      method: "POST",
      body: payload,
    });
  },

  register(payload: any) {
    return apiRequest(API_ORIGINS.auth, "/auth/register", {
      method: "POST",
      body: {
        email: payload.email,
        password: payload.password,
      },
    });
  },
};

export const productApi = {
  getActive() {
    return apiRequest(API_ORIGINS.products, "/Products");
  },

  getAdmin() {
    return apiRequest(API_ORIGINS.products, "/Products/admin");
  },

  create(payload: any) {
    return apiRequest(API_ORIGINS.products, "/Products", {
      method: "POST",
      body: payload,
    });
  },

  update(id: number, payload: any) {
    return apiRequest(API_ORIGINS.products, `/Products/${id}`, {
      method: "PUT",
      body: payload,
    });
  },

  deactivate(id: number) {
    return apiRequest(API_ORIGINS.products, `/Products/${id}`, {
      method: "DELETE",
    });
  },

  activate(id: number) {
    return apiRequest(API_ORIGINS.products, `/Products/${id}/activate`, {
      method: "PATCH",
    });
  },
};

export const categoryApi = {
  getAll() {
    return apiRequest(API_ORIGINS.categories, "/Categories");
  },

  create(name: string) {
    return apiRequest(API_ORIGINS.categories, "/Categories", {
      method: "POST",
      body: { name },
    });
  },

  update(id: number, name: string) {
    return apiRequest(API_ORIGINS.categories, `/Categories/${id}`, {
      method: "PUT",
      body: { name },
    });
  },
};

export const cartApi = {
  get() {
    return apiRequest(API_ORIGINS.cart, "/Cart");
  },

  add(productId: number, quantity = 1) {
    return apiRequest(API_ORIGINS.cart, "/Cart", {
      method: "POST",
      body: { productId, quantity },
    });
  },

  remove(productId: number) {
    return apiRequest(API_ORIGINS.cart, `/Cart/${productId}`, {
      method: "DELETE",
    });
  },

  updateQuantity(productId: number, quantity: number) {
    return apiRequest(
      API_ORIGINS.cart,
      `/Cart/${productId}?quantity=${quantity}`,
      {
        method: "PATCH",
      },
    );
  },

  clear() {
    return apiRequest(API_ORIGINS.cart, "/Cart", {
      method: "DELETE",
    });
  },
};

export const orderApi = {
  create() {
    return apiRequest(API_ORIGINS.orders, "/Orders", {
      method: "POST",
    });
  },

  my() {
    return apiRequest(API_ORIGINS.orders, "/Orders/my");
  },

  cancel(id: number) {
    return apiRequest(API_ORIGINS.orders, `/Orders/${id}/cancel`, {
      method: "PATCH",
    });
  },

  all() {
    return apiRequest(API_ORIGINS.orders, "/Orders");
  },

  updateStatus(id: number, status: number | string) {
    return apiRequest(
      API_ORIGINS.orders,
      `/Orders/${id}/status?status=${encodeURIComponent(status)}`,
      {
        method: "PATCH",
      },
    );
  },
};

export const userApi = {
  getAll() {
    return apiRequest(API_ORIGINS.auth, "/Users");
  },
};
