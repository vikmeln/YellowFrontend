import { useState } from "react";
import "./AuthModal.css";
import axios from "axios";
import API_URLS from "../services/api";

export default function AuthModal({ onClose }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const login = async () => {
    try {
      const res = await axios.post(`${API_URLS.auth}/auth/login`, {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      window.location.reload();
    } catch {
      alert("Ошибка входа");
    }
  };

  const register = async () => {
    try {
      await axios.post(`${API_URLS.auth}/auth/register`, {
        email,
        password,
      });

      alert("Регистрация успешна");
      setIsLogin(true);
    } catch {
      alert("Ошибка регистрации");
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{isLogin ? "Вход" : "Регистрация"}</h2>

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          placeholder="Пароль"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="buttons">
          <button onClick={isLogin ? login : register}>
            {isLogin ? "Войти" : "Регистрация"}
          </button>
        </div>

        <div className="toggle-form">
          {isLogin ? (
            <p>
              Нет аккаунта?{" "}
              <span onClick={() => setIsLogin(false)} className="link">
                Зарегистрироваться
              </span>
            </p>
          ) : (
            <p>
              Уже есть аккаунт?{" "}
              <span onClick={() => setIsLogin(true)} className="link">
                Войти
              </span>
            </p>
          )}
        </div>

        <button onClick={onClose}>Закрыть</button>
      </div>
    </div>
  );
}
