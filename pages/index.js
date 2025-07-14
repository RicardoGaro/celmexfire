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
  const [form, setForm] = useState({
    modelo: "", color: "", capacidad: "", imei: "", condicion: "Usado",
    accesorios: "", costo: "", estado: "Disponible", detalles: [],
    mensajePieza: "", estrelladoParte: "", otroDetalle: ""
  });
  const [inventario, setInventario] = useState([]);

  const modeloSeleccionado = modelos.find(m => m.modelo === form.modelo);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "inventario"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInventario(data);
    });
    return () => unsub();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleDetalles = (e) => {
    const value = e.target.value;
    setForm(prev => ({
      ...prev,
      detalles: prev.detalles.includes(value)
        ? prev.detalles.filter(d => d !== value)
        : [...prev.detalles, value]
    }));
  };

  const guardar = async () => {
    await addDoc(collection(db, "inventario"), {
      ...form,
      fecha: new Date().toLocaleDateString()
    });
    setForm({
      modelo: "", color: "", capacidad: "", imei: "", condicion: "Usado",
      accesorios: "", costo: "", estado: "Disponible", detalles: [],
      mensajePieza: "", estrelladoParte: "", otroDetalle: ""
    });
  };

  const eliminar = async (id) => {
    await deleteDoc(doc(db, "inventario", id));
  };

  const cambiarEstado = async (id, nuevoEstado) => {
    await updateDoc(doc(db, "inventario", id), { estado: nuevoEstado });
  };

  return (
    <div className="container">
      <h1>📱 Inventario CELMX</h1>

      <div className="formulario">
        <select name="modelo" value={form.modelo} onChange={handleChange}>
          <option value="">Modelo</option>
          {modelos.map((m, i) => <option key={i} value={m.modelo}>{m.modelo}</option>)}
        </select>

        <select name="color" value={form.color} onChange={handleChange} disabled={!modeloSeleccionado}>
          <option value="">Color</option>
          {modeloSeleccionado?.colores.map((c, i) => <option key={i}>{c}</option>)}
        </select>

        <select name="capacidad" value={form.capacidad} onChange={handleChange} disabled={!modeloSeleccionado}>
          <option value="">Capacidad</option>
          {modeloSeleccionado?.capacidades.map((c, i) => <option key={i}>{c}</option>)}
        </select>

        <input name="imei" maxLength={5} placeholder="IMEI (últimos 5)" value={form.imei} onChange={handleChange} />
        <select name="condicion" value={form.condicion} onChange={handleChange}>
          <option>Usado</option><option>Nuevo</option>
        </select>
        <select name="accesorios" value={form.accesorios} onChange={handleChange}>
          <option value="">Accesorios</option>
          {accesorios.map((a, i) => <option key={i}>{a}</option>)}
        </select>
        <input name="costo" placeholder="Costo" type="number" value={form.costo} onChange={handleChange} />
        <select name="estado" value={form.estado} onChange={handleChange}>
          {estados.map((e, i) => <option key={i}>{e}</option>)}
        </select>

        <fieldset>
          <legend>Detalles</legend>
          {["Face ID", "Zoom", "Mensaje pieza", "Estrellado", "Otro"].map((d, i) => (
            <label key={i}><input type="checkbox" value={d} onChange={handleDetalles} checked={form.detalles.includes(d)} /> {d}</label>
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

        <button onClick={guardar}>➕ Agregar</button>
      </div>

      <h2>📋 Inventario</h2>
      <table>
        <thead>
          <tr>
            <th>Modelo</th><th>Color</th><th>Capacidad</th><th>IMEI</th><th>Condición</th>
            <th>Accesorios</th><th>Costo</th><th>Estado</th><th>Fecha</th><th>Detalles</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {inventario.map((item) => (
            <tr key={item.id}>
              <td>{item.modelo}</td><td>{item.color}</td><td>{item.capacidad}</td><td>{item.imei}</td>
              <td>{item.condicion}</td><td>{item.accesorios}</td><td>{item.costo}</td>
              <td>
                <select value={item.estado} onChange={(e) => cambiarEstado(item.id, e.target.value)}>
                  {estados.map((s, i) => <option key={i}>{s}</option>)}
                </select>
              </td>
              <td>{item.fecha}</td>
              <td>{item.detalles?.join(", ")}</td>
              <td><button onClick={() => eliminar(item.id)}>❌</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}