import { loadCultureFiles } from '../common/culture-loader';
import { PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView,
ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner} from '@syncfusion/ej2-pdfviewer';
// tslint:disable-next-line:max-line-length
PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView, ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner);

/**
 * Default PdfViewer sample
 */
(window as any).default = (): void => {
    loadCultureFiles();
    let viewer: PdfViewer = new PdfViewer();
    viewer.documentPath = "https://cdn.syncfusion.com/content/pdf/restricted-formfield.pdf";
    viewer.resourceUrl ="https://cdn.syncfusion.com/ej2/23.2.6/dist/ej2-pdfviewer-lib";
    viewer.toolbarSettings={ showTooltip : true, toolbarItems:['OpenOption', 'PageNavigationTool', 'MagnificationTool', 'PanTool','PrintOption']};
    viewer.enableAnnotationToolbar = false;
    viewer.enableDownload = false;

    viewer.appendTo('#pdfViewer');
    viewer.enableStickyNotesAnnotation=false;
    viewer.enablePageOrganizer = false;
    viewer.annotationSettings = {  
        isLock:true,  
    };
    viewer.contextMenuOption = 'None';
    viewer.documentLoad = documentLoaded;
    function documentLoaded() {
         var viewer=(document.getElementById('pdfViewer')as any).ej2_instances[0];
        var formField = viewer.retrieveFormFields();
        for (var x = 0; x < formField.length; x++) {
            viewer.formDesignerModule.updateFormField(viewer.formFieldCollections[x], {
                isReadOnly: true,
            });
        }
    }
};
