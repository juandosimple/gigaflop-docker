import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ModalVistaPreviaCliente({ visible, onClose, cliente, loading }) {
  if (!visible) return null;

  // Si está cargando, mostramos spinner dentro del Modal
  // Si NO está cargando pero no hay cliente, retornamos null o mensaje
  if (!loading && !cliente) return null;

  const {
    razon_social,
    cuit,
    fecha_modificacion,
    direcciones = [],
    contactos = [],
    condiciones_comerciales = []
  } = cliente || {}; // fallback vacío para evitar crash si cliente es null durante loading

  // Función auxiliar para formatear fecha
  const formatFecha = (fecha) => {
    if (!fecha) return 'Sin registro';
    const date = new Date(fecha);
    return `${date.toLocaleDateString('es-AR')} ${date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const descargarClientePDF = () => {
    if (!cliente) return;

    const doc = new jsPDF();
    const margin = 14;
    let y = margin;

    // Título
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102);
    doc.text("Ficha de Cliente", margin, y);
    y += 10;

    // Datos Generales
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(cliente.razon_social || "Razón Social Desconocida", margin, y);
    y += 6;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`CUIT: ${cliente.cuit || "-"}`, margin, y);
    y += 5;
    doc.text(`Última modificación: ${formatFecha(cliente.fecha_modificacion)}`, margin, y);
    y += 10;

    // Direcciones
    if (cliente.direcciones && cliente.direcciones.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0, 51, 102);
      doc.text("Direcciones", margin, y);
      y += 6;

      const headersDirecciones = [["Calle", "Num", "Loc", "Prov", "CP", "Piso", "Depto", "Tipo"]];
      const dataDirecciones = cliente.direcciones.map(d => [
        d.calle, d.numeracion, d.localidad, d.provincia, d.codigo_postal, d.piso, d.depto, d.locacion
      ]);

      autoTable(doc, {
        startY: y,
        head: headersDirecciones,
        body: dataDirecciones,
        theme: 'striped',
        headStyles: { fillColor: [0, 51, 102] },
        styles: { fontSize: 8 },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // Contactos
    if (cliente.contactos && cliente.contactos.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0, 51, 102);
      doc.text("Contactos", margin, y);
      y += 6;

      const headersContactos = [["Nombre", "Apellido", "Area", "Teléfono", "Email"]];
      const dataContactos = cliente.contactos.map(c => [
        c.nombre_contacto, c.apellido, c.area_contacto, c.telefono, c.email
      ]);

      autoTable(doc, {
        startY: y,
        head: headersContactos,
        body: dataContactos,
        theme: 'striped',
        headStyles: { fillColor: [0, 51, 102] },
        styles: { fontSize: 8 },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    // Condiciones Comerciales
    if (cliente.condiciones_comerciales && cliente.condiciones_comerciales.length > 0) {
      doc.setFontSize(14);
      doc.setTextColor(0, 51, 102);
      doc.text("Condiciones Comerciales", margin, y);
      y += 6;

      const headersCondiciones = [["Forma Pago", "T. Cambio", "Días Pago", "Mark-up", "Obs"]];
      const dataCondiciones = cliente.condiciones_comerciales.map(c => [
        c.forma_pago, c.tipo_cambio, c.dias_pago, `${c.mark_up_maximo}%`, c.observaciones
      ]);

      autoTable(doc, {
        startY: y,
        head: headersCondiciones,
        body: dataCondiciones,
        theme: 'striped',
        headStyles: { fillColor: [0, 51, 102] },
        styles: { fontSize: 8 },
      });
      y = doc.lastAutoTable.finalY + 10;
    }

    doc.save(`Ficha_Cliente_${cliente.cuit}.pdf`);
  };

  return (
    <Modal
      show={visible}
      onHide={onClose}
      size="xl"
      centered
      dialogClassName="modal-dialog-scrollable"
    >
      <div
        className="modal-header bg-primary text-white"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid #dee2e6' }}
      >
        <h5 className="modal-title mb-0">
          <i className="bi bi-eye-fill me-2"></i> Vista previa del cliente
        </h5>
        <button className="btn-close btn-close-white" onClick={onClose}></button>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <>
          <div
            style={{
              backgroundColor: '#fff',
              borderBottom: '1px solid #dee2e6',
              padding: '12px 20px'
            }}
          >
            <div className="fw-semibold">{razon_social}</div>
            <small className="text-muted">CUIT: {cuit}</small><br />
            <small className="text-muted">Última modificación: {formatFecha(fecha_modificacion)}</small>
          </div>

          <Modal.Body>
            {/* Direcciones */}

            <h6 className="text-secondary fw-bold text-uppercase mt-4">Direcciones</h6>
            {direcciones.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-sm table-bordered align-middle text-nowrap">
                  <thead className="table-light text-center">
                    <tr>
                      <th>#</th>
                      <th>Calle</th>
                      <th>Localidad</th>
                      <th>Provincia</th>
                      <th>CP</th>
                      <th>Piso</th>
                      <th>Depto</th>
                      <th>Locación</th>
                      <th>Zona de envío</th>
                    </tr>
                  </thead>
                  <tbody>
                    {direcciones.map((dir, i) => (
                      <tr key={i}>
                        <td className="text-center">{i + 1}</td>
                        <td>{dir.calle} {dir.numeracion}</td>
                        <td>{dir.localidad}</td>
                        <td>{dir.provincia}</td>
                        <td>{dir.codigo_postal}</td>
                        <td>{dir.piso || '—'}</td>
                        <td>{dir.depto || '—'}</td>
                        <td>{dir.locacion || '—'}</td>
                        <td>{dir.zona_envio || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted">Sin direcciones registradas.</p>
            )}

            {/* Contactos */}
            <h6 className="text-secondary fw-bold text-uppercase mt-4">Contactos</h6>
            {contactos.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-sm table-bordered align-middle text-nowrap">
                  <thead className="table-light text-center">
                    <tr>
                      <th>#</th>
                      <th>Nombre</th>
                      <th>Área</th>
                      <th>Teléfono</th>
                      <th>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contactos.map((c, i) => (
                      <tr key={i}>
                        <td className="text-center">{i + 1}</td>
                        <td>{c.nombre_contacto} {c.apellido}</td>
                        <td>{c.area_contacto}</td>
                        <td>{c.telefono}</td>
                        <td>{c.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted">Sin contactos registrados.</p>
            )}

            {/* Condiciones Comerciales */}
            <h6 className="text-secondary fw-bold text-uppercase mt-4">Condiciones Comerciales</h6>
            {condiciones_comerciales.length > 0 ? (
              <div className="table-responsive">
                <table className="table table-sm table-bordered align-middle text-nowrap">
                  <thead className="table-light text-center">
                    <tr>
                      <th>#</th>
                      <th>Forma de pago</th>
                      <th>Tipo de cambio</th>
                      <th>Días de pago</th>
                      <th>Mark-up</th>
                      <th>Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {condiciones_comerciales.map((cond, i) => (
                      <tr key={i}>
                        <td className="text-center">{i + 1}</td>
                        <td className="text-capitalize">{cond.forma_pago}</td>
                        <td>{cond.tipo_cambio}</td>
                        <td>{cond.dias_pago}</td>
                        <td>{cond.mark_up_maximo}%</td>
                        <td>{cond.observaciones || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted">Sin condiciones comerciales registradas.</p>
            )}
          </Modal.Body>

          <div
            className="modal-footer"
            style={{
              marginTop: 'auto',
              backgroundColor: '#fff',
              borderTop: '1px solid #dee2e6',
              padding: '12px 20px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px'
            }}
          >
            <button className="btn btn-outline-primary" onClick={descargarClientePDF} disabled={loading}>
              <i className="bi bi-file-earmark-arrow-down-fill me-2"></i> Exportar como PDF
            </button>
            <button className="btn btn-secondary" onClick={onClose}>
              Cerrar
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}