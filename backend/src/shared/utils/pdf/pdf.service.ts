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
  tenantLogo?: string;
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

const MARGIN = 12;
const PAGE_WIDTH = 227;
const PRINTABLE_WIDTH = PAGE_WIDTH - MARGIN * 2;

const fetchImageBuffer = async (url: string): Promise<Buffer | null> => {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
};

export const generateSalePdf = async (sale: SaleData): Promise<Buffer> => {
  let logoBuffer: Buffer | null = null;
  if (sale.tenantLogo) {
    logoBuffer = await fetchImageBuffer(sale.tenantLogo);
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [PAGE_WIDTH, 1000],
      margin: MARGIN,
      info: {
        Title: `Venta ${sale.saleNumber}`,
        Author: sale.tenantName,
      },
    });

    const buffers: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const left = doc.page.margins.left;

    const center = (text: string, size: number, opts: any = {}) => {
      doc.fontSize(size).font(opts.bold ? 'Helvetica-Bold' : 'Helvetica').text(text, { align: 'center', ...opts });
    };

    if (logoBuffer) {
      const maxLogoW = 100;
      const maxLogoH = 50;
      doc.image(logoBuffer, left + (PRINTABLE_WIDTH - maxLogoW) / 2, doc.y, {
        fit: [maxLogoW, maxLogoH],
        align: 'center',
      });
      doc.moveDown(0.5);
    }

    center(sale.tenantName, 14, { bold: true });
    doc.moveDown(0.15);

    if (sale.tenantNit) center(`NIT: ${sale.tenantNit}`, 8);
    if (sale.tenantAddress) center(sale.tenantAddress, 8);
    if (sale.tenantPhone) center(`Tel: ${sale.tenantPhone}`, 8);
    if (sale.tenantEmail) center(sale.tenantEmail, 8);
    center(`Suc. ${sale.branchName}`, 8);

    doc.moveDown(0.4);
    doc.moveTo(left, doc.y).lineTo(left + PRINTABLE_WIDTH, doc.y).stroke('#cccccc');
    doc.moveDown(0.3);

    center('COMPROBANTE DE VENTA', 11, { bold: true });
    doc.moveDown(0.15);
    center(`N° ${sale.saleNumber}`, 9);
    center(sale.createdAt.toLocaleDateString('es-CL', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit',
    }), 8);

    doc.moveDown(0.4);
    doc.moveTo(left, doc.y).lineTo(left + PRINTABLE_WIDTH, doc.y).stroke('#cccccc');
    doc.moveDown(0.3);

    doc.font('Helvetica-Bold').fontSize(9).text(`Cliente: ${sale.customerName || '—'}`);
    doc.font('Helvetica').fontSize(8).text(`Vendedor: ${sale.userName || '—'}`);
    doc.moveDown(0.3);

    doc.moveTo(left, doc.y).lineTo(left + PRINTABLE_WIDTH, doc.y).stroke('#cccccc');
    doc.moveDown(0.3);

    doc.font('Helvetica-Bold').fontSize(9).text('Método de Pago');
    doc.font('Helvetica').fontSize(8);
    const paymentLabels: Record<string, string> = { cash: 'Efectivo', card: 'Tarjeta', transfer: 'Transferencia' };
    doc.text(paymentLabels[sale.paymentMethod] || sale.paymentMethod);

    if (sale.paymentMethod === 'transfer') {
      doc.moveDown(0.15);
      if (sale.transferBank) doc.fontSize(8).text(`Banco: ${sale.transferBank}`);
      if (sale.transferReference) doc.fontSize(8).text(`Ref: ${sale.transferReference}`);
      if (sale.transferAmount != null) doc.fontSize(8).text(`Monto: ${formatCurrency(sale.transferAmount)}`);
    }
    if (sale.paymentMethod === 'card') {
      doc.moveDown(0.15);
      if (sale.cardBank) doc.fontSize(8).text(`Entidad: ${sale.cardBank}`);
      if (sale.cardReference) doc.fontSize(8).text(`Ref: ${sale.cardReference}`);
    }

    doc.moveDown(0.3);
    doc.moveTo(left, doc.y).lineTo(left + PRINTABLE_WIDTH, doc.y).stroke('#cccccc');
    doc.moveDown(0.3);

    const colCant = PRINTABLE_WIDTH - 130;
    const colPrice = PRINTABLE_WIDTH - 70;
    const colTotal = PRINTABLE_WIDTH - 5;
    const colProdWidth = colCant - left - 8;

    doc.font('Helvetica-Bold').fontSize(8);
    doc.text('Producto', left, doc.y, { width: colProdWidth });
    doc.text('Cant', colCant, doc.y - doc.currentLineHeight(), { width: 60, align: 'center' });
    doc.text('P.U.', colPrice, doc.y - doc.currentLineHeight(), { width: 60, align: 'center' });
    doc.text('Total', colTotal, doc.y - doc.currentLineHeight(), { width: 60, align: 'right' });

    doc.moveDown(0.15);
    doc.moveTo(left, doc.y).lineTo(left + PRINTABLE_WIDTH, doc.y).stroke('#cccccc');
    doc.moveDown(0.15);

    doc.font('Helvetica').fontSize(7.5);
    for (const item of sale.items) {
      const y = doc.y;
      doc.text(item.productName, left, y, { width: colProdWidth });
      doc.text(String(item.quantity), colCant, y, { width: 40, align: 'center' });
      doc.text(formatCurrency(item.unitPrice), colPrice, y, { width: 50, align: 'center' });
      doc.text(formatCurrency(item.total), colTotal, y, { width: 65, align: 'right' });
      doc.moveDown(0.6);
    }

    doc.moveTo(left, doc.y).lineTo(left + PRINTABLE_WIDTH, doc.y).stroke('#cccccc');
    doc.moveDown(0.3);

    const totalWidth = 160;
    const totalX = left + PRINTABLE_WIDTH - totalWidth;

    const line = (label: string, value: string, bold = false) => {
      if (bold) doc.font('Helvetica-Bold');
      else doc.font('Helvetica');
      doc.text(label, totalX, doc.y, { width: totalWidth - 80 });
      doc.text(value, totalX + totalWidth - 80, doc.y - doc.currentLineHeight(), { width: 80, align: 'right' });
      doc.moveDown(0.3);
    };

    doc.fontSize(8);
    line('Subtotal:', formatCurrency(sale.subtotal));
    if (sale.discount > 0) line('Descuento:', `-${formatCurrency(sale.discount)}`);
    if (sale.tax > 0) line('IVA:', formatCurrency(sale.tax));
    doc.moveDown(0.1);
    doc.moveTo(totalX, doc.y).lineTo(totalX + totalWidth, doc.y).stroke('#cccccc');
    doc.moveDown(0.1);
    doc.fontSize(9);
    line('TOTAL:', formatCurrency(sale.total), true);

    doc.moveDown(1);
    doc.fontSize(7).font('Helvetica').fillColor('#999999');
    doc.text('Documento generado electrónicamente.', { align: 'center' });

    doc.end();
  });
};
