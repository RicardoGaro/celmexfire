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

// Lista de modelos, colores y capacidades
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

export default function Home() {
  // Estado inicial del formulario
  const estadoInicialFormulario = {
    modelo: "", color: "", capacidad: "", imei: "", condicion: "Usado",
    bateria: "", accesorios: "", costo: "", estado: "Disponible", detalles: [],
    mensajePieza: "", estrelladoParte: "", otroDetalle: ""
  };

  const [form, setForm] = useState(estadoInicialFormulario);
  const [inventario, setInventario] = useState([]);

  // Encuentra el modelo seleccionado para mostrar colores y capacidades
  const modeloSeleccionado = modelos.find(m => m.modelo === form.modelo);

  // Efecto para obtener datos de Firebase en tiempo real
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "inventario"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventario(data);
    });
    return () => unsub(); // Limpia la suscripción al desmontar el componente
  }, []);

  // Maneja los cambios en los campos del formulario
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Maneja los cambios en los checkboxes de detalles
  const handleDetalles = (e) => {
    const { value, checked } = e.target;
    setForm(prev => ({
      ...prev,
      detalles: checked
        ? [...prev.detalles, value]
        : prev.detalles.filter(d => d !== value)
    }));
  };

  // Guarda un nuevo artículo en el inventario
  const guardar = async () => {
    if (!form.modelo || !form.imei || !form.costo) {
        alert("Por favor, completa los campos Modelo, IMEI y Costo.");
        return;
    }
    await addDoc(collection(db, "inventario"), {
      ...form,
      costo: Number(form.costo) || 0,
      bateria: Number(form.bateria) || 0,
      fecha: new Date().toLocaleDateString()
    });
    setForm(estadoInicialFormulario); // Resetea el formulario
  };

  // Elimina un artículo del inventario
  const eliminar = async (id) => {
    if (confirm("¿Estás seguro de que quieres eliminar este artículo?")) {
        await deleteDoc(doc(db, "inventario", id));
    }
  };

  // Cambia el estado de un artículo
  const cambiarEstado = async (id, nuevoEstado) => {
    await updateDoc(doc(db, "inventario", id), { estado: nuevoEstado });
  };

  return (
    <div className="container">
      <h1>📱 Inventario CELMX</h1>

      <div className="formulario">
        <select name="modelo" value={form.modelo} onChange={handleChange}>
          <option value="">Selecciona Modelo</option>
          {modelos.map((m) => <option key={m.modelo} value={m.modelo}>{m.modelo}</option>)}
        </select>

        <select name="color" value={form.color} onChange={handleChange} disabled={!modeloSeleccionado}>
          <option value="">Selecciona Color</option>
          {modeloSeleccionado?.colores.map((c) => <option key={c}>{c}</option>)}
        </select>

        <select name="capacidad" value={form.capacidad} onChange={handleChange} disabled={!modeloSeleccionado}>
          <option value="">Selecciona Capacidad</option>
          {modeloSeleccionado?.capacidades.map((c) => <option key={c}>{c}</option>)}
        </select>

        <input name="imei" maxLength={5} placeholder="IMEI (últimos 5)" value={form.imei} onChange={handleChange} />
        <select name="condicion" value={form.condicion} onChange={handleChange}>
          <option>Usado</option><option>Nuevo</option>
        </select>
        
        <input name="bateria" placeholder="Condición Batería %" type="number" value={form.bateria} onChange={handleChange} />

        <select name="accesorios" value={form.accesorios} onChange={handleChange}>
          <option value="">Accesorios</option>
          {accesorios.map((a) => <option key={a}>{a}</option>)}
        </select>
        <input name="costo" placeholder="Costo" type="number" value={form.costo} onChange={handleChange} />
        <select name="estado" value={form.estado} onChange={handleChange}>
          {estados.map((e) => <option key={e}>{e}</option>)}
        </select>

        <fieldset>
          <legend>Detalles Adicionales</legend>
          {["Face ID", "Zoom", "Mensaje pieza", "Estrellado", "Otro"].map((d) => (
            <label key={d}><input type="checkbox" value={d} onChange={handleDetalles} checked={form.detalles.includes(d)} /> {d}</label>
          ))}
          {form.detalles.includes("Mensaje pieza") && (
            <input placeholder="¿Qué mensaje da?" name="mensajePieza" value={form.mensajePieza} onChange={handleChange} />
          )}
          {form.detalles.includes("Estrellado") && (
            <input placeholder="¿Dónde está estrellado?" name="estrelladoParte" value={form.estrelladoParte} onChange={handleChange} />
          )}
          {form.detalles.includes("Otro") && (
            <input placeholder="¿Qué otro detalle?" name="otroDetalle" value={form.otroDetalle} onChange={handleChange} />
          )}
        </fieldset>

        <button onClick={guardar}>➕ Agregar al Inventario</button>
      </div>

      <h2>📋 Inventario Actual</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Modelo</th><th>Color</th><th>Capacidad</th><th>IMEI</th><th>Condición</th>
              <th>Batería</th><th>Accesorios</th><th>Costo</th><th>Estado</th>
              <th>Fecha</th><th>Detalles</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {inventario.map((item) => (
              <tr key={item.id}>
                <td data-label="Modelo">{item.modelo}</td>
                <td data-label="Color">{item.color}</td>
                <td data-label="Capacidad">{item.capacidad}</td>
                <td data-label="IMEI">{item.imei}</td>
                <td data-label="Condición">{item.condicion}</td>
                <td data-label="Batería">{item.bateria ? `${item.bateria}%` : 'N/A'}</td>
                <td data-label="Accesorios">{item.accesorios}</td>
                <td data-label="Costo">{`$${item.costo}`}</td>
                <td data-label="Estado">
                  <select value={item.estado} onChange={(e) => cambiarEstado(item.id, e.target.value)}>
                    {estados.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </td>
                <td data-label="Fecha">{item.fecha}</td>
                <td data-label="Detalles">
                  {item.detalles?.map(detalle => {
                    if (detalle === "Otro" && item.otroDetalle) return `Otro: ${item.otroDetalle}`;
                    if (detalle === "Mensaje pieza" && item.mensajePieza) return `Mensaje pieza: ${item.mensajePieza}`;
                    if (detalle === "Estrellado" && item.estrelladoParte) return `Estrellado: ${item.estrelladoParte}`;
                    return detalle;
                  }).join(", ") || "Ninguno"}
                </td>
                <td data-label="Acciones">
                    <button onClick={() => eliminar(item.id)}>❌</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
