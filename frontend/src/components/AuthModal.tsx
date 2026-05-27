import { useState } from "react";
import type { SyntheticEvent } from "react";
import "./AuthModal.css";
import { authApi, getErrorMessage } from "../services/api";
import { getSession, setToken } from "../utils/auth";

export default function AuthModal({ onClose, onSuccess }: any) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const title = mode === "login" ? "Вход" : "Регистрация";

  async function submit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        await authApi.register({
          email,
          password,
        });
      }

      const response: any = await authApi.login({
        email,
        password,
      });

      const token = response.token || response.Token || response.accessToken;

      if (!token) {
        throw new Error("Backend не вернул token после входа.");
      }
      setToken(token);
      const session = getSession();
      if (!session) {
        throw new Error("Не удалось прочитать token.");
      }
      onSuccess(session);
      onClose();
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal auth-modal">
        <div className="modal-header">
          <h2>{title}</h2>

          <button className="icon-button" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="form-grid" onSubmit={submit}>
          <label>
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </label>

          <label>
            Пароль
            <input
              required
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="password"
            />
          </label>

          {error && <p className="error-box">{error}</p>}

          <button
            className="primary full-width"
            type="submit"
            disabled={loading}
          >
            {loading ? "Подождите..." : title}
          </button>
        </form>

        <button
          className="link-button"
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login"
            ? "Нет аккаунта? Зарегистрироваться"
            : "Уже есть аккаунт? Войти"}
        </button>
      </div>
    </div>
  );
}
