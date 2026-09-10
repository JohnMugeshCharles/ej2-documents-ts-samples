import { loadCultureFiles } from '../common/culture-loader';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument, PdfPage, PdfGraphics, PdfBrush, PdfFont, PdfFontFamily, PdfFontStyle, PdfBitmap } from '@syncfusion/ej2-pdf';
(window as any).default = (): void => {
    loadCultureFiles();
    const generateBtn = new Button();
    generateBtn.appendTo('#generatebtn');
    generateBtn.element.onclick = async (): Promise<void> => {
        try {
            const [jpgBytes, pngBytes] = await Promise.all([
                fetchAsUint8Array(jpeg),
                fetchAsUint8Array(png)
            ]);
            // Create a new PdfDocument
            const document: PdfDocument = new PdfDocument();
            // Add a new page and get its PdfGraphics context
            const page: PdfPage = document.addPage();
            const g: PdfGraphics = page.graphics;
            // Embed a Helvetica bold font (size 12)
            const font: PdfFont = document.embedFont(PdfFontFamily.helvetica, 12, PdfFontStyle.bold);
            // Create a blue PdfBrush for headings
            const blueBrush: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 255 });
            // Draw the "JPEG Image" heading at (0, 40)
            g.drawString('JPEG Image', font, { x: 0, y: 40, width: 100, height: 100 }, blueBrush);
            // Create a PdfBitmap from the JPEG bytes
            const jpgImage: PdfBitmap = new PdfBitmap(jpgBytes);
            // Draw the JPEG image at (0, 70) sized 515x215
            g.drawImage(jpgImage, { x: 0, y: 70, width: 515, height: 215 });
            //  Draw the "PNG Image" heading at (0, 355)
            g.drawString('PNG Image', font, { x: 0, y: 355, width: 100, height: 100 }, blueBrush);
            // Create a PdfBitmap from the PNG bytes
            const pngImage: PdfBitmap = new PdfBitmap(pngBytes);
            // Draw the PNG image at (0, 365) sized 199x300
            g.drawImage(pngImage, { x: 0, y: 365, width: 199, height: 300 });
            // Save and download PDF
            document.save(outpt);
            // Destroy the PDF document instance
            document.destroy();
        } catch (err) {
            console.error('Generate PDF failed:', err);
        }
    };
};
const jpeg = 'https://cdn.syncfusion.com/content/pdf-resources/xamarin-jpeg.jpg';
const png = 'https://cdn.syncfusion.com/content/pdf-resources/xamarin-png.png';
const outpt = 'Images.pdf';
async function fetchAsUint8Array(url: string): Promise<Uint8Array> {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
}