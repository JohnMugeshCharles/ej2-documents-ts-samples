import { loadCultureFiles } from '../common/culture-loader';
import { Button } from '@syncfusion/ej2-buttons';
import { PdfDocument, PdfBrush, PdfFontFamily, PdfFontStyle, PdfListItem, PdfListItemCollection, PdfOrderedList, PdfStringFormat, PdfUnorderedList, PdfUnorderedListStyle, PdfBitmap, PdfImageMarker } from '@syncfusion/ej2-pdf';

(window as any).default = (): void => {
    loadCultureFiles();
    let button: Button = new Button();
    button.appendTo('#successbtn');
    button.element.onclick = async (): Promise<void> => {
        let pdf = new PdfDocument();
        // Add a new page
        let page = pdf.addPage();
        // Embed fonts used for title, body, and lists
        let font1 = pdf.embedFont(PdfFontFamily.helvetica, 14, PdfFontStyle.bold);
        let font2 = pdf.embedFont(PdfFontFamily.helvetica, 12, PdfFontStyle.regular);
        let font3 = pdf.embedFont(PdfFontFamily.timesRoman, 10, PdfFontStyle.bold);
        let font4 = pdf.embedFont(PdfFontFamily.timesRoman, 10, PdfFontStyle.italic);
        let font5 = pdf.embedFont(PdfFontFamily.timesRoman, 10, PdfFontStyle.regular);
        // Draw the title and introductory paragraph explaining lists
        page.graphics.drawString('List Features', font1, { x: 225, y: 10, width: 300, height: 100 }, new PdfBrush({ r: 0, g: 0, b: 139 }));
        page.graphics.drawString('This sample demonstrates letious features of bullets and lists. A list can be ordered and Unordered. Essential PDF provides support for creating and formatting ordered and unordered lists.', font2, { x: 0, y: 50, width: page.graphics.clientSize.width, height: page.graphics.clientSize.height - 50 }, new PdfBrush({ r: 0, g: 0, b: 0 }));
        // Create a string format for list items with line spacing
        let format = new PdfStringFormat();
        format.lineSpacing = 10;
        // Create an unordered list with disk-style bullets
        const collection = new PdfListItemCollection(['List of Essential Studio products', 'IO products']);
        let unorderedList = new PdfUnorderedList(collection, { format: format, font: font3, style: PdfUnorderedListStyle.disk, indent: 10, textIndent: 10 });
        // Create ordered sublist for first item
        let orderedSubList = new PdfOrderedList(new PdfListItemCollection(), { brush: new PdfBrush({ r: 0, g: 0, b: 0 }), indent: 20, font: font4, format: format });
        let products = ['Tools', 'Grid', 'Chart', 'Edit', 'Diagram', 'XlsIO', 'Grouping', 'Calculate', 'PDF', 'HTMLUI', 'DocIO'];
        products.forEach(function (s) { orderedSubList.items.add(new PdfListItem('Essential ' + s)); });
        // Add the ordered sublist to the first main item
        unorderedList.items.at(0).subList = orderedSubList;
        // Create unordered sublist for second item
        const subSubListCollection = new PdfListItemCollection([
            'Essential PDF: It is a .NET library with the capability to produce Adobe PDF files. It features a full-fledged object model for the easy creation of PDF files from any .NET language. It does not use any external libraries and is built from scratch in C#. It can be used on the server side (ASP.NET or any other environment) or with Windows Forms applications. Essential PDF supports many features for creating a PDF document. Drawing Text, Images, Shapes, etc can be drawn easily in the PDF document.',
            'Essential DocIO: It is a .NET library that can read and write Microsoft Word files. It features a full-fledged object model similar to the Microsoft Office COM libraries. It does not use COM interop and is built from scratch in C#. It can be used on systems that do not have Microsoft Word installed. Here are some of the most common questions that arise regarding the usage and functionality of Essential DocIO.',
            'Essential XlsIO: It is a .NET library that can read and write Microsoft Excel files (BIFF 8 format). It features a full-fledged object model similar to the Microsoft Office COM libraries. It does not use COM interop and is built from scratch in C#. It can be used on systems that do not have Microsoft Excel installed, making it an excellent reporting engine for tabular data. ',
        ]);
        let unorderedSubList = new PdfUnorderedList(subSubListCollection, { brush: new PdfBrush({ r: 0, g: 0, b: 0 }), indent: 20, font: font5, format: format, style: PdfUnorderedListStyle.square });
        // Set image as unordered list marker
        const imageData = await fetchImageAsUint8Array('https://cdn.syncfusion.com/content/pdf-resources/logo.png');
        const imageMarker: PdfImageMarker = {image: new PdfBitmap(imageData)}
        unorderedSubList.setMarker(imageMarker);
        // Add the unordered sublist to the second main item
        unorderedList.items.at(1).subList = unorderedSubList;
        // Draw the list on the page
        unorderedList.draw(page, { x: 0, y: 130, width: page.graphics.clientSize.width, height: page.graphics.clientSize.height - 130 });
        // Save the document PDF
        pdf.save('BulletsAndLists.pdf');
        // Destory the document instance.
        pdf.destroy();
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
};