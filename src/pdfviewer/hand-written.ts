import { loadCultureFiles } from '../common/culture-loader';
import { PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView,
ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner,PageOrganizer } from '@syncfusion/ej2-pdfviewer';
// tslint:disable-next-line:max-line-length
 

PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView, ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner, PageOrganizer);

(window as any).default = (): void => {
    loadCultureFiles();
    let viewer: PdfViewer = new PdfViewer();
     viewer.documentPath = "https://cdn.syncfusion.com/content/pdf/handwritten-signature.pdf";
     viewer.resourceUrl ="https://cdn.syncfusion.com/ej2/23.2.6/dist/ej2-pdfviewer-lib";

    
    
    viewer.appendTo('#pdfViewer');
    // tslint:disable-next-line
    let isInitialLoading: boolean = true;
    viewer.documentLoad = function (): any {
        if (isInitialLoading) {
            viewer.annotationModule.setAnnotationMode('HandWrittenSignature');
            isInitialLoading = false;
        }
    };
};
