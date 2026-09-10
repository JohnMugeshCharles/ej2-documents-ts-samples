import { loadCultureFiles } from '../common/culture-loader';
import { DocumentEditorContainer, Ribbon, Toolbar } from '@syncfusion/ej2-documenteditor';
import { TitleBar } from './title-bar';
import * as data from './data-table-of-contents.json';
import { createSpinner, showSpinner, hideSpinner, } from '@syncfusion/ej2-popups';

/**
 * Default document editor sample
 */
function formatSave(type: string) {
    createSpinner({
        target: document.getElementById('container')
    });
    showSpinner(document.getElementById('container'));
    let format: string = type;
    let url = (window as any).container.documentEditor.serviceUrl + 'Export';
    let http = new XMLHttpRequest();
    http.open('POST', url);
    http.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
    http.responseType = 'blob';

    let sfdt = {
        Content: (window as any).container.documentEditor.serialize(),
        Filename: (window as any).container.documentEditor.documentName,
        Format: '.' + type,
    };

    http.onload = function () {
        if (http.status === 200) {
            let responseData = http.response;
            let blobUrl = URL.createObjectURL(responseData);
            let downloadLink = document.createElement('a');
            downloadLink.href = blobUrl;
            downloadLink.download =
                (window as any).container.documentEditor.documentName + '.' + type.toLowerCase();
            document.body.appendChild(downloadLink);
            hideSpinner(document.getElementById('container'));
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(blobUrl);
        } else {
            console.error('Request failed with status:', http.status);
            hideSpinner(document.getElementById('container'));
        }
    };

    http.send(JSON.stringify(sfdt));
}

(window as any).default = (): void => {
    loadCultureFiles();

    let hostUrl: string = 'https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/';

    let container: DocumentEditorContainer = new DocumentEditorContainer({ serviceUrl: hostUrl, toolbarMode: 'Ribbon', enableToolbar: true, height: '590px', documentEditorSettings: { showRuler: true }, fileMenuItems: [
    'New',
    'Open',
    {
        text: 'Export',
        id: 'custom_item',
        iconCss: 'e-icons e-export',
        items: [
            { id: 'sfdt', text: 'Syncfusion Document Text (*.sfdt)' },
            { id: 'docx', text: 'Word Document (*.docx)' },
            { id: 'dotx', text: 'Word Template (*.dotx)' },
            { id: 'text', text: 'Plain Text (*.txt)' },
            { id: 'pdf', text: 'PDF (*.pdf)' },
            { id: 'html', text: 'HyperText Markup Language (*.html)' },
            { id: 'rtf', text: 'Rich Text Format (*.rtf)' },
            { id: 'md', text: 'Markdown (*.md)' },
            { id: 'odt', text: 'OpenDocument Text (*.odt)' },
        ],
    },
    'Print',
], fileMenuItemClick: function (args) {
    if (args.item.id) {
        let value: string = args.item.id;
        switch (value) {
            case 'docx':
                container.documentEditor.save('Sample', 'Docx');
                break;
            case 'sfdt':
                container.documentEditor.save('Sample', 'Sfdt');
                break;
            case 'text':
                container.documentEditor.save('Sample', 'Txt');
                break;
            case 'dotx':
                container.documentEditor.save('Sample', 'Dotx');
                break;
            case 'pdf':
                formatSave('Pdf');
                break;
            case 'html':
                formatSave('Html');
                break;
            case 'odt':
                formatSave('Odt');
                break;
            case 'md':
                formatSave('Md');
                break;
            case 'rtf':
                formatSave('Rtf');
                break;
        }
    }
} });
    DocumentEditorContainer.Inject(Toolbar, Ribbon);
    container.appendTo('#container');
    (window as any).container = container;

    let titleBar: TitleBar = new TitleBar(document.getElementById('documenteditor_titlebar'), container.documentEditor, true);
    container.documentEditor.open(JSON.stringify((<any>data)));
    container.documentEditor.documentName = 'Table of Contents';
    titleBar.updateDocumentTitle();

    container.documentChange = (): void => {
        titleBar.updateDocumentTitle();
        container.documentEditor.focusIn();
    };
    titleBar.initializeRibbonSwitch(container);
    titleBar.showButtons(false);
};