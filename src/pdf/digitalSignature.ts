import { loadCultureFiles } from '../common/culture-loader';
import { Button } from '@syncfusion/ej2-buttons';
import { TextBox } from '@syncfusion/ej2-inputs';
import {PdfDocument, PdfSignatureField, PdfSignature, CryptographicStandard, DigestAlgorithm, PdfBitmap} from '@syncfusion/ej2-pdf';
(window as any).default = (): void => {
    loadCultureFiles();
    const createBtn = new Button();
    createBtn.appendTo('#createSignBtn');
    const signBtn = new Button({}, '#signExistingBtn');
    createBtn.element.onclick = () => createAndSignPdf();
    signBtn.element.onclick = () => signExistingPdf();
    // Initialize EJ2 TextBox components for inputs using demo-like features
    new TextBox({ cssClass: 'e-filled', placeholder: 'Password', type: 'password', width: '300px', showClearButton: false }, '#certPassword');
    new TextBox({ cssClass: 'e-filled', placeholder: 'Reason', width: '300px', showClearButton: true }, '#reason');
    new TextBox({ cssClass: 'e-filled', placeholder: 'Contact', width: '300px', showClearButton: true }, '#contact');
    new TextBox({ cssClass: 'e-filled', placeholder: 'Location', width: '300px', showClearButton: true }, '#location');
    const srcInput = document.getElementById('sourceFile') as HTMLInputElement | null;
    const certInput = document.getElementById('certFile') as HTMLInputElement | null;
    const srcNameSpan = document.getElementById('sourceFileName') as HTMLElement | null;
    const certNameSpan = document.getElementById('certFileName') as HTMLElement | null;
    if (srcInput && srcNameSpan) {
        srcInput.addEventListener('change', () => {
            const f = srcInput.files && srcInput.files[0];
            srcNameSpan.textContent = f ? f.name : 'No file chosen';
        });
    }
    if (certInput && certNameSpan) {
        certInput.addEventListener('change', () => {
            const f = certInput.files && certInput.files[0];
            certNameSpan.textContent = f ? f.name : 'No file chosen';
        });
    }
    (window as any).createAndSignPdf = createAndSignPdf;
    (window as any).signExistingPdf = signExistingPdf;
    function signPdf(
        pdfBytes: Uint8Array,
        options: {
            bounds?: { x?: number; y?: number; width?: number; height?: number };
            fieldName?: string;
            crypto?: string | null;
            digest?: string | null;
            pfxData: Uint8Array;
            password: string;
            contact?: string;
            location?: string;
            reason?: string;
            logoBytes?: Uint8Array;
            logoRect?: { x?: number; y?: number; width?: number; height?: number };
            outputName: string;
            author?: boolean;
        }
    ): void {
        // Load the PDF
        const pdf = new PdfDocument(pdfBytes);
        // First page
        const page = pdf.getPage(0);
        // Bounds for signature field
        const b = options.bounds ?? {};
        const sigX = typeof b.x === 'number' ? b.x : 20;
        const sigY = typeof b.y === 'number' ? b.y : 20;
        const sigW = typeof b.width === 'number' ? b.width : 200;
        const sigH = typeof b.height === 'number' ? b.height : 100;
        // Create signature field on the page
        const signatureField = new PdfSignatureField(page, options.fieldName || 'Signature', {
            x: sigX, y: sigY, width: sigW, height: sigH
        });
        // Build signature options
        var sigOptions = {
            cryptographicStandard: mapCryptoStandard(options.crypto ?? 'CMS'),
            digestAlgorithm: mapDigestAlgorithm(options.digest ?? 'SHA256'),
            contactInfo: options.contact || '',
            locationInfo: options.location || '',
            reason: options.reason || ''
        };
        if (options.author === true) {
            (sigOptions as any).certify = true;
        }
        // Create the signature from PFX
        const signature = PdfSignature.create(options.pfxData, options.password, sigOptions);
        // Assign the signature to the field
        signatureField.setSignature(signature);
        // Add field to form
        pdf.form.add(signatureField);
        // Optional: draw a logo in appearance
        if (options.logoBytes) {
            const app = signatureField.getAppearance();
            const lr = options.logoRect ?? {};
            const lx = typeof lr.x === 'number' ? lr.x : 20;
            const ly = typeof lr.y === 'number' ? lr.y : 20;
            const lw = typeof lr.width === 'number' ? lr.width : 120;
            const lh = typeof lr.height === 'number' ? lr.height : 50;
            const logoBmp = new PdfBitmap(options.logoBytes);
            app.normal.graphics.drawImage(logoBmp, { x: lx, y: ly, width: lw, height: lh });
        }
        // Save and download
        pdf.save(options.outputName);
        pdf.destroy();
    }
    function getSelectedRadio(name: string): string | null {
        const el = document.querySelector(`input[name="${name}"]:checked`) as HTMLInputElement | null;
        return el ? el.value : null;
    }
    function mapCryptoStandard(val: string | null): CryptographicStandard {
        return val === 'CAdES' ? CryptographicStandard.cades : CryptographicStandard.cms;
    }
    function mapDigestAlgorithm(val: string | null): DigestAlgorithm {
        switch (val) {
            case 'SHA1': return DigestAlgorithm.sha1;
            case 'SHA384': return DigestAlgorithm.sha384;
            case 'SHA512': return DigestAlgorithm.sha512;
            case 'RIPEMD160': return DigestAlgorithm.ripemd160;
            default: return DigestAlgorithm.sha256;
        }
    }
    async function readFromPdfResources(fileName: string): Promise<Uint8Array> {
        const res = await fetch(fileName);
        if (!res.ok) throw new Error(`Failed to fetch ${fileName}: ${res.status} ${res.statusText}`);
        const buf = await res.arrayBuffer();
        return new Uint8Array(buf);
    }
    async function createAndSignPdf(): Promise<void> {
        const crypto = getSelectedRadio('cryptoStandard');
        const digest = getSelectedRadio('digestAlgo');
        const sigType = getSelectedRadio('signatureType');
        const [pdfBytes, pfxBytes, logoBytes] = await Promise.all([
            readFromPdfResources('https://cdn.syncfusion.com/content/pdf-resources/pdf-succinctly.pdf'),
            readFromPdfResources('https://cdn.syncfusion.com/content/pdf-resources/PDF.pfx'),
            readFromPdfResources('https://cdn.syncfusion.com/content/pdf-resources/logo.png')
        ]);
        signPdf(pdfBytes, {
            crypto,
            digest,
            pfxData: pfxBytes,
            password: 'password123',
            contact: 'johndoe@owned.us',
            location: 'Honolulu, Hawaii',
            reason: sigType === 'Author' ? 'I am author of this document.' : 'Approved.',
            logoBytes,
            outputName: 'SignedPDF.pdf',
            author: sigType === 'Author'
        });
    }
    function ensureNoteHost(): HTMLDivElement {
        let host = document.getElementById('noteMessage') as HTMLDivElement | null;
        if (!host) {
            host = document.createElement('div');
            host.id = 'noteMessage';
            host.style.display = 'none';
            host.style.color = '#b00020';
            host.style.fontWeight = '600';
            host.style.margin = '8px 0';
            host.setAttribute('role', 'alert');
            host.setAttribute('aria-live', 'assertive');
            const controlSection = document.querySelector('.control-section') as HTMLElement | null || document.body;
            controlSection.insertBefore(host, controlSection.firstChild);
        }
        return host;
    }
    function showNote(msg: string) {
        const noteEl = ensureNoteHost();
        noteEl.textContent = msg;
        noteEl.style.display = 'block';
        try { noteEl.scrollIntoView({ behavior: 'smooth', block: 'center' }); } catch { }
    }
    function hideNote() {
        const noteEl = document.getElementById('noteMessage') as HTMLDivElement | null;
        if (noteEl) noteEl.style.display = 'none';
    }
    async function signExistingPdf(): Promise<void> {
        const crypto = getSelectedRadio('cryptoStandard');
        const digest = getSelectedRadio('digestAlgo');
        const sourceInput = document.getElementById('sourceFile') as HTMLInputElement | null;
        const certInput = document.getElementById('certFile') as HTMLInputElement | null;
        const passwordEl = document.getElementById('certPassword') as HTMLInputElement | null;
        const reasonEl = document.getElementById('reason') as HTMLInputElement | null;
        const contactEl = document.getElementById('contact') as HTMLInputElement | null;
        const locationEl = document.getElementById('location') as HTMLInputElement | null;
        const password = (passwordEl?.value || '').trim();
        const reason = (reasonEl?.value || '').trim();
        const contact = (contactEl?.value || '').trim();
        const location = (locationEl?.value || '').trim();
        const hasSource = !!sourceInput?.files?.length;
        const hasCert = !!certInput?.files?.length;
        const allOk = hasSource && hasCert && password && reason && contact && location;
        if (!allOk) {
            showNote('NOTE: Fill all fields and then create PDF');
            return;
        }
        hideNote();
        const sourceFile = sourceInput!.files![0];
        const certFile = certInput!.files![0];
        try {
            const [srcBuf, pfxBuf, logoBytes] = await Promise.all([
                sourceFile.arrayBuffer(),
                certFile.arrayBuffer(),
                readFromPdfResources('https://cdn.syncfusion.com/content/pdf-resources/logo.png')
            ]);
            const pdfBytes = srcBuf instanceof Uint8Array ? srcBuf : new Uint8Array(srcBuf);
            const pfxBytes = pfxBuf instanceof Uint8Array ? pfxBuf : new Uint8Array(pfxBuf);
            signPdf(pdfBytes, {
                crypto,
                digest,
                pfxData: pfxBytes,
                password,
                contact,
                location,
                reason,
                logoBytes,
                outputName: 'SignedPDF.pdf'
            });
        } catch (err: any) {
            showNote(err?.message || 'Error while signing existing PDF.');
        }
    }
};
