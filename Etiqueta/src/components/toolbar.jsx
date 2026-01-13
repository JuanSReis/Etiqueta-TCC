// src/components/Toolbar.js

import React from 'react';
import './Toolbar.css';

function Toolbar({
  onAddText, onAddLine, onAddSquare, onAddFilledSquare,
  onAddQRCode,
  onAddBarcode, 
  onClearAll, onGenerateCode,
  labelWidth, labelHeight, onWidthChange, onHeightChange,
  selectedElement,
  fontHeight, fontWidth, onFontSizeChange,
  qrCodeContent, qrCodeMagnification, onQRCodeChange,
  barcodeContent, barcodeHeight, barcodeShowText, barcodeBarWidth, onBarcodeChange,
  // --- INÍCIO: PROPS ADICIONADAS PARA ESPESSURA ---
  elementThickness, onThicknessChange,
  // --- FIM: PROPS ADICIONADAS ---
}) {
  const isTextSelected = selectedElement && selectedElement.type === 'text';
  const isQRCodeSelected = selectedElement && selectedElement.type === 'qrcode';
  const isBarcodeSelected = selectedElement && selectedElement.type === 'barcode';
  // --- INÍCIO: VERIFICAÇÃO ADICIONADA ---
  const isLineOrSquareSelected = selectedElement && (selectedElement.type === 'line' || selectedElement.type === 'square');
  // --- FIM: VERIFICAÇÃO ADICIONADA ---

  return (
    <div className="toolbar">
      <div className="toolbar-left">

        {isTextSelected && (
          <div className="font-size-group">
            <div className="input-group">
              <label htmlFor="fontHeight">Altura</label>
              <input type="number" id="fontHeight" value={fontHeight} onChange={(e) => onFontSizeChange('height', e.target.value)} className="font-size-input" min="1"/>
            </div>
            <div className="input-group">
              <label htmlFor="fontWidth">Largura</label>
              <input type="number" id="fontWidth" value={fontWidth} onChange={(e) => onFontSizeChange('width', e.target.value)} className="font-size-input" min="1"/>
            </div>
          </div>
        )}

        {isQRCodeSelected && (
          <div className="font-size-group">
            <div className="input-group">
              <label htmlFor="qrContent">Conteúdo</label>
              <input type="text" id="qrContent" value={qrCodeContent} onChange={(e) => onQRCodeChange('content', e.target.value)} className="qr-content-input" />
            </div>
            <div className="input-group">
              <label htmlFor="qrMag">Tamanho</label>
              <input type="number" id="qrMag" value={qrCodeMagnification} onChange={(e) => onQRCodeChange('magnification', e.target.value)} className="font-size-input" min="1" max="10" />
            </div>
          </div>
        )}

        {isBarcodeSelected && (
          <div className="font-size-group">
            <div className="input-group">
              <label htmlFor="barcodeContent">Conteúdo</label>
              <input
                type="text"
                id="barcodeContent"
                value={barcodeContent}
                onChange={(e) => onBarcodeChange('content', e.target.value)}
                className="barcode-content-input"
              />
            </div>
            <div className="input-group">
              <label htmlFor="barcodeHeight">Altura</label>
              <input
                type="number"
                id="barcodeHeight"
                value={barcodeHeight}
                onChange={(e) => onBarcodeChange('height', e.target.value)}
                className="font-size-input"
                min="10"
              />
            </div>
            <div className="input-group checkbox-group">
              <label htmlFor="barcodeShowText">Mostrar Texto</label>
              <input
                type="checkbox"
                id="barcodeShowText"
                checked={barcodeShowText}
                onChange={(e) => onBarcodeChange('showText', e.target.checked)}
              />
            </div>
          </div>
        )}

        {/* --- INÍCIO: INPUT ADICIONADO PARA CONTROLE DE ESPESSURA --- */}
        {isLineOrSquareSelected && (
          <div className="font-size-group">
            <div className="input-group">
              <label htmlFor="thickness">Espessura (px)</label>
              <input 
                type="number" 
                id="thickness" 
                value={elementThickness} 
                onChange={(e) => onThicknessChange(e.target.value)} 
                className="font-size-input" 
                min="1"
              />
            </div>
          </div>
        )}
        {/* --- FIM: INPUT ADICIONADO --- */}

        <button onClick={onAddText}>Adicionar Texto</button>
        <button onClick={onAddLine}>Adicionar Linha</button>
        <button onClick={onAddSquare}>Adicionar Quadrado</button>
        <button onClick={onAddFilledSquare}>Quadrado Preto</button>
        <button onClick={onAddQRCode}>QR-Code</button>
        <button onClick={onAddBarcode}>Cód. Barras</button>
      </div>
      <div className="toolbar-center">
        <div className="input-group">
          <label htmlFor="width">Largura (cm)</label>
          <input type="number" id="width" value={labelWidth} onChange={onWidthChange} min="1" max="20" />
        </div>
        <div className="input-group">
          <label htmlFor="height">Altura (cm)</label>
          <input type="number" id="height" value={labelHeight} onChange={onHeightChange} min="1" max="20" />
        </div>
      </div>
      <div className="toolbar-right">
        <button onClick={onGenerateCode} className="generate-button">Gerar Código</button>
        <button onClick={onClearAll} className="clear-button">Limpar Tudo</button>
      </div>
    </div>
  );
}

export default Toolbar;