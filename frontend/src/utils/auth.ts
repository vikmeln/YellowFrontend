const TOKEN_KEY = "yellow-token";

const ROLE_CLAIM =
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role";

const NAME_IDENTIFIER_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";

const EMAIL_CLAIM =
  "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");

  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "=",
  );

  return decodeURIComponent(
    atob(padded)
      .split("")
      .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join(""),
  );
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function decodeJwt(token: string) {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    return JSON.parse(decodeBase64Url(payload));
  } catch {
    return null;
  }
}

function readClaim(claims: any, keys: string[]) {
  for (const key of keys) {
    const value = claims[key];

    if (typeof value === "string") {
      return value;
    }

    if (Array.isArray(value) && typeof value[0] === "string") {
      return value[0];
    }
  }
  return undefined;
}

export function getSession() {
  const token = getToken();
  if (!token) {
    return null;
  }
  const claims = decodeJwt(token) || {};
  return {
    token,
    role: readClaim(claims, ["role", "roles", ROLE_CLAIM]),
    email: readClaim(claims, ["email", "unique_name", EMAIL_CLAIM]),
    userId: readClaim(claims, ["nameid", "sub", NAME_IDENTIFIER_CLAIM]),
  };
}

export function isAdminSession(session: any) {
  return session?.role === "Admin";
}

export function isCustomerSession(session: any) {
  return session?.role === "Customer";
}

export function isAuthenticated() {
  return Boolean(getToken());
}

export function isAdmin() {
  return isAdminSession(getSession());
}

export function isCustomer() {
  return isCustomerSession(getSession());
}
