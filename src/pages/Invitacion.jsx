import { useParams, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useRef } from "react";
import { db } from "../firebase/config";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs
} from "firebase/firestore";

export default function Invitacion() {

  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const tokenURL = searchParams.get("token");

  const [invitado, setInvitado] = useState(null);
  const [confirmados, setConfirmados] = useState(0);
  const [guardando, setGuardando] = useState(false);
  const [abierta, setAbierta] = useState(false);

  const [eventos, setEventos] = useState([]);
  const [ahora, setAhora] = useState(Date.now());

  const [url, setMusicaURL] = useState("");
  const [padrinos, setPadrinos] = useState([]);
  const [padres, setPadres] = useState([]);
  const [itinerarios, setItinerarios] = useState([]);
const [actividades, setActividades] = useState([]);
const [vestimenta, setVestimenta] = useState(null);
const [qrs, setQrs] = useState([]);
const audioIntro = useRef(null);

useEffect(() => {

  const iniciarAudio = () => {
    audioIntro.current?.play();
    window.removeEventListener("click", iniciarAudio);
  };

  window.addEventListener("click", iniciarAudio);

  return () => window.removeEventListener("click", iniciarAudio);

}, []);
  // ============================
  // Actualizar contador
  // ============================

  useEffect(() => {

    const intervalo = setInterval(() => {
      setAhora(Date.now());
    }, 1000);

    return () => clearInterval(intervalo);

  }, []);
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
};
  // ============================
  // Cargar invitación
  // ============================

  useEffect(() => {

    const obtenerInvitado = async () => {

      try {

        const ref = doc(db, "invitados", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setInvitado("denegado");
          return;
        }

        const data = snap.data();

        if (data.token !== tokenURL) {
          setInvitado("denegado");
          return;
        }

        setInvitado(data);
        setConfirmados(data.asistentesConfirmados || 0);

      } catch (error) {

        console.error(error);
        setInvitado("denegado");

      }

    };

    obtenerInvitado();

  }, [id, tokenURL]);

  // ============================
  // Cargar eventos
  // ============================

  useEffect(() => {

    const cargarEventos = async () => {

      const snapshot = await getDocs(collection(db, "eventos"));

      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setEventos(lista);

    };

    cargarEventos();

  }, []);
  // ============================
// Cargar padres
// ============================

useEffect(() => {

  const cargarPadres = async () => {

    try {

      const snapshot = await getDocs(collection(db, "padres"));

      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPadres(lista);

    } catch (error) {
      console.error("Error cargando padres:", error);
    }

  };

  cargarPadres();

}, []);
// ============================
// Cargar padrinos
// ============================

useEffect(() => {

  const cargarPadrinos = async () => {

    try {

      const snapshot = await getDocs(collection(db, "padrinos"));

      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setPadrinos(lista);

    } catch (error) {
      console.error("Error cargando padrinos:", error);
    }

  };

  cargarPadrinos();

}, []);
  // ============================
  // Cargar música
  // ============================

  useEffect(() => {

    const cargarMusica = async () => {

      try {

        const ref = doc(db, "configuracion", "musica");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();

          if (data.url) {
            setMusicaURL(data.url);
          }
        }

      } catch (error) {
        console.error("Error cargando música:", error);
      }

    };

    cargarMusica();

  }, []);

  // ============================
  // Calcular tiempo
  // ============================

  const calcularTiempo = (fechaEvento) => {

    if (!fechaEvento) return null;

    const fecha = fechaEvento.toDate
      ? fechaEvento.toDate()
      : new Date(fechaEvento);

    const ahora = new Date();

    const diferencia = fecha - ahora;

    if (diferencia <= 0) return "Evento iniciado";

    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor((diferencia / (1000 * 60 * 60)) % 24);
    const minutos = Math.floor((diferencia / (1000 * 60)) % 60);
    const segundos = Math.floor((diferencia / 1000) % 60);

    return { dias, horas, minutos, segundos };

  };
  // ============================
// Cargar actividades de itinerarios
// ============================

useEffect(() => {

  const cargarActividades = async () => {

    try {

      const itinerariosSnap = await getDocs(collection(db, "itinerarios"));

      let todas = [];

      for (const it of itinerariosSnap.docs) {

        const actividadesSnap = await getDocs(
          collection(db, "itinerarios", it.id, "actividades")
        );

        const lista = actividadesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        todas = [...todas, ...lista];

      }

      todas.sort((a,b) =>
        (a.hora || "").localeCompare(b.hora || "")
      );

      setActividades(todas);

    } catch (error) {
      console.error("Error cargando actividades:", error);
    }

  };

  cargarActividades();

}, []);
// ============================
// Cargar código de vestimenta
// ============================

useEffect(() => {

  const cargarVestimenta = async () => {

    try {

      const ref = doc(db, "configuracion", "vestimenta");
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setVestimenta(snap.data());
      }

    } catch (error) {
      console.error("Error cargando vestimenta:", error);
    }

  };

  cargarVestimenta();

}, []);
// ============================
// Cargar QR
// ============================

useEffect(() => {

  const cargarQR = async () => {

    try {

      const snapshot = await getDocs(collection(db, "qrs"));

      const lista = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setQrs(lista);

    } catch (error) {
      console.error("Error cargando QR:", error);
    }

  };

  cargarQR();

}, []);
  // ============================
  // Confirmar asistencia
  // ============================

  const confirmarAsistencia = async () => {

    if (!invitado) return;

    if (confirmados > invitado.personasPermitidas) {
      alert("Excede el límite permitido");
      return;
    }

    setGuardando(true);

    try {

      const ref = doc(db, "invitados", id);

      await updateDoc(ref, {
        asistentesConfirmados: confirmados
      });

      alert("Asistencia confirmada 🎉");

    } catch (error) {

      console.error(error);
      alert("Error al guardar");

    }

    setGuardando(false);
  };

  if (invitado === null)
    return (
      <div style={estilos.fullScreen}>
        <h2>Cargando invitación...</h2>
      </div>
    );

  if (invitado === "denegado")
    return (
      <div style={estilos.fullScreen}>
        <h2 style={{ color:"red" }}>
          ❌ Invitación no válida
        </h2>
      </div>
    );

  if (!abierta) {
  return (
       <>
    <audio ref={audioIntro}>
      <source src="/sonidos/magia.mp3" type="audio/mpeg" />
    </audio>

    <div style={estilos.pagina}>
      <div style={estilos.recuadroPrincipal}>
        <div style={estilos.zeldaPortada}>

  <img
    src="/imagenes/invitacion/zelda.png"
    alt="mapaches"
    style={estilos.zeldaImagen}
  />

  <div style={estilos.zeldaMensaje}>
    <h2 style={estilos.zeldaTitulo}>
      ¡Has recibido una Invitación de boda!
    </h2>

    <p style={estilos.zeldaTexto}>
      Objeto que guarda mucho amor
    </p>
  </div>

  <button
    style={estilos.zeldaBoton}
    onClick={() => setAbierta(true)}
  >
    Abrir invitación
  </button>
 

        </div>

      </div>
    </div>
    </>
  );
}

  return (
  <div>

    {/* HERO */}

    <div style={estilos.hero}>
      <div style={estilos.overlay}>
        <h1 style={estilos.heroTitulo}>Nuestra Boda</h1>
        <h2 style={estilos.nombres}>Diego & Keidy</h2>
      </div>
    </div>

{/* MUSICA */}

{url && (
  <div style={estilos.reproductor}>
    <p style={estilos.tituloMusica}>Nuestra canción</p>

    <audio controls autoPlay loop style={{width:"100%"}}>
      <source src={url} />
      Tu navegador no soporta audio
    </audio>
  </div>
)}

{/* CONTADORES */}

<div style={estilos.eventoFull}>
  <div style={estilos.overlayEvento}>
    {eventos.map(ev => {

      const tiempo = calcularTiempo(ev.fechaEvento);

      return (

        <div key={ev.id} style={{ marginBottom: 60 }}>

          <h2 style={estilos.tituloEvento}>{ev.titulo}</h2>

          {typeof tiempo === "string" ? (
            <p>{tiempo}</p>
          ) : tiempo && (

            <div style={estilos.contador}>

              <div style={estilos.bloque}>
                <strong>{tiempo.dias}</strong>
                <span>Días</span>
              </div>

              <div style={estilos.bloque}>
                <strong>{tiempo.horas}</strong>
                <span>Horas</span>
              </div>

              <div style={estilos.bloque}>
                <strong>{tiempo.minutos}</strong>
                <span>Min</span>
              </div>

              <div style={estilos.bloque}>
                <strong>{tiempo.segundos}</strong>
                <span>Seg</span>
              </div>

            </div>

          )}

        </div>

      );

    })}
  </div>
</div>

{/* TARJETAS EVENTOS */}

<div style={estilos.eventosContainer}>
<p style={estilos.tituloeventos}>Eventos</p>
<p style={estilos.subtituloeventos}>Acompañanos en este momento tan especial para nosotros</p>
  {eventos.map(ev => {

    const fecha = ev.fechaEvento?.toDate
      ? ev.fechaEvento.toDate()
      : new Date(ev.fechaEvento);

    const hora = fecha.toLocaleTimeString([], {
      hour:"2-digit",
      minute:"2-digit"
    });

    return (

      <div key={ev.id} style={estilos.eventoCard}>

        <div style={estilos.eventoInfo}>

          <h2>{ev.titulo}</h2>

          <p><strong>Hora:</strong> {hora}</p>

          <p><strong>Lugar:</strong> {ev.lugar}</p>

          <p>{ev.direccion}</p>

          {ev.mapsURL && (
            <a
              href={ev.mapsURL}
              target="_blank"
              rel="noopener noreferrer"
              style={estilos.botonMaps}
            >
              Ver ubicación
            </a>
          )}

        </div>

        <div style={estilos.eventoImagen}>
          <img
            src={ev.imagenURL}
            alt={ev.titulo}
            style={estilos.imagenEvento}
          />
        </div>

      </div>

    );

  })}

</div>

{/* PADRES Y PADRINOS */}

<div style={estilos.padrinosSection}>

  <div style={estilos.padrinoCard}>
     <h2 style={estilos.tituloPadrinos}>
    Padres & Padrinos
  </h2>

    <h2 style={estilos.tituloPadrinos}>
      Nuestros Padres
    </h2>

    {/* PADRES DE LA NOVIA */}

    {padres
      .filter(p => p.lado === "Novia")
      .map(p => (

        <div key={p.id} style={estilos.bloquePadres}>

          <h3 style={estilos.subtituloPadres}>
            Padres de la Novia
          </h3>

          {p.padre && (
            <>
              <p style={estilos.labelPadres}>Padre</p>
              <p style={estilos.nombrePadres}>{p.padre}</p>
            </>
          )}

          {p.madre && (
            <>
              <p style={estilos.labelPadres}>Madre</p>
              <p style={estilos.nombrePadres}>{p.madre}</p>
            </>
          )}

        </div>

      ))}

    {/* PADRES DEL NOVIO */}

    {padres
      .filter(p => p.lado === "Novio")
      .map(p => (

        <div key={p.id} style={estilos.bloquePadres}>

          <h3 style={estilos.subtituloPadres}>
            Padres del Novio
          </h3>

          {p.padre && (
            <>
              <p style={estilos.labelPadres}>Padre</p>
              <p style={estilos.nombrePadres}>{p.padre}</p>
            </>
          )}

          {p.madre && (
            <>
              <p style={estilos.labelPadres}>Madre</p>
              <p style={estilos.nombrePadres}>{p.madre}</p>
            </>
          )}

        </div>

      ))}

    {/* PADRINOS */}

    <h2 style={{...estilos.tituloPadrinos, marginTop:40}}>
      Padrinos
    </h2>

    {padrinos.map(p => (

      <div key={p.id} style={{marginTop:15}}>
{p.descripcion && (
          <p style={estilos.descripcionPadrino}>
            {p.descripcion}
          </p>
        )}
        <p style={estilos.nombrePadres}>
          {p.nombre}
        </p>

        

      </div>

    ))}

  </div>

</div>

{/* ITINERARIO */}

<div style={estilos.itinerarioSection}>

  <h2 style={estilos.tituloPadrinos}>
    Itinerario del evento
  </h2>

 <div style={estilos.itinerarioCard}>

  <img
    src="/imagenes/invitacion/flor.png"
    alt="flor decorativa"
    style={estilos.florItinerario}
  />

    {actividades.map(act => (

  <div key={act.id} style={estilos.actividadFila}>

    <div>

      <div>
        <span style={estilos.horaActividad}>
          {act.hora || "--:--"}
        </span>

         <span  style={estilos.nombreActividad}>{" — "}</span>

        <span style={estilos.nombreActividad}>
          {act.nombre}
        </span>
      </div>

      {act.detalles && (
        <div style={estilos.detalleActividad}>
          {act.detalles}
        </div>
      )}

    </div>

  </div>

))}

  </div>

</div>
{/* CODIGO DE VESTIMENTA */}

{vestimenta && (

<div style={estilos.vestimentaSection}>

  <h2 style={estilos.tituloPadrinos}>
    Código de Vestimenta
  </h2>

  <div style={estilos.vestimentaGrid}>

    {/* HOMBRE */}

    <div style={estilos.vestimentaCard}>

      <h3 style={estilos.tituloVestimenta}>Hombre</h3>

      {vestimenta.hombre && (
        <img
          src={imagenesHombre[vestimenta.hombre]}
          alt="vestimenta hombre"
          style={estilos.vestimentaImagen}
        />
      )}

      <p style={estilos.tipoVestimenta}>{vestimenta.hombre}</p>

      <div style={estilos.coloresVestimenta}>
        {vestimenta.coloresHombre?.map((c,i)=>(
          <div
            key={i}
            style={{
              width:30,
              height:30,
              background:c,
              borderRadius:"50%",
              border:"2px solid #ddd"
            }}
          />
        ))}
      </div>

    </div>

    {/* MUJER */}

    <div style={estilos.vestimentaCard}>

      <h3 style={estilos.tituloVestimenta}>Mujer</h3>

      {vestimenta.mujer && (
        <img
          src={imagenesMujer[vestimenta.mujer]}
          alt="vestimenta mujer"
          style={estilos.vestimentaImagen}
        />
      )}

      <p style={estilos.tipoVestimenta}>{vestimenta.mujer}</p>

      <div style={estilos.coloresVestimenta}>
        {vestimenta.coloresMujer?.map((c,i)=>(
          <div
            key={i}
            style={{
              width:30,
              height:30,
              background:c,
              borderRadius:"50%",
              border:"2px solid #ddd"
            }}
          />
        ))}
      </div>

    </div>

  </div>

</div>

)}
{qrs.length > 0 && (

<div style={estilos.qrSection}>

  <h2 style={estilos.tituloPadrinos}>
    Galería de fotos
  </h2>
  <p style={estilos.qrNombre}>
      comparte con nosotros las fotos de este día tan especial
        </p>

  <div style={estilos.qrGrid}>

    {qrs.map(qr => (

      <div key={qr.id} style={estilos.qrCard}>

        <img
          src={qr.imagenURL}
          alt={qr.nombre}
          style={estilos.qrImagen}
        />

      </div>

    ))}

  </div>

</div>

)}

<div style={estilos.regaloSection}>
 <img
    src="/imagenes/invitacion/flor.png"
    alt="flor decorativa"
    style={estilos.florRegalo}
  />
  <p style={estilos.regaloTexto}>
    Si deseas tener un detalle adicional, el día del evento
    tendremos una cajita para tus buenos deseos y otra para
    ayudarnos a cumplir nuestro sueño de luna de miel.
  </p>

</div>
{/* CONFIRMAR */}
<div style={estilos.tituloConfirmacionSection}>

  <h2 style={estilos.tituloConfirmacion}>
    Confirma tu asistencia
  </h2>

  <p style={estilos.subtituloConfirmacion}>
    Es importante para nosotros contar con tu presencia
  </p>

</div>
<div style={estilos.contenedor}>

  <div style={estilos.invitacion}>
    

    <h2>Invitado: {invitado.nombre}</h2>

    <p>
      Personas permitidas: {invitado.personasPermitidas}
    </p>

    <input
      type="number"
      min="0"
      max={invitado.personasPermitidas}
      value={confirmados}
      onChange={(e) => {

        let valor = Number(e.target.value);

        if (valor < 0) valor = 0;

        if (valor > invitado.personasPermitidas)
          valor = invitado.personasPermitidas;

        setConfirmados(valor);

      }}
      style={estilos.input}
    />

    <button
      onClick={confirmarAsistencia}
      disabled={guardando}
      style={estilos.boton}
    >
      {guardando ? "Guardando..." : "Confirmar asistencia"}
    </button>

  </div>

</div>
<div style={estilos.mensajeFinal}>

  <h2 style={{marginBottom:"30px"}}>
    Nuestra Historia
  </h2>

  <p>
    Dicen que cuando dos corazones están destinados, Dios encuentra la forma de unirlos.
  </p>

  <p>
    Ella pidió una señal en un sueño para reconocer al hombre con quien compartiría su vida.
    Sin saberlo, él soñó con ella.
  </p>

  <p style={estilos.historiaDestacada}>
    Tiempo después, un sábado cualquiera, mientras él picaba un chunk en Minecraft,
    sus caminos se cruzaron.
  </p>

  <p>
    Lo que comenzó como un encuentro inesperado se convirtió en la historia de amor
    que hoy celebramos.
  </p>

  <p>
    Gracias por acompañarnos en este día tan especial.
  </p>

  <p style={{marginTop:"30px"}}>
  Con cariño <br/>
  <strong>Diego & Keidy</strong>
</p>

<img
  src="/imagenes/invitacion/corazon.png"
  alt="corazon"
  style={estilos.corazonFinal}
/>

</div>

  </div>
  
);

}


// ============================
// ESTILOS
// ============================

const estilos = {

fullScreen:{
  minHeight:"100vh",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  textAlign:"center"
},

portada:{
  minHeight:"100vh",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  background:"#111",
  color:"white",
  padding:"20px"
},

contenedor:{
   display:"flex",
  justifyContent:"center",
  alignItems:"flex-start",
  padding:"20px",
  background:"#ede9dd",
  marginTop:"20px"
},
hero:{
  height:"50vh",
  width:"100%",
  backgroundImage:"url('/imagenes/invitacion/festejado.jpeg')",
  backgroundSize:"cover",
  backgroundPosition:"center",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  clipPath:"polygon(0 0,100% 0,100% 94%,50% 100%,0 94%)"
},

overlay:{
  background:"rgba(0,0,0,0.35)",
  width:"100%",
  height:"100%",
  display:"flex",
  flexDirection:"column",
  justifyContent:"center",
  alignItems:"center",
  color:"white",
  textAlign:"center",
  animation:"fadeIn 1.5s ease"
},

heroTitulo:{
  fontSize:"clamp(28px,6vw,60px)",
  marginBottom:"10px"
},

nombres:{
  fontSize:"clamp(40px,8vw,90px)",
  fontFamily:"cursive",
  animation:"fadeUp 1.5s ease"
},

invitacion:{
  width:"100%",
  maxWidth:"500px",
  padding:"30px",
  borderRadius:"20px",
  background:"#7b7861",
  color:"white",
  textAlign:"center",
  boxShadow:"0 10px 30px rgba(0,0,0,0.2)",
  animation:"fadeUp 1s ease"
},

tarjeta:{
  width:"100%",
  maxWidth:"400px",
  padding:"40px",
  borderRadius:"20px",
  background:"#ede9dd",
  animation:"fadeUp 1s ease"
},

titulo:{
  fontSize:"clamp(32px,6vw,60px)",
  marginBottom:"10px",
  color:"#000"
},

subtitulo:{
  marginBottom:"30px",
  fontSize:"18px",
  color:"#000"
},

input:{
  width:"100%",
  padding:"12px",
  marginBottom:"20px",
  borderRadius:"10px",
  border:"none",
  fontSize:"16px"
},

boton:{
  width:"100%",
  padding:"15px",
  fontSize:"18px",
  borderRadius:"10px",
  border:"none",
  cursor:"pointer",
  background:"#d4af37",
  color:"black",
  transition:"transform 0.2s"
},

eventoFull:{
  minHeight:"100vh",
  backgroundImage:"url('/imagenes/invitacion/contador.jpeg')",
  backgroundSize:"cover",
  backgroundPosition:"center",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  clipPath:"polygon(0 0,100% 0,100% 85%,50% 100%,0 85%)"

},

overlayEvento:{
  width:"100%",
  height:"100%",
  background:"rgba(0,0,0,0.45)",
  display:"flex",
  flexDirection:"column",
  justifyContent:"center",
  alignItems:"center",
  color:"white",
  padding:"40px 20px"
},

tituloEvento:{
  fontSize:"clamp(30px,6vw,50px)",
  marginBottom:"40px",
  textAlign:"center"
},

contador:{
  display:"flex",
  flexWrap:"wrap",
  justifyContent:"center",
  gap:"20px",
  fontSize:"clamp(22px,5vw,32px)"
},

bloque:{
  display:"flex",
  flexDirection:"column",
  alignItems:"center"
},

reproductor:{
  width:"90%",
  maxWidth:"500px",
  margin:"40px auto",
  textAlign:"center",
  padding:"20px",
  background:"#ede9dd",
  borderRadius:"15px",
  animation:"fadeUp 1s ease"
},

eventosContainer:{
  width:"90%",
  maxWidth:"1100px",
  margin:"80px auto",
  padding:"20px",
  display:"flex",
  flexDirection:"column",
  gap:"40px",
  alignItems:"center"
},

eventoCard:{
  display:"flex",
  flexDirection:"row",
  flexWrap:"wrap",
  background:"#eaeff1",
  borderRadius:"20px",
  overflow:"hidden",
  boxShadow:"0 15px 40px rgba(0,0,0,0.08)",
  width:"100%",
  maxWidth:"900px",
  margin:"0 auto",
  animation:"fadeUp 1s ease"
},

eventoInfo:{
  flex:"1 1 350px",
  padding:"30px",
  display:"flex",
  flexDirection:"column",
  justifyContent:"center",
  gap:"10px",
  color:"#c79459"
},

eventoImagen:{
  flex:"1 1 350px"
},

imagenEvento:{
  width:"100%",
  height:"100%",
  minHeight:"250px",
  objectFit:"cover"
},

botonMaps:{
  marginTop:"20px",
  display:"inline-block",
  padding:"10px 20px",
  background:"#d4af37",
  color:"#000",
  textDecoration:"none",
  borderRadius:"8px"
},

tituloMusica:{
  marginBottom:"15px",
  fontSize:"20px",
  fontFamily:"Playfair Display, serif",
  letterSpacing:"2px",
  color:"#e7a75d"
},

subtituloeventos:{
  marginTop:"0px",
  marginBottom:"20px",
  fontSize:"clamp(16px,4vw,20px)",
  fontFamily:"Playfair Display, serif",
  letterSpacing:"1px",
  color:"#131212",
  textAlign:"center",
  maxWidth:"600px"
},

tituloeventos:{
  marginBottom:"5px",
  fontSize:"clamp(32px,6vw,50px)",
  fontFamily:"Roboto, sans-serif",
  letterSpacing:"2px",
  color:"#000000",
  textAlign:"center"
},
padrinosSection:{
  width:"90%",
  maxWidth:"1000px",
  margin:"80px auto",
  textAlign:"center"
},

tituloPadrinos:{
  fontSize:"clamp(30px,6vw,50px)",
  fontFamily:"Playfair Display, serif",
  marginBottom:"40px",
  color:"#000"
},

padrinosGrid:{
  display:"grid",
  gridTemplateColumns:"repeat(auto-fit, minmax(250px,1fr))",
  gap:"30px"
},

padrinoCard:{
  background:"#d3d3d3",
  padding:"25px",
  borderRadius:"15px",
  boxShadow:"0 10px 25px rgba(0,0,0,0.08)"
},

nombrePadrino:{
  fontSize:"20px",
  color:"#e7e4e4"
},

descripcionPadrino:{
  marginTop:"8px",
  color:"#522e06"
},
bloquePadres:{
  marginTop:"25px"
},

subtituloPadres:{
  fontSize:"22px",
  fontFamily:"Playfair Display, serif",
  marginBottom:"10px",
  color:"#000"
},

labelPadres:{
  fontSize:"14px",
  color:"#683608",
  marginTop:"10px"
},

nombrePadres:{
  fontSize:"18px",
  color:"#000",
  fontWeight:"500"
},
itinerarioSection:{
  width:"90%",
  maxWidth:"700px",
  margin:"80px auto",
  textAlign:"center"
},

itinerarioCard:{
  background:"#ffffff",
  borderRadius:"20px",
  padding:"40px 30px 30px 30px",
  boxShadow:"0 10px 30px rgba(0,0,0,0.08)",
  display:"flex",
  flexDirection:"column",
  gap:"15px",
  position:"relative"
},

actividadFila:{
  display:"flex",
  justifyContent:"center",
  gap:"20px",
  fontSize:"18px",
  borderBottom:"1px solid #eee",
  paddingBottom:"10px"
},

horaActividad:{
  fontWeight:"bold",
  color:"#c79459"
},

nombreActividad:{
  color:"#000"
},
detalleActividad:{
  fontSize:"14px",
  marginTop:"5px",
  color:"#555"
},
florItinerario:{
  position:"absolute",
  top:"-20px",
  left:"-10px",
  width:"180px",
  opacity:0.9
},
vestimentaSection:{
  width:"90%",
  maxWidth:"900px",
  margin:"80px auto",
  textAlign:"center"
},

vestimentaGrid:{
  display:"flex",
  flexWrap:"wrap",
  gap:"30px",
  justifyContent:"center"
},

vestimentaCard:{
  background:"#ffffff",
  padding:"25px",
  borderRadius:"15px",
  boxShadow:"0 10px 30px rgba(0,0,0,0.08)",
  width:"280px"
},

vestimentaImagen:{
  width:"100%",
  maxHeight:"250px",
  objectFit:"contain",
  borderRadius:"10px",
  marginBottom:"10px"
},

coloresVestimenta:{
  display:"flex",
  gap:"10px",
  justifyContent:"center",
  marginTop:"10px"
},
tituloVestimenta:{
  fontSize:"22px",
  color:"#c79459",
  fontFamily:"Playfair Display, serif",
  marginBottom:"10px"
},

tipoVestimenta:{
  fontSize:"18px",
  color:"#037969",
  fontWeight:"500",
  marginTop:"10px"
},
qrSection:{
  width:"90%",
  maxWidth:"900px",
  margin:"80px auto",
  textAlign:"center"
},

qrGrid:{
  display:"flex",
  flexWrap:"wrap",
  gap:"30px",
  justifyContent:"center"
},

qrCard:{
  background:"#fff",
  padding:"7px",
  borderRadius:"22px",
  boxShadow:"0 10px 30px rgba(0,0,0,0.08)",
  width:"285px",
  textAlign:"center"
},

qrImagen:{
  width:"292px",
  height:"280px",
  objectFit:"contain"
},

qrNombre:{
  marginTop:"10px",
  fontSize:"16px",
  color:"#333"
},
tituloConfirmacionSection:{
  width:"90%",
  maxWidth:"700px",
  margin:"60px auto 20px auto",
  textAlign:"center"
},

tituloConfirmacion:{
  fontSize:"clamp(32px,6vw,48px)",
  fontFamily:"Playfair Display, serif",
  color:"#000",
  marginBottom:"10px"
},

subtituloConfirmacion:{
  fontSize:"18px",
  color:"#444",
  maxWidth:"500px",
  margin:"0 auto"
},
zeldaPortada:{
  position:"relative",
  width:"100%",
  maxWidth:"500px",
  margin:"0 auto",
  paddingTop:"0px",
  textAlign:"center"
},

zeldaImagen:{
  width:"300px",
  display:"block",
  margin:"0 auto",
  position:"relative",
  zIndex:1,
  animation:"fadeZoom 1.5s ease"
},

zeldaMensaje:{
  background:"rgba(9, 56, 187, 0.47)",
  borderRadius:"15px",
  padding:"30px",
  marginTop:"-60px",
  boxShadow:"0 10px 30px rgba(0,0,0,0.3)",
  color:"white",
  position:"relative",
  zIndex:2,
  animation:"subirMensaje 1.5s ease"
},

zeldaTitulo:{
  fontSize:"20px",
  marginBottom:"10px"
},

zeldaTexto:{
  fontSize:"15px"
},

zeldaBoton:{
  marginTop:"20px",
  padding:"15px 40px",
  background:"#071197f5",
  border:"none",
  borderRadius:"10px",
  fontSize:"18px",
  fontWeight:"bold",
  cursor:"pointer",
  boxShadow:"0 6px 20px rgba(0,0,0,0.4)",
  animation:"fadeIn 2s ease"
},
pagina:{
  minHeight:"100vh",
  background:"#e5e2d8",
  display:"flex",
  justifyContent:"center",
  alignItems:"center",
  padding:"30px"
},

recuadroPrincipal:{
  width:"100%",
  maxWidth:"700px",
  background:"#fff",
  borderRadius:"50px",
  overflow:"hidden",
  boxShadow:"0 20px 60px rgba(0,0,0,0.15)",
  padding:"40px 20px"
},
mensajeFinal:{
  textAlign:"center",
  margin:"1px auto",
  maxWidth:"700px",
  fontSize:"18px",
  color:"#444",
  lineHeight:"1.7",
  padding:"20px"
},

historiaDestacada:{
  fontStyle:"italic",
  color:"#c79459",
  fontWeight:"500",
  margin:"20px 0"
},
regaloSection:{
  width:"80%",
  maxWidth:"700px",
  margin:"30px auto 10px auto",
  textAlign:"center",
  padding:"clamp(25px,5vw,50px)",
  background:"#ffffff",
  borderRadius:"20px",
  boxShadow:"0 10px 30px rgba(0,0,0,0.08)",
  position:"relative"
},

regaloTexto:{
  fontSize:"clamp(16px,4vw,20px)",
  color:"#555",
  lineHeight:"1.7",
  maxWidth:"500px",
  margin:"0 auto"
},
florRegalo:{
  position:"absolute",
  top:"-15px",
  left:"-10px",
  width:"120px",
  opacity:0.9,
  zIndex:3
},
corazonFinal:{
  width:"200px",
  marginTop:"1px",
  opacity:0.9
},
};
