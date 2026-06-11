import PDFDocument from 'pdfkit';

interface SaleData {
  saleNumber: string;
  createdAt: Date;
  customerName?: string;
  userName?: string;
  items: Array<{
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  transferReference?: string;
  transferBank?: string;
  transferAmount?: number;
  cardBank?: string;
  cardReference?: string;
  tenantName: string;
  tenantNit?: string;
  tenantEmail?: string;
  tenantPhone?: string;
  tenantAddress?: string;
  branchName: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const generateSalePdf = (sale: SaleData): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `Venta ${sale.saleNumber}`,
        Author: sale.tenantName,
      },
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const left = doc.page.margins.left;

    const center = (text: string, size: number, opts: any = {}) => {
      doc.fontSize(size).font(opts.bold ? 'Helvetica-Bold' : 'Helvetica').text(text, { align: 'center', ...opts });
    };

    center(sale.tenantName, 18, { bold: true });
    doc.moveDown(0.2);

    if (sale.tenantNit) center(`NIT: ${sale.tenantNit}`, 9);
    if (sale.tenantAddress) center(sale.tenantAddress, 9);
    if (sale.tenantPhone) center(`Tel: ${sale.tenantPhone}`, 9);
    if (sale.tenantEmail) center(sale.tenantEmail, 9);
    center(`Sucursal: ${sale.branchName}`, 9);

    doc.moveDown(0.8);
    doc.moveTo(left, doc.y).lineTo(left + pageWidth, doc.y).stroke('#cccccc');
    doc.moveDown(0.6);

    center('Comprobante de Venta', 14, { bold: true });
    doc.moveDown(0.3);
    center(`N°: ${sale.saleNumber}`, 10);
    center(`Fecha: ${sale.createdAt.toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}`, 9);

    doc.moveDown(0.8);
    doc.moveTo(left, doc.y).lineTo(left + pageWidth, doc.y).stroke('#cccccc');
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(11).text('Datos del Cliente');
    doc.font('Helvetica').fontSize(10);
    doc.text(`Cliente: ${sale.customerName || '—'}`);
    doc.text(`Vendedor: ${sale.userName || '—'}`);
    doc.moveDown(0.5);

    doc.moveTo(left, doc.y).lineTo(left + pageWidth, doc.y).stroke('#cccccc');
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(11).text('Método de Pago');
    doc.font('Helvetica').fontSize(10);
    const paymentLabels: Record<string, string> = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia' };
    doc.text(paymentLabels[sale.paymentMethod] || sale.paymentMethod);

    if (sale.paymentMethod === 'transfer') {
      doc.moveDown(0.3);
      if (sale.transferBank) doc.text(`Banco origen: ${sale.transferBank}`);
      if (sale.transferReference) doc.text(`Referencia: ${sale.transferReference}`);
      if (sale.transferAmount != null) doc.text(`Monto transferido: ${formatCurrency(sale.transferAmount)}`);
    }

    if (sale.paymentMethod === 'card') {
      doc.moveDown(0.3);
      if (sale.cardBank) doc.text(`Banco o entidad: ${sale.cardBank}`);
      if (sale.cardReference) doc.text(`Referencia: ${sale.cardReference}`);
    }

    doc.moveDown(0.5);
    doc.moveTo(left, doc.y).lineTo(left + pageWidth, doc.y).stroke('#cccccc');
    doc.moveDown(0.5);

    const tableTop = doc.y;
    doc.font('Helvetica-Bold').fontSize(10);

    const col1 = left;
    const col2 = left + pageWidth - 180;
    const col3 = left + pageWidth - 120;
    const col4 = left + pageWidth - 60;

    doc.text('Producto', col1, tableTop);
    doc.text('Cant.', col2, tableTop, { width: 60, align: 'center' });
    doc.text('Precio', col3, tableTop, { width: 60, align: 'center' });
    doc.text('Total', col4, tableTop, { width: 60, align: 'right' });

    doc.moveDown(0.3);
    doc.moveTo(left, doc.y).lineTo(left + pageWidth, doc.y).stroke('#cccccc');
    doc.moveDown(0.3);

    doc.font('Helvetica').fontSize(9);
    for (const item of sale.items) {
      const y = doc.y;
      doc.text(item.productName, col1, y, { width: col2 - col1 - 10 });
      doc.text(String(item.quantity), col2, y, { width: 60, align: 'center' });
      doc.text(formatCurrency(item.unitPrice), col3, y, { width: 60, align: 'center' });
      doc.text(formatCurrency(item.total), col4, y, { width: 60, align: 'right' });
      doc.moveDown(0.8);
    }

    doc.moveTo(left, doc.y).lineTo(left + pageWidth, doc.y).stroke('#cccccc');
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(10);
    const totalX = left + pageWidth - 200;
    const totalWidth = 200;

    const line = (label: string, value: string, bold = false) => {
      if (bold) doc.font('Helvetica-Bold');
      else doc.font('Helvetica');
      doc.text(label, totalX, doc.y, { width: 100 });
      doc.text(value, totalX + 100, doc.y - doc.currentLineHeight(), { width: 100, align: 'right' });
      doc.moveDown(0.4);
    };

    line('Subtotal:', formatCurrency(sale.subtotal));
    if (sale.discount > 0) line('Descuento:', `-${formatCurrency(sale.discount)}`);
    if (sale.tax > 0) line('IVA:', formatCurrency(sale.tax));
    doc.moveDown(0.2);
    doc.moveTo(totalX, doc.y).lineTo(totalX + totalWidth, doc.y).stroke('#cccccc');
    doc.moveDown(0.2);
    line('Total:', formatCurrency(sale.total), true);

    doc.moveDown(2);
    doc.fontSize(8).font('Helvetica').fillColor('#999999');
    doc.text('Documento generado electrónicamente.', { align: 'center' });

    doc.end();
  });
};
