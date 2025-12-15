import React, { useEffect, useState } from 'react';
import { useUser } from "../context/UserContext";
import PageHeader from '../components/PageHeader';
import '../CSS/productos.css';
import '../CSS/dashboard.css';
import '../CSS/menu.css';
import axios from "axios";
import KpiGridDashb from '../components/KpiGridDashb';
import FiltersDashb from '../components/FiltersDashb';
import CotizacionesTableDashb from '../components/CotizacionesTableDashb';

const Dashboard = () => {
  const { usuario } = useUser();

  // estado global
  const [all, setAll] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const perPage = 10;

  // filtros
  const [estado, setEstado] = useState('');
  const [vendedor, setVendedor] = useState('');
  const [razon, setRazon] = useState('');
  const [producto, setProducto] = useState('');
  const [marca, setMarca] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');
  const [buscar, setBuscar] = useState('');

  // cargar datos desde el nuevo endpoint
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    axios.get("/api/cotizaciones/dashboard", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setAll(res.data);
        setFiltered(res.data);
      })
      .catch(err => console.error("Error al obtener cotizaciones:", err))
      .finally(() => setLoading(false));
  }, []);

  // KPIs normalizados
  const kpiCot = all.length;

  const aceptadas = all.filter(r =>
    ["aceptada", "finalizada_aceptada"].includes(r.estado_nombre?.toLowerCase())
  );
  const rechazadas = all.filter(r =>
    ["rechazada", "finalizada_rechazada"].includes(r.estado_nombre?.toLowerCase())
  );
  const pendientes = all.filter(r => r.estado_nombre?.toLowerCase() === 'pendiente');
  const vencidas = all.filter(r => r.estado_nombre?.toLowerCase() === 'vencida');

  const kpiAcept = aceptadas.length;
  const kpiRech = rechazadas.length;
  const kpiPend = pendientes.length;
  const kpiVenc = vencidas.length;

  // 🔹 Ticket promedio general
  const ticket = (
    all.reduce((acc, r) => acc + Number(r.total || 0), 0) / (kpiCot || 1)
  ) || 0;

  // 🔹 Tasas por estado
  const tasaAcept = ((kpiAcept / kpiCot) * 100).toFixed(1);
  const tasaRech = ((kpiRech / kpiCot) * 100).toFixed(1);
  const tasaPend = ((kpiPend / kpiCot) * 100).toFixed(1);
  const tasaVenc = ((kpiVenc / kpiCot) * 100).toFixed(1);

  // aplicar filtros
  const apply = () => {
    const fe = (estado || "").toLowerCase();
    const fv = (vendedor || "").toLowerCase();
    const fr = (razon || "").toLowerCase();
    const fp = (producto || "").toLowerCase();
    const fm = (marca || "").toLowerCase();
    const fd = (desde || "");
    const fh = (hasta || "");
    const fb = (buscar || "").toLowerCase();

    const estadoMap = {
      "aceptada": ["aceptada", "finalizada_aceptada"],
      "rechazada": ["rechazada", "finalizada_rechazada"],
      "pendiente": ["pendiente"],
      "vencida": ["vencida"]
    };

    const result = all.filter(r => {
      const estadoReal = r.estado_nombre?.toLowerCase();

      if (fe) {
        const permitidos = estadoMap[fe] || [];
        if (!permitidos.includes(estadoReal)) return false;
      }

      if (fv && !r.usuario_nombre?.toLowerCase().includes(fv)) return false;
      if (fr && !r.cliente_nombre?.toLowerCase().includes(fr)) return false;
      if (fp && !r.productos?.toLowerCase().includes(fp)) return false;
      if (fm && !r.marcas?.toLowerCase().includes(fm)) return false;
      if (fd && r.fecha < fd) return false;
      if (fh && r.fecha > fh) return false;
      if (fb && !(`${r.id} ${r.cliente_nombre} ${r.usuario_nombre}`.toLowerCase().includes(fb))) return false;

      return true;
    });

    setFiltered(result);
    setPage(1);
  };

  const limpiar = () => {
    setEstado(''); setVendedor(''); setRazon('');
    setProducto(''); setMarca(''); setDesde(''); setHasta('');
    setBuscar('');
    setFiltered(all);
    setPage(1);
  };

  // paginación
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const slice = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <>
      <PageHeader titulo="Dashboard" />

      {/* KPIS */}
      <main className="dash">
        <KpiGridDashb
          kpiCot={kpiCot}
          kpiAcept={kpiAcept}
          kpiRech={kpiRech}
          kpiPend={kpiPend}
          kpiVenc={kpiVenc}
          ticket={ticket}
          tasaAcept={tasaAcept}
          tasaRech={tasaRech}
          tasaPend={tasaPend}
          tasaVenc={tasaVenc}
        />

        {/* filtros */}
        <FiltersDashb
          estado={estado} setEstado={setEstado}
          vendedor={vendedor} setVendedor={setVendedor}
          razon={razon} setRazon={setRazon}
          producto={producto} setProducto={setProducto}
          marca={marca} setMarca={setMarca}
          desde={desde} setDesde={setDesde}
          hasta={hasta} setHasta={setHasta}
          buscar={buscar} setBuscar={setBuscar}
          apply={apply}
          limpiar={limpiar}
        />

        {/* tabla y paginación */}
        <CotizacionesTableDashb
          slice={slice}
          page={page}
          pages={pages}
          setPage={setPage}
          filtered={filtered}
          loading={loading}
        />
      </main>
    </>
  );
};

export default Dashboard;