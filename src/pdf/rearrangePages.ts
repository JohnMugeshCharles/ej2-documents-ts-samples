import { loadCultureFiles } from '../common/culture-loader';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument } from '@syncfusion/ej2-pdf';
(window as any).default = (): void => {
    loadCultureFiles();
    const viewBtn = new Button({}, '#viewtemplatebtn');
    const rearrangeBtn = new Button({}, '#rearrangebtn');
    rearrangeBtn.element.onclick = async (): Promise<void> => {
        try {
            const pdfBytes = await readFromPdfResources(templateUrl);
            // Create a PdfDocument instance from the fetched bytes
            const pdf = new PdfDocument(pdfBytes);
            // Reorder pages using pdf.reorderPages with the new order [2, 0, 1]
            pdf.reorderPages([2, 0, 1]);
            // Save and download the document
            pdf.save(outputPdfName);
            // Destroy the document instance.
            pdf.destroy();
        } catch (err) {
            console.error('Rearrange Pages failed:', err);
        }
    };
    viewBtn.element.onclick = async (): Promise<void> => {
        try {
            const pdfBytes = await readFromPdfResources(templateUrl);
            downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'SyncfusionBrochure.pdf');
        } catch (err) {
            console.error('View Template failed:', err);
        }
    };
};
const templateUrl = 'https://cdn.syncfusion.com/content/pdf-resources/syncfusion-brochure.pdf';
const outputPdfName = 'RearrangedPages.pdf';
async function readFromPdfResources(url: string): Promise<Uint8Array> {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
}
function downloadBlob(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}