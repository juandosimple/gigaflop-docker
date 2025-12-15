import axios from 'axios';
import { NavLink, useNavigate } from 'react-router-dom';
import '../CSS/menu.css';
import "bootstrap-icons/font/bootstrap-icons.css";
import PageHeader from '../components/PageHeader';
import React, { useState, useEffect } from 'react';
import { useUser } from '../context/UserContext';
import EtiquetaEstado from '../components/ui/EtiquetaEstado';
import ModalVistaPreviaCot from '../components/ModalVistaPreviaCot.jsx';


const Cotizaciones = () => {
  const { usuario, cargando } = useUser();
  const navigate = useNavigate();
  const [cotizaciones, setCotizaciones] = useState([]);
  const [fetchingCotizaciones, setFetchingCotizaciones] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletedCotizacion, setDeletedCotizacion] = useState(null);
  const [estadoFiltro, setEstadoFiltro] = useState(null);
  const [alertasEnviadas, setAlertasEnviadas] = useState(new Set());
  const [modalVisible, setModalVisible] = useState(false);
  const [cotizacionSeleccionada, setCotizacionSeleccionada] = useState(null);
  const [loadingModal, setLoadingModal] = useState(false); // Estado de carga para el modal
  const [skip, setSkip] = useState(0);
  const limit = 10; // cantidad de cotizaciones por página
  const [total, setTotal] = useState(0);

  useEffect(() => {

  }, [usuario]);

  const abrirVistaPrevia = async (cotizacion) => {
    // 1. Mostrar modal de inmediato con loading
    setCotizacionSeleccionada(null);
    setLoadingModal(true);
    setModalVisible(true);

    try {
      const res = await axios.get(`/api/cotizaciones/ver/${cotizacion.id}`);
      const cotizacionCompleta = res.data;

      const vigencia = cotizacionCompleta.vigencia_hasta
        ? new Date(cotizacionCompleta.vigencia_hasta)
        : null;
      const hoy = new Date();
      const diasRestantes = vigencia
        ? Math.ceil((vigencia - hoy) / (1000 * 60 * 60 * 24))
        : null;

      const alertaEnviada = alertasEnviadas.has(cotizacion.id);

      setCotizacionSeleccionada({
        ...cotizacionCompleta,
        diasRestantes,
        alerta_enviada: alertaEnviada
      });

    } catch (error) {
      console.error('❌ Error al cargar cotización completa:', error);
    } finally {
      setLoadingModal(false);
    }
  };

  useEffect(() => {
    if (cargando || !usuario?.id) return;

    const cargarCotizaciones = async () => {
      setFetchingCotizaciones(true);
      try {
        let res;
        if (usuario.rol === "administrador" || usuario.rol === "gerente") {
          res = await axios.get("/api/cotizaciones/todas", {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
        } else {
          res = await axios.get(`/api/cotizaciones/todas/${usuario.id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          });
        }



        const transformadas = (Array.isArray(res.data) ? res.data : []).map(c => ({
          id: c.id,
          numero: c.numero_cotizacion,
          fecha: c.fecha || c.created_at || c.fecha_creacion || null,
          vigencia_hasta: c.vigencia_hasta ?? c.vencimiento ?? null,
          vendedor: c.usuario_nombre || `${usuario.nombre} ${usuario.apellido}`,
          estado: {
            id: c.estado_id ?? null,
            nombre: c.estado_nombre ?? "—",
            es_final: c.estado_es_final ?? false,
            requiere_vencimiento: c.estado_requiere_vencimiento ?? false,
            color_dashboard: c.estado_color_dashboard ?? "#6c757d"
          },
          cliente: c.cliente_nombre || "—",
          contacto: c.contacto_nombre && c.contacto_apellido
            ? `${c.contacto_nombre} ${c.contacto_apellido}`
            : "—",
          total: Number(c.total || 0).toFixed(2) // 👈 usamos directamente el total del backend
        }));
        setCotizaciones(transformadas);
      } catch (error) {
        console.error("Error al cargar cotizaciones:", error);
      } finally {
        setFetchingCotizaciones(false);
      }
    };

    cargarCotizaciones();
  }, [cargando, usuario]);

  const onSiguiente = () => {
    if (skip + limit < total) {
      setSkip(prev => prev + limit);
    }
  };

  const onAnterior = () => {
    setSkip(prev => Math.max(prev - limit, 0));
  };

  function confirmarEstado(id, nuevoEstado) {
    const texto = nuevoEstado === 'finalizada_aceptada'
      ? '¿Confirmás marcar esta cotización como ACEPTADA?'
      : nuevoEstado === 'finalizada_rechazada'
        ? '¿Confirmás marcar esta cotización como RECHAZADA?'
        : `¿Confirmás marcar como ${nuevoEstado}?`;

    const confirmar = window.confirm(texto);
    if (!confirmar) return;

    manejarCambioDeEstado(id, nuevoEstado);
  }

  async function enviarAlertaVencimiento(cotizacion) {
    try {
      await axios.post(
        `/api/cotizaciones/alerta-vencimiento/${cotizacion.id}`,
        {},
        { withCredentials: true }
      );

      setAlertasEnviadas(prev => new Set(prev).add(cotizacion.id));
      alert(`Alerta enviada al cliente: ${cotizacion.cliente}`);
    } catch (error) {
      console.error('Error al enviar alerta de vencimiento:', error);
      alert('No se pudo enviar la alerta.');
    }
  }

  async function manejarCambioDeEstado(id, nuevoEstado) {
    try {
      const res = await axios.put(
        `/api/cotizaciones/estado/${id}`,
        { nuevoEstado },
        { withCredentials: true }
      );

      const estadoActualizado = res.data.estado;

      setCotizaciones(prev =>
        prev.map(c => c.id === id
          ? { ...c, estado: estadoActualizado }
          : c)
      );
    } catch (error) {
      console.error(`Error al marcar como ${nuevoEstado}:`, error);
    }
  }

  const safeToLower = v => String(v ?? '').toLowerCase();
  const filteredCotizaciones = cotizaciones.filter(cotizacion => {
    const term = safeToLower(searchTerm);
    const estadoId = cotizacion.estado?.id;
    const estadoNombre = safeToLower(cotizacion.estado?.nombre ?? '');
    const vigencia = cotizacion.vigencia_hasta ? new Date(cotizacion.vigencia_hasta) : null;
    const hoy = new Date();
    const diasRestantes = vigencia ? (vigencia - hoy) / (1000 * 60 * 60 * 24) : null;

    const coincideTexto =
      safeToLower(cotizacion.numero).includes(term) ||
      safeToLower(String(cotizacion.id)).includes(term) ||
      safeToLower(cotizacion.vendedor).includes(term) ||
      safeToLower(cotizacion.cliente).includes(term);

    const coincideEstado = (() => {
      switch (term) {
        case 'borrador': return estadoId === 1;
        case 'pendiente': return estadoId === 2;
        case 'aceptada':
        case 'finalizada':
        case 'finalizada_aceptada': return estadoId === 3;
        case 'rechazada':
        case 'finalizada_rechazada': return estadoId === 4;
        case 'vencida': return estadoId === 5;
        case 'pendiente vencimiento':
        case 'pendiente por vencer':
        case 'pendiente a vencer':
        case 'pendiente venciendo':
          return estadoId === 2 && diasRestantes !== null && diasRestantes <= 3 && diasRestantes >= 0;
        default:
          return estadoNombre.includes(term);
      }
    })();

    return coincideTexto || coincideEstado;
  });

  const currentCotizaciones = filteredCotizaciones.slice(skip, skip + limit);

  useEffect(() => {
    setTotal(filteredCotizaciones.length);
    // 👇 solo resetea si el skip está fuera de rango
    if (skip >= filteredCotizaciones.length) {
      setSkip(0);
    }
  }, [filteredCotizaciones, skip]);

  if (cargando) return <p className="text-center mt-5">Cargando usuario...</p>;



  return (
    <>
      <PageHeader titulo="Mis Cotizaciones">
        <div className="buscador-container" style={{ margin: 0 }}>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por ID, vendedor o cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className='botonescontainer' style={{ width: 'auto', margin: 0 }}>
            <button
              className='nc'
              style={{ width: 'auto', padding: '0 20px', height: '38px', lineHeight: '38px' }}
              onClick={() => {
                localStorage.removeItem('idCotizacionActual');
                navigate('/nuevacotizacion');
              }}>+ Nueva Cotización
            </button>
          </div>
        </div>
      </PageHeader>

      <div className="menu-matriz">
        <div className="container">
          <div className="col-lg-12">
            <div className="table-responsive px-2">
              <table className="table tabla-cotizaciones align-middle">
                <thead className="table-primary">
                  <tr>
                    <th>ID</th>
                    <th>Fecha</th>
                    <th>Fecha de vencimiento</th>
                    <th>Vendedor</th>
                    <th>Estado</th>
                    <th>Cliente</th>
                    <th>Contacto</th>
                    <th>Total</th>
                    <th className="text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {fetchingCotizaciones ? (
                    <tr>
                      <td colSpan="9" className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                        <p className="mt-2 text-muted">Cargando cotizaciones...</p>
                      </td>
                    </tr>
                  ) : currentCotizaciones.length > 0 ? (
                    currentCotizaciones.map((cotizacion, index) => {
                      const fechaIso = cotizacion.fecha ? new Date(cotizacion.fecha) : null;
                      const fechaDisplay = fechaIso && !isNaN(fechaIso.getTime())
                        ? fechaIso.toLocaleDateString('es-AR')
                        : (cotizacion.fecha ? String(cotizacion.fecha) : '—');

                      const fechaVencimiento = cotizacion.vigencia_hasta
                        ? new Date(cotizacion.vigencia_hasta)
                        : null;

                      const hoy = new Date();
                      const diferenciaDias = fechaVencimiento && !isNaN(fechaVencimiento.getTime())
                        ? Math.ceil((fechaVencimiento - hoy) / (1000 * 60 * 60 * 24))
                        : null;

                      const vencida = diferenciaDias !== null && diferenciaDias < 0;
                      const vencePronto = diferenciaDias !== null && diferenciaDias >= 0 && diferenciaDias <= 3;

                      const estadoId = cotizacion.estado?.id;

                      return (
                        <tr key={index} className="fila-cotizacion">
                          <td>
                            <button className="btn-link" onClick={() => abrirVistaPrevia(cotizacion)}>
                              {cotizacion.numero}
                            </button>
                          </td>
                          <td>{fechaDisplay}</td>
                          <td className={
                            estadoId === 2
                              ? vencida
                                ? 'text-danger fw-bold'
                                : vencePronto
                                  ? 'text-warning fw-bold'
                                  : ''
                              : ''
                          }>
                            {cotizacion.estado?.requiere_vencimiento && fechaVencimiento && !isNaN(fechaVencimiento.getTime())
                              ? fechaVencimiento.toLocaleDateString('es-AR')
                              : '—'}
                          </td>
                          <td>{cotizacion.vendedor}</td>
                          <td><EtiquetaEstado estado={cotizacion.estado} /></td>
                          <td>{cotizacion.cliente}</td>
                          <td>{cotizacion.contacto}</td>
                          <td>${Number(cotizacion.total || 0).toFixed(2)}</td>

                          <td className="text-end">
                            <div className="dropdown">
                              <button
                                className="btn btn-sm btn-light"
                                type="button"
                                data-bs-toggle="dropdown"
                                aria-expanded="false"
                                title="Acciones"
                              >
                                <i className="bi bi-three-dots-vertical"></i>
                              </button>

                              <ul className="dropdown-menu dropdown-menu-end">
                                <li>
                                  <button
                                    className="dropdown-item"
                                    onClick={() => {
                                      localStorage.setItem('idCotizacionActual', cotizacion.id);
                                      navigate('/nuevacotizacion', { state: { retomar: true } });
                                    }}
                                  >
                                    <i className="bi bi-arrow-repeat me-2 text-primary"></i> Retomar
                                  </button>
                                </li>

                                {estadoId === 2 && vencePronto && (
                                  <li>
                                    {alertasEnviadas.has(cotizacion.id) ? (
                                      <span className="dropdown-item text-muted">
                                        <i className="bi bi-check2-circle me-2 text-success"></i> Alerta enviada
                                      </span>
                                    ) : (
                                      <button
                                        className="dropdown-item text-warning"
                                        onClick={() => enviarAlertaVencimiento(cotizacion)}
                                      >
                                        <i className="bi bi-envelope-exclamation me-2"></i> Alerta por vencimiento
                                      </button>
                                    )}
                                  </li>
                                )}

                                {estadoId === 2 && (
                                  <>
                                    <li>
                                      <button
                                        className="dropdown-item text-success"
                                        onClick={() => confirmarEstado(cotizacion.id, 'finalizada_aceptada')}
                                      >
                                        <i className="bi bi-check-circle me-2"></i> Aceptar
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        className="dropdown-item text-danger"
                                        onClick={() => confirmarEstado(cotizacion.id, 'finalizada_rechazada')}
                                      >
                                        <i className="bi bi-x-circle me-2"></i> Rechazar
                                      </button>
                                    </li>
                                  </>
                                )}
                              </ul>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="9" className="text-center py-4 text-muted">
                        No se encontraron cotizaciones
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {total > 0 && (
                <div className="pagination justify-content-center mt-3">
                  <button
                    className="btn-outline dashbtn"
                    onClick={onAnterior}
                    disabled={skip === 0}
                  >
                    Anterior
                  </button>
                  <span className="mx-3">
                    Página {Math.floor(skip / limit) + 1} de {Math.ceil(total / limit)}
                  </span>
                  <button
                    className="btn-outline dashbtn"
                    onClick={onSiguiente}
                    disabled={skip + limit >= total}
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>




      <ModalVistaPreviaCot
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        cotizacion={cotizacionSeleccionada}
        loading={loadingModal}
      />



    </>
  );
};




export default Cotizaciones;

