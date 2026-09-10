import { loadCultureFiles } from '../common/culture-loader';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument, PdfPage, PdfBrush, PdfFontFamily,  PdfDestination, PdfBookmark, PdfStandardFont, Rectangle, PdfBookmarkBase } from '@syncfusion/ej2-pdf';
(window as any).default = (): void => {
    loadCultureFiles();
    let button: Button = new Button();
	button.appendTo('#bookmarkbtn');
    button.element.onclick = (): void => {
		// Create a new PDF document instance
        const document = new PdfDocument();
		// Loop 3 times to add three pages representing Chapter 1, 2, and 3
		for (let i = 1; i <= 3; i++) {
			// For each iteration, add a new page to the document
			const page: PdfPage = document.addPage();
			// Compose the chapter title text (e.g., "Chapter 1")
			const chapterTitle = `Chapter ${i}`;
			// Draw the chapter title on the page at (10, 10) using a red brush
			drawTitle(page, chapterTitle, 10, 10, new PdfBrush({ r: 255, g: 0, b: 0 }));
			// Access the document's root bookmarks collection
			const bookmarks: PdfBookmarkBase = document.bookmarks;
			// Add a chapter-level bookmark with the chapter title
			const chapter: PdfBookmark = bookmarks.add(chapterTitle);
			// Set the chapter bookmark's destination to the chapter title position on the current page
			chapter.destination = new PdfDestination(page, { x: 10, y: 10 });
			// Color the chapter bookmark red
			chapter.color = { r: 255, g: 0, b: 0 };
			// Prepare section titles (e.g., "Section 1.1" and "Section 1.2")
			const sec1Title = `Section ${i}.1`;
			const sec2Title = `Section ${i}.2`;
			// Draw both section titles on the page at the specified coordinates using a green brush
			drawTitle(page, sec1Title, 30, 30, new PdfBrush({ r: 0, g: 255, b: 0 }));
			drawTitle(page, sec2Title, 30, 400, new PdfBrush({ r: 0, g: 255, b: 0 }));
			// Add a bookmark for Section 1 under the current chapter bookmark
			const section1: PdfBookmark = chapter.add(sec1Title);
			// Set the Section 1 bookmark destination to the section title position
			section1.destination = new PdfDestination(page, { x: 30, y: 30 });
			// Color the Section 1 bookmark dark green
			section1.color = { r: 0, g: 128, b: 0 };
			// Add a bookmark for Section 2 under the current chapter bookmark
			const section2: PdfBookmark = chapter.add(sec2Title);
			// Set the Section 2 bookmark destination to its title position
			section2.destination = new PdfDestination(page, { x: 30, y: 400 });
			// Color the Section 2 bookmark dark green
			section2.color = { r: 0, g: 128, b: 0 };
			// Define paragraph entries under Section 1 with their text and coordinates
			const subs1 = [
				{ t: `Paragraph ${i}.1.1`, pt: { x: 50, y: 50 } },
				{ t: `Paragraph ${i}.1.2`, pt: { x: 50, y: 150 } },
				{ t: `Paragraph ${i}.1.3`, pt: { x: 50, y: 250 } }
			];
			for (const s of subs1) {
				drawTitle(page, s.t, s.pt.x, s.pt.y, new PdfBrush({ r: 0, g: 0, b: 255 }));
				const b = section1.add(s.t);
				b.destination = new PdfDestination(page, s.pt);
				b.color = { r: 0, g: 0, b: 255 };
			}
			// Define paragraph entries under Section 2 with their text and coordinates
			const subs2 = [
				{ t: `Paragraph ${i}.2.1`, pt: { x: 50, y: 420 } },
				{ t: `Paragraph ${i}.2.2`, pt: { x: 50, y: 560 } },
				{ t: `Paragraph ${i}.2.3`, pt: { x: 50, y: 680 } }
			];
			for (const s of subs2) {
				drawTitle(page, s.t, s.pt.x, s.pt.y, new PdfBrush({ r: 0, g: 0, b: 255 }));
				const b = section2.add(s.t);
				b.destination = new PdfDestination(page, s.pt);
				b.color = { r: 0, g: 0, b: 255 };
			}
		}
		// Save and download PDF document
		document.save('Bookmarks.pdf');
		// Destory the document instance
		document.destroy();
    }
    function drawTitle(page: PdfPage, title: string, x: number, y: number, brush: PdfBrush) {
		const font = new PdfStandardFont(PdfFontFamily.helvetica, 10);
		const bounds: Rectangle = { x: x, y: y, width: 500, height: 20 };
		page.graphics.drawString(title, font, bounds, brush);
	}
};