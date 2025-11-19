import jsPDF from 'jspdf';

export const generateInvoicePDF = async (pedido, userProfile) => {
  try {
    const doc = new jsPDF();
    
    // Configuración inicial
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Información de la empresa - MARKLICOR
    doc.setFontSize(16);
    doc.setTextColor(245, 158, 11); // Color amber
    doc.text('MARKLICOR S.R.L.', pageWidth / 2, yPosition, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    yPosition += 6;
    doc.text('Sistema de Gestión de Licores', pageWidth / 2, yPosition, { align: 'center' });
    doc.text('contacto@marklicormundo.com | Tel: 1 (555) 987-6543', pageWidth / 2, yPosition + 5, { align: 'center' });
    
    // Datos fiscales de la empresa
    doc.text('NIT: 123456789 | Código Autorización: 123456ABCD', pageWidth / 2, yPosition + 10, { align: 'center' });
    doc.text('Fecha Límite de Emisión: 31/12/2025', pageWidth / 2, yPosition + 15, { align: 'center' });

    yPosition += 25;

    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 10;

    // Información de la factura
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text('FACTURA LEGAL', margin, yPosition);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    yPosition += 8;
    doc.text(`Número: ${pedido.numero_pedido}`, margin, yPosition);
    doc.text(`Fecha: ${new Date(pedido.creado_en).toLocaleDateString('es-ES')}`, margin, yPosition + 5);
    doc.text(`Hora: ${new Date(pedido.creado_en).toLocaleTimeString('es-ES', { 
      hour: '2-digit', minute: '2-digit' 
    })}`, margin, yPosition + 10);

    yPosition += 20;

    // Información del cliente
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.text('INFORMACIÓN DEL CLIENTE', margin, yPosition);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    yPosition += 8;
    
    // Nombre del cliente
    if (userProfile?.nombre_completo) {
      doc.text(`Señor(es): ${userProfile.nombre_completo}`, margin, yPosition);
      yPosition += 5;
    }
    
    // Email del cliente
    if (userProfile?.email) {
      doc.text(`Email: ${userProfile.email}`, margin, yPosition);
      yPosition += 5;
    }
    
    // NIT/CI del cliente (prioridad: pedido > profile > default)
    const nitCliente = pedido.nit_ci || userProfile?.nit_ci || '1234';
    doc.text(`NIT/CI: ${nitCliente}`, margin, yPosition);
    yPosition += 5;
    
    doc.text(`Método de Pago: ${pedido.metodo_pago.toUpperCase()}`, margin, yPosition);
    yPosition += 5;
    doc.text(`Estado: ${pedido.estado.toUpperCase()}`, margin, yPosition);
    
    if (pedido.direccion_envio) {
      yPosition += 5;
      const direccionLines = doc.splitTextToSize(`Dirección: ${pedido.direccion_envio}`, pageWidth - 2 * margin);
      direccionLines.forEach((line, index) => {
        doc.text(line, margin, yPosition + (index * 5));
      });
      yPosition += (direccionLines.length * 5);
    }

    yPosition += 10;

    // Tabla de productos - Encabezados
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(245, 158, 11);
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
    
    doc.text('Producto', margin + 5, yPosition + 6);
    doc.text('Cant.', pageWidth - 100, yPosition + 6);
    doc.text('Precio Unit.', pageWidth - 70, yPosition + 6);
    doc.text('Subtotal', pageWidth - 30, yPosition + 6);

    yPosition += 12;

    // Productos
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    
    let tableY = yPosition;
    pedido.pedido_detalles.forEach((detalle, index) => {
      // Alternar colores de fondo
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, tableY, pageWidth - 2 * margin, 8, 'F');
      }

      const nombre = detalle.productos?.nombre || 'Producto';
      const nombreTruncado = nombre.length > 30 ? nombre.substring(0, 30) + '...' : nombre;
      doc.text(nombreTruncado, margin + 5, tableY + 6);

      doc.text(detalle.cantidad.toString(), pageWidth - 100, tableY + 6, { align: 'center' });
      doc.text(`Bs. ${detalle.precio_unitario.toFixed(2)}`, pageWidth - 70, tableY + 6, { align: 'right' });
      doc.text(`Bs. ${detalle.subtotal.toFixed(2)}`, pageWidth - 30, tableY + 6, { align: 'right' });

      tableY += 8;

      // Nueva página si es necesario
      if (tableY > doc.internal.pageSize.getHeight() - 60) {
        doc.addPage();
        tableY = margin;
        
        // Redibujar encabezados
        doc.setFillColor(245, 158, 11);
        doc.rect(margin, tableY, pageWidth - 2 * margin, 8, 'F');
        doc.setTextColor(255, 255, 255);
        doc.text('Producto', margin + 5, tableY + 6);
        doc.text('Cant.', pageWidth - 100, tableY + 6);
        doc.text('Precio Unit.', pageWidth - 70, tableY + 6);
        doc.text('Subtotal', pageWidth - 30, tableY + 6);
        tableY += 12;
        doc.setTextColor(40, 40, 40);
      }
    });

    // Totales
    const finalY = Math.max(tableY, yPosition + (pedido.pedido_detalles.length * 8)) + 10;
    
    const subtotal = pedido.pedido_detalles.reduce((sum, detalle) => sum + detalle.subtotal, 0);
    const iva = subtotal * 0.13;
    const total = subtotal + iva;

    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(pageWidth - 100, finalY - 5, pageWidth - margin, finalY - 5);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Subtotal:`, pageWidth - 70, finalY, { align: 'right' });
    doc.text(`Bs. ${subtotal.toFixed(2)}`, pageWidth - 20, finalY, { align: 'right' });
    
    doc.text(`IVA (13%):`, pageWidth - 70, finalY + 6, { align: 'right' });
    doc.text(`Bs. ${iva.toFixed(2)}`, pageWidth - 20, finalY + 6, { align: 'right' });
    
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    doc.setFont(undefined, 'bold');
    doc.text(`TOTAL:`, pageWidth - 70, finalY + 16, { align: 'right' });
    doc.text(`Bs. ${total.toFixed(2)}`, pageWidth - 20, finalY + 16, { align: 'right' });

    // Información fiscal adicional
    const infoY = finalY + 30;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Código de Control: AUTOMÁTICO', margin, infoY);
    doc.text('Fecha Límite de Emisión: 31/12/2025', margin, infoY + 4);
    doc.text('Ley N° 453: Esta factura garantiza el derecho a crédito fiscal', margin, infoY + 8);
    
    // Observaciones si existen
    if (pedido.observacion) {
      const obsY = infoY + 15;
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Observaciones del Pedido:', margin, obsY);
      
      const observacionLines = doc.splitTextToSize(pedido.observacion, pageWidth - 2 * margin);
      observacionLines.forEach((line, index) => {
        doc.text(line, margin, obsY + 5 + (index * 4));
      });
    }

    // Pie de página legal
    const footerY = doc.internal.pageSize.getHeight() - 15;
    doc.setFontSize(7);
    doc.text('Este documento es la representación impresa de un Comprobante Fiscal en Línea', pageWidth / 2, footerY, { align: 'center' });
    doc.text('Emitido a través del Sistema de Facturación Electrónica MarkLicor S.R.L.', pageWidth / 2, footerY + 4, { align: 'center' });
    doc.text('¡Gracias por su compra! - Marcando momentos especiales', pageWidth / 2, footerY + 8, { align: 'center' });

    // Guardar el PDF
    doc.save(`factura-${pedido.numero_pedido}.pdf`);
    
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw new Error('No se pudo generar la factura. Por favor, intente nuevamente.');
  }
};