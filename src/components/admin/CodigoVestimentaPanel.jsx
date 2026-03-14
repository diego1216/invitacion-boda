import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function CodigoVestimentaPanel() {

  // =========================
  // STATES
  // =========================
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [hombre, setHombre] = useState("");
  const [mujer, setMujer] = useState("");
 const [coloresHombre, setColoresHombre] = useState([]);
const [coloresMujer, setColoresMujer] = useState([]);

  // =========================
// IMÁGENES POR ESTILO
// (puedes cambiar las URLs después)
// =========================
const imagenesHombre = {
  "Etiqueta": "/imagenes/vestimenta/hombre-etiqueta.png",
  "Formal": "/imagenes/vestimenta/hombre-formal.png",
  "Semi formal": "/imagenes/vestimenta/hombre-semiformal.png",
  "Casual": "/imagenes/vestimenta/hombre-casual.png"
};

const imagenesMujer = {
  "Etiqueta": "/imagenes/vestimenta/mujer-etiqueta.png",
  "Formal": "/imagenes/vestimenta/mujer-formal.png",
  "Semi formal": "/imagenes/vestimenta/mujer-semiformal.png",
  "Casual": "/imagenes/vestimenta/mujer-casual.png"
}
// ✅ FALTABA ESTO
  const estilos = [
    "Etiqueta",
    "Formal",
    "Semi formal",
    "Casual"
  ];
  // =========================
  // CARGAR CONFIGURACIÓN
  // =========================
  useEffect(() => {

    const cargar = async () => {
      const ref = doc(db, "configuracion", "vestimenta");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setHombre(data.hombre || "");
        setMujer(data.mujer || "");
        setColoresHombre(data.coloresHombre || []);
setColoresMujer(data.coloresMujer || []);
        setMostrarFormulario(true);
      }
    };

    cargar();

  }, []);

  // =========================
  // GUARDAR
  // =========================
  const guardar = async () => {

    await setDoc(
      doc(db, "configuracion", "vestimenta"),
      {
        hombre,
        mujer,
        coloresHombre,
      coloresMujer,
        actualizado: new Date()
      }
    );

    alert("Código de vestimenta guardado ✅");
  };
// =========================
// MANEJO COLORES
// =========================
const agregarColorHombre = (color) => {
  if (!coloresHombre.includes(color)) {
    setColoresHombre([...coloresHombre, color]);
  }
};

const agregarColorMujer = (color) => {
  if (!coloresMujer.includes(color)) {
    setColoresMujer([...coloresMujer, color]);
  }
};

const eliminarColorHombre = (color) => {
  setColoresHombre(coloresHombre.filter(c => c !== color));
};

const eliminarColorMujer = (color) => {
  setColoresMujer(coloresMujer.filter(c => c !== color));
};
  // =========================
  // UI
  // =========================
  const paleta = [
  "#000000",
  "#ffffff",
  "#1a1a1a",
  "#2c3e50",
  "#34495e",
  "#8e44ad",
  "#c0392b",
  "#e67e22",
  "#f1c40f",
  "#27ae60",
  "#16a085",
  "#2980b9",
  "#d35400",
  "#7f8c8d",
  "#f5b7b1",
  "#fadbd8",
  "#aed6f1",
  "#a9dfbf"
];

  return (
    <div style={{ maxWidth: 900 }}>

      {!mostrarFormulario && (
        <button onClick={() => setMostrarFormulario(true)}>
          Añadir código de vestimenta
        </button>
      )}

      {mostrarFormulario && (
        <>
          <h2 className="admin-total">Código de Vestimenta</h2>

          {/* ================= HOMBRE ================= */}
          <h3 className="admin-total">Hombre</h3>

          <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
            {estilos.map(estilo => (
              <button
                key={estilo}
                onClick={() => setHombre(estilo)}
                style={{
                  padding: 10,
                  background:
                    hombre === estilo ? "#4da6ff" : "#222",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer"
                }}
              >
                {estilo}
              </button>
            ))}
          </div>

          {/* ESPACIO PARA IMÁGENES HOMBRE */}
          <div
  style={{
    marginTop: 15,
    padding: 20,
    border: "1px dashed #555",
    textAlign: "center"
  }}
>
  {hombre ? (
    <img
      src={imagenesHombre[hombre]}
      alt={hombre}
      style={{
        maxWidth: "100%",
        maxHeight: 350,
        borderRadius: 10,
        objectFit: "cover"
      }}
    />
  ) : (
    "Selecciona un estilo para ver referencia"
  )}
  <h4>Colores sugeridos (Hombre)</h4>

<div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
  {paleta.map(color => (
    <div
      key={color}
      onClick={() => agregarColorHombre(color)}
      style={{
        width: 35,
        height: 35,
        background: color,
        borderRadius: "50%",
        cursor: "pointer",
        border: "2px solid white"
      }}
    />
  ))}
</div>

{/* COLORES SELECCIONADOS */}
<div style={{ marginTop: 15, display: "flex", gap: 10, flexWrap: "wrap" }}>
  {coloresHombre.map(color => (
    <div
      key={color}
      onClick={() => eliminarColorHombre(color)}
      title="Click para eliminar"
      style={{
        width: 40,
        height: 40,
        background: color,
        borderRadius: "50%",
        cursor: "pointer",
        border: "3px solid #4da6ff"
      }}
    />
  ))}
</div>
</div>

          <hr />

          {/* ================= MUJER ================= */}
          <h3 className="admin-total">Mujer</h3>

          <div style={{ display: "flex", gap: 15, flexWrap: "wrap" }}>
            {estilos.map(estilo => (
              <button
                key={estilo}
                onClick={() => setMujer(estilo)}
                style={{
                  padding: 10,
                  background:
                    mujer === estilo ? "#ff4da6" : "#222",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  cursor: "pointer"
                }}
              >
                {estilo}
              </button>
            ))}
          </div>

          {/* ESPACIO PARA IMÁGENES MUJER */}
          <div
  style={{
    marginTop: 15,
    padding: 20,
    border: "1px dashed #555",
    textAlign: "center"
  }}
>
  {mujer ? (
    <img
      src={imagenesMujer[mujer]}
      alt={mujer}
      style={{
        maxWidth: "100%",
        maxHeight: 350,
        borderRadius: 10,
        objectFit: "cover"
      }}
    />
  ) : (
    "Selecciona un estilo para ver referencia"
  )}
  <h4>Colores sugeridos (Mujer)</h4>

<div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
  {paleta.map(color => (
    <div
      key={color}
      onClick={() => agregarColorMujer(color)}
      style={{
        width: 35,
        height: 35,
        background: color,
        borderRadius: "50%",
        cursor: "pointer",
        border: "2px solid white"
      }}
    />
  ))}
</div>

<div style={{ marginTop: 15, display: "flex", gap: 10, flexWrap: "wrap" }}>
  {coloresMujer.map(color => (
    <div
      key={color}
      onClick={() => eliminarColorMujer(color)}
      title="Click para eliminar"
      style={{
        width: 40,
        height: 40,
        background: color,
        borderRadius: "50%",
        cursor: "pointer",
        border: "3px solid #ff4da6"
      }}
    />
  ))}
</div>
</div>

          <hr />

          

          <button onClick={guardar}>
            Guardar código de vestimenta
          </button>
        </>
      )}

    </div>
  );
}