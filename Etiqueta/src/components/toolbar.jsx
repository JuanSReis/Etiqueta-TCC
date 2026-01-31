import React from 'react';
import {
  Type,
  Minus,
  Square,
  Square as SquareFilled,
  QrCode,
  Barcode,
  Trash2,
  Play
} from 'lucide-react'; // Importando os ícones
import './Toolbar.css';

function Toolbar({
  onAddText, onAddLine, onAddSquare, onAddFilledSquare,
  onAddQRCode, onAddBarcode, onClearAll, onGenerateCode,
  labelWidth, labelHeight, onWidthChange, onHeightChange,
  selectedElement, fontHeight, fontWidth, onFontSizeChange,
  qrCodeContent, qrCodeMagnification, onQRCodeChange,
  barcodeContent, barcodeHeight, barcodeShowText, onBarcodeChange,
  elementThickness, onThicknessChange,
}) {

  const isTextSelected = selectedElement?.type === 'text';
  const isQRCodeSelected = selectedElement?.type === 'qrcode';
  const isBarcodeSelected = selectedElement?.type === 'barcode';
  const isLineOrSquareSelected = selectedElement && (selectedElement.type === 'line' || selectedElement.type === 'square');

  return (
    <>
      {/* BARRA LATERAL (CRIAÇÃO COM ÍCONES) */}
      <aside className="sidebar">
        <button
          onClick={onAddText}
          className={selectedElement?.type === 'text' ? 'active' : ''}
          title="Texto (T)"
        >
          <Type size={22} />
        </button>

        <button
          onClick={onAddLine}
          className={selectedElement?.type === 'line' ? 'active' : ''}
          title="Linha (L)"
        >
          <Minus size={22} />
        </button>

        <button
          onClick={onAddSquare}
          className={selectedElement?.type === 'square' ? 'active' : ''}
          title="Retângulo (R)"
        >
          <Square size={22} />
        </button>

        <button
          onClick={onAddFilledSquare}
          className={selectedElement?.type === 'filled-square' ? 'active' : ''}
          title="Bloco Preenchido"
        >
          <SquareFilled size={22} fill="currentColor" />
        </button>

        <button
          onClick={onAddQRCode}
          className={selectedElement?.type === 'qrcode' ? 'active' : ''}
          title="QR Code (Q)"
        >
          <QrCode size={22} />
        </button>

        <button
          onClick={onAddBarcode}
          className={selectedElement?.type === 'barcode' ? 'active' : ''}
          title="Código de Barras (B)"
        >
          <Barcode size={22} />
        </button>

        <hr />

        {/* O botão de limpar agora vai para o fim da barra por causa do margin-top: auto */}
        <button onClick={onClearAll} className="clear-button" title="Limpar Tudo">
          <Trash2 size={22} />
        </button>
      </aside>

      {/* BARRA SUPERIOR (PROPRIEDADES) */}
      <header className="top-toolbar">
        <div className="input-group-horizontal">
          <label>Etiqueta (cm):</label>
          <input type="number" value={labelWidth} onChange={onWidthChange} />
          <span>x</span>
          <input type="number" value={labelHeight} onChange={onHeightChange} />
        </div>

        <div className="vertical-divider"></div>

        <div className="dynamic-props">
          {/* ... (Manter lógica de propriedades dinâmicas igual) ... */}
          {isTextSelected && (
            <div className="prop-row">
              <label>Fonte:</label>
              <input type="number" value={fontHeight} onChange={(e) => onFontSizeChange('height', e.target.value)} />
              <input type="number" value={fontWidth} onChange={(e) => onFontSizeChange('width', e.target.value)} />
            </div>
          )}
          {/* Outros condicionais... */}
        </div>

        <button onClick={onGenerateCode} className="generate-button" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Play size={16} fill="white" /> Gerar ZPL
        </button>
      </header>
    </>
  );
}

export default Toolbar;