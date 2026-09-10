import { loadCultureFiles } from '../common/culture-loader';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument, PdfPageImportOptions } from '@syncfusion/ej2-pdf';
(window as any).default = (): void => {
    loadCultureFiles();
    const mergeBtn = new Button();
    mergeBtn.appendTo('#mergebtn');
    mergeBtn.element.onclick = async (): Promise<void> => {
        try {
            const pdfBytes = await fetchAsUint8Array(templateUrl);
            // Create two PdfDocument instances (doc1 and doc2) from the same source bytes
            const doc1 = new PdfDocument(pdfBytes);
            const doc2 = new PdfDocument(pdfBytes);
            //Import all pages from doc2 into doc1 using importPageRange
            doc1.importPageRange(doc2, 0, doc2.pageCount - 1);
            //Save and download the document
            doc1.save(outputPdfName);
            // Destroy the document instance
            doc1.destroy();
            doc2.destroy();
        } catch (err) {
            console.error('Merge PDFs failed:', err);
        }
    };
};
const templateUrl = 'https://cdn.syncfusion.com/content/pdf-resources/pdf-succinctly.pdf';
const outputPdfName = 'MergedPDF.pdf';
async function fetchAsUint8Array(url: string): Promise<Uint8Array> {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
}