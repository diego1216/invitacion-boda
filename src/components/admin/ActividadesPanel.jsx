import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy
} from "firebase/firestore";
import { db } from "../../firebase/config";

export default function ActividadesPanel({ itinerario }) {

  // ======================
  // STATES
  // ======================
  const [actividades, setActividades] = useState([]);

  const [nombre, setNombre] = useState("");
  const [hora, setHora] = useState("");
  const [detalles, setDetalles] = useState("");

  const [editandoId, setEditandoId] = useState(null);
  const [loading, setLoading] = useState(true);

  // ======================
  // LISTENER ACTIVIDADES
  // ======================
  useEffect(() => {

    // ✅ VALIDACIÓN REAL
    if (!itinerario?.id) {
      setActividades([]);
      return;
    }

    setLoading(true);

    const ref = collection(
      db,
      "itinerarios",
      itinerario.id,
      "actividades"
    );

    // ordenar por hora
    const q = query(ref, orderBy("hora", "asc"));

    const unsub = onSnapshot(q, snap => {

      const data = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      setActividades(data);
      setLoading(false);
    });

    // limpiar formulario al cambiar itinerario
    limpiarFormulario();
    setEditandoId(null);

    return () => unsub();

  }, [itinerario?.id]);

  // ======================
  // CREAR / GUARDAR
  // ======================
  const guardarActividad = async () => {

    if (!itinerario?.id) {
      alert("Itinerario inválido");
      return;
    }

    if (!nombre.trim()) {
      alert("Escribe una actividad");
      return;
    }

    const ref = collection(
      db,
      "itinerarios",
      itinerario.id,
      "actividades"
    );

    try {

      // ✏️ EDITAR
      if (editandoId) {

        await updateDoc(doc(ref, editandoId), {
          nombre,
          hora,
          detalles
        });

        setEditandoId(null);

      } else {

        // ➕ CREAR
        await addDoc(ref, {
          nombre,
          hora,
          detalles,
          creado: new Date()
        });
      }

      limpiarFormulario();

    } catch (error) {
      console.error(error);
      alert("Error al guardar actividad");
    }
  };

  // ======================
  // ELIMINAR
  // ======================
  const eliminarActividad = async (id) => {

    if (!itinerario?.id) return;

    const confirmar = window.confirm("¿Eliminar actividad?");
    if (!confirmar) return;

    const ref = collection(
      db,
      "itinerarios",
      itinerario.id,
      "actividades"
    );

    await deleteDoc(doc(ref, id));
  };

  // ======================
  // INICIAR EDICIÓN
  // ======================
  const iniciarEdicion = (act) => {
    setEditandoId(act.id);
    setNombre(act.nombre || "");
    setHora(act.hora || "");
    setDetalles(act.detalles || "");
  };

  // ======================
  // LIMPIAR
  // ======================
  const limpiarFormulario = () => {
    setNombre("");
    setHora("");
    setDetalles("");
  };

  // ======================
  // SEGURIDAD
  // ======================
  if (!itinerario?.id) {
    return <p>Selecciona un itinerario...</p>;
  }

  // ======================
  // UI
  // ======================
  return (
    <div style={{ marginTop: 20 }}>

      <h3 className="admin-total">Actividades — {itinerario.titulo}</h3>

      {/* ===== FORMULARIO ===== */}

      <input
        placeholder="Actividad"
        value={nombre}
        onChange={e => setNombre(e.target.value)}
      />

      <br /><br />

      <input
        type="time"
        value={hora}
        onChange={e => setHora(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Detalles"
        value={detalles}
        onChange={e => setDetalles(e.target.value)}
      />

      <br /><br />

      <button onClick={guardarActividad}>
        {editandoId ? "Guardar cambios" : "Agregar actividad"}
      </button>

      {editandoId && (
        <button
          style={{ marginLeft: 10 }}
          onClick={() => {
            setEditandoId(null);
            limpiarFormulario();
          }}
        >
          Cancelar
        </button>
      )}

      <hr />

      {/* ===== LISTA ===== */}

      {loading && <p className="admin-total">Cargando actividades...</p>}

      {!loading && actividades.length === 0 && (
        <p className="admin-total">No hay actividades aún.</p>
      )}

      {actividades.map(act => (
        <div
          key={act.id}
          style={{
            border: "1px solid #444",
            padding: 12,
            marginBottom: 10,
            borderRadius: 8
          }}
        >
          <b className="admin-total">{act.hora || "--:--"}</b>  <span className="admin-total">—{act.nombre}</span>

          {act.detalles && <p className="admin-total">{act.detalles}</p>}

          <button onClick={() => iniciarEdicion(act)}>
            Editar
          </button>

          <button
            style={{ marginLeft: 10 }}
            onClick={() => eliminarActividad(act.id)}
          >
            Eliminar
          </button>
        </div>
      ))}

    </div>
  );
}