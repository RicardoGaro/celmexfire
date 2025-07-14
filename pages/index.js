import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

// --- DATOS DE CONFIGURACIÓN ---
const modelos = [
  { modelo: "iPhone 11", colores: ["Black", "Green", "Purple", "Red", "White", "Yellow"], capacidades: ["64 GB", "128 GB", "256 GB"] },
  { modelo: "iPhone 11 Pro", colores: ["Gold", "Space Gray", "Silver", "Midnight Green"], capacidades: ["64 GB", "256 GB", "512 GB"] },
  { modelo: "iPhone 11 Pro Max", colores: ["Gold", "Space Gray", "Silver", "Midnight Green"], capacidades: ["64 GB", "256 GB", "512 GB"] },
  { modelo: "iPhone 12", colores: ["Black", "Blue", "Green", "Red", "White", "Purple"], capacidades: ["64 GB", "128 GB", "256 GB"] },
  { modelo: "iPhone 12 Pro", colores: ["Silver", "Graphite", "Gold", "Pacific Blue"], capacidades: ["128 GB", "256 GB", "512 GB"] },
  { modelo: "iPhone 12 Pro Max", colores: ["Silver", "Graphite", "Gold", "Pacific Blue"], capacidades: ["128 GB", "256 GB", "512 GB"] },
  { modelo: "iPhone 13", colores: ["Starlight", "Midnight", "Blue", "Pink", "Green", "Red"], capacidades: ["128 GB", "256 GB", "512 GB"] },
  { modelo: "iPhone 13 Pro", colores: ["Graphite", "Gold", "Silver", "Sierra Blue", "Alpine Green"], capacidades: ["128 GB", "256 GB", "512 GB", "1 TB"] },
  { modelo: "iPhone 13 Pro Max", colores: ["Graphite", "Gold", "Silver", "Sierra Blue", "Alpine Green"], capacidades: ["128 GB", "256 GB", "512 GB", "1 TB"] },
  { modelo: "iPhone 14", colores: ["Blue", "Purple", "Yellow", "Midnight", "Starlight", "Red"], capacidades: ["128 GB", "256 GB", "512 GB"] },
  { modelo: "iPhone 14 Pro", colores: ["Deep Purple", "Gold", "Silver", "Space Black"], capacidades: ["128 GB", "256 GB", "512 GB", "1 TB"] },
  { modelo: "iPhone 14 Pro Max", colores: ["Deep Purple", "Gold", "Silver", "Space Black"], capacidades: ["128 GB", "256 GB", "512 GB", "1 TB"] },
  { modelo: "iPhone 15", colores: ["Black", "Blue", "Green", "Yellow", "Pink"], capacidades: ["128 GB", "256 GB", "512 GB"] },
  { modelo: "iPhone 15 Pro", colores: ["Black Titanium", "White Titanium", "Blue Titanium", "Natural Titanium"], capacidades: ["128 GB", "256 GB", "512 GB", "1 TB"] },
  { modelo: "iPhone 15 Pro Max", colores: ["Black Titanium", "White Titanium", "Blue Titanium", "Natural Titanium"], capacidades: ["256 GB", "512 GB", "1 TB"] },
  { modelo: "iPhone 16", colores: ["Black", "White", "Silver"], capacidades: ["128 GB", "256 GB", "512 GB"] },
  { modelo: "iPhone 16 Pro", colores: ["Titan Gray", "Silver", "Dark Blue"], capacidades: ["256 GB", "512 GB", "1 TB"] },
  { modelo: "iPhone 16 Pro Max", colores: ["Titan Gray", "Silver", "Dark Blue"], capacidades: ["256 GB", "512 GB", "1 TB"] }
];
const accesorios = ["Caja y cable", "Caja", "Cable", "Sin caja"];
const estados = ["Disponible", "Vendido", "Reservado"];
const todasLasCapacidades = [...new Set(modelos.flatMap(m => m.capacidades))];

// --- COMPONENTE DE TARJETA DE INVENTARIO ---
const InventoryCard = ({ item, onEliminar, onCambiarEstado }) => {
  const detallesFormateados = item.detalles?.map(detalle => {
    if (detalle === "Otro" && item.otroDetalle) return `Otro: ${item.otroDetalle}`;
    if (detalle === "Mensaje pieza" && item.mensajePieza) return `Mensaje pieza: ${item.mensajePieza}`;
    if (detalle === "Estrellado" && item.estrelladoParte) return `Estrellado: ${item.estrelladoParte}`;
    return detalle;
  }).join(", ") || "Ninguno";

  return (
    <div className="inventory-card">
      <div className="card-header">
        <h3>{item.modelo}</h3>
        <span className={`item-status ${item.estado?.toLowerCase()}`}>{item.estado}</span>
      </div>
      <div className="card-body">
        <div className="info-item"><span>Color</span><span>{item.color || 'N/A'}</span></div>
        <div className="info-item"><span>Capacidad</span><span>{item.capacidad || 'N/A'}</span></div>
        <div className="info-item"><span>Batería</span><span>{item.bateria ? `${item.bateria}%` : 'N/A'}</span></div>
        <div className="info-item"><span>Condición</span><span>{item.condicion || 'N/A'}</span></div>
        <div className="info-item"><span>IMEI</span><span>...{item.imei}</span></div>
        <div className="info-item"><span>Accesorios</span><span>{item.accesorios || 'N/A'}</span></div>
      </div>
      <div className="card-details">
        <strong>Detalles:</strong> {detallesFormateados}
      </div>
      <div className="card-footer">
        <span className="costo">${new Intl.NumberFormat('es-MX').format(item.costo)}</span>
        <button onClick={() => onEliminar(item.id)} title="Eliminar">🗑️</button>
      </div>
    </div>
  );
};


export default function Home() {
  // --- ESTADOS ---
  const estadoInicialFormulario = {
    modelo: "", color: "", capacidad: "", imei: "", condicion: "Usado",
    bateria: "", accesorios: "", costo: "", estado: "Disponible", detalles: [],
    mensajePieza: "", estrelladoParte: "", otroDetalle: ""
  };
  const [form, setForm] = useState(estadoInicialFormulario);
  const [inventario, setInventario] = useState([]);
  const [vistaActiva, setVistaActiva] = useState('consulta');
  const [filtros, setFiltros] = useState({ modelo: '', capacidad: '' });

  // --- EFECTOS ---
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "inventario"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventario(data);
    });
    return () => unsub();
  }, []);

  // --- MANEJADORES DE EVENTOS ---
  const handleFormChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFiltroChange = (e) => setFiltros({ ...filtros, [e.target.name]: e.target.value });
  const handleDetallesChange = (e) => {
    const { value, checked } = e.target;
    setForm(prev => ({
      ...prev,
      detalles: checked ? [...prev.detalles, value] : prev.detalles.filter(d => d !== value)
    }));
  };

  // --- LÓGICA DE FIREBASE ---
  const guardar = async () => {
    if (!form.modelo || !form.imei || !form.costo) {
        alert("Por favor, completa los campos Modelo, IMEI y Costo.");
        return;
    }
    await addDoc(collection(db, "inventario"), {
      ...form,
      costo: Number(form.costo) || 0,
      bateria: Number(form.bateria) || 0,
      fecha: new Date().toLocaleDateString('es-MX')
    });
    setForm(estadoInicialFormulario);
    alert("¡Equipo agregado al inventario!");
    setVistaActiva('consulta'); // Cambiar a la vista de consulta después de guardar
  };

  const eliminar = async (id) => {
    if (confirm("¿Estás seguro de que quieres eliminar este artículo?")) {
        await deleteDoc(doc(db, "inventario", id));
    }
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    await updateDoc(doc(db, "inventario", id), { estado: nuevoEstado });
  };

  // --- LÓGICA DE FILTRADO ---
  const inventarioFiltrado = inventario.filter(item => {
    const pasaModelo = filtros.modelo ? item.modelo === filtros.modelo : true;
    const pasaCapacidad = filtros.capacidad ? item.capacidad === filtros.capacidad : true;
    return pasaModelo && pasaCapacidad;
  });

  const modeloSeleccionado = modelos.find(m => m.modelo === form.modelo);

  return (
    <div className="container">
      <h1>📱 Inventario CELMX</h1>
      
      <div className="view-switcher">
        <button onClick={() => setVistaActiva('consulta')} className={vistaActiva === 'consulta' ? 'active' : ''}>
          Consultar Inventario
        </button>
        <button onClick={() => setVistaActiva('registro')} className={vistaActiva === 'registro' ? 'active' : ''}>
          Registrar Equipo
        </button>
      </div>

      {vistaActiva === 'consulta' && (
        <div id="consulta-view">
          <h2>Filtros de Búsqueda</h2>
          <div className="filtros-container">
              <select name="modelo" value={filtros.modelo} onChange={handleFiltroChange}>
                  <option value="">Todos los Modelos</option>
                  {modelos.map(m => <option key={m.modelo} value={m.modelo}>{m.modelo}</option>)}
              </select>
              <select name="capacidad" value={filtros.capacidad} onChange={handleFiltroChange}>
                  <option value="">Todas las Capacidades</option>
                  {todasLasCapacidades.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
          </div>

          <h2>Resultados ({inventarioFiltrado.length})</h2>
          <div className="inventory-grid">
            {inventarioFiltrado.map((item) => (
              <InventoryCard 
                key={item.id} 
                item={item} 
                onEliminar={eliminar} 
                onCambiarEstado={cambiarEstado} 
              />
            ))}
          </div>
        </div>
      )}

      {vistaActiva === 'registro' && (
        <div id="registro-view">
            <h2>➕ Registrar Nuevo Equipo</h2>
            <div className="formulario">
                <select name="modelo" value={form.modelo} onChange={handleFormChange}>
                    <option value="">Selecciona Modelo</option>
                    {modelos.map((m) => <option key={m.modelo} value={m.modelo}>{m.modelo}</option>)}
                </select>
                <select name="color" value={form.color} onChange={handleFormChange} disabled={!modeloSeleccionado}>
                    <option value="">Selecciona Color</option>
                    {modeloSeleccionado?.colores.map((c) => <option key={c}>{c}</option>)}
                </select>
                <select name="capacidad" value={form.capacidad} onChange={handleFormChange} disabled={!modeloSeleccionado}>
                    <option value="">Selecciona Capacidad</option>
                    {modeloSeleccionado?.capacidades.map((c) => <option key={c}>{c}</option>)}
                </select>
                <input name="imei" maxLength={5} placeholder="IMEI (últimos 5)" value={form.imei} onChange={handleFormChange} />
                <select name="condicion" value={form.condicion} onChange={handleFormChange}>
                    <option>Usado</option><option>Nuevo</option>
                </select>
                <input name="bateria" placeholder="Condición Batería %" type="number" value={form.bateria} onChange={handleFormChange} />
                <select name="accesorios" value={form.accesorios} onChange={handleFormChange}>
                    <option value="">Accesorios</option>
                    {accesorios.map((a) => <option key={a}>{a}</option>)}
                </select>
                <input name="costo" placeholder="Costo (MXN)" type="number" value={form.costo} onChange={handleFormChange} />
                <select name="estado" value={form.estado} onChange={handleFormChange}>
                    {estados.map((e) => <option key={e}>{e}</option>)}
                </select>
                <fieldset>
                    <legend>Detalles Adicionales</legend>
                    {["Face ID", "Zoom", "Mensaje pieza", "Estrellado", "Otro"].map((d) => (
                        <label key={d}><input type="checkbox" value={d} onChange={handleDetallesChange} checked={form.detalles.includes(d)} /> {d}</label>
                    ))}
                    {form.detalles.includes("Mensaje pieza") && <input placeholder="¿Qué mensaje da?" name="mensajePieza" value={form.mensajePieza} onChange={handleFormChange} />}
                    {form.detalles.includes("Estrellado") && <input placeholder="¿Dónde está estrellado?" name="estrelladoParte" value={form.estrelladoParte} onChange={handleFormChange} />}
                    {form.detalles.includes("Otro") && <input placeholder="¿Qué otro detalle?" name="otroDetalle" value={form.otroDetalle} onChange={handleFormChange} />}
                </fieldset>
                <button onClick={guardar}>Agregar al Inventario</button>
            </div>
        </div>
      )}
    </div>
  );
}
