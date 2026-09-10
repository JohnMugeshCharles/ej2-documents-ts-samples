import { loadCultureFiles } from '../common/culture-loader';
import {
    PdfDocument, PdfPageSettings, PdfMargins, PdfPage, PdfGraphics, PdfBrush, PdfFont, PdfFontFamily, PdfFontStyle, PdfEncryptionType
} from '@syncfusion/ej2-pdf';

(window as any).default = (): void => {
    loadCultureFiles();

    // Set default values for password inputs
    const userPasswordEl = document.getElementById('userPassword') as HTMLInputElement | null;
    const ownerPasswordEl = document.getElementById('ownerPassword') as HTMLInputElement | null;

    if (userPasswordEl) userPasswordEl.value = 'password';
    if (ownerPasswordEl) ownerPasswordEl.value = 'syncfusion';

    // Wire up button click handler
    const encryptBtn = document.getElementById('encryptPdfBtn') as HTMLButtonElement | null;
    if (encryptBtn) {
        encryptBtn.onclick = () => encryptPdf();
    }

    (window as any).encryptPdf = encryptPdf;

    function getSelectedRadio(name: string): string | null {
        const el = document.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement | null;
        return el ? el.value : null;
    }

    async function readFromPdfResources(fileName: string): Promise<Uint8Array> {
        const res = await fetch(fileName);
        if (!res.ok) throw new Error(`Failed to fetch ${fileName}: ${res.status} ${res.statusText}`);
        const buf = await res.arrayBuffer();
        return new Uint8Array(buf);
    }

    async function encryptPdf(): Promise<void> {
        const encryptionType = getSelectedRadio('encryptionType');
        const userPassword = (document.getElementById('userPassword') as HTMLInputElement | null)?.value || 'password';
        const ownerPassword = (document.getElementById('ownerPassword') as HTMLInputElement | null)?.value || 'syncfusion';

        // Create PDF document
        let pdf: PdfDocument = new PdfDocument();
        let settings: PdfPageSettings = new PdfPageSettings({ margins: new PdfMargins(0) });
        let page: PdfPage = pdf.addPage(settings);
        let graphics: PdfGraphics = page.graphics;

        // Set up fonts and brushes
        let black: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
        let font: PdfFont = pdf.embedFont(PdfFontFamily.timesRoman, 14, PdfFontStyle.bold);
        let smallFont: PdfFont = pdf.embedFont(PdfFontFamily.timesRoman, 11, PdfFontStyle.bold);

        // Map encryption type to PdfEncryptionType enum
        let encType: PdfEncryptionType = PdfEncryptionType.aesBit128;

        switch (encryptionType) {
            case "40_RC4":
                encType = PdfEncryptionType.rc4Bit40;
                break;
            case "128_RC4":
                encType = PdfEncryptionType.rc4Bit128;
                break;
            case "128_AES":
                encType = PdfEncryptionType.aesBit128;
                break;
            case "256_AES":
                encType = PdfEncryptionType.aesBit256Rev5;
                break;
            case "256_AES_Revision_6":
                encType = PdfEncryptionType.aesBit256Rev6;
                break;
        }

        // Set security with setSecurity method
        pdf.setSecurity({
            userPassword: userPassword,
            ownerPassword: ownerPassword,
            encryptionType: encType
        });

        // Extract key size and algorithm from encryption type
        let keySize = '';
        let algorithm = '';

        if (encryptionType) {
            // Extract key size: 40, 128, or 256
            const keySizeMatch = encryptionType.match(/(\d+)/);
            keySize = keySizeMatch ? keySizeMatch[1] : '';

            // Extract algorithm: RC4 or AES
            if (encryptionType.includes('RC4')) {
                algorithm = 'RC4';
            } else if (encryptionType.includes('AES')) {
                algorithm = 'AES';
            }
        }

        // Create content text
        let text = "Security options:\n\n" +
            `KeySize: ${keySize}\n\n` +
            `Encryption Algorithm: ${algorithm}\n\n` +
            `Owner Password: ${ownerPassword}\n\n` +
            `Permissions: Print, FullQualityPrint\n\n` +
            `User Password: ${userPassword}`;

        // Draw text on page
        graphics.drawString("Document is Encrypted with following settings", font, { x: 10, y: 20, width: 500, height: 100 }, black);
        graphics.drawString(text, smallFont, { x: 40, y: 80, width: 500, height: 400 }, black);

        // Save and download PDF
        pdf.save('Secure.pdf');
        pdf.destroy();

        showNote('PDF encrypted and downloaded successfully!');
    }

    function ensureNoteHost(): HTMLDivElement {
        let host = document.getElementById('noteMessage') as HTMLDivElement | null;
        if (!host) {
            host = document.createElement('div');
            host.id = 'noteMessage';
            host.style.display = 'none';
            host.style.position = 'fixed';
            host.style.top = '20px';
            host.style.right = '20px';
            host.style.backgroundColor = '#4caf50';
            host.style.color = 'white';
            host.style.padding = '16px';
            host.style.borderRadius = '4px';
            host.style.zIndex = '10000';
            host.style.maxWidth = '300px';
            document.body.appendChild(host);
        }
        return host;
    }

    function showNote(msg: string): void {
        const noteEl = ensureNoteHost();
        noteEl.textContent = msg;
        noteEl.style.display = 'block';
        try {
            setTimeout(() => hideNote(), 5000);
        } catch { }
    }

    function hideNote(): void {
        const noteEl = document.getElementById('noteMessage') as HTMLDivElement | null;
        if (noteEl) noteEl.style.display = 'none';
    }
};
