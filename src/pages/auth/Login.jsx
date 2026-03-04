import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../../services/api/http";
import { endpoints } from "../../services/api/endpoints";
import { AuthContext } from "../../services/auth/AuthContext";

import { Button, Input, Card } from '../../components/ui';

export default function Login() {
  const nav = useNavigate();
  const auth = useContext(AuthContext);

  const [num_documento, setUser] = useState("");
  const [password, setPass] = useState("");
  const [msg, setMsg] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const { data } = await http.post(endpoints.auth.login, {
        num_documento: parseInt(num_documento),
        password,
      });

      if (data.hasError) {
        setMsg(data.Message);
        return;
      }

      auth.login(data.Data.access_token);

      // Lee el role del token directamente, no del contexto
      const payload = JSON.parse(atob(data.Data.access_token.split(".")[1]));
      const role = payload.role;
      
      if (role === "Médico") nav("/doctor");
      else if (role === "Paciente") nav("/patient");
      else if (role === "Enfermero") nav("/nurse");
      else if (role === "Farmaceuta") nav("/pharmacy");
      else if (role === "Recepcionista") nav("/receptionist");
      else if (role === "Talento Humano") nav("/hr");
      else {
        auth.logout();
        setMsg("Tu role no tiene permisos para acceder.");
      }
      
    } catch {
      setMsg("Error de conexión. Intente nuevamente.");
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
              name="num_documento"
              value={num_documento}
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