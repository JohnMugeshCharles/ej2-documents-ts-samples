import { PdfDataExtractor, TextSearchResult } from '@syncfusion/ej2-pdf-data-extract';
import { loadCultureFiles } from '../common/culture-loader';
import { PdfDocument } from '@syncfusion/ej2-pdf';
import { Button } from '@syncfusion/ej2-buttons';

interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

interface OccurrenceInfo {
    pageNumber: number;
    x: number;
    y: number;
    width: number;
    height: number;
}

(window as any).default = (): void => {
    loadCultureFiles();

    const DEFAULT_PDF_URL = 'https://cdn.syncfusion.com/content/pdf-resources/pdf-succinctly.pdf';
    const DEFAULT_FILENAME = 'PDF Succinctly.pdf';

    let selectedFile: File | null = null;
    let currentPdfUrl: string = DEFAULT_PDF_URL;

    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    const searchTextInput = document.getElementById('searchText') as HTMLInputElement;
    const resultTextarea = document.getElementById('resultTextarea') as HTMLTextAreaElement;
    const errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
    const successMessage = document.getElementById('successMessage') as HTMLDivElement;
    const filenameDisplay = document.getElementById('filenameDisplay') as HTMLSpanElement;
    const matchCaseCheckbox = document.getElementById('matchCaseCheckbox') as HTMLInputElement;
    const wholeWordCheckbox = document.getElementById('wholeWordCheckbox') as HTMLInputElement;

    const findTextButton: Button = new Button();
    findTextButton.appendTo('#findBtn');

    // File input change handler
    fileInput.addEventListener('change', (): void => {
        const file = fileInput.files?.[0];
        if (file) {
            selectedFile = file;
            filenameDisplay.textContent = file.name;
            clearMessages();
        }
    });

    // Find text button click handler
    findTextButton.element.onclick = async (): Promise<void> => {
        const searchText = searchTextInput.value.trim();

        if (!searchText) {
            showError('Please enter text to search.');
            return;
        }

        clearMessages();
        resultTextarea.value = '';
        // Determine which PDF to use
        let pdfBytes: Uint8Array;
        if (selectedFile) {
            pdfBytes = await readFileAsBytes(selectedFile);
        } else {
            pdfBytes = await readFromPdfResources(currentPdfUrl);
        }

        // Create PDF document instance
        const pdf = new PdfDocument(pdfBytes);

        // Use PdfDataExtractor to find text with options
        const extractor = new PdfDataExtractor(pdf);
        const options = {
            caseSensitive: matchCaseCheckbox.checked,
            wholeWord: wholeWordCheckbox.checked
        };
        const results: TextSearchResult = extractor.findTextSync(searchText, options);

        const occurrences: OccurrenceInfo[] = [];
        let totalMatches = 0;

        // Collect all occurrences with coordinates
        results.searchResults.forEach((boundsCollection: Rectangle[], pageNumber: number): void => {
            boundsCollection.forEach((rectangle: Rectangle): void => {
                occurrences.push({
                    pageNumber: pageNumber,
                    x: rectangle.x,
                    y: rectangle.y,
                    width: rectangle.width,
                    height: rectangle.height
                });
                totalMatches++;
            });
        });

        pdf.destroy();

        // Display results
        if (totalMatches > 0) {
            let resultText = `The text "${searchText}" appears ${totalMatches} times in this document\n`;

            occurrences.forEach((occurrence: OccurrenceInfo, index: number): void => {
                resultText += `Occurrence ${index + 1} is on page ${occurrence.pageNumber} with the following coordinates: `;
                resultText += `X:${occurrence.x}; Y:${occurrence.y}; Width:${occurrence.width}; Height:${occurrence.height}\n`;
            });

            resultTextarea.value = resultText;
            showSuccess(`Search complete. Found ${totalMatches} match(es).`);
        } else {
            resultTextarea.value = `No matches found for "${searchText}" in the PDF.`;
            showError('Search complete. No matches found.');
        }
    };

    // Helper function to read file as bytes
    async function readFileAsBytes(file: File): Promise<Uint8Array> {
        return new Promise((resolve, reject): void => {
            const reader = new FileReader();
            reader.onload = (): void => {
                if (reader.result instanceof ArrayBuffer) {
                    resolve(new Uint8Array(reader.result));
                } else {
                    reject(new Error('Failed to read file'));
                }
            };
            reader.onerror = (): void => {
                reject(new Error('File reading error'));
            };
            reader.readAsArrayBuffer(file);
        });
    }

    // Helper function to fetch PDF from URL
    async function readFromPdfResources(url: string): Promise<Uint8Array> {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Failed to fetch PDF: ${res.status} ${res.statusText}`);
        }
        const buf = await res.arrayBuffer();
        return new Uint8Array(buf);
    }

    // Helper function to escape regex special characters
    function escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Helper function to show error message
    function showError(message: string): void {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
        successMessage.style.display = 'none';
    }

    // Helper function to show success message
    function showSuccess(message: string): void {
        successMessage.textContent = message;
        successMessage.style.display = 'block';
        errorMessage.style.display = 'none';
    }

    // Helper function to clear messages
    function clearMessages(): void {
        errorMessage.style.display = 'none';
        successMessage.style.display = 'none';
        errorMessage.textContent = '';
        successMessage.textContent = '';
    }
};
