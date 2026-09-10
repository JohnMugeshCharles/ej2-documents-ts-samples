import { loadCultureFiles } from '../common/culture-loader';
import { Button } from "@syncfusion/ej2-buttons";
import { PdfDocument, PdfPage, PdfFontFamily, PdfLayoutFormat, PdfLayoutType, PdfLayoutBreakType, PdfBrush, PdfStandardFont, PdfFontStyle, PdfStringFormat, PdfTextElement, PdfLayoutResult } from '@syncfusion/ej2-pdf';

(window as any).default = (): void => {
	loadCultureFiles();
	let button: Button = new Button();
	button.appendTo('#textFlow');
	button.element.onclick = async (): Promise<void> => {
		let textContent: string = '';
		try {
			const resp = await fetch('https://cdn.syncfusion.com/content/pdf-resources/pdf-textFlow.txt');
			if (resp.ok) {
				textContent = await resp.text();
			}
		} catch (e) {
			/* If fetch fails, leave textContent empty */
		}
		// Create a new PDF document
		let doc: PdfDocument = new PdfDocument();

		// Add a new page to the document
		let page: PdfPage = doc.addPage();

		// Get the client size of the page for layout calculations
		let clientSize = page.graphics.clientSize;

		// Create an instance for layout format for drawing
		let layoutFormat: PdfLayoutFormat = new PdfLayoutFormat();
		// Set the layout type to paginate for the page layout format
		layoutFormat.layout = PdfLayoutType.paginate;
		//  Set the layout break type for the page
		layoutFormat.break = PdfLayoutBreakType.fitPage;
		// Set the paginate bounds for the page
		layoutFormat.paginateBounds = { x: 0, y: 0, width: clientSize.width, height: clientSize.height };

		// Define a text element with styling and layout options
		let element: PdfTextElement = {
			text: textContent, // The text string to render
			font: new PdfStandardFont(PdfFontFamily.timesRoman, 14), // Times Roman font at 14pt
			brush: new PdfBrush({ r: 0, g: 0, b: 0 }), // Black color brush (RGB: 0,0,0)
			layoutFormat: layoutFormat // Apply the pagination layout settings
		};

		// Draw the text element on the page within the specified bounds
		page.drawTextElement(element, {
			x: 0, // X coordinate starting position
			y: 0, // Y coordinate starting position
			width: clientSize.width, // Width matches page width
			height: clientSize.height // Height matches page height
		});

		// Save the document
		doc.save('TextFlowOutput.pdf');

		// Destroy the document
		doc.destroy();
	};
};

