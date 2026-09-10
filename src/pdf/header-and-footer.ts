import { loadCultureFiles } from '../common/culture-loader';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument, PdfPage, PdfBrush, PdfPen, PdfFontFamily, PdfFontStyle, PdfStandardFont, PdfStringFormat, PdfTextAlignment, PdfVerticalAlignment, PdfPageTemplateElement, PdfPageNumberField, PdfPageCountField, PdfBitmap, PdfCompositeField, PdfLayoutFormat, PdfLayoutType, PdfLayoutBreakType, Rectangle } from '@syncfusion/ej2-pdf';

function getclientBounds(page: PdfPage): Rectangle {
    const result: number[] = page._getActualBounds(page._pageSettings);
    return { x: result[0], y: result[1], width: result[2], height: result[3] };
}

// Helper function to fetch image as Uint8Array
async function fetchImageAsUint8Array(url: string): Promise<Uint8Array> {
    const response = await fetch(url, { cache: 'no-cache' });
    if (!response.ok) {
        throw new Error(`Failed to fetch image from ${url}: ${response.status} ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return new Uint8Array(arrayBuffer);
}

// Helper function to fetch text content from file
async function fetchTextContent(filePath: string): Promise<string> {
    try {
        const response = await fetch(filePath, { cache: 'no-cache' });
        if (response.ok) {
            return await response.text();
        }
    } catch (error) {
        console.warn(`Could not load text from ${filePath}:`, error);
    }
    return '';
}

(window as any).default = (): void => {
    loadCultureFiles();

    let button: Button = new Button();
    button.appendTo('#successbtn');

    button.element.onclick = async (): Promise<void> => {
        const doc = new PdfDocument();
        const page = doc.addPage();
        const pageWidth = getclientBounds(page).width;
        doc.setDocumentInformation({
            title: 'Essential PDF Sample',
            author: 'Syncfusion',
            subject: 'Document information DEMO',
            keywords: 'PDF,ej2',
            creator: 'Essential PDF',
            producer: 'Syncfusion PDF',
            language: 'en-us',
        });
        const header = new PdfPageTemplateElement({ width: pageWidth, height: 50 });
        const titleFont = new PdfStandardFont(PdfFontFamily.helvetica, 16, PdfFontStyle.bold);
        const descFont = new PdfStandardFont(PdfFontFamily.helvetica, 6, PdfFontStyle.bold);
        const center = new PdfStringFormat();
        center.alignment = PdfTextAlignment.center;
        center.lineAlignment = PdfVerticalAlignment.middle;
        const left = new PdfStringFormat();
        left.alignment = PdfTextAlignment.left;
        left.lineAlignment = PdfVerticalAlignment.bottom;
        header.graphics.drawImage(
            new PdfBitmap(await fetchImageAsUint8Array('https://cdn.syncfusion.com/content/pdf-resources/logo.png')),
            { x: pageWidth - 130, y: 5, width: 110, height: 35 }
        );
        header.graphics.drawString(
            'Syncfusion Essential PDF',
            titleFont,
            { x: 0, y: 0, width: pageWidth, height: 50 },
            new PdfBrush({ r: 44, g: 71, b: 120 }),
            center
        );
        header.graphics.drawString(
            'Header and Footer Demo',
            descFont,
            { x: 0, y: 0, width: pageWidth, height: 42 },
            new PdfBrush({ r: 128, g: 128, b: 128 }),
            left
        );
        header.graphics.drawLine(new PdfPen({ r: 0, g: 0, b: 139 }, 0.7), { x: 0, y: 0 }, { x: pageWidth, y: 0 });
        header.graphics.drawLine(new PdfPen({ r: 0, g: 0, b: 139 }, 2), { x: 0, y: 3 }, { x: pageWidth + 3, y: 3 });
        header.graphics.drawLine(new PdfPen({ r: 0, g: 0, b: 139 }, 2), { x: 0, y: 47 }, { x: pageWidth, y: 47 });
        header.graphics.drawLine(new PdfPen({ r: 0, g: 0, b: 139 }, 2), { x: 0, y: 50 }, { x: pageWidth, y: 50 });
        doc.template.top = { template: header };
        const fFont = new PdfStandardFont(PdfFontFamily.helvetica, 6, PdfFontStyle.bold);
        const centerF = new PdfStringFormat();
        centerF.alignment = PdfTextAlignment.center;
        centerF.lineAlignment = PdfVerticalAlignment.middle;
        const footer = new PdfPageTemplateElement({ width: pageWidth, height: 50 });
        footer.graphics.drawString(
            '@Copyright 2015',
            fFont,
            { x: 0, y: 18, width: pageWidth, height: 20 },
            new PdfBrush({ r: 128, g: 128, b: 128 }),
            centerF
        );
        const pageNumber = new PdfPageNumberField(
            { font: fFont }
        );
        const pageCount = new PdfPageCountField(
            { font: fFont }
        );
        const composite: PdfCompositeField = new PdfCompositeField({
            font: fFont,
            brush: new PdfBrush({ r: 128, g: 128, b: 128 }),
            pattern: 'Page {0} of {1}',
            automaticFields: [pageNumber, pageCount]
        });
        doc.template.bottom = { template: footer };
        const actual = page._getActualBounds(page._pageSettings);
        const contentHeight = actual[3];
        const gap = 20;
        const columnWidth = (pageWidth - gap) / 2;
        const textFormat = new PdfStringFormat();
        textFormat.alignment = PdfTextAlignment.justify;
        let x = 0;
        let y = 20;
        const switchColumn = (): void => {
            if (x === 0) {
                x = columnWidth + gap;
                y = 20;
            }
        }
        const font = new PdfStandardFont(PdfFontFamily.helvetica, 11.5);
        const headingFont = new PdfStandardFont(PdfFontFamily.courier, 14, PdfFontStyle.bold);
        const ensureSpace = (height: number): void => {
            if (y + height > contentHeight) {
                switchColumn();
            }
        }
        const leftText = await fetchTextContent('https://document.syncfusion.com/content/pdf-resources/Essential-studio.txt');
        // Create layout format
        const layout = new PdfLayoutFormat();
        layout.break = PdfLayoutBreakType.fitPage;
        layout.layout = PdfLayoutType.onePage;
        const resStart = page.drawTextElement(
            { text: leftText, font, brush: new PdfBrush({ r: 0, g: 0, b: 0 }), stringFormat: textFormat, layoutFormat: layout },
            { x, y, width: columnWidth, height: contentHeight }
        );
        y = resStart.bounds.y + resStart.bounds.height + 10;
        if (y >= contentHeight) switchColumn();

        // Helper function to draw a section with title, text, and image
        const drawSection = async (title: string, textFile: string, imageFile: string): Promise<void> => {
            const titleH = 20;
            const imgH = 100;
            const spacing = 10;
            ensureSpace(titleH);
            page.graphics.drawString(
                title,
                headingFont,
                { x, y, width: columnWidth, height: titleH },
                new PdfBrush({ r: 0, g: 0, b: 139 })
            );
            y += titleH + spacing;
            const txt = await fetchTextContent(textFile);
            if (txt) {
                const res = page.drawTextElement(
                    { text: txt, font, brush: new PdfBrush({ r: 0, g: 0, b: 0 }), stringFormat: textFormat, layoutFormat: layout },
                    { x, y, width: columnWidth, height: contentHeight - y }
                );
                y = res.bounds.y + res.bounds.height + spacing;
            }
            ensureSpace(imgH);
            try {
                const imageBytes = await fetchImageAsUint8Array(imageFile);
                page.graphics.drawImage(
                    new PdfBitmap(imageBytes),
                    { x, y, width: 180, height: imgH }
                );
            } catch (error) {
                console.warn(`Could not load image from ${imageFile}:`, error);
            }
            y += imgH + spacing;
        };

        // Draw all three sections
        await drawSection('Essential PDF', 'https://document.syncfusion.com/content/pdf-resources/Essential-PDF.txt', 'https://document.syncfusion.com/content/pdf-resources/Essen-PDF.jpg');
        await drawSection('Essential DocIO', 'https://document.syncfusion.com/content/pdf-resources/Essential-DocIO.txt', 'https://document.syncfusion.com/content/pdf-resources/Essen-DocIO.jpg');
        await drawSection('Essential XlsIO', 'https://document.syncfusion.com/content/pdf-resources/Essential-XlsIO.txt', 'https://document.syncfusion.com/content/pdf-resources/Essen-XlsIO.jpg');

        // Draw composite field on footer and save PDF
        composite.draw(
            footer.graphics,
            { x: pageWidth - 100, y: 20 }
        );
        doc.save('HeadersAndFooters.pdf');
    };
};