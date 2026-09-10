import { loadCultureFiles } from '../common/culture-loader';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument, PdfSignatureField, RevocationType } from "@syncfusion/ej2-pdf";

// Load certificate data from file path
async function loadCertificateData(certPath: string): Promise<Uint8Array> {
    try {
        const response = await fetch(certPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        return new Uint8Array(arrayBuffer);
    } catch (error) {
        throw new Error(`Failed to load certificate: ${certPath} - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Load PDF document from file path
async function loadPdfDocument(pdfPath: string): Promise<PdfDocument> {
    try {
        const response = await fetch(pdfPath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        return new PdfDocument(uint8Array);
    } catch (error) {
        throw new Error(`Failed to load PDF: ${pdfPath} - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

// Export default function following the pattern from header-and-footer.ts
(window as any).default = (): void => {
    loadCultureFiles();

    // Initialize the button
    let button: Button = new Button();
    button.appendTo('#validateBtn');

    // Button click handler
    button.element.onclick = async (): Promise<void> => {
        // Main validation function
        async function validateSignature(): Promise<void> {
            const resultTextArea = document.getElementById('resultTextArea') as HTMLTextAreaElement;
            const errorDiv = document.getElementById('errorMsg') as HTMLElement;
            const validateBtn = document.getElementById('validateBtn') as HTMLButtonElement;
            // Clear previous results
            resultTextArea.value = '';
            errorDiv.textContent = '';
            validateBtn.disabled = true;

            // Load the signed PDF document
            const loaded = await loadPdfDocument('https://document.syncfusion.com/content/pdf-resources/digital-signature.pdf');

            // Retrieve the first signature field
            const signature = loaded.form.fieldAt(0) as PdfSignatureField;

            // Load trusted certificates (Root, Intermediate0, Intermediate1)
            const rootBytes = await loadCertificateData('https://document.syncfusion.com/content/pdf-resources/Root.cer');
            const int0Bytes = await loadCertificateData('https://document.syncfusion.com/content/pdf-resources/Intermediate0.cer');
            const int1Bytes = await loadCertificateData('https://document.syncfusion.com/content/pdf-resources/Intermediate1.cer');

            // Validate the signature using the trusted certificate collection
            const result = signature.validateSignature({
                trustedCertificates: [rootBytes, int0Bytes, int1Bytes],
                revocationValidationType: RevocationType.ocspAndCrl
            });
            // Enum-to-string maps (matching .NET output labels)
            const statusNames: Record<number, string> = { 0: 'Invalid', 1: 'Valid', 2: 'Unknown' };
            const digestNames: Record<number, string> = { 0: 'SHA1', 1: 'SHA256', 2: 'SHA384', 3: 'SHA512', 4: 'RIPEMD160' };
            const revocNames: Record<number, string> = { 0: 'None', 1: 'Good', 2: 'Unknown', 3: 'Revoked' };

            // Format date as .NET default: M/d/yyyy h:mm:ss tt (e.g. "2/3/2021 12:34:41 PM")
            // Uses UTC getters so output matches the stored UTC value regardless of local timezone
            const formatDate = (d: Date): string => {
                if (!d || !(d instanceof Date) || isNaN(d.getTime())) { return 'undefined'; }
                const month: number = d.getUTCMonth() + 1;
                const day: number = d.getUTCDate();
                const year: number = d.getUTCFullYear();
                let hours: number = d.getUTCHours();
                const minutes: string =
                    d.getUTCMinutes() < 10 ? '0' + d.getUTCMinutes() : d.getUTCMinutes().toString();

                const seconds: string =
                    d.getUTCSeconds() < 10 ? '0' + d.getUTCSeconds() : d.getUTCSeconds().toString();
                const ampm: string = hours >= 12 ? 'PM' : 'AM';
                hours = hours % 12 || 12;
                return `${month}/${day}/${year} ${hours}:${minutes}:${seconds} ${ampm}`;
            };

            // Build output matching .NET StringBuilder pattern
            let output: string = '';
            output += `Signature is ${statusNames[result.signatureStatus] ?? result.signatureStatus}\n`;
            output += '----------Validation Summary----------\n';
            if (result.isDocumentModified) {
                output += 'The document has been altered or corrupted since the signature was applied.\n';
            } else {
                output += 'The document has not been modified since the signature was applied.\n';
            }

            // Signature certificate details — use the leaf signer cert from signerCertificates
            const leafCert = result.signerCertificates && result.signerCertificates.length > 0
                ? result.signerCertificates[0].certificate : null;
            if (leafCert) {
                output += `Digitally signed by ${leafCert.issuerSimpleName}\n`;
                output += `Valid From : ${formatDate(leafCert.validFrom)}\n`;
                output += `Valid To : ${formatDate(leafCert.validTo)}\n`;
            }
            output += `Signature Algorithm : ${result.signatureAlgorithm}\n`;
            output += `Hash Algorithm : ${digestNames[result.digestAlgorithm] ?? result.digestAlgorithm}\n`;

            // Revocation details
            const ocspStatus = result.revocationResult ? result.revocationResult.ocspRevocationStatus : 0;
            output += `OCSP revocation status : ${revocNames[ocspStatus] ?? ocspStatus}\n`;
            output += '\n--------Revocation Information---------\n\n';

            // Iterate signerCertificates for OCSP/CRL details
            if (result.signerCertificates) {
                for (const signerCertificate of result.signerCertificates) {
                    if (signerCertificate.ocspCertificate) {
                        output += '------------OCSP Certificate-------------\n\n';
                        for (const item of signerCertificate.ocspCertificate.certificates) {
                            output += `The OCSP Response was signed by ${item.subject}\n`;
                        }
                        output += `Is Embedded: ${signerCertificate.ocspCertificate.isEmbedded}\n`;
                        output += `ValidFrom: ${formatDate(signerCertificate.ocspCertificate.validFrom)}\n`;
                        output += `ValidTo: ${formatDate(signerCertificate.ocspCertificate.validTo)}\n\n`;
                        continue;
                    }
                    if (signerCertificate.crlCertificate) {
                        output += '------------CRL Certificate--------------\n\n';
                        for (const item of signerCertificate.crlCertificate.certificates) {
                            output += `The CRL was signed by ${item.subject}\n`;
                        }
                        output += `Is Embedded: ${signerCertificate.crlCertificate.isEmbedded}\n`;
                        output += `ValidFrom: ${formatDate(signerCertificate.crlCertificate.validFrom)}\n`;
                        output += `ValidTo: ${formatDate(signerCertificate.crlCertificate.validTo)}\n`;
                        break;
                    }
                }
            }

            // Display results in textarea
            resultTextArea.value = output;
        }

        // Call the validation function
        await validateSignature();
    };
};