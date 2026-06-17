import { useState, useRef, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { useImportProducts } from '@/features/inventory/hooks';
import { Upload, FileSpreadsheet, ArrowLeft, CheckCircle2, XCircle, X } from 'lucide-react';

const SYSTEM_FIELDS = [
  { key: 'sku', label: 'SKU', required: true },
  { key: 'barcode', label: 'Código Barras', required: true },
  { key: 'name', label: 'Nombre', required: true },
  { key: 'categoryName', label: 'Departamento', required: true },
  { key: 'costPrice', label: 'Precio Costo', required: true },
  { key: 'price', label: 'Precio Venta', required: true },
  { key: 'minStock', label: 'Stock Mínimo', required: false },
  { key: 'maxStock', label: 'Stock Máximo', required: false },
  { key: 'unit', label: 'Unidad', required: true },
  { key: 'brandId', label: 'Marca', required: false },
  { key: 'description', label: 'Descripción', required: false },
  { key: 'wholesalePrice', label: 'Precio Mayorista', required: false },
  { key: 'specialPrice', label: 'Precio Especial', required: false },
  { key: 'initialStock', label: 'Stock Inicial', required: true },
  { key: 'applyTax', label: 'Aplica IVA', required: false },
  { key: 'taxPercentage', label: '% IVA', required: false },
  { key: 'allowsDiscount', label: 'Permite Descuento', required: false },
  { key: 'maxDiscount', label: '% Desc Máx', required: false },
  { key: 'sellOutOfStock', label: 'Vender Sin Stock', required: false },
  { key: 'historicalSales', label: 'Inventario (Vendidos)', required: false },
];

const AUTO_MAP: Record<string, string[]> = {
  sku: ['sku', 'código', 'codigo', 'ref', 'referencia', 'clave'],
  barcode: ['código barras', 'codigo barras', 'barcode', 'barra', 'ean', 'upc', 'código de barras'],
  name: ['nombre', 'producto', 'descripción', 'descripcion', 'artículo', 'articulo', 'product'],
  categoryName: ['categoría', 'categoria', 'departamento', 'línea', 'linea', 'tipo', 'familia'],
  costPrice: ['precio costo', 'costo', 'cost', 'precio compra', 'precio de costo'],
  price: ['precio venta', 'precio', 'price', 'venta', 'pvp', 'precio de venta'],
  wholesalePrice: ['precio mayorista', 'mayoreo', 'mayorista', 'precio mayoreo'],
  specialPrice: ['precio especial', 'especial', 'oferta', 'precio oferta'],
  minStock: ['stock mínimo', 'stock minimo', 'mínimo', 'minimo', 'min', 'stock min'],
  maxStock: ['stock máximo', 'stock maximo', 'máximo', 'maximo', 'max', 'stock max'],
  unit: ['unidad', 'medida', 'unidad medida', 'uom'],
  brandId: ['marca', 'brand', 'marca producto'],
  description: ['descripción', 'descripcion', 'detalle', 'comentario'],
  applyTax: ['iva', 'aplica iva', 'impuesto'],
  taxPercentage: ['% iva', 'porcentaje iva', 'tasa iva'],
  allowsDiscount: ['descuento', 'permite descuento'],
  maxDiscount: ['% descuento', 'descuento máx', 'max descuento'],
  initialStock: ['stock inicial', 'inicial', 'stock actual', 'cantidad inicial', 'stock'],
  sellOutOfStock: ['vender sin stock', 'sin stock', 'agotado'],
  historicalSales: ['inventario', 'vendidos', 'ventas', 'histórico', 'historico', 'cantidad vendida'],
};

interface ImportModalProps {
  onClose: () => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_ROWS = 10000;

export const ImportModal = ({ onClose }: ImportModalProps) => {
  const [step, setStep] = useState(1);
  const [fileName, setFileName] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [rawData, setRawData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ created: number; errors: Array<{ row: number; message: string }> } | null>(null);
  const [fileError, setFileError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: importProducts, isPending } = useImportProducts();

  const handleFile = (file: File) => {
    setFileError('');
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`El archivo excede el límite de 5 MB`);
      return;
    }
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setFileError('Formato no soportado. Usa .xlsx, .xls o .csv');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target!.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { defval: '' });
      if (json.length === 0) {
        setFileError('El archivo está vacío');
        return;
      }
      if (json.length > MAX_ROWS) {
        setFileError(`El archivo tiene más de ${MAX_ROWS.toLocaleString()} filas. Reduce la cantidad e intenta de nuevo`);
        return;
      }
      const hdrs = Object.keys(json[0] as object);
      setHeaders(hdrs);
      setRawData(json as any[]);
      setPreviewRows(json.slice(0, 5) as any[]);
      autoMap(hdrs);
      setStep(2);
    };
    reader.readAsArrayBuffer(file);
  };

  const autoMap = (hdrs: string[]) => {
    const map: Record<string, string> = {};
    const hdrLower = hdrs.map(h => h.toLowerCase().trim());
    for (const field of SYSTEM_FIELDS) {
      const keywords = AUTO_MAP[field.key] || [];
      let matched = '';
      for (let i = 0; i < hdrLower.length; i++) {
        if (keywords.some(k => hdrLower[i].includes(k))) {
          matched = hdrs[i];
          break;
        }
      }
      if (matched) map[field.key] = matched;
    }
    setMapping(map);
  };

  const mappedData = useMemo(() => {
    return rawData.map((row) => {
      const obj: any = {};
      for (const field of SYSTEM_FIELDS) {
        const col = mapping[field.key];
        if (!col) continue;
        let val = row[col];
        if (['costPrice', 'price', 'wholesalePrice', 'specialPrice', 'minStock', 'maxStock', 'maxDiscount', 'taxPercentage', 'initialStock', 'historicalSales'].includes(field.key)) {
          val = Number(val) || 0;
        }
        if (['applyTax', 'allowsDiscount', 'sellOutOfStock'].includes(field.key)) {
          val = String(val).toLowerCase() === 'sí' || String(val).toLowerCase() === 'si' || String(val).toLowerCase() === 'yes' || val === true;
        }
        obj[field.key] = val;
      }
      return obj;
    });
  }, [rawData, mapping]);

  const missingRequired = SYSTEM_FIELDS.filter(f => f.required && !mapping[f.key]);

  const handleImport = () => {
    importProducts(
      { products: mappedData, skipDuplicates: true },
      {
        onSuccess: (res) => {
          setResult(res.data);
          setStep(3);
        },
      }
    );
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto mx-4">
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            {step > 1 && step < 3 && (
              <button onClick={() => setStep(step - 1)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors text-brand-muted">
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <h3 className="text-lg font-sans font-bold text-brand-text">
              {step === 1 ? 'Importar Productos' : step === 2 ? 'Mapear Columnas' : 'Resultado'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors text-brand-muted hover:text-brand-text">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {step === 1 && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-200 rounded-xl p-12 text-center cursor-pointer hover:border-brand/50 hover:bg-brand-bg/30 transition-all"
            >
              <Upload className="w-10 h-10 text-brand-muted mx-auto mb-4" />
              <p className="text-sm font-medium text-brand-text mb-1">Arrastra tu archivo aquí o haz clic para seleccionar</p>
              <p className="text-xs text-brand-muted">Formatos: .xlsx, .xls, .csv</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div className="flex items-center gap-2 text-sm text-brand-muted">
                <FileSpreadsheet className="w-4 h-4" />
                <span>{fileName}</span>
                <span className="text-xs">— {rawData.length} fila(s)</span>
              </div>

              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-brand-bg">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-brand-muted uppercase tracking-wider w-48">Campo del Sistema</th>
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-brand-muted uppercase tracking-wider">Columna del Excel</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {SYSTEM_FIELDS.map((field) => (
                      <tr key={field.key} className="hover:bg-brand-bg/30">
                        <td className="px-4 py-2.5">
                          <span className="text-brand-text font-medium">{field.label}</span>
                          {field.required && <span className="text-red-500 ml-1">*</span>}
                        </td>
                        <td className="px-4 py-2.5">
                          <select
                            value={mapping[field.key] || ''}
                            onChange={(e) => setMapping({ ...mapping, [field.key]: e.target.value })}
                            className={`w-full px-3 py-1.5 rounded-lg border text-sm outline-none transition-all ${
                              field.required && !mapping[field.key]
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-200 focus:border-brand focus:ring-2 focus:ring-brand/20'
                            }`}
                          >
                            <option value="">—</option>
                            {headers.map((h) => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <p className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-2">Vista previa ({previewRows.length} filas)</p>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-brand-bg">
                        {SYSTEM_FIELDS.filter(f => mapping[f.key]).map(f => (
                          <th key={f.key} className="text-left px-3 py-2 font-semibold text-brand-muted whitespace-nowrap">{f.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {mappedData.slice(0, 5).map((row, i) => (
                        <tr key={i}>
                          {SYSTEM_FIELDS.filter(f => mapping[f.key]).map(f => (
                            <td key={f.key} className="px-3 py-2 text-brand-text whitespace-nowrap">{String(row[f.key] ?? '')}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
                {missingRequired.length > 0 && (
                  <p className="text-xs text-red-500 flex items-center">
                    Faltan campos requeridos: {missingRequired.map(f => f.label).join(', ')}
                  </p>
                )}
                <button
                  onClick={handleImport}
                  disabled={missingRequired.length > 0 || isPending}
                  className="bg-brand text-white px-5 py-2.5 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {isPending ? 'Importando...' : `Importar ${rawData.length} producto(s)`}
                </button>
              </div>
            </div>
          )}

          {step === 3 && result && (
            <div className="text-center py-8 space-y-4">
              <div className="flex items-center justify-center gap-2 text-green-600">
                <CheckCircle2 className="w-6 h-6" />
                <span className="text-lg font-semibold">{result.created} producto(s) creados</span>
              </div>
              {result.errors.length > 0 && (
                <div className="text-left max-h-48 overflow-y-auto border border-red-100 rounded-lg bg-red-50 p-4">
                  <p className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                    <XCircle className="w-4 h-4" />
                    {result.errors.length} error(es)
                  </p>
                  {result.errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-600 py-0.5">Fila {err.row}: {err.message}</p>
                  ))}
                </div>
              )}
              <button
                onClick={onClose}
                className="mt-4 bg-brand text-white px-6 py-2.5 rounded-lg hover:bg-brand-dark transition-colors text-sm font-medium"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
