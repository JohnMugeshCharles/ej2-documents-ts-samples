import { loadCultureFiles } from '../common/culture-loader';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument, PdfBrush, PdfFontFamily, PdfFontStyle } from '@syncfusion/ej2-pdf';
(window as any).default = (): void => {
    loadCultureFiles();
  const btn = new Button({}, '#documentbtn');
  btn.element.onclick = (): void => {
    // Create a new PDF document
    const pdf = new PdfDocument();
    // Set document information
    const now = new Date();
    pdf.setDocumentInformation({
      author: 'Syncfusion',
      creationDate: now,
      modificationDate: now,
      creator: 'Essential PDF',
      keywords: 'PDF',
      subject: 'Document information DEMO',
      title: 'Syncfusion JavaScript PDF Library Example',
      producer: 'Syncfusion PDF'
    });
    // Add a page and draw text
    const page = pdf.addPage();
    const g = page.graphics;
    const boldFont = pdf.embedFont(PdfFontFamily.helvetica, 12, PdfFontStyle.bold);
    const regularFont = pdf.embedFont(PdfFontFamily.helvetica, 10, PdfFontStyle.regular);
    const black = new PdfBrush({ r: 0, g: 0, b: 0 });
    g.drawString('Document Properties', boldFont, { x: 10, y: 10, width: 520, height: 20 }, black);
    const formattedDate = now.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    });
    let y = 50;
    const line = (text: string) => {
      g.drawString(text, regularFont, { x: 10, y, width: 520, height: 16 }, black);
      y += 20;
    };
    line('Title: Syncfusion JavaScript PDF Library Example');
    line('Author: Syncfusion');
    line('Subject: Document information DEMO');
    line('Keywords: PDF');
    line('Created: ' + formattedDate);
    line('Modified: ' + formattedDate);
    line('Application: Essential PDF');
    // Save and downlaod the document
    pdf.save('DocPropertiesAndXml.pdf');
    pdf.destroy();
  };
};