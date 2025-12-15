export const calcularResumen = (productos, costoEnvioInput = 0) => {
  let base21 = 0;
  let base105 = 0;
  let totalDescuentos = 0;
  
  const safeNum = (v) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  const listaProductos = Array.isArray(productos) ? productos : [];

  listaProductos.forEach((p) => {
    const precio = safeNum(p.precio_unitario ?? p.precio);
    const cantidad = safeNum(p.cantidad) || 1;
    const markup = safeNum(p.markup_ingresado ?? p.markup);
    const descuento = safeNum(p.descuento);
    // Tasa IVA: default 21
    const t = safeNum(p.tasa_iva);
    const iva = t > 0 ? t : 21;

    // Precio con markup
    const precioConMarkup = precio * (1 + markup / 100);

    // Asumimos descuento UNITARIO para mantener consistencia con el backend
    // Subtotal línea = (PrecioConMarkup - DescuentoUnitario) * Cantidad
    const baseLinea = Math.max(0, (precioConMarkup - descuento) * cantidad);

    // Acumular descuento total (solo referencial)
    totalDescuentos += (descuento * cantidad);

    if (iva === 10.5) {
      base105 += baseLinea;
    } else {
      // Por defecto todo lo que no es 10.5 va a 21 (o 21 explícito)
      base21 += baseLinea;
    }
  });

  const baseProd = base21 + base105;

  // Lógica de envío bonificado
  const envioBonificado = baseProd >= 1500;
  const envioFinal = envioBonificado ? 0 : safeNum(costoEnvioInput);

  // IVA
  // El IVA 21% se aplica sobre la base21 + el envío (si no es bonificado)
  const iva21 = (base21 + envioFinal) * 0.21;
  
  // El IVA 10.5% se aplica solo sobre la base105
  const iva105 = base105 * 0.105;

  const baseImp = baseProd + envioFinal;
  const total = baseImp + iva21 + iva105;

  return {
    base21,
    base105,
    baseProd,
    totalDescuentos,
    costoEnvio: envioFinal,
    envio: envioFinal,
    envioBonificado,
    baseImp,
    iva21,
    iva105,
    total
  };
};
