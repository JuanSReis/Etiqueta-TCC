import React, { useState, useRef, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';
import './App.css';
import Toolbar from './components/Toolbar';

// Constantes de Escala
const DOTS_PER_MM = 8; // Para impressoras 203 DPI
const PIXELS_PER_MM = 3.78; // Para telas ~96 DPI
const SNAP_DISTANCE = 2; // Distância para o "snap" em pixels

function App() {
  const [elements, setElements] = useState([]);
  const [activeDrag, setActiveDrag] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [generatedCode, setGeneratedCode] = useState("Código ZPL aparecerá aqui...");
  const [labelWidthCm, setLabelWidthCm] = useState(10);
  const [labelHeightCm, setLabelHeightCm] = useState(15);
  const [selectedElementId, setSelectedElementId] = useState(null);

  // Estados para elementos de texto
  const [fontHeight, setFontHeight] = useState(50);
  const [fontWidth, setFontWidth] = useState(50);

  // Estados para QR Code
  const [qrCodeContent, setQrCodeContent] = useState('');
  const [qrCodeMagnification, setQrCodeMagnification] = useState(5);

  // Estados para Código de Barras
  const [barcodeContent, setBarcodeContent] = useState('123456');
  const [barcodeHeight, setBarcodeHeight] = useState(50);
  const [barcodeShowText, setBarcodeShowText] = useState(true);
  const [barcodeBarWidth, setBarcodeBarWidth] = useState(2);

  const [elementThickness, setElementThickness] = useState(2);

  // --- INÍCIO: ESTADO PARA IMPORTAÇÃO DE ZPL ---
  const [zplToImport, setZplToImport] = useState("");
  // --- FIM: ESTADO PARA IMPORTAÇÃO DE ZPL ---

  const [snapLines, setSnapLines] = useState([]);

  const labelBoundaryRef = useRef(null);
  const elementRefs = useRef({});
  const selectedElement = elements.find(el => el.id === selectedElementId);

  useEffect(() => {
    if (selectedElement) {
      if (selectedElement.type === 'text') {
        setFontHeight(selectedElement.fontHeight);
        setFontWidth(selectedElement.fontWidth);
      } else if (selectedElement.type === 'qrcode') {
        setQrCodeContent(selectedElement.content);
        setQrCodeMagnification(selectedElement.magnification);
      } else if (selectedElement.type === 'barcode') {
        setBarcodeContent(selectedElement.content);
        setBarcodeHeight(selectedElement.height);
        setBarcodeShowText(selectedElement.showText);
        setBarcodeBarWidth(selectedElement.barWidth);
      }
      else if (selectedElement.type === 'line' || selectedElement.type === 'square') {
        setElementThickness(selectedElement.thickness);
      }
    }
  }, [selectedElement]);


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Delete' && selectedElementId) {
        setElements(prev => prev.filter(el => el.id !== selectedElementId));
        setSelectedElementId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedElementId]);

  const handleAddText = () => { setEditingId(null); const newTextElement = { id: `text-${Date.now()}`, type: 'text', content: 'Adicione seu texto aqui', x: 10, y: 20, font: 'sans-serif', fontHeight: 20, fontWidth: 20, }; setElements(prev => [...prev, newTextElement]); setSelectedElementId(newTextElement.id); };
  const handleAddLine = () => { setSelectedElementId(null); const newLine = { id: `line-${Date.now()}`, type: 'line', x1: 50, y1: 50, x2: 200, y2: 50, thickness: 4, }; setElements(prev => [...prev, newLine]); setSelectedElementId(newLine.id); };
  const handleAddSquare = () => { setSelectedElementId(null); const newSquare = { id: `square-${Date.now()}`, type: 'square', x: 60, y: 60, width: 150, height: 100, thickness: 2, }; setElements(prev => [...prev, newSquare]); setSelectedElementId(newSquare.id); };
  const handleAddFilledSquare = () => { setSelectedElementId(null); const newFilledSquare = { id: `filled-square-${Date.now()}`, type: 'filled-square', x: 80, y: 80, width: 120, height: 90, }; setElements(prev => [...prev, newFilledSquare]); };
  const handleAddQRCode = () => { setSelectedElementId(null); const newQRCode = { id: `qrcode-${Date.now()}`, type: 'qrcode', content: 'https://www.google.com', x: 50, y: 50, magnification: 5, }; setElements(prev => [...prev, newQRCode]); setSelectedElementId(newQRCode.id); };

  const handleAddBarcode = () => {
    setSelectedElementId(null);
    const newBarcode = {
      id: `barcode-${Date.now()}`,
      type: 'barcode',
      content: '12345678',
      x: 50,
      y: 50,
      height: 50,
      barWidth: 2,
      showText: true,
    };
    setElements(prev => [...prev, newBarcode]);
    setSelectedElementId(newBarcode.id);
  };

  const handleClearAll = () => { setElements([]); setEditingId(null); setSelectedElementId(null); setGeneratedCode("Código ZPL aparecerá aqui..."); };

  // --- INÍCIO: LÓGICA DE IMPORTAÇÃO ZPL CORRIGIDA ---
  const handleZplImport = () => {
    const newElements = [];
    let lastFO = { x: 0, y: 0 };
    let lastCF = { h: 30, w: 30 };
    let lastA = null;
    let lastBY = { barWidth: 2, ratio: 2, height: 50 };

    const commands = zplToImport
      .replace(/\^XA|\^XZ/g, '')
      .replace(/(\r\n|\n|\r)/gm, "")
      .split(/\^/g)
      .filter(cmd => cmd.trim() !== '');

    // --- CORREÇÃO: MUDANÇA PARA O LAÇO 'for' TRADICIONAL PARA PULAR COMANDOS ---
    for (let i = 0; i < commands.length; i++) {
      const fullCmd = commands[i];
      const command = fullCmd.substring(0, 2);
      const data = fullCmd.substring(2);

      if (command === 'FO') {
        const [x_dots, y_dots] = data.split(',').map(Number);
        lastFO = { x: x_dots, y: y_dots };
        continue;
      }
      if (command === 'CF') {
        const params = data.split(',');
        lastCF = { h: parseInt(params[1], 10), w: parseInt(params[2] || params[1], 10) };
        lastA = null;
        continue;
      }
      if (command.startsWith('A')) {
        const params = data.substring(data.indexOf(',') + 1).split(',');
        const h = parseInt(params[0], 10);
        const w = parseInt(params[1] || params[0], 10);
        if (!isNaN(h)) {
          lastA = { h, w };
        }
        continue;
      }
      if (command === 'BY') {
        const params = data.split(',');
        lastBY = {
          barWidth: parseInt(params[0], 10) || 2,
          ratio: parseFloat(params[1]) || 2,
          height: parseInt(params[2], 10) || 50
        };
        continue;
      }
      if (command === 'FS') {
        continue;
      }

      const x_px = (lastFO.x / DOTS_PER_MM) * PIXELS_PER_MM;
      let y_px = (lastFO.y / DOTS_PER_MM) * PIXELS_PER_MM;

      if (command === 'FD') {
        const content = data;
        const fontSettings = lastA || lastCF;
        const font_h_dots = fontSettings.h;
        const font_h_px = (font_h_dots / DOTS_PER_MM) * PIXELS_PER_MM;

        const visual_y_px = (y_px - font_h_px) * 1.099; //Aqui faço um arredondamento no calculo pra arredondar o calculo de visualização
        newElements.push({
          id: `text-${Date.now()}-${newElements.length}`,
          type: 'text',
          x: x_px,
          y: visual_y_px,
          fontHeight: font_h_px,
          fontWidth: (fontSettings.w / DOTS_PER_MM) * PIXELS_PER_MM,
          content: content
        });
      } else if (command === 'GB') { // Comando de caixa/linha gráfica
        const [width_dots, height_dots, thickness_dots = 1] = data.split(',').map(Number);
        const isFilled = thickness_dots >= Math.min(width_dots, height_dots) && Math.min(width_dots, height_dots) > 0;

        if (isFilled) {
          newElements.push({
            id: `filled-square-${Date.now()}-${newElements.length}`,
            type: 'filled-square',
            x: x_px, y: y_px,
            width: (width_dots / DOTS_PER_MM) * PIXELS_PER_MM,
            height: (height_dots / DOTS_PER_MM) * PIXELS_PER_MM,
          });
        } else {
          newElements.push({
            id: `square-${Date.now()}-${newElements.length}`,
            type: 'square',
            x: x_px, y: y_px,
            width: (width_dots / DOTS_PER_MM) * PIXELS_PER_MM,
            height: (height_dots / DOTS_PER_MM) * PIXELS_PER_MM,
            thickness: (thickness_dots / DOTS_PER_MM) * PIXELS_PER_MM,
          });
        }
      } else if (command === 'BC') {
        if ((i + 1) < commands.length) {
          const nextCmdRaw = commands[i + 1].trim();

          if (nextCmdRaw.startsWith('FD')) {
            const content = nextCmdRaw.substring(2);

            // ^BCo,h,f,g,e,m
            // o = orientação (index 0)
            // h = altura (index 1)
            // f = flag texto (index 2)
            const params = data.split(',');

            // CORREÇÃO 1: A altura é o segundo parâmetro (index 1), não o primeiro
            const height_dots = parseInt(params[1], 10) || lastBY.height;

            // CORREÇÃO 2: O flag de mostrar texto é o terceiro parâmetro (index 2)
            // Se não for especificado, o padrão do ZPL é 'Y' (mostrar)
            const paramShowText = params[2];
            const showText = paramShowText ? paramShowText === 'Y' : true;

            newElements.push({
              id: `barcode-${Date.now()}-${newElements.length}`,
              type: 'barcode',
              content: content,
              x: x_px,
              y: y_px,
              height: (height_dots / DOTS_PER_MM) * PIXELS_PER_MM,
              showText: showText,
              barWidth: lastBY.barWidth,
            });
            i++;
            continue;
          }
        }
      }
      else if (command === 'BQ') { // CORREÇÃO 1: O comando base é 'BQ' (2 chars), não 'BQN'
        if ((i + 1) < commands.length && commands[i + 1].startsWith('FD')) {
          // CORREÇÃO 2: Pega o conteúdo removendo apenas o "FD" (2 chars),
          // sem procurar por vírgula, pois ^FDtexto não tem vírgula obrigatória.
          const qrData = commands[i + 1].substring(2);

          const params = data.split(',');
          // O parametro de magnificação é geralmente o terceiro item (ex: N,2,5)
          const magnification = parseInt(params[2], 10) || 5;

          newElements.push({
            id: `qrcode-${Date.now()}-${newElements.length}`,
            type: 'qrcode',
            content: qrData,
            x: x_px,
            y: y_px,
            magnification: magnification,
          });
          i++; // Pula o comando ^FD que já foi usado
        }
      }
    }
    setElements(newElements);
    setZplToImport("");
  };
  // --- FIM: LÓGICA DE IMPORTAÇÃO ZPL CORRIGIDA ---


  const handleGenerateCode = () => {
    if (elements.length === 0) {
      setGeneratedCode("Adicione elementos na área de desenho primeiro.");
      return;
    }
    const zplCommands = elements.map(element => {
      const x_dots = Math.round((element.x / PIXELS_PER_MM) * DOTS_PER_MM);
      let y_dots = Math.round((element.y / PIXELS_PER_MM) * DOTS_PER_MM);

      if (element.type === 'text') {
        const font_height_dots = Math.round(element.fontHeight * (DOTS_PER_MM / PIXELS_PER_MM));
        const font_width_dots = Math.round(element.fontWidth * (DOTS_PER_MM / PIXELS_PER_MM));

        const adjusted_y_dots = Math.round((y_dots + font_height_dots) * 0.92);
        return `^FO${x_dots},${adjusted_y_dots}^A0N,${font_height_dots},${font_width_dots}^FD${element.content}^FS`;
      }
      if (element.type === 'line') {
        const x1_dots = Math.round((element.x1 / PIXELS_PER_MM) * DOTS_PER_MM);
        const y1_dots = Math.round((element.y1 / PIXELS_PER_MM) * DOTS_PER_MM);
        const x2_dots = Math.round((element.x2 / PIXELS_PER_MM) * DOTS_PER_MM);
        const y2_dots = Math.round((element.y2 / PIXELS_PER_MM) * DOTS_PER_MM);
        const thickness_dots = Math.max(1, Math.round(element.thickness * (DOTS_PER_MM / PIXELS_PER_MM)));

        const half_thickness = Math.round(thickness_dots / 2);

        const x_origin = Math.min(x1_dots, x2_dots);
        const y_origin = Math.min(y1_dots, y2_dots);
        const width_dots = Math.abs(x2_dots - x1_dots);
        const height_dots = Math.abs(y2_dots - y1_dots);

        if (width_dots < thickness_dots) {
          return `^FO${x_origin - half_thickness},${y_origin}^GB${thickness_dots},${height_dots},${thickness_dots}^FS`;
        }
        if (height_dots < thickness_dots) {
          return `^FO${x_origin},${y_origin - half_thickness}^GB${width_dots},${thickness_dots},${thickness_dots}^FS`;
        }

        const orientation = (y2_dots - y1_dots) * (x2_dots - x1_dots) >= 0 ? 'L' : 'R';
        return `^FO${x_origin},${y_origin}^GD${width_dots},${height_dots},${thickness_dots},B,${orientation}^FS`;
      }
      if (element.type === 'square') {
        const width_dots = Math.max(1, Math.round(element.width * (DOTS_PER_MM / PIXELS_PER_MM)));
        const height_dots = Math.max(1, Math.round(element.height * (DOTS_PER_MM / PIXELS_PER_MM)));
        const thickness_dots = Math.max(1, Math.round(element.thickness * (DOTS_PER_MM / PIXELS_PER_MM)));
        return `^FO${x_dots},${y_dots}^GB${width_dots},${height_dots},${thickness_dots},B^FS`;
      }
      if (element.type === 'filled-square') {
        const width_dots = Math.max(1, Math.round((element.width / PIXELS_PER_MM) * DOTS_PER_MM));
        const height_dots = Math.max(1, Math.round((element.height / PIXELS_PER_MM) * DOTS_PER_MM));
        return `^FO${x_dots},${y_dots}^GB${width_dots},${height_dots},${height_dots},B^FS`;
      }
      if (element.type === 'qrcode') {
        return `^FO${x_dots},${y_dots}^BQN,2,${element.magnification}^FDLA,${element.content}^FS`;
      }
      if (element.type === 'barcode') {
        const height_dots = Math.round(element.height * (DOTS_PER_MM / PIXELS_PER_MM));
        const show_text = element.showText ? 'Y' : 'N';
        const bar_width = Math.max(1, Math.min(10, element.barWidth));
        const barcode_command = `^BY${bar_width}\n^FO${x_dots},${y_dots}^BCN,${height_dots},${show_text},N,N^FD${element.content}^FS`;
        return barcode_command;
      }
      return null;
    }).filter(cmd => cmd).join('\n');

    setGeneratedCode(`^XA\n${zplCommands}\n^XZ`);
  };

  const handleTextChange = (id, newContent) => { setElements(prev => prev.map(el => (el.id === id ? { ...el, content: newContent } : el))); };
  const handleFontSizeChange = (dimension, value) => { const numericValue = parseInt(value, 10) || 1; if (dimension === 'height') setFontHeight(numericValue); else setFontWidth(numericValue); if (selectedElementId) { setElements(prev => prev.map(el => { if (el.id === selectedElementId && el.type === 'text') { const finalValue = Math.max(1, numericValue); return dimension === 'height' ? { ...el, fontHeight: finalValue } : { ...el, fontWidth: finalValue }; } return el; })); } };

  const handleThicknessChange = (value) => {
    const numericValue = Math.max(1, parseInt(value, 10) || 1);
    setElementThickness(numericValue);
    if (selectedElementId) {
      setElements(prev =>
        prev.map(el => {
          if (el.id === selectedElementId && (el.type === 'line' || el.type === 'square')) {
            return { ...el, thickness: numericValue };
          }
          return el;
        })
      );
    }
  };

  const handleMouseDown = (e, elementId, handle) => { e.preventDefault(); e.stopPropagation(); setEditingId(null); setActiveDrag({ elementId, handle, startX: e.clientX, startY: e.clientY }); setSelectedElementId(elementId); };

  const handleQRCodeChange = (property, value) => {
    const numericValue = parseInt(value, 10) || 1;
    if (property === 'content') setQrCodeContent(value);
    if (property === 'magnification') setQrCodeMagnification(numericValue);

    if (selectedElementId) {
      setElements(prev =>
        prev.map(el => {
          if (el.id === selectedElementId && el.type === 'qrcode') {
            const finalValue = property === 'magnification' ? Math.max(1, Math.min(10, numericValue)) : value;
            return { ...el, [property]: finalValue };
          }
          return el;
        })
      );
    }
  };

  const handleBarcodeChange = (property, value) => {
    if (selectedElementId) {
      if (property === 'content') setBarcodeContent(value);
      if (property === 'height') setBarcodeHeight(parseInt(value, 10) || 1);
      if (property === 'showText') setBarcodeShowText(value);
      if (property === 'barWidth') setBarcodeBarWidth(parseInt(value, 10) || 1);

      setElements(prev =>
        prev.map(el => {
          if (el.id === selectedElementId && el.type === 'barcode') {
            let finalValue = value;
            if (property === 'height' || property === 'barWidth') {
              finalValue = Math.max(1, parseInt(value, 10) || 1);
            }
            return { ...el, [property]: finalValue };
          }
          return el;
        })
      );
    }
  };

  const getElementBounds = (element) => {
    if (!element) return null;

    const node = elementRefs.current[element.id];
    if (!node) {
      if (element.type === 'line') {
        const bounds = {
          left: Math.min(element.x1, element.x2),
          right: Math.max(element.x1, element.x2),
          top: Math.min(element.y1, element.y2),
          bottom: Math.max(element.y1, element.y2),
        };
        bounds.centerX = (bounds.left + bounds.right) / 2;
        bounds.centerY = (bounds.top + bounds.bottom) / 2;
        return bounds;
      }
      return { left: element.x, right: element.x + 100, top: element.y, bottom: element.y + 50, centerX: element.x + 50, centerY: element.y + 25 };
    }

    const bounds = {
      left: element.x,
      right: element.x + node.offsetWidth,
      top: element.y,
      bottom: element.y + node.offsetHeight,
    };
    bounds.centerX = bounds.left + node.offsetWidth / 2;
    bounds.centerY = bounds.top + node.offsetHeight / 2;
    return bounds;
  };

  const handleMouseMove = (e) => {
    if (!activeDrag) return;
    let movementX = e.movementX;
    let movementY = e.movementY;
    setElements(prev => {
      const newElements = [...prev];
      const draggedElIndex = newElements.findIndex(el => el.id === activeDrag.elementId);
      if (draggedElIndex === -1) return prev;

      const originalDraggedEl = { ...newElements[draggedElIndex] };
      const { handle } = activeDrag;

      if (handle.includes('body')) {
        const staticElements = newElements.filter(el => el.id !== activeDrag.elementId);
        const draggedBounds = getElementBounds(originalDraggedEl);
        let snapX = false, snapY = false;
        const newSnapLines = [];
        if (draggedBounds) {
          for (const staticEl of staticElements) {
            const staticBounds = getElementBounds(staticEl);
            if (!staticBounds) continue;
            if (!snapX) {
              if (Math.abs(draggedBounds.left + movementX - staticBounds.left) < SNAP_DISTANCE) { movementX = staticBounds.left - draggedBounds.left; snapX = true; newSnapLines.push({ type: 'vertical', x: staticBounds.left }); }
              else if (Math.abs(draggedBounds.left + movementX - staticBounds.right) < SNAP_DISTANCE) { movementX = staticBounds.right - draggedBounds.left; snapX = true; newSnapLines.push({ type: 'vertical', x: staticBounds.right }); }
              else if (Math.abs(draggedBounds.right + movementX - staticBounds.left) < SNAP_DISTANCE) { movementX = staticBounds.left - draggedBounds.right; snapX = true; newSnapLines.push({ type: 'vertical', x: staticBounds.left }); }
              else if (Math.abs(draggedBounds.right + movementX - staticBounds.right) < SNAP_DISTANCE) { movementX = staticBounds.right - draggedBounds.right; snapX = true; newSnapLines.push({ type: 'vertical', x: staticBounds.right }); }
              else if (Math.abs(draggedBounds.centerX + movementX - staticBounds.centerX) < SNAP_DISTANCE) { movementX = staticBounds.centerX - draggedBounds.centerX; snapX = true; newSnapLines.push({ type: 'vertical', x: staticBounds.centerX }); }
            }
            if (!snapY) {
              if (Math.abs(draggedBounds.top + movementY - staticBounds.top) < SNAP_DISTANCE) { movementY = staticBounds.top - draggedBounds.top; snapY = true; newSnapLines.push({ type: 'horizontal', y: staticBounds.top }); }
              else if (Math.abs(draggedBounds.top + movementY - staticBounds.bottom) < SNAP_DISTANCE) { movementY = staticBounds.bottom - draggedBounds.top; snapY = true; newSnapLines.push({ type: 'horizontal', y: staticBounds.bottom }); }
              else if (Math.abs(draggedBounds.bottom + movementY - staticBounds.top) < SNAP_DISTANCE) { movementY = staticBounds.top - draggedBounds.bottom; snapY = true; newSnapLines.push({ type: 'horizontal', y: staticBounds.top }); }
              else if (Math.abs(draggedBounds.bottom + movementY - staticBounds.bottom) < SNAP_DISTANCE) { movementY = staticBounds.bottom - draggedBounds.bottom; snapY = true; newSnapLines.push({ type: 'horizontal', y: staticBounds.bottom }); }
              else if (Math.abs(draggedBounds.centerY + movementY - staticBounds.centerY) < SNAP_DISTANCE) { movementY = staticBounds.centerY - draggedBounds.centerY; snapY = true; newSnapLines.push({ type: 'horizontal', y: staticBounds.centerY }); }
            }
          }
        }
        setSnapLines(newSnapLines);
      }

      const finalEl = { ...newElements[draggedElIndex] };
      if (handle === 'body' || handle === 'square-body' || handle === 'qrcode-body' || handle === 'barcode-body') { finalEl.x += movementX; finalEl.y += movementY; }
      else if (handle === 'line-body') { finalEl.x1 += movementX; finalEl.y1 += movementY; finalEl.x2 += movementX; finalEl.y2 += movementY; }
      else if (handle === 'start') { finalEl.x1 += e.movementX; finalEl.y1 += e.movementY; }
      else if (handle === 'end') { finalEl.x2 += e.movementX; finalEl.y2 += e.movementY; }
      else if (handle === 'square-resize') { finalEl.width = Math.max(20, finalEl.width + e.movementX); finalEl.height = Math.max(20, finalEl.height + e.movementY); }
      else if (handle === 'qrcode-resize') {
        const currentSize = finalEl.magnification * 24;
        const newSize = Math.max(24, currentSize + (e.movementX + e.movementY) / 2);
        const newMagnification = Math.round(newSize / 24);
        finalEl.magnification = Math.max(1, Math.min(10, newMagnification));
        setQrCodeMagnification(finalEl.magnification);
      }
      newElements[draggedElIndex] = finalEl;
      return newElements;
    });
  };

  const handleMouseUp = () => { setActiveDrag(null); setSnapLines([]); };
  const handleDoubleClick = (id) => setEditingId(id);
  const handleInputBlur = () => setEditingId(null);

  return (
    <div className="app-container">
      <Toolbar
        onAddText={handleAddText} onAddLine={handleAddLine} onAddSquare={handleAddSquare}
        onAddFilledSquare={handleAddFilledSquare}
        onAddQRCode={handleAddQRCode}
        onAddBarcode={handleAddBarcode}
        onClearAll={handleClearAll} onGenerateCode={handleGenerateCode}
        labelWidth={labelWidthCm} labelHeight={labelHeightCm}
        onWidthChange={(e) => setLabelWidthCm(e.target.value)}
        onHeightChange={(e) => setLabelHeightCm(e.target.value)}
        selectedElement={selectedElement}
        fontHeight={fontHeight} fontWidth={fontWidth}
        onFontSizeChange={handleFontSizeChange}
        qrCodeContent={qrCodeContent}
        qrCodeMagnification={qrCodeMagnification}
        onQRCodeChange={handleQRCodeChange}
        barcodeContent={barcodeContent}
        barcodeHeight={barcodeHeight}
        barcodeShowText={barcodeShowText}
        barcodeBarWidth={barcodeBarWidth}
        onBarcodeChange={handleBarcodeChange}
        elementThickness={elementThickness}
        onThicknessChange={handleThicknessChange}
      />
      <div className="content-container" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
        <div className="editor-pane">
          <div ref={labelBoundaryRef} className="label-boundary" style={{ width: `${labelWidthCm * 10 * PIXELS_PER_MM}px`, height: `${labelHeightCm * 10 * PIXELS_PER_MM}px` }}>
            {elements.map(element => {
              const setRef = (el) => { if (el) { elementRefs.current[element.id] = el; } };
              const isSelected = selectedElementId === element.id;

              if (element.type === 'text') { const isEditing = editingId === element.id; const containerStyle = { left: `${element.x}px`, top: `${element.y}px`, fontFamily: element.font, fontSize: `${element.fontHeight}px`, }; const fontScaleX = element.fontWidth / (element.fontHeight * 1.21); const innerSpanStyle = { display: 'inline-block', transform: `scaleX(${fontScaleX})`, transformOrigin: 'top left', whiteSpace: 'nowrap', }; const inputStyle = { left: `${element.x}px`, top: `${element.y}px`, fontFamily: element.font, fontSize: `${element.fontHeight}px`, width: 'auto', }; return isEditing ? (<input key={element.id} type="text" value={element.content} onChange={e => handleTextChange(element.id, e.target.value)} onBlur={handleInputBlur} autoFocus className="element-input" style={inputStyle} />) : (<div key={element.id} ref={setRef} className={`element ${activeDrag?.elementId === element.id ? 'dragging' : ''} ${isSelected ? 'selected' : ''}`} style={containerStyle} onMouseDown={e => handleMouseDown(e, element.id, 'body')} onDoubleClick={() => handleDoubleClick(element.id)}> <span style={innerSpanStyle}>{element.content}</span> </div>); }
              if (element.type === 'line') { const left = Math.min(element.x1, element.x2), top = Math.min(element.y1, element.y2); const width = Math.abs(element.x1 - element.x2), height = Math.abs(element.y1 - element.y2); return (<React.Fragment key={element.id}> <div ref={setRef} className={`line-container ${isSelected ? 'selected' : ''}`} style={{ left, top, width: width || 1, height: height || 1 }}><svg width={width || 1} height={height || 1} style={{ overflow: 'visible' }}><line x1={element.x1 - left} y1={element.y1 - top} x2={element.x2 - left} y2={element.y2 - top} className="line-element" style={{ strokeWidth: element.thickness }} /></svg></div> <div className="line-body" style={{ left, top, width, height, cursor: 'move', position: 'absolute', zIndex: 1001 }} onMouseDown={e => handleMouseDown(e, element.id, 'line-body')}></div> {isSelected && (<> <div className="line-handle" style={{ left: element.x1, top: element.y1 }} onMouseDown={e => handleMouseDown(e, element.id, 'start')}></div> <div className="line-handle" style={{ left: element.x2, top: element.y2 }} onMouseDown={e => handleMouseDown(e, element.id, 'end')}></div></>)} </React.Fragment>); }
              if (element.type === 'square' || element.type === 'filled-square') { return (<div key={element.id} ref={setRef} className={`square-element ${isSelected ? 'selected' : ''}`} style={{ left: `${element.x}px`, top: `${element.y}px`, width: `${element.width}px`, height: `${element.height}px`, borderWidth: element.type === 'square' ? `${element.thickness}px` : '0px', backgroundColor: element.type === 'filled-square' ? '#333' : 'transparent', }} onMouseDown={e => handleMouseDown(e, element.id, 'square-body')}> {isSelected && <div className="resize-handle" onMouseDown={e => handleMouseDown(e, element.id, 'square-resize')}></div>} </div>); }
              if (element.type === 'qrcode') { const qrSize = element.magnification * 13; return (<div key={element.id} ref={setRef} className={`qrcode-element ${isSelected ? 'selected' : ''}`} style={{ left: `${element.x}px`, top: `${element.y}px`, width: `${qrSize}px`, height: `${qrSize}px`, }} onMouseDown={e => handleMouseDown(e, element.id, 'qrcode-body')} > <QRCodeSVG value={element.content} size={qrSize} style={{ width: '100%', height: 'auto' }} /> {isSelected && <div className="resize-handle" onMouseDown={e => handleMouseDown(e, element.id, 'qrcode-resize')}></div>} </div>); }
              if (element.type === 'barcode') {
                // --- INÍCIO DA CORREÇÃO ---
                // AGORA a largura da barra (width) é controlada pelo `barWidth` do elemento,
                // que vem do comando ^BY do ZPL importado. O valor 2 é um multiplicador visual.
                const visualBarWidth = (element.barWidth || 2) * 0.75;
                // --- FIM DA CORREÇÃO ---

                return (
                  <div
                    key={element.id}
                    ref={setRef}
                    className={`element ${isSelected ? 'selected' : ''}`}
                    style={{
                      left: `${element.x}px`,
                      top: `${element.y}px`,
                      backgroundColor: 'white',
                      display: 'inline-block',
                      lineHeight: 1,
                    }}
                    onMouseDown={e => handleMouseDown(e, element.id, 'barcode-body')}
                  >
                    <Barcode
                      value={element.content}
                      height={element.height}
                      width={visualBarWidth} // <-- USANDO O VALOR CORRIGIDO
                      displayValue={element.showText}
                      margin={0}
                      fontSize={14}
                    />
                  </div>
                );
              }
              return null;
            })}

            {snapLines.map((line, index) => { if (line.type === 'vertical') { return <div key={index} className="snap-line vertical" style={{ left: line.x }} />; } if (line.type === 'horizontal') { return <div key={index} className="snap-line horizontal" style={{ top: line.y }} />; } return null; })}
          </div>
        </div>
        <div className="code-pane">
          <div className="zpl-import-section">
            <h2>Importar Código ZPL</h2>
            <textarea
              placeholder="Cole seu código ZPL aqui..."
              value={zplToImport}
              onChange={(e) => setZplToImport(e.target.value)}
            />
            <button onClick={handleZplImport}>Desenhar ZPL</button>
          </div>
          <div className="zpl-generation-section">
            <h2>Código ZPL Gerado</h2>
            <textarea readOnly value={generatedCode} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;