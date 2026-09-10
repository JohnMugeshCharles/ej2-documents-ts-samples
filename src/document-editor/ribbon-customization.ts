import { DocumentEditor, Selection, Editor, TableOfContentsDialog, Search, Ribbon } from '@syncfusion/ej2-documenteditor';
import { DocumentEditorContainer, Toolbar } from '@syncfusion/ej2-documenteditor';
import { Button } from '@syncfusion/ej2-buttons';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import { ChangeEventArgs, CheckBox } from '@syncfusion/ej2-buttons';
import { TitleBar } from './title-bar';
import * as data from './data-default.json';

import { loadCultureFiles } from '../common/culture-loader';
import { RibbonGroupModel, RibbonItemModel, RibbonItemSize, RibbonItemType, RibbonTabModel } from '@syncfusion/ej2-ribbon';
import {
    createSpinner,
    showSpinner,
    hideSpinner,
} from '@syncfusion/ej2-popups';

DocumentEditorContainer.Inject(Ribbon);

/**
 * Document Editor Ribbon Customization
 */
let container: DocumentEditorContainer;
/**
 * Default document editor sample
 */

function formatSave(type: string) {
    createSpinner({
        target: document.getElementById('container'),
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
        Format: '.' + format,
    };

    http.onload = function () {
        if (http.status === 200) {
            let responseData = http.response;
            let blobUrl = URL.createObjectURL(responseData);
            let downloadLink = document.createElement('a');
            downloadLink.href = blobUrl;
            downloadLink.download =
                (window as any).container.documentEditor.documentName + '.' + format.toLowerCase();
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
    container = new DocumentEditorContainer({
        enableToolbar: true,
        toolbarMode: 'Ribbon',
        ribbonLayout: 'Classic',
        height: '590px',
        serviceUrl: 'https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/',
        fileMenuItems: [
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
        ],
        fileMenuItemClick: function (args) {
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
        },
    });
    container.appendTo('#container');
    (window as any).container = container;
    let titleBar: TitleBar = new TitleBar(document.getElementById('documenteditor_titlebar'), container.documentEditor, true);
    container.documentEditor.open(JSON.stringify((<any>data)));
    container.documentEditor.documentName = 'Getting Started';
    titleBar.updateDocumentTitle();
    titleBar.showButtons(false);
    // Event binding for Home tab visibility toggle
    let showHomeTabCheckBox: CheckBox = new CheckBox({
        checked: true,
        label: 'Show/Hide Home Tab',
        change: (args: ChangeEventArgs) => {
            // Update checked state
            container.ribbon.showTab('Home', args.checked);

        }
    });
    showHomeTabCheckBox.appendTo('#showHomeTab');

    // Event binding for Clipboard group visibility toggle
    let showClipboardCheckBox: CheckBox = new CheckBox({
        checked: true,
        label: 'Show/Hide Clipboard Group',
        change: (args: ChangeEventArgs) => {
            // Update checked state
            container.ribbon.showGroup({ tabId: 'Home', index: 1 }, args.checked)
        }
    });
    showClipboardCheckBox.appendTo('#showClipboard');

    // Event binding for Clipboard group visibility toggle
    let showItemCheckBox: CheckBox = new CheckBox({
        checked: true,
        label: 'Show/Hide Bold & Italic Items',
        change: (args: ChangeEventArgs) => {
            // Update checked state
            container.ribbon.showItems({ tabId: 'Home', groupIndex: 2, itemIndexes: [5, 6] }, args.checked);
        }
    });
    showItemCheckBox.appendTo('#showItem');
    let enableItemCheckBox: CheckBox = new CheckBox({
        checked: true,
        label: 'Enable/Disable Underline Item',
        change: (args: ChangeEventArgs) => {
            // Update checked state
            container.ribbon.enableItems({ tabId: 'Home', groupIndex: 2, itemIndexes: [7] }, args.checked);
        }
    });
    enableItemCheckBox.appendTo('#enableItem');
};