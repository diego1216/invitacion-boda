import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";
import QRPanel from "../components/admin/QRPanel";
import MusicaPanel from "../components/admin/MusicaPanel";
import CodigoVestimentaPanel from "../components/admin/CodigoVestimentaPanel";
import ItinerariosPanel from "../components/admin/ItinerariosPanel"; // ✅ NUEVO
import EventosPanel from "../components/admin/EventosPanel";
import PadrinosPanel from "../components/admin/PadrinosPanel";
import PadresPanel from "../components/admin/PadresPanel";
export default function AdminPanel() {

  // ================================
  // 🧭 NAVEGACIÓN DEL PANEL
  // ================================
  const [vista, setVista] = useState("menu");

  // ================================
  // ESTADOS INVITACIONES
  // ================================
  const [nombre, setNombre] = useState("");
  const [personas, setPersonas] = useState(1);
  const [invitados, setInvitados] = useState([]);

  const [editandoId, setEditandoId] = useState(null);
  const [editNombre, setEditNombre] = useState("");
  const [editPersonas, setEditPersonas] = useState(1);

  const generarToken = () => Math.random().toString(36).substring(2, 12);
  

  // 🔥 LISTENER REALTIME
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "invitados"),
      (snapshot) => {
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setInvitados(data);
      }
    );
    return () => unsubscribe();
  }, []);

  // ================================
  // ✅ CREAR INVITACIÓN
  // ================================
  const crearInvitacion = async () => {
    if (!nombre.trim()) {
      alert("Escribe un nombre");
      return;
    }

    const token = generarToken();

    const docRef = await addDoc(collection(db, "invitados"), {
      nombre,
      personasPermitidas: Number(personas),
      asistentesConfirmados: 0,
      token,
      creado: new Date()
    });

    const link = `${window.location.origin}/invitacion/${docRef.id}?token=${token}`;

    await updateDoc(docRef, {
      linkInvitacion: link
    });

    setNombre("");
    setPersonas(1);
  };

  // ================================
  // ✏️ EDICIÓN
  // ================================
  const iniciarEdicion = (inv) => {
    setEditandoId(inv.id);
    setEditNombre(inv.nombre);
    setEditPersonas(inv.personasPermitidas);
  };

  const guardarEdicion = async () => {
    if (!editNombre.trim()) {
      alert("Nombre inválido");
      return;
    }

    await updateDoc(doc(db, "invitados", editandoId), {
      nombre: editNombre,
      personasPermitidas: Number(editPersonas)
    });

    setEditandoId(null);
  };

  // ================================
  // ❌ ELIMINAR
  // ================================
  const eliminarInvitacion = async (id) => {
    const confirmar = window.confirm("¿Eliminar esta invitación?");
    if (!confirmar) return;
    await deleteDoc(doc(db, "invitados", id));
  };

  // ================================
  // 📋 COPIAR LINK
  // ================================
  const copiarLink = async (link) => {
    if (!link) {
      alert("El link aún no está listo");
      return;
    }
    await navigator.clipboard.writeText(link);
    alert("Link copiado ✅");
  };

  const totalAsistentes = invitados.reduce(
    (acc, inv) => acc + (inv.asistentesConfirmados || 0),
    0
  );

  // ===================================================
  // 🧭 MENU PRINCIPAL
  // ===================================================
  if (vista === "menu") {
    return (
      <div style={{ padding: 40, textAlign: "center" }}>
        <h1 className="admin-title">Panel Administrador para:cambiar nombre</h1>

        <button
          onClick={() => setVista("invitaciones")}
          style={{ marginRight: 20 }}
        >
          Invitaciones
        </button>
<button onClick={() => setVista("qr")}
  style={{ marginRight: 20 }}>
  QR
</button>
        <button
          onClick={() => setVista("eventos")}
          style={{ marginRight: 20 }}
        >
          Eventos
        </button>
<button
  onClick={() => setVista("vestimenta")}
  style={{ marginRight: 20 }}
>
  
  Código de vestimenta
</button>
<button
  onClick={() => setVista("padrinos")}
  style={{ marginRight: 20 }}
>
  Padrinos y Padres
</button>
        {/* ✅ NUEVO BOTÓN */}
        <button onClick={() => setVista("itinerarios")}>
          Itinerarios
        </button>
        <button
  onClick={() => setVista("musica")}
  style={{ marginLeft: 20 }}
>
  Música
</button>
      </div>
    );
  }

  // ===================================================
  // 🎉 EVENTOS
  // ===================================================
  if (vista === "eventos") {
    return (
      <div style={{ padding: 40 }}>
        <button onClick={() => setVista("menu")}>
          ← Volver
        </button>

        <h1 className="admin-title">Eventos</h1>
        <EventosPanel />
      </div>
    );
  }

  // ===================================================
  // 🗓️ ITINERARIOS (NUEVO)
  // ===================================================
  if (vista === "itinerarios") {
    return (
      <div style={{ padding: 40 }}>
        <button onClick={() => setVista("menu")}>
          ← Volver
        </button>

        <h1 className="admin-title">Administrador de Itinerarios</h1>

        <ItinerariosPanel />
      </div>
    );
  }
  
  // ===================================================
// 👗 CÓDIGO DE VESTIMENTA
// ===================================================
if (vista === "vestimenta") {
  return (
    <div style={{ padding: 40 }}>
      <button onClick={() => setVista("menu")}>
        ← Volver
      </button>

      <h1 className="admin-title">Código de Vestimenta</h1>

      <CodigoVestimentaPanel />
    </div>
  );
}
// ===================================================
// 🎵 MÚSICA
// ===================================================
if (vista === "musica") {
  return (
    <div style={{ padding: 40 }}>
      <button onClick={() => setVista("menu")}>
        ← Volver
      </button>

      <h1 className="admin-title">Configuración de Música</h1>

      <MusicaPanel />
    </div>
  );
}
// ===================================================
  // 🔳 QR
  // ===================================================
  if (vista === "qr") {
    return (
      <div style={{ padding: 40 }}>
        <button onClick={() => setVista("menu")}>← Volver</button>

        <h1 className="admin-title">Administrador de QR</h1>

        <QRPanel />
      </div>
    );
  }
  // ===================================================
// 👨‍👩‍👧 PADRINOS Y PADRES
// ===================================================
if (vista === "padrinos") {
  return (
    <div style={{ padding: 40 }}>
      <button onClick={() => setVista("menu")}>
        ← Volver
      </button>

      <h1 className="admin-title">Padrinos y Padres</h1>

      <button
        style={{ marginRight: 20 }}
        onClick={() => setVista("verPadrinos")}
      >
        Administrar Padrinos
      </button>

      <button
        onClick={() => setVista("verPadres")}
      >
        Administrar Padres
      </button>
    </div>
  );
}
if (vista === "verPadrinos") {
  return (
    <div style={{ padding: 40 }}>
      <button onClick={() => setVista("padrinos")}>
        ← Volver
      </button>

      <PadrinosPanel />
    </div>
  );
}

if (vista === "verPadres") {
  return (
    <div style={{ padding: 40 }}>
      <button onClick={() => setVista("padrinos")}>
        ← Volver
      </button>

      <PadresPanel />
    </div>
  );
}
  // ===================================================
  // 💌 INVITACIONES
  // ===================================================
  if (vista === "invitaciones") {
    return (
      <div style={{ padding: 40, maxWidth: 800, margin: "auto" }}>
        <button onClick={() => setVista("menu")}>
          ← Volver
        </button>

        <h1 className="admin-title">Panel Administrador para:cambiar nombre</h1>


        <h3 className="admin-subtitle">Crear Invitación</h3>

        <input
          placeholder="Nombre o Familia"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          style={{ marginRight: 10 }}
        />

        <input
          type="number"
          min="1"
          value={personas}
          onChange={(e) => setPersonas(e.target.value)}
          style={{ width: 80, marginRight: 10 }}
        />

        <button onClick={crearInvitacion}>
          Generar Invitación
        </button>

        <hr />

        <h2 className="admin-total">
  Total asistentes confirmados: {totalAsistentes}
</h2>

       <h3 className="admin-subtitle">Invitados</h3>

        {invitados.map(inv => {
          const estaEditando = editandoId === inv.id;

          return (
            <div
              key={inv.id}
              style={{
                border: "1px solid #444",
                marginBottom: 15,
                padding: 15,
                borderRadius: 10,
                background: "#1a1a1a",
                color: "white"
              }}
            >
              {estaEditando ? (
                <>
                  <input
                    value={editNombre}
                    onChange={(e) => setEditNombre(e.target.value)}
                  />

                  <input
                    type="number"
                    min="1"
                    value={editPersonas}
                    onChange={(e) => setEditPersonas(e.target.value)}
                    style={{ width: 80, marginLeft: 10 }}
                  />

                  <div style={{ marginTop: 10 }}>
                    <button onClick={guardarEdicion}>Guardar</button>
                    <button
                      style={{ marginLeft: 10 }}
                      onClick={() => setEditandoId(null)}
                    >
                      Cancelar
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <strong className="admin-nombre">{inv.nombre}</strong>

                  <div className="admin-text">
  Personas permitidas: {inv.personasPermitidas}
</div>
                  <div className="admin-text">
  Confirmados: {inv.asistentesConfirmados || 0}
</div>

                  <div style={{ marginTop: 10 }}>
                    <button onClick={() => iniciarEdicion(inv)}>Editar</button>
                    <button
                      style={{ marginLeft: 10 }}
                      onClick={() => eliminarInvitacion(inv.id)}
                    >
                      Eliminar
                    </button>
                  </div>
                </>
              )}

              <hr style={{ margin: "12px 0" }} />

              <small>Link de invitación:</small>

              <div
                style={{
                  background: "#000",
                  padding: 10,
                  marginTop: 6,
                  borderRadius: 6,
                  wordBreak: "break-all",
                  fontSize: 13
                }}
              >
                {inv.linkInvitacion ? (
                  <a
                    href={inv.linkInvitacion}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#4da6ff" }}
                  >
                    {inv.linkInvitacion}
                  </a>
                ) : (
                  "Generando link..."
                )}
              </div>

              <button
                style={{ marginTop: 10 }}
                onClick={() => copiarLink(inv.linkInvitacion)}
              >
                Copiar link
              </button>
            </div>
          );
        })}
      </div>
    );
  }
}