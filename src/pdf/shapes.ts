import { loadCultureFiles } from '../common/culture-loader';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument, PdfPage, PdfGraphics, PdfBrush, PdfPen, PdfFontFamily, PdfFontStyle, PdfLineJoin } from '@syncfusion/ej2-pdf';
(window as any).default = (): void => {
    loadCultureFiles();
    let button: Button = new Button({}, '#shapebtn');
    button.element.onclick = (): void => {
        const doc = new PdfDocument();
        const page: PdfPage = doc.addPage();
        const g: PdfGraphics = page.graphics;
        // Fonts
        const headerFont = doc.embedFont(PdfFontFamily.helvetica, 14, PdfFontStyle.bold);
        let pen = new PdfPen({ r: 0, g: 0, b: 0 }, 3);
        const pointNum = 16;
        const radius = 100;
        const center = { x: 140, y: 140 };
        // Build points like your loop
        const polygonPoints = makeRegularPolygon(center.x, center.y, radius, pointNum);
        // Brush and pen colors (brown stroke, green fill)
        pen._color = { r: 165, g: 42, b: 42 };     // Brown
        pen._width = 10;
        pen._lineJoin = PdfLineJoin.round;
        const greenBrush = new PdfBrush({ r: 0, g: 128, b: 0 });
        g.drawString('Polygon', headerFont, { x: 50, y: 0, width: 100, height: 100 }, new PdfBrush({ r: 0, g: 0, b: 139 }));
        g.drawPolygon(polygonPoints, pen, greenBrush);
        let rect = { x: 20, y: 280, width: 200, height: 200 };
        g.drawString('Pie shape', headerFont, { x: 50, y: 250, width: 100, height: 100 }, new PdfBrush({ r: 0, g: 0, b: 139 }));
        pen._color = { r: 165, g: 42, b: 42 }; // Brown stroke
        pen._width = 10;
        pen._lineJoin = PdfLineJoin.round;
        const brownBrush = new PdfBrush({ r: 165, g: 42, b: 42 });
        const green = new PdfBrush({ r: 0, g: 128, b: 0 });
        g.drawPie(rect, 180, 60, pen, green);
        g.drawPie(rect, 360 - 60, 60, pen, green);
        g.drawPie(rect, 60, 60, pen, green);
        g.drawString('Arcs', headerFont, { x: 330, y: 0, width: 100, height: 100 }, new PdfBrush({ r: 0, g: 0, b: 139 }));
        rect = { x: 310, y: 40, width: 200, height: 200 };
        g.drawArc(rect, 0, 90, new PdfPen({ r: 165, g: 42, b: 42 }, 11));
        g.drawArc({ x: rect.x - 10, y: rect.y, width: rect.width, height: rect.height }, 90, 90, new PdfPen({ r: 0, g: 100, b: 0 }, 11));
        g.drawArc({ x: rect.x - 10, y: rect.y - 10, width: rect.width, height: rect.height }, 180, 90, new PdfPen({ r: 165, g: 42, b: 42 }, 11));
        g.drawArc({ x: rect.x, y: rect.y - 10, width: rect.width, height: rect.height }, 270, 90, new PdfPen({ r: 0, g: 100, b: 0 }, 11));
        rect = { x: 310, y: 280, width: 200, height: 100 };
        g.drawString('Simple Rectangle', headerFont, { x: 310, y: 255, width: 150, height: 100 }, new PdfBrush({ r: 0, g: 0, b: 139 }));
        g.drawRectangle(rect, new PdfPen({ r: 165, g: 42, b: 42 }, 11), new PdfBrush({ r: 0, g: 128, b: 0 }));
        g.drawString('Shape with pagination', headerFont, { x: 300, y: 390, width: 200, height: 100 }, new PdfBrush({ r: 0, g: 0, b: 139 }));
        // Large ellipse on first page
        g.drawEllipse({ x: 300, y: 450, width: 160, height: 1100 }, brownBrush);
        g.drawEllipse({ x: 320, y: 480, width: 160, height: 1100 }, green);
        let page2 = doc.addPage();
        let g2 = page2.graphics;
        g2.drawEllipse({ x: 300, y: -480, width: 160, height: 1100 }, brownBrush);
        g2.drawEllipse({ x: 320, y: -450, width: 160, height: 1100 }, green);
        g2.drawString('Transparent Rectangles', headerFont, { x: 50, y: 80, width: 200, height: 100 }, new PdfBrush({ r: 0, g: 0, b: 139 }));
        let r = { x: 10, y: 150, width: 100, height: 100 };
        let p = new PdfPen({ r: 0, g: 0, b: 0 }, 1);
        let b: PdfBrush = new PdfBrush({ r: 0, g: 100, b: 0 }); // DarkGreen
        g2.drawRectangle(r, p, b);
        r = { x: r.x + 20, y: r.y + 20, width: r.width, height: r.height };
        p = new PdfPen({ r: 165, g: 42, b: 42 }, 1); // Brown
        b = new PdfBrush({ r: 165, g: 42, b: 42 });
        g2.setTransparency(0.7);
        g2.drawRectangle(r, p, b);
        r = { x: r.x + 20, y: r.y + 20, width: r.width, height: r.height };
        g2.setTransparency(0.5);
        g2.drawRectangle(r, p, new PdfBrush({ r: 0, g: 100, b: 0 }));
        r = { x: r.x + 20, y: r.y + 20, width: r.width, height: r.height };
        p = new PdfPen({ r: 0, g: 0, b: 255 }, 1); // Blue
        b = new PdfBrush({ r: 128, g: 128, b: 128 }); // Gray
        g2.setTransparency(0.25);
        g2.drawRectangle(r, p, b);
        r = { x: r.x + 20, y: r.y + 20, width: r.width, height: r.height };
        p = new PdfPen({ r: 0, g: 0, b: 0 }, 1); // Black
        b = new PdfBrush({ r: 0, g: 128, b: 0 }); // Green
        g2.setTransparency(0.1);
        g2.drawRectangle(r, p, b);
        // Save and download
        doc.save('Shapes.pdf');
        doc.destroy();
    }
    function makeRegularPolygon(
        cx: number,
        cy: number,
        r: number,
        pointNum: number
    ): Array<{ x: number; y: number }> {
        const pts: Array<{ x: number; y: number }> = [];
        const f = (360.0 / pointNum) * Math.PI / 180.0;
        for (let i = 0; i < pointNum; i++) {
            const theta = i * f;
            pts.push({
                x: Math.cos(theta) * r + cx,
                y: Math.sin(theta) * r + cy
            });
        }
        return pts;
    }
};