"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const LOGIN = `mutation Login($email: String!, $password: String!) {
  login(email: $email, password: $password) { token email }
}`;
const REGISTER = `mutation Register($email: String!, $password: String!) {
  register(email: $email, password: $password) { token email }
}`;

async function gql(query: string, variables: object) {
  const res = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const { data, errors } = await gql(mode === "login" ? LOGIN : REGISTER, { email, password });
      if (errors) return setError(errors[0].message);
      const payload = mode === "login" ? data.login : data.register;
      if (!payload?.token) return setError("Something went wrong. Try again.");
      localStorage.setItem("token", payload.token);
      router.push("/students");
    } catch (err) {
      setError("Network error. Is the server running?");
    }
  }

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
      <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 32, borderRadius: 8, width: 360, boxShadow: "0 2px 12px #0001" }}>
        <h2 style={{ marginBottom: 24, textAlign: "center" }}>{mode === "login" ? "Login" : "Register"}</h2>
        {error && <p style={{ color: "red", marginBottom: 12, fontSize: 14 }}>{error}</p>}
        <input style={inp} placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input style={inp} placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit" style={btn}>{mode === "login" ? "Login" : "Register"}</button>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 14 }}>
          {mode === "login" ? "No account? " : "Have account? "}
          <span style={{ color: "#2563eb", cursor: "pointer" }} onClick={() => setMode(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "Register" : "Login"}
          </span>
        </p>
      </form>
    </div>
  );
}

const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", marginBottom: 12, border: "1px solid #ddd", borderRadius: 6, fontSize: 14 };
const btn: React.CSSProperties = { width: "100%", padding: "10px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontSize: 15, marginTop: 4 };
