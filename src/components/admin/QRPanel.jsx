import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";

export default function QRPanel() {

  const [nombre, setNombre] = useState("");
  const [imagenURL, setImagenURL] = useState("");
  const [qrs, setQrs] = useState([]);

  // =============================
  // ESCUCHAR QRs EN TIEMPO REAL
  // =============================
 useEffect(() => {

  const unsub = onSnapshot(
    collection(db, "qrs"),
    (snapshot) => {
      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQrs(lista);
    },
    (error) => {
      console.error("Error leyendo QRs:", error);
    }
  );

  return () => unsub();

}, []);
  // =============================
  // GUARDAR QR
  // =============================
const convertirLinkDrive = (url) => {

  if (!url.includes("drive.google.com")) return url;

  let id = "";

  // formato /file/d/ID/
  const match1 = url.match(/\/d\/([^\/]+)/);

  if (match1) {
    id = match1[1];
  }

  // formato id=ID
  const match2 = url.match(/[?&]id=([^&]+)/);

  if (!id && match2) {
    id = match2[1];
  }

  if (id) {
    return `https://drive.google.com/uc?export=view&id=${id}`;
  }

  return url;
};

  const guardarQR = async () => {

  if (!nombre || !imagenURL) {
    alert("Completa todos los campos");
    return;
  }

  const urlConvertida = convertirLinkDrive(imagenURL);

  await addDoc(collection(db, "qrs"), {
    nombre,
    imagenURL: urlConvertida,
    creado: serverTimestamp()
  });

  setNombre("");
  setImagenURL("");
};

  // =============================
  // ELIMINAR
  // =============================
  const eliminarQR = async (id) => {
    await deleteDoc(doc(db, "qrs", id));
  };

  // =============================
  // UI
  // =============================
  return (
    <div style={{ maxWidth: 900 }}>

      <h2 className="admin-total">Gestión de QR</h2>

      <input
        placeholder="Nombre del QR (Ej: Fotos boda)"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        style={{ width: "100%", padding: 10, marginBottom: 10 }}
      />

      <input
        placeholder="Pega aquí la URL del QR (PNG)"
        value={imagenURL}
        onChange={(e) => setImagenURL(e.target.value)}
        style={{ width: "100%", padding: 10 }}
      />

      <br /><br />

      <button onClick={guardarQR}>
        Añadir QR
      </button>

      <hr />

      <h3>QRs creados</h3>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {qrs.map(qr => (
          <div key={qr.id} style={{ textAlign: "center" }}>
            <img
              src={qr.imagenURL}
              alt={qr.nombre}
              style={{
                width: 150,
                height: 150,
                objectFit: "contain",
                border: "1px solid #ccc",
                borderRadius: 10
              }}
            />

            <p>{qr.nombre}</p>

            <button onClick={() => eliminarQR(qr.id)}>
              Eliminar
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}