import { loadCultureFiles } from '../common/culture-loader';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument } from '@syncfusion/ej2-pdf';
import { PdfRedactor, PdfRedactionRegion } from '@syncfusion/ej2-pdf-data-extract';
(window as any).default = (): void => {
    loadCultureFiles();
    const viewBtn = new Button({}, '#viewtemplatebtn');
    const topRedactBtn = new Button({}, '#topRedactBtn');
    const uploadRedactBtn = new Button({}, '#uploadRedactBtn');
    async function redactPdf(
        pdfBytes: Uint8Array,
        rect: { x: number; y: number; width: number; height: number }
            | Array<{ x: number; y: number; width: number; height: number }>): Promise<void> {
        const bytes = pdfBytes instanceof Uint8Array ? pdfBytes : new Uint8Array(pdfBytes);
        // Create a new PDF document
        const pdf = new PdfDocument(bytes);
        const rects = Array.isArray(rect) ? rect : [rect];
        // Create redactor from the document
        const redactor = new PdfRedactor(pdf);
        // Build regions for page index 0
        const regions: PdfRedactionRegion[] = rects.map((r) => {
            const region = new PdfRedactionRegion(0, { x: r.x, y: r.y, width: r.width, height: r.height });
            // Black fill for redaction
            region.fillColor = { r: 0, g: 0, b: 0 };
            return region;
        });
        // Add redactor region
        redactor.add(regions);
        // Apply redaction
        redactor.redactSync();
        // Save the PDF
        pdf.save('Redaction.pdf');
        // Destory the document
        pdf.destroy();
    }
    const redactPdfFromUpload = () => {
        const fileInput = document.getElementById('pdfFile') as HTMLInputElement | null;
        const fileNameSpan = document.getElementById('pdfFileName') as HTMLElement | null;
        const msgSpan = document.getElementById('fileMessage') as HTMLSpanElement | null;
        // update filename display when invoked from button too
        if (fileNameSpan) {
            const f = fileInput?.files?.[0];
            fileNameSpan.textContent = f ? f.name : 'No file chosen';
        }
        if (msgSpan) msgSpan.style.display = 'none';
        const chosenFile = fileInput?.files?.[0];
        if (!chosenFile) {
            if (msgSpan) {
                msgSpan.textContent = 'Choose PDF document to redact';
                msgSpan.style.display = 'inline';
            }
            return;
        }
        const xEl = document.getElementById('x') as HTMLInputElement | null;
        const yEl = document.getElementById('y') as HTMLInputElement | null;
        const wEl = document.getElementById('width') as HTMLInputElement | null;
        const hEl = document.getElementById('height') as HTMLInputElement | null;
        const x = parseFloat(xEl?.value ?? '');
        const y = parseFloat(yEl?.value ?? '');
        const w = parseFloat(wEl?.value ?? '');
        const h = parseFloat(hEl?.value ?? '');
        if ([x, y, w, h].some((v) => isNaN(v))) {
            alert('Please enter valid numeric values for X, Y, Width, and Height.');
            return;
        }
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const buffer = e.target?.result as ArrayBuffer;
                const bytes = new Uint8Array(buffer);
                await redactPdf(bytes, { x, y, width: w, height: h });
            } catch (err) {
                console.error(err);
                alert('Failed to redact the uploaded PDF.');
            }
        };
        reader.readAsArrayBuffer(chosenFile);
    };
    const viewTemplate = async () => {
        try {
            const pdfData = await fetchAsUint8Array(input1);
            downloadPdf(pdfData, 'RedactionTemplate.pdf');
        } catch (err) {
            console.error(err);
            alert('Failed to load the template PDF. Check the file path and server setup.');
        }
    };
    const redactPdfFromResource = async () => {
        const rects = [
            { x: 70, y: 120, width: 200, height: 80 },
            { x: 400, y: 150, width: 100, height: 30 }
        ];
        try {
            const pdfData = await fetchAsUint8Array(input1);
            await redactPdf(pdfData, rects);
        } catch (err) {
            console.error(err);
            alert('Failed to redact the resource PDF. Check the file path and server setup.');
        }
    };
    viewBtn.element.onclick = viewTemplate;
    topRedactBtn.element.onclick = redactPdfFromResource;
    uploadRedactBtn.element.onclick = redactPdfFromUpload;
    // update filename inline when user picks a file via file input
    const pdfFileInput = document.getElementById('pdfFile') as HTMLInputElement | null;
    const pdfFileNameEl = document.getElementById('pdfFileName') as HTMLElement | null;
    if (pdfFileInput && pdfFileNameEl) {
        pdfFileInput.addEventListener('change', () => {
            const f = pdfFileInput.files && pdfFileInput.files[0];
            pdfFileNameEl.textContent = f ? f.name : 'No file chosen';
        });
    }
    (window as any).viewTemplate = viewTemplate;
    (window as any).redactPdfFromResource = redactPdfFromResource;
    (window as any).redactPdfFromUpload = redactPdfFromUpload;
    function downloadPdf(bytes: Uint8Array, fileName: string): void {
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    }
};
const input1 = 'https://cdn.syncfusion.com/content/pdf-resources/credit_card_statement.pdf';
async function fetchAsUint8Array(url: string): Promise<Uint8Array> {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
}