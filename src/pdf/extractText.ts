import { loadCultureFiles } from '../common/culture-loader';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument } from '@syncfusion/ej2-pdf';
import { PdfDataExtractor } from '@syncfusion/ej2-pdf-data-extract';
(window as any).default = (): void => {
    loadCultureFiles();
    const viewBtn = new Button();
    viewBtn.appendTo('#viewtemplatebtn');
    const extractBtn = new Button();
    extractBtn.appendTo('#normalbtn');
    extractBtn.element.onclick = async (): Promise<void> => {
        try {
            // Fetch the sample PDF bytes from the remote URL
            const pdfBytes = await readFromPdfResources(templateURL);
            // Create a PdfDocument instance from the fetched bytes
            const pdf = new PdfDocument(pdfBytes);
            // Create a PdfDataExtractor bound to the PdfDocument
            const extractor = new PdfDataExtractor(pdf);
            // Extract text across the full page range:
            const text: string = extractor.extractTextSync({
                startPageIndex: 0,
                endPageIndex: pdf.pageCount - 1
            });
            // Destroy the document instance
            pdf.destroy();
            downloadBlob(new Blob([text], { type: 'text/plain' }), 'Sample.txt');
        } catch (err) {
            console.error('Extract Text failed:', err);
        }
    };
    viewBtn.element.onclick = async (): Promise<void> => {
        try {
            const pdfBytes = await readFromPdfResources(templateURL);
            downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'PDF_Succinctly.pdf');
        } catch (err) {
            console.error('View Template failed:', err);
        }
    };
};
const templateURL = 'https://cdn.syncfusion.com/content/pdf-resources/pdf-succinctly.pdf'
async function readFromPdfResources(url: string): Promise<Uint8Array> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`Failed to fetch PDF: ${res.status} ${res.statusText}`);
    }
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