import { loadCultureFiles } from '../common/culture-loader';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument, PdfPageSettings, PdfMargins, PdfPage, PdfGraphics, PdfBrush, PdfPen, PdfFont, PdfFontFamily, PdfFontStyle, PdfTextWebLinkAnnotation } from '@syncfusion/ej2-pdf';
(window as any).default = (): void => {
    loadCultureFiles();
	let button: Button = new Button();
	button.appendTo('#successbtn');
	button.element.onclick = (): void => {
		// Create a new PDF document
		let pdf: PdfDocument = new PdfDocument();
		let settings: PdfPageSettings = new PdfPageSettings({ margins: new PdfMargins(0) });
		// Add a new page
		let page: PdfPage = pdf.addPage(settings);
		let g: PdfGraphics = page.graphics;
		// PDF brushes with different colors
		let gray: PdfBrush = new PdfBrush({ r: 64, g: 64, b: 64 });
		let black: PdfBrush = new PdfBrush({ r: 0, g: 0, b: 0 });
		let white: PdfBrush = new PdfBrush({ r: 255, g: 255, b: 255 });
		let violet: PdfBrush = new PdfBrush({ r: 255, g: 153, b: 255 });
		// Pens for lines
		let redPen: PdfPen = new PdfPen({ r: 255, g: 0, b: 0 }, 2);
		let violetPen: PdfPen = new PdfPen({ r: 148, g: 0, b: 211 }, 2);
		let greenPen: PdfPen = new PdfPen({ r: 0, g: 128, b: 0 }, 2);
		let bluePen: PdfPen = new PdfPen({ r: 0, g: 0, b: 255 }, 2);
		// Draw rectangles and text
		g.drawRectangle({ x: 0, y: 0, width: g.clientSize.width, height: g.clientSize.height }, gray);
		g.drawRectangle({ x: 0, y: 0, width: g.clientSize.width, height: 130 }, black);
		g.drawRectangle({ x: 0, y: 400, width: g.clientSize.width, height: g.clientSize.height - 450 }, white);
		let headerFont: PdfFont = pdf.embedFont(PdfFontFamily.timesRoman, 35, PdfFontStyle.regular);
		g.drawString('Enterprise', headerFont, { x: 10, y: 20, width: 150, height: 200 }, violet);
		g.drawRectangle({ x: 10, y: 63, width: 140, height: 35 }, violet);
		let subHeadingFont: PdfFont = pdf.embedFont(PdfFontFamily.timesRoman, 16, PdfFontStyle.regular);
		g.drawString('Reporting Solutions', subHeadingFont, { x: 15, y: 70, width: 130, height: 200 }, black);
		let yPos: number = 30;
		// Header points
		let bodyFont: PdfFont = pdf.embedFont(PdfFontFamily.timesRoman, 11, PdfFontStyle.regular);
		let bulletHeaderFont: PdfFont = pdf.embedFont(PdfFontFamily.zapfDingbats, 10, PdfFontStyle.regular);
		yPos = drawHeaderPoint(g, 'Develop cloud-ready reporting applications in as little as 20% of the time.', yPos, bulletHeaderFont, bodyFont, white, violet);
		yPos = drawHeaderPoint(g, 'Proven, reliable platform thousands of users over the past 10 years.', yPos, bulletHeaderFont, bodyFont, white, violet);
		yPos = drawHeaderPoint(g, 'Microsoft Excel, Word, Adobe PDF, RDL display and editing.', yPos, bulletHeaderFont, bodyFont, white, violet);
		yPos = drawHeaderPoint(g, 'Why start from scratch? Rely on our dependable solution frameworks', yPos, bulletHeaderFont, bodyFont, white, violet);
		// Body content
		yPos += 105;
		let bulletBodyFont: PdfFont = pdf.embedFont(PdfFontFamily.zapfDingbats, 16, PdfFontStyle.regular);
		let bodyContentFont: PdfFont = pdf.embedFont(PdfFontFamily.timesRoman, 17, PdfFontStyle.regular);
		yPos = drawBodyContent(g, 'Deployment-ready framework tailored to your needs.', yPos, bulletBodyFont, bodyContentFont, white, violet);
		yPos = drawBodyContent(g, 'Our architects and developers have years of reporting experience.', yPos, bulletBodyFont, bodyContentFont, white, violet);
		yPos = drawBodyContent(g, 'Solutions available for web, desktop, and mobile applications.', yPos, bulletBodyFont, bodyContentFont, white, violet);
		yPos = drawBodyContent(g, 'Backed by our end-to-end product maintenance infrastructure.', yPos, bulletBodyFont, bodyContentFont, white, violet);
		yPos = drawBodyContent(g, 'The quickest path from concept to delivery.', yPos, bulletBodyFont, bodyContentFont, white, violet);
		let headerBulletsXposition: number = 45;
		yPos = 350;
		// Section 1: The Experts
		let titleFont: PdfFont = pdf.embedFont(PdfFontFamily.timesRoman, 20, PdfFontStyle.regular);
		g.drawLine(redPen, { x: headerBulletsXposition, y: yPos + 92 }, { x: headerBulletsXposition, y: yPos + 145 });
		g.drawString('The Experts', titleFont, { x: headerBulletsXposition + 10, y: yPos + 90, width: 150, height: 200 }, black);
		g.drawLine(violetPen, { x: headerBulletsXposition + 280, y: yPos + 92 }, { x: headerBulletsXposition + 280, y: yPos + 145 });
		g.drawString('Accurate Estimates', titleFont, { x: headerBulletsXposition + 290, y: yPos + 90, width: 300, height: 200 }, black);
		g.drawString('A substantial number of .NET reporting applications use our frameworks', bodyFont, { x: headerBulletsXposition + 10, y: yPos + 115, width: 250, height: 200 }, black);
		g.drawString('Given our expertise, you can expect estimates to be accurate.', bodyFont, { x: headerBulletsXposition + 290, y: yPos + 115, width: 250, height: 200 }, black);
		// Section 2: Product Licensing
		yPos += 200;
		g.drawLine(greenPen, { x: headerBulletsXposition, y: yPos + 32 }, { x: headerBulletsXposition, y: yPos + 85 });
		g.drawString('Product Licensing', titleFont, { x: headerBulletsXposition + 10, y: yPos + 30, width: 250, height: 200 }, black);
		g.drawLine(bluePen, { x: headerBulletsXposition + 280, y: yPos + 32 }, { x: headerBulletsXposition + 280, y: yPos + 85 });
		g.drawString('About Syncfusion', titleFont, { x: headerBulletsXposition + 290, y: yPos + 30, width: 250, height: 200 }, black);
		g.drawString('Solution packages can be combined with product licensing for great cost savings.', bodyFont, { x: headerBulletsXposition + 10, y: yPos + 55, width: 250, height: 200 }, black);
		g.drawString('Syncfusion has more than 7,000 customers including large financial institutions and Fortune 100 companies.', bodyFont, { x: headerBulletsXposition + 290, y: yPos + 55, width: 250, height: 200 }, black);
		// Footer
		let footerFont: PdfFont = pdf.embedFont(PdfFontFamily.timesRoman, 8, PdfFontStyle.italic);
		g.drawString('All trademarks mentioned belong to their owners.', footerFont, { x: 10, y: g.clientSize.height - 30, width: 250, height: 200 }, white);
		let annot: PdfTextWebLinkAnnotation = new PdfTextWebLinkAnnotation(
		  { x: g.clientSize.width - 100, y: g.clientSize.height - 30, width: 70, height: 10 },
		  { r: 255, g: 255, b: 255 },
		  null,
		  0,
		  { text: 'www.syncfusion.com', font: footerFont, url: 'http://www.syncfusion.com' }
		);
		page.annotations.add(annot);
		// Save the PDF
		pdf.save('Sample.pdf');
		pdf.destroy();
	}
	function drawHeaderPoint(g: PdfGraphics, text: string, y: number, bulletFont: PdfFont, bodyFont: PdfFont, white: PdfBrush, violet: PdfBrush) {
		g.drawString('l', bulletFont, { x: 220, y: y, width: 100, height: 100 }, violet);
		g.drawString(text, bodyFont, { x: 240, y: y, width: 400, height: 100 }, white);
		return y + 15; // Move down for next header
	}
	function drawBodyContent(g: PdfGraphics, text: string, y: number, bulletBodyFont: PdfFont, bodyContentFont: PdfFont, white: PdfBrush, violet: PdfBrush) {
		g.drawString('3', bulletBodyFont, { x: 35, y: y, width: 100, height: 100 }, violet);
		g.drawString(text, bodyContentFont, { x: 60, y: y, width: 500, height: 100 }, white);
		return y + 25; // Move down for next body content
	}
};