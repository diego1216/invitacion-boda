import { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { db } from "../../firebase/config";
import ActividadesPanel from "./ActividadesPanel";

export default function ItinerariosPanel() {

  const [itinerarios, setItinerarios] = useState([]);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [itinerarioActivo, setItinerarioActivo] = useState(null);

  // =========================
  // LISTAR ITINERARIOS
  // =========================
  useEffect(() => {
    const ref = collection(db, "itinerarios");

    const unsub = onSnapshot(ref, snap => {
      setItinerarios(
        snap.docs.map(d => ({ id: d.id, ...d.data() }))
      );
    });

    return unsub;
  }, []);

  // =========================
  // CREAR ITINERARIO
  // =========================
  const crearItinerario = async () => {
    if (!titulo) return;

    await addDoc(collection(db, "itinerarios"), {
      titulo,
      createdAt: new Date()
    });

    setTitulo("");
    setMostrarForm(false);
  };

  // =========================
  // ELIMINAR ITINERARIO
  // =========================
  const eliminarItinerario = async (id) => {
    await deleteDoc(doc(db, "itinerarios", id));
  };

  // =========================
  // EDITAR TITULO
  // =========================
  const editarTitulo = async (id, nuevoTitulo) => {
    await updateDoc(doc(db, "itinerarios", id), {
      titulo: nuevoTitulo
    });
  };

  return (
    <div>

      <h2 className="admin-total">Itinerarios</h2>

      <button onClick={() => setMostrarForm(true)}>
        Crear itinerario
      </button>

      {mostrarForm && (
        <div>
          <input
            placeholder="Título del itinerario"
            value={titulo}
            onChange={(e)=>setTitulo(e.target.value)}
          />

          <button onClick={crearItinerario}>
            Guardar
          </button>
        </div>
      )}

      <hr />

      {itinerarios.map(it => (
        <div key={it.id} style={{marginBottom:"20px"}}>

          <h3 className="admin-total">{it.titulo}</h3>

          <button onClick={() => setItinerarioActivo(it)}>
            Ver actividades
          </button>

          <button onClick={()=>{
            const nuevo = prompt("Nuevo título");
            if(nuevo) editarTitulo(it.id, nuevo);
          }}>
            Editar
          </button>

          <button onClick={()=>eliminarItinerario(it.id)}>
            Eliminar
          </button>

        </div>
      ))}

      {itinerarioActivo && (
  <div style={{ marginTop: 40 }}>
    <hr />
    <h2 className="admin-total">Actividades del itinerario</h2>

    <ActividadesPanel itinerario={itinerarioActivo} />

    <button
      onClick={() => setItinerarioActivo(null)}
      style={{ marginTop: 10 }}
    >
      ← Volver a itinerarios
    </button>
  </div>
)}

    </div>
  );
}