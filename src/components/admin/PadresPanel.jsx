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

export default function PadresPanel() {

  const [mostrarForm, setMostrarForm] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const [padre, setPadre] = useState("");
  const [madre, setMadre] = useState("");
  const [lado, setLado] = useState("Novia");

  const [padres, setPadres] = useState([]);

  // =============================
  // ESCUCHAR EN TIEMPO REAL
  // =============================
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "padres"),
      (snapshot) => {
        const lista = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPadres(lista);
      }
    );

    return () => unsub();
  }, []);

  // =============================
  // LIMPIAR FORM
  // =============================
  const limpiarForm = () => {
    setPadre("");
    setMadre("");
    setLado("Novia");
    setEditandoId(null);
    setMostrarForm(false);
  };

  // =============================
  // GUARDAR / ACTUALIZAR
  // =============================
  const guardarPadres = async () => {

  // ❌ Si ambos están vacíos, no permitir
  if (!padre.trim() && !madre.trim()) {
    alert("Debes escribir al menos un nombre");
    return;
  }

  const datos = {
    padre: padre.trim() || "",
    madre: madre.trim() || "",
    lado
  };

  if (editandoId) {
    await updateDoc(doc(db, "padres", editandoId), datos);
  } else {
    await addDoc(collection(db, "padres"), {
      ...datos,
      creado: serverTimestamp()
    });
  }

  limpiarForm();
};

  // =============================
  // ELIMINAR
  // =============================
  const eliminarPadres = async (id) => {
    if (!window.confirm("¿Eliminar registro?")) return;
    await deleteDoc(doc(db, "padres", id));
  };

  // =============================
  // EDITAR
  // =============================
  const editarPadres = (p) => {
    setPadre(p.padre);
    setMadre(p.madre);
    setLado(p.lado);
    setEditandoId(p.id);
    setMostrarForm(true);
  };

  return (
    <div style={{ marginTop: 30 }}>

      <h2>Padres</h2>

      {/* BOTÓN AGREGAR */}
      {!mostrarForm && (
        <button onClick={() => setMostrarForm(true)}>
          ➕ Agregar Padres
        </button>
      )}

      {/* FORMULARIO */}
      {mostrarForm && (
        <div style={{
          marginTop: 20,
          padding: 20,
          border: "1px solid #444",
          borderRadius: 10
        }}>

          <input
            placeholder="Nombre del Padre"
            value={padre}
            onChange={(e) => setPadre(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />

          <input
            placeholder="Nombre de la Madre"
            value={madre}
            onChange={(e) => setMadre(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          />

          <select
            value={lado}
            onChange={(e) => setLado(e.target.value)}
            style={{ width: "100%", padding: 10, marginBottom: 10 }}
          >
            <option>Novia</option>
            <option>Novio</option>
            <option>Quinceañera</option>
            <option>Quinceañero</option>
            <option>Bautizado</option>
            <option>Bautizada</option>
            <option>Festejado</option>
            <option>Festejada</option>
          </select>

          <button onClick={guardarPadres} style={{ marginRight: 10 }}>
            {editandoId ? "Actualizar" : "Guardar"}
          </button>

          <button onClick={limpiarForm}>
            Cancelar
          </button>

        </div>
      )}

      <hr />

      <h3>Lista</h3>

      {padres.map(p => (
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
          <strong> {p.lado}</strong>

          {p.padre && <div>👨 Padre: {p.padre}</div>}
{p.madre && <div>👩 Madre: {p.madre}</div>}

          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => editarPadres(p)}
              style={{ marginRight: 10 }}
            >
              ✏ Editar
            </button>

            <button onClick={() => eliminarPadres(p.id)}>
              🗑 Eliminar
            </button>
          </div>
        </div>
      ))}

    </div>
  );
}