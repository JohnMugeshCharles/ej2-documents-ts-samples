import { loadCultureFiles } from '../common/culture-loader';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument, PdfPageSettings, PdfMargins, PdfPage, PdfGraphics, PdfBrush, PdfPen, PdfFontFamily, PdfStandardFont } from '@syncfusion/ej2-pdf';
(window as any).default = (): void => {
    loadCultureFiles();
    let button: Button = new Button();
    button.appendTo('#layerbtn');
    button.element.onclick = (): void => {
        const doc = new PdfDocument();
        // Create page settings
        let settings = new PdfPageSettings();
        settings.size = { width: 350, height: 300 };
        settings.margins = new PdfMargins(0);
        const page: PdfPage = doc.addPage(settings);
        // Heading
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 16);
        const darkBlueBrush = new PdfBrush({ r: 0, g: 0, b: 139 });
        page.graphics.drawString('Layers', font, { x: 150, y: 10, width: 100, height: 100 }, darkBlueBrush);
        // ---------- Layer 1 ----------
        const layer1 = doc.layers.add('Layer1');
        const g1: PdfGraphics = layer1.createGraphics(page);
        g1.translateTransform({ x: 100, y: 60 });
        const rect = { x: 0, y: 0, width: 50, height: 50 };
        let pen = new PdfPen({ r: 255, g: 0, b: 0 }, 50);
        // drawArc using pen
        g1.drawArc(rect, 360, 360, pen);
        pen = new PdfPen({ r: 0, g: 0, b: 255 }, 30);
        g1.drawArc(rect, 360, 360, pen);
        pen = new PdfPen({ r: 255, g: 255, b: 0 }, 20);
        g1.drawArc(rect, 360, 360, pen);
        pen = new PdfPen({ r: 0, g: 128, b: 0 }, 10);
        g1.drawArc(rect, 360, 360, pen);
        // ---------- Layer 2 ----------
        const layer2 = doc.layers.add('Layer2');
        const g2: PdfGraphics = layer2.createGraphics(page);
        g2.translateTransform({ x: 100, y: 180 });
        pen = new PdfPen({ r: 255, g: 0, b: 0 }, 50);
        g2.drawArc(rect, 360, 360, pen);
        pen = new PdfPen({ r: 0, g: 0, b: 255 }, 30);
        g2.drawArc(rect, 360, 360, pen);
        pen = new PdfPen({ r: 255, g: 255, b: 0 }, 20);
        g2.drawArc(rect, 360, 360, pen);
        pen = new PdfPen({ r: 0, g: 128, b: 0 }, 10);
        g2.drawArc(rect, 360, 360, pen);
        // ---------- Layer 3 ----------
        const layer3 = doc.layers.add('Layer3');
        const g3: PdfGraphics = layer3.createGraphics(page);
        g3.translateTransform({ x: 160, y: 120 });
        pen = new PdfPen({ r: 255, g: 0, b: 0 }, 50);
        g3.drawArc(rect, -60, 60, pen);
        pen = new PdfPen({ r: 0, g: 0, b: 255 }, 30);
        g3.drawArc(rect, -60, 60, pen);
        pen = new PdfPen({ r: 255, g: 255, b: 0 }, 20);
        g3.drawArc(rect, -60, 60, pen);
        pen = new PdfPen({ r: 0, g: 128, b: 0 }, 10);
        g3.drawArc(rect, -60, 60, pen);
        doc.save('Layers.pdf');
        doc.destroy();
    }
};