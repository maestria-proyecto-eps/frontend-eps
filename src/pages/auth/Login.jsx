import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../../services/api/http";
import { endpoints } from "../../services/api/endpoints";
import { AuthContext } from "../../services/auth/AuthProvider";

import {
  Button,
  Input,
  Card,
} from '../../components/ui';

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
      const { data } = await http.post(endpoints.login, {
        user_name,
        password,
      });

      auth.login(data.access_token);

      if (data.role === "admin") nav("/admin");
      else nav("/user");
    } catch (err) {
      setMsg("Login inválido");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-80">
        <Card.Header>
          <h2 className="text-lg font-bold text-center">Iniciar sesión</h2>
        </Card.Header>

        <Card.Body>
          <form onSubmit={submit} className="space-y-3">
            <Input
              placeholder="Usuario"
              name="user_name"
              value={user_name}
              onChange={(e) => setUser(e.target.value)}
              required
            />

            <Input
              type="password"
              placeholder="Contraseña"
              name="password"
              value={password}
              onChange={(e) => setPass(e.target.value)}
              error={msg || undefined}
              required
            />

            <Button type="submit" fullWidth>
              Entrar
            </Button>
          </form>
        </Card.Body>
      </Card>
    </div>
  );
}