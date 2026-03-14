import { useEffect, useState } from "react";
import { db } from "../../firebase/config";

import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ActividadesPanel from "./ActividadesPanel"
export default function EventosPanel() {

  // =====================
  // STATES
  // =====================
  const [titulo, setTitulo] = useState("");
  const [lugar, setLugar] = useState("");
  const [fecha, setFecha] = useState(new Date());
  const [hora, setHora] = useState(new Date());
  const [direccion, setDireccion] = useState("");
  const [mapsURL, setMapsURL] = useState("");
  const [imagenURL, setImagenURL] = useState("");

  const [eventos, setEventos] = useState([]);

  // ✅ modo edición
  const [editandoId, setEditandoId] = useState(null);

  // =====================
  // LISTENER
  // =====================
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "eventos"),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEventos(data);
      }
    );

    return () => unsubscribe();
  }, []);

  // =====================
  // FORMATEAR FECHA
  // =====================
  const formatearFecha = (fechaFirestore) => {
    if (!fechaFirestore) return "";

    const fecha = fechaFirestore.toDate
      ? fechaFirestore.toDate()
      : new Date(fechaFirestore);

    return fecha.toLocaleString("es-MX", {
      dateStyle: "long",
      timeStyle: "short"
    });
  };

  // =====================
  // CREAR / ACTUALIZAR
  // =====================
  const guardarEvento = async () => {

    if (!titulo.trim() || !lugar.trim() || !imagenURL.trim()) {
      alert("Completa los campos obligatorios");
      return;
    }

    const fechaCompleta = new Date(fecha);
    fechaCompleta.setHours(
      hora.getHours(),
      hora.getMinutes(),
      0,
      0
    );

    try {

      if (editandoId) {
        // ✏️ ACTUALIZAR
        await updateDoc(doc(db, "eventos", editandoId), {
          titulo,
          lugar,
          fechaEvento: fechaCompleta,
          direccion,
          mapsURL,
          imagenURL
        });

        alert("Evento actualizado ✅");
      } else {
        // ➕ CREAR
        await addDoc(collection(db, "eventos"), {
          titulo,
          lugar,
          fechaEvento: fechaCompleta,
          direccion,
          mapsURL,
          imagenURL,
          creado: new Date()
        });

        alert("Evento creado ✅");
      }

      limpiarFormulario();

    } catch (error) {
      console.error(error);
      alert("Error guardando evento");
    }
  };

  // =====================
  // EDITAR
  // =====================
  const editarEvento = (ev) => {

    setEditandoId(ev.id);
    setTitulo(ev.titulo);
    setLugar(ev.lugar);
    setDireccion(ev.direccion || "");
    setMapsURL(ev.mapsURL || "");
    setImagenURL(ev.imagenURL || "");

    const fechaDoc = ev.fechaEvento.toDate();
    setFecha(fechaDoc);
    setHora(fechaDoc);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // =====================
  // ELIMINAR
  // =====================
  const eliminarEvento = async (id) => {

    if (!confirm("¿Eliminar evento?")) return;

    await deleteDoc(doc(db, "eventos", id));
  };

  // =====================
  // LIMPIAR
  // =====================
  const limpiarFormulario = () => {
    setEditandoId(null);
    setTitulo("");
    setLugar("");
    setDireccion("");
    setMapsURL("");
    setImagenURL("");
    setFecha(new Date());
    setHora(new Date());
  };

  // =====================
  // UI
  // =====================
  return (
    <div style={{ padding: 40 }}>

      <h2 className="admin-subtitle">
        {editandoId ? "✏️ Editando Evento" : "📅 Administración de Eventos"}
      </h2>

      <input
        placeholder="Título del evento"
        value={titulo}
        onChange={e => setTitulo(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Nombre del lugar"
        value={lugar}
        onChange={e => setLugar(e.target.value)}
      />

      <br /><br />

      <label className="admin-subtitle">Fecha:</label><br />
      <DatePicker
        selected={fecha}
        onChange={setFecha}
        dateFormat="dd/MM/yyyy"
      />

      <br /><br />

      <label className="admin-subtitle">Hora:</label><br />
      <DatePicker
        selected={hora}
        onChange={setHora}
        showTimeSelect
        showTimeSelectOnly
        dateFormat="HH:mm"
      />

      <br /><br />

      <input
        placeholder="Dirección exacta"
        value={direccion}
        onChange={e => setDireccion(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="Link Google Maps"
        value={mapsURL}
        onChange={e => setMapsURL(e.target.value)}
      />

      <br /><br />

      <input
        placeholder="URL imagen"
        value={imagenURL}
        onChange={(e) => setImagenURL(e.target.value)}
      />

      {imagenURL && (
        <img src={imagenURL} className="preview-evento" />
      )}

      <br /><br />

      <button onClick={guardarEvento}>
        {editandoId ? "Actualizar Evento" : "Guardar Evento"}
      </button>

      {editandoId && (
        <button onClick={limpiarFormulario} style={{ marginLeft: 10 }}>
          Cancelar
        </button>
      )}

      <hr />

      <h3 className="admin-total">Eventos creados</h3>

      {eventos.map(ev => (
        <div key={ev.id} className="card-evento">

         <h3 className="admin-subtitle">{ev.titulo}</h3>

<p className="admin-subtitle"><strong>Lugar:</strong> {ev.lugar}</p>

<p className="admin-subtitle">
  <strong>Fecha:</strong> {formatearFecha(ev.fechaEvento)}
</p>

{/* ✅ Dirección */}
{ev.direccion && (
  <p className="admin-subtitle">
    <strong>Dirección:</strong> {ev.direccion}
  </p>
)}

{/* ✅ Imagen */}
{ev.imagenURL && (
  <img
    src={ev.imagenURL}
    className="imagen-evento"
    alt="evento"
  />
)}

<br />

{/* ✅ Botón Google Maps */}
{ev.mapsURL && (
  <a
    href={ev.mapsURL}
    target="_blank"
    rel="noreferrer"
    className="btn-maps"
  >
    📍 Llegar al lugar
  </a>
)}

<br /><br />

<button onClick={() => editarEvento(ev)}>
  ✏️ Editar
</button>

<button
  onClick={() => eliminarEvento(ev.id)}
  style={{ marginLeft: 10 }}
>
  🗑 Eliminar
</button>

        </div>
      ))}
    </div>
  );
}