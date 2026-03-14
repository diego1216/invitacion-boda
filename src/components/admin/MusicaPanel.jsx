import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { doc, setDoc, getDoc } from "firebase/firestore";

export default function MusicaPanel() {

  // ============================
  // STATES
  // ============================
  const [musicaURL, setMusicaURL] = useState("");
  const [guardando, setGuardando] = useState(false);

  // ============================
  // CARGAR MÚSICA EXISTENTE
  // ============================
  useEffect(() => {

    const cargarMusica = async () => {
      try {
        const ref = doc(db, "configuracion", "musica");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setMusicaURL(snap.data().url || "");
        }
      } catch (error) {
        console.error("Error cargando música:", error);
      }
    };

    cargarMusica();

  }, []);

  // ============================
  // GUARDAR MÚSICA
  // ============================
  const guardarMusica = async () => {

    if (!musicaURL.trim()) {
      alert("Pega el link del audio");
      return;
    }

    try {
      setGuardando(true);

      await setDoc(
        doc(db, "configuracion", "musica"),
        {
          url: musicaURL,
          actualizado: new Date()
        }
      );

      alert("Música guardada ✅");

    } catch (error) {
      console.error(error);
      alert("Error al guardar");
    }

    setGuardando(false);
  };

  // ============================
  // UI
  // ============================
  return (
    <div style={{ maxWidth: 700 }}>

      <h2 className="admin-total">Música de la Invitación</h2>

      <p className="admin-subtitle">
        Pega el link directo del archivo MP3 (Cloudinary).
        Esta música se reproducirá automáticamente cuando el invitado
        abra su invitación.
      </p>

      <input
        placeholder="https://res.cloudinary.com/.../musica.mp3"
        value={musicaURL}
        onChange={(e) => setMusicaURL(e.target.value)}
        style={{
          width: "100%",
          padding: 10,
          marginTop: 10
        }}
      />

      <br /><br />

      <button onClick={guardarMusica}>
        {guardando ? "Guardando..." : "Guardar música"}
      </button>

      {/* PREVIEW */}
      {musicaURL && (
        <>
          <hr />

          <p>Vista previa:</p>

          <audio controls style={{ width: "100%" }}>
            <source src={musicaURL} type="audio/mpeg" />
          </audio>
        </>
      )}

    </div>
  );
}