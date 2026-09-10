import { loadCultureFiles } from '../common/culture-loader';
import { Button } from '@syncfusion/ej2-buttons';
import { NumericTextBox } from '@syncfusion/ej2-inputs';
import { PdfDocument } from '@syncfusion/ej2-pdf';
const DEFAULT_PDF_NAME = 'pdf-succinctly.pdf';
const DEFAULT_PDF_URL = 'https://cdn.syncfusion.com/content/pdf-resources/pdf-succinctly.pdf';
(window as any).default = (): void => {
    loadCultureFiles();
    const splitBtnSf = new Button({}, '#splitBtn');
    async function splitPdf(): Promise<void> {
        try {
            const bytes = await getInputPdfBytes();
            // Create the source document
            const pdf = new PdfDocument(bytes);
            // Hook into split event to download parts as they’re created
            (pdf as any).splitEvent = (_sender: unknown, args: { index: number; pdfData: Uint8Array }) => {
                const part = new PdfDocument(args.pdfData);
                // index is zero-based; add 1 for human-friendly naming
                part.save(`SplittedDoc_${args.index + 1}.pdf`);
                part.destroy();
            };
            const total = pdf.pageCount || 0;
            if (total <= 0) {
                pdf.destroy();
                alert('The input PDF has no pages.');
                return;
            }
            const fixedRangeRadio = document.getElementById('fixedRange') as HTMLInputElement | null;
            const fileCountRadio = document.getElementById('fileCount') as HTMLInputElement | null;
            const pageCountRadio = document.getElementById('pageCount') as HTMLInputElement | null;
            if (fixedRangeRadio?.checked) {
                const controlInt = (id: string, fallback = '1') => {
                    const el = document.getElementById(id) as HTMLElement | null;
                    if (!el) return parseInt(fallback, 10);
                    const inst = (el as any).ej2_instances && (el as any).ej2_instances[0];
                    const val = inst && typeof inst.value !== 'undefined' ? String(inst.value) : ((el as HTMLInputElement).value || fallback);
                    return parseInt(val, 10);
                };
                const from = controlInt('fromPage', '1');
                const to = controlInt('toPage', '1');
                if (isNaN(from) || isNaN(to) || from < 1 || to < from || to > total) {
                    alert(`Please enter a valid page range between 1 and ${total}.`);
                    pdf.destroy();
                    return;
                }
                const startIndex = from - 1;
                const endIndex = to - 1;
                // Split by the specific inclusive page range
                (pdf as any).splitByPageRanges([[startIndex, endIndex]]);
            } else if (fileCountRadio?.checked) {
                const n = Math.max(1, ((): number => {
                    const el = document.getElementById('fileCountInput') as HTMLElement | null;
                    if (!el) return 2;
                    const inst = (el as any).ej2_instances && (el as any).ej2_instances[0];
                    const val = inst && typeof inst.value !== 'undefined' ? String(inst.value) : ((el as HTMLInputElement).value || '2');
                    return parseInt(val, 10) || 2;
                })());
                const ranges = buildRangesForFileCount(total, n);
                (pdf as any).splitByPageRanges(ranges);
            } else if (pageCountRadio?.checked) {
                // Split by the fixed number
                const per = Math.max(1, ((): number => {
                    const el = document.getElementById('pagesPerFileInput') as HTMLElement | null;
                    if (!el) return 1;
                    const inst = (el as any).ej2_instances && (el as any).ej2_instances[0];
                    const val = inst && typeof inst.value !== 'undefined' ? String(inst.value) : ((el as HTMLInputElement).value || '1');
                    return parseInt(val, 10) || 1;
                })());
                (pdf as any).splitByFixedNumber(per);
            }
            pdf.destroy();
        } catch (err: any) {
            console.error(err);
            alert(err?.message || 'Failed to split PDF.');
        }
    }
    const fileInput = document.getElementById('fileUpload') as HTMLInputElement | null;
    const fileNameSpan = document.getElementById('fileName') as HTMLSpanElement | null;
    const fixedRangeRadio = document.getElementById('fixedRange') as HTMLInputElement | null;
    const fileCountRadio = document.getElementById('fileCount') as HTMLInputElement | null;
    const pageCountRadio = document.getElementById('pageCount') as HTMLInputElement | null;
    const rangeSection = document.getElementById('rangeSection') as HTMLDivElement | null;
    const fileCountSection = document.getElementById('fileCountSection') as HTMLDivElement | null;
    const pageCountSection = document.getElementById('pageCountSection') as HTMLDivElement | null;
    if (fileNameSpan) fileNameSpan.textContent = DEFAULT_PDF_NAME;
    if (fileInput && fileNameSpan) {
        fileInput.addEventListener('change', () => {
            fileNameSpan.textContent = fileInput.files?.[0]?.name || DEFAULT_PDF_NAME;
        });
    }
    const elFrom = document.getElementById('fromPage') as HTMLInputElement | null;
    const elTo = document.getElementById('toPage') as HTMLInputElement | null;
    const elFileCount = document.getElementById('fileCountInput') as HTMLInputElement | null;
    const elPagesPer = document.getElementById('pagesPerFileInput') as HTMLInputElement | null;
    new NumericTextBox({ min: 1, value: elFrom ? parseInt(elFrom.value || '1', 10) : 1, format: 'n0', width: '120px', showSpinButton: true }, '#fromPage');
    new NumericTextBox({ min: 1, value: elTo ? parseInt(elTo.value || '1', 10) : 1, format: 'n0', width: '120px', showSpinButton: true }, '#toPage');
    new NumericTextBox({ min: 1, value: elFileCount ? parseInt(elFileCount.value || '2', 10) : 2, format: 'n0', width: '120px', showSpinButton: true }, '#fileCountInput');
    new NumericTextBox({ min: 1, value: elPagesPer ? parseInt(elPagesPer.value || '1', 10) : 1, format: 'n0', width: '120px', showSpinButton: true }, '#pagesPerFileInput');
    function updateVisibility(): void {
        const selected = (document.querySelector('input[name="splitOption"]:checked') as HTMLInputElement | null)?.value;
        if (rangeSection) rangeSection.style.display = selected === 'fixed' ? 'block' : 'none';
        if (fileCountSection) fileCountSection.style.display = selected === 'fileCount' ? 'block' : 'none';
        if (pageCountSection) pageCountSection.style.display = selected === 'pageCount' ? 'block' : 'none';
    }
    fixedRangeRadio?.addEventListener('change', updateVisibility);
    fileCountRadio?.addEventListener('change', updateVisibility);
    pageCountRadio?.addEventListener('change', updateVisibility);
    updateVisibility();
    splitBtnSf.element.onclick = splitPdf;
    async function getInputPdfBytes(): Promise<Uint8Array> {
        const fileInput = document.getElementById('fileUpload') as HTMLInputElement | null;
        const chosen = fileInput?.files?.[0];
        if (chosen) {
            const buf = await chosen.arrayBuffer();
            return new Uint8Array(buf);
        }
        const res = await fetch(DEFAULT_PDF_URL, { cache: 'no-cache' });
        if (!res.ok) throw new Error(`Failed to fetch default PDF: ${res.status} ${res.statusText}`);
        const buf = await res.arrayBuffer();
        return new Uint8Array(buf);
    }
    function buildRangesForFileCount(totalPages: number, numberOfFiles: number): Array<[number, number]> {
        const ranges: Array<[number, number]> = [];
        const per = Math.ceil(totalPages / Math.max(1, numberOfFiles));
        let start = 0;
        while (start < totalPages) {
            const end = Math.min(start + per - 1, totalPages - 1);
            ranges.push([start, end]);
            start = end + 1;
        }
        return ranges;
    }
};