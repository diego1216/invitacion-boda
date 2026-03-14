import { useState, useEffect } from "react";
import { db } from "../../firebase/config";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

export default function PadrinosPanel() {

  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");

  const [padrinos, setPadrinos] = useState([]);

  // =============================
  // ESCUCHAR EN TIEMPO REAL
  // =============================
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "padrinos"),
      (snapshot) => {
        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPadrinos(lista);
      }
    );

    return () => unsub();
  }, []);

  // =============================
  // LIMPIAR FORM
  // =============================
  const limpiarForm = () => {
    setNombre("");
    setDescripcion("");
    setEditandoId(null);
    setMostrarForm(false);
  };

  // =============================
  // GUARDAR / ACTUALIZAR
  // =============================
  const guardarPadrino = async () => {

    if (!nombre.trim()) {
      alert("Escribe un nombre");
      return;
    }

    const datos = {
      nombre: nombre.trim(),
      descripcion: descripcion.trim() || ""
    };

    if (editandoId) {
      await updateDoc(doc(db, "padrinos", editandoId), datos);
    } else {
      await addDoc(collection(db, "padrinos"), {
        ...datos,
        creado: serverTimestamp()
      });
    }

    limpiarForm();
  };

  // =============================
  // ELIMINAR
  // =============================
  const eliminarPadrino = async (id) => {
    if (!window.confirm("¿Eliminar padrino?")) return;
    await deleteDoc(doc(db, "padrinos", id));
  };

  // =============================
  // EDITAR
  // =============================
  const editarPadrino = (p) => {
    setNombre(p.nombre);
    setDescripcion(p.descripcion || "");
    setEditandoId(p.id);
    setMostrarForm(true);
  };

  return (
    <div style={{ marginTop: 30 }}>

      <h2>Padrinos</h2>

      {/* BOTÓN AGREGAR */}
      {!mostrarForm && (
        <button onClick={() => setMostrarForm(true)}>
          ➕ Agregar Padrino
        </button>
      )}

      {/* FORMULARIO */}
      {mostrarForm && (
        <div
          style={{
            marginTop: 20,
            padding: 20,
            border: "1px solid #444",
            borderRadius: 10
          }}
        >
          <input
            placeholder="Nombre del padrino"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />

          <input
            placeholder="Descripción (Ej: Padrino de anillos)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />

          <button onClick={guardarPadrino} style={{ marginRight: 10 }}>
            {editandoId ? "Actualizar" : "Guardar"}
          </button>

          <button onClick={limpiarForm}>
            Cancelar
          </button>
        </div>
      )}

      <hr />

      <h3>Lista</h3>

      {padrinos.map(p => (
        <div
          key={p.id}
          style={{
            border: "1px solid #444",
            padding: 15,
            marginBottom: 10,
            borderRadius: 8,
            background: "#1a1a1a",
            color: "white"
          }}
        >
          <strong>{p.nombre}</strong>

          {p.descripcion && <div>{p.descripcion}</div>}

          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => editarPadrino(p)}
              style={{ marginRight: 10 }}
            >
              ✏ Editar
            </button>

            <button onClick={() => eliminarPadrino(p.id)}>
              🗑 Eliminar
            </button>
          </div>
        </div>
      ))}

    </div>
  );
}