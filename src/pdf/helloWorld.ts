import { loadCultureFiles } from '../common/culture-loader';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument, PdfBrush, PdfFontFamily, PdfFontStyle, } from '@syncfusion/ej2-pdf';
(window as any).default = (): void => {
    loadCultureFiles();
    let button: Button = new Button();
    button.appendTo('#hellowbtn');
    button.element.onclick = (): void => {
        // Create a new PDF document
        let pdf = new PdfDocument();
        // Add a new page
        let page = pdf.addPage();
        // Access graphics of the page
        let graphics = page.graphics;
        // Create a new PDF standard font
        let font = pdf.embedFont(PdfFontFamily.helvetica, 36, PdfFontStyle.regular);
        // Create a new black brush
        let brush = new PdfBrush({r: 0, g: 0, b: 0});
        // Draw the text
        graphics.drawString('Hello World!!!', font, {x: 20, y: 20, width: graphics.clientSize.width - 20, height: 60}, brush);
        // Save and download PDF
        pdf.save('Sample.pdf');
        // Destroy the PDF document instance
        pdf.destroy();
    }
};