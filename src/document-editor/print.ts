import { loadCultureFiles } from '../common/culture-loader';
import { DocumentEditor, ViewChangeEventArgs, Print } from '@syncfusion/ej2-documenteditor';
import { DocumentLoader } from './document-loader';
import { NumericTextBox } from '@syncfusion/ej2-inputs';
import { Tooltip } from '@syncfusion/ej2-popups';
import { TitleBar } from './title-bar';
import { StatusBar } from './status-bar';
import * as data from './data-print.json';
DocumentEditor.Inject(Print);
/**
 * Print document editor sample
 */
(window as any).default = (): void => {
    loadCultureFiles();
    let containerPanel: HTMLElement = document.getElementById('documenteditor_container_panel');
    let documenteditor: DocumentEditor = new DocumentEditor({ enablePrint: true, height: '590px' });
    documenteditor.pageOutline = '#E0E0E0';
    documenteditor.appendTo('#container');
    documenteditor.documentEditorSettings.printDevicePixelRatio = 2;
    let documentLoader: DocumentLoader = new DocumentLoader(documenteditor);
    onLoadDefault();
    documenteditor.viewChange = (e: ViewChangeEventArgs) => {
        onViewChange(e);
    };
    documenteditor.documentChange = (): void => {
        applyPageCountAndDocumentTitle();
    };

    let numeric: NumericTextBox = new NumericTextBox({
        width: "120px",
        min: 1,
        max: 10,
        value: 2,
        format: 'n',
        decimals: 1,
        step: 0.5,
        change: (args) => { 
            documenteditor.documentEditorSettings.printDevicePixelRatio = args.value;
          }
    });
    numeric.appendTo('#numeric');
    let tooltip: Tooltip = new Tooltip({
        content: 'Specifies the device pixel ratio for the image generated while printing the document.',
    });
    tooltip.appendTo('#numeric');
    let titleBar: TitleBar = new TitleBar(document.getElementById('documenteditor_titlebar'), documenteditor, false);
    let statusBar: StatusBar = new StatusBar(document.getElementById('documenteditor_statusbar'), documenteditor);
    applyPageCountAndDocumentTitle();
    document.getElementById('uploadfileButton').addEventListener('change', onFileChange);
    document.getElementById('uploadfileButton').setAttribute('accept', '.doc,.docx,.rtf,.txt,.sfdt');
    documenteditor.zoomFactorChange = (): void => {
        statusBar.updateZoomContent();
    };
    function onFileChange(args: any): void {
        if (args.target.files[0]) {
            let path: any = args.target.files[0];
            if (path.name.substr(path.name.lastIndexOf('.')) === '.sfdt') {
                let fileReader: FileReader = new FileReader();
                fileReader.onload = (e: any) => {
                    let contents: any = e.target.result;
                    documenteditor.open(contents);
                };
                fileReader.readAsText(path);
                documenteditor.documentName = path.name.substr(0, path.name.lastIndexOf('.'));
            } else {
                documentLoader.loadFile(path);
            }
        }
        event.preventDefault();
    }

    function onLoadDefault(): void {
        let waitingPopUp: HTMLElement = document.getElementById('waiting-popup');
        let overlay: HTMLElement = document.getElementById('popup-overlay');
        overlay.style.display = 'block';
        waitingPopUp.style.display = 'block';
        documentLoader.loadDefault(data);
        documenteditor.documentName = 'Getting Started';
        waitingPopUp.style.display = 'none';
        overlay.style.display = 'none';
    }
    function applyPageCountAndDocumentTitle(): void {
        //Sets Document name.
        titleBar.updateDocumentTitle();
        statusBar.updatePageCount();
    }
    function onViewChange(args: ViewChangeEventArgs): void {
        statusBar.updatePageNumberOnViewChange(args);
    }
};
