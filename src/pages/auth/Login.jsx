import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../../services/api/http";
import { endpoints } from "../../services/api/endpoints";
import { AuthContext } from "../../services/auth/AuthContext";

export default function Login() {
  const nav = useNavigate();
  const auth = useContext(AuthContext);

  const [user_name, setUser] = useState("");
  const [password, setPass] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const { data } = await http.post(endpoints.auth.login, {
        user_name,
        password,
      });

      auth.login(data.access_token);

      if (data.role === "admin") nav("/admin");
      else nav("/user");
    } catch {
      setMsg("Login inválido");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={submit}
        className="border p-6 rounded space-y-3 w-80"
      >
        <h2 className="text-lg font-bold text-center">
          Iniciar sesión
        </h2>

        <input
          placeholder="Usuario"
          value={user_name}
          onChange={(e) => setUser(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPass(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />

        <button
          type="submit"
          className="bg-blue-500 text-white p-2 w-full rounded"
        >
          Entrar
        </button>

        {msg && (
          <div className="text-red-500 text-sm text-center">
            {msg}
          </div>
        )}
      </form>
    </div>
  );
}
