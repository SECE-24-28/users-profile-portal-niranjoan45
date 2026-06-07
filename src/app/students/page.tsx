"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Student {
  id: string;
  name: string;
  email: string;
  phone?: string;
  course?: string;
  profileImage?: string;
}

const Q = {
  GET_ALL: `query { students { id name email phone course profileImage } }`,
  ADD: `mutation Add($name:String!,$email:String!,$phone:String,$course:String){
    addStudent(name:$name,email:$email,phone:$phone,course:$course){id name email phone course profileImage}}`,
  UPDATE: `mutation Update($id:ID!,$name:String,$email:String,$phone:String,$course:String,$profileImage:String){
    updateStudent(id:$id,name:$name,email:$email,phone:$phone,course:$course,profileImage:$profileImage){id name email phone course profileImage}}`,
  DELETE: `mutation Delete($id:ID!){ deleteStudent(id:$id) }`,
};

function useGql() {
  const router = useRouter();
  return useCallback(async (query: string, variables?: object) => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return null; }
    const res = await fetch("/api/graphql", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ query, variables }),
    });
    const json = await res.json();
    if (json.errors?.[0]?.extensions?.code === "UNAUTHENTICATED") { router.push("/login"); return null; }
    return json.data;
  }, [router]);
}

const emptyForm = { name: "", email: "", phone: "", course: "" };

export default function StudentsPage() {
  const gql = useGql();
  const [students, setStudents] = useState<Student[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState<Student | null>(null);
  const [selected, setSelected] = useState<Student | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchStudents = useCallback(async () => {
    const data = await gql(Q.GET_ALL);
    if (data) setStudents(data.students);
  }, [gql]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editing) {
      await gql(Q.UPDATE, { id: editing.id, ...form });
    } else {
      await gql(Q.ADD, form);
    }
    setForm(emptyForm); setEditing(null); setShowForm(false);
    fetchStudents();
  }

  function startEdit(s: Student) {
    setEditing(s);
    setForm({ name: s.name, email: s.email, phone: s.phone ?? "", course: s.course ?? "" });
    setShowForm(true); setSelected(null);
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this student?")) return;
    await gql(Q.DELETE, { id });
    if (selected?.id === id) setSelected(null);
    fetchStudents();
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, studentId: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("studentId", studentId);
    const token = localStorage.getItem("token");
    const res = await fetch("/api/upload", { method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData });
    const json = await res.json();
    setUploading(false);
    if (json.profileImage) {
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, profileImage: json.profileImage } : s));
      if (selected?.id === studentId) setSelected(prev => prev ? { ...prev, profileImage: json.profileImage } : prev);
    }
  }

  function logout() { localStorage.removeItem("token"); window.location.href = "/login"; }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>Students</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => { setShowForm(true); setEditing(null); setForm(emptyForm); }} style={btnPrimary}>+ Add Student</button>
          <button onClick={logout} style={btnGhost}>Logout</button>
        </div>
      </div>

      {/* Student Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
        {students.map(s => (
          <div key={s.id} onClick={() => setSelected(s)} style={{ background: "#fff", borderRadius: 10, padding: 16, boxShadow: "0 1px 6px #0001", cursor: "pointer", border: selected?.id === s.id ? "2px solid #2563eb" : "2px solid transparent" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
              {s.profileImage
                ? <Image src={s.profileImage} alt={s.name} width={72} height={72} style={{ borderRadius: "50%", objectFit: "cover" }} />
                : <div style={{ width: 72, height: 72, borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#2563eb" }}>{s.name[0]}</div>}
            </div>
            <p style={{ fontWeight: 600, textAlign: "center" }}>{s.name}</p>
            <p style={{ fontSize: 13, color: "#666", textAlign: "center" }}>{s.course ?? "—"}</p>
            <div style={{ display: "flex", gap: 6, marginTop: 12 }}>
              <button onClick={e => { e.stopPropagation(); startEdit(s); }} style={{ ...btnSmall, background: "#2563eb", color: "#fff" }}>Edit</button>
              <button onClick={e => { e.stopPropagation(); handleDelete(s.id); }} style={{ ...btnSmall, background: "#ef4444", color: "#fff" }}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {/* Profile Detail Panel */}
      {selected && (
        <div style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 320, background: "#fff", boxShadow: "-4px 0 20px #0002", padding: 28, overflowY: "auto" }}>
          <button onClick={() => setSelected(null)} style={{ ...btnGhost, marginBottom: 16 }}>✕ Close</button>
          <div style={{ textAlign: "center", marginBottom: 20 }}>
            {selected.profileImage
              ? <Image src={selected.profileImage} alt={selected.name} width={100} height={100} style={{ borderRadius: "50%", objectFit: "cover" }} />
              : <div style={{ width: 100, height: 100, borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, color: "#2563eb", margin: "0 auto" }}>{selected.name[0]}</div>}
            <label style={{ display: "block", marginTop: 10, cursor: "pointer", color: "#2563eb", fontSize: 13 }}>
              {uploading ? "Uploading..." : "Upload Photo"}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleImageUpload(e, selected.id)} />
            </label>
          </div>
          <h2 style={{ fontWeight: 700, fontSize: 20 }}>{selected.name}</h2>
          <p style={{ color: "#555", margin: "6px 0" }}>{selected.email}</p>
          <p style={{ color: "#555", margin: "6px 0" }}>📞 {selected.phone ?? "—"}</p>
          <p style={{ color: "#555", margin: "6px 0" }}>🎓 {selected.course ?? "—"}</p>
          <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
            <button onClick={() => startEdit(selected)} style={btnPrimary}>Edit</button>
            <button onClick={() => handleDelete(selected.id)} style={{ ...btnPrimary, background: "#ef4444" }}>Delete</button>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, background: "#0005", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 28, borderRadius: 10, width: 400, boxShadow: "0 4px 24px #0003" }}>
            <h3 style={{ marginBottom: 20, fontWeight: 700 }}>{editing ? "Edit Student" : "Add Student"}</h3>
            {(["name", "email", "phone", "course"] as const).map(f => (
              <input key={f} style={inp} placeholder={f[0].toUpperCase() + f.slice(1)} value={form[f]}
                onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} required={f === "name" || f === "email"} />
            ))}
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <button type="submit" style={btnPrimary}>{editing ? "Update" : "Add"}</button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }} style={btnGhost}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

const btnPrimary: React.CSSProperties = { padding: "8px 16px", background: "#2563eb", color: "#fff", border: "none", borderRadius: 6, fontSize: 14 };
const btnGhost: React.CSSProperties = { padding: "8px 16px", background: "transparent", color: "#555", border: "1px solid #ddd", borderRadius: 6, fontSize: 14 };
const btnSmall: React.CSSProperties = { flex: 1, padding: "5px 0", border: "none", borderRadius: 5, fontSize: 13 };
const inp: React.CSSProperties = { width: "100%", padding: "9px 12px", marginBottom: 10, border: "1px solid #ddd", borderRadius: 6, fontSize: 14 };
