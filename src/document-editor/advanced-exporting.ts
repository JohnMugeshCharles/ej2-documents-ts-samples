import { loadCultureFiles } from '../common/culture-loader';
import { DocumentEditorContainer, Toolbar, Ribbon } from '@syncfusion/ej2-documenteditor';
import { TitleBar } from './title-bar';
import { DropDownButton, DropDownButtonModel } from '@syncfusion/ej2-splitbuttons';
import { ListView, SelectEventArgs as ListSelectEventArgs } from '@syncfusion/ej2-lists';
import { createSpinner, showSpinner, hideSpinner } from '@syncfusion/ej2-popups';
import { Switch } from '@syncfusion/ej2-buttons';
import * as data from './data-default.json';

/**
 * Default document editor sample
 */
(window as any).default = (): void => {
    loadCultureFiles();
    let hostUrl: string = 'https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/';

    let toolItem: any =
{
    tooltipText: 'Export',
    template: '<button title="Export" class="e-tbar-btn e-tbtn-txt e-control e-btn e-lib e-dropdown-btn e-caret-hide" type="button" id="dropdownbtn"><span class="e-btn-icon e-icons e-export e-icon-left"></span><span class="e-tbar-btn-text">' + "Export" + '</span><span class="e-btn-icon e-icons e-icon-right e-caret"></span></button><div id="listview"></div>',
    id: "dropdownbtn",
    text: "Export",
};

let isDropDownButtonCreated = false;
let ddbOption: DropDownButtonModel = {
    target: '#listview',
    cssClass: 'e-caret-hide',
    created: function () {
        isDropDownButtonCreated = true;
    },
};

let drpDownBtn: DropDownButton = new DropDownButton(ddbOption);


// Initialize datsource for ListView component.
let dataSource: { [key: string]: Object }[] = [
    { class: 'data', text: 'Syncfusion Document Text (*.sfdt)', id: 'sfdt', category: 'Client side exporting' },
    { class: 'data', text: 'Word Document (*.docx)', id: 'docx', category: 'Client side exporting' },
    { class: 'data', text: 'Word Template (*.dotx)', id: 'dotx', category: 'Client side exporting' },
    { class: 'data', text: 'Plain Text (*.txt)', id: 'text', category: 'Client side exporting' },    
    { class: 'data', text: 'PDF (*.pdf)', id: 'pdf', category: 'Server side exporting' },
    { class: 'data', text: 'HyperText Markup Language (*.html)', id: 'html', category: 'Server side exporting' },
    { class: 'data', text: 'Rich Text Format (*.rtf)', id: 'rtf', category: 'Server side exporting' },
    { class: 'data', text: 'Markdown (*.md)', id: 'md', category: 'Server side exporting' },
    { class: 'data', text: 'OpenDocument Text (*.odt)', id: 'odt', category: 'Server side exporting' }
];

// Initialize ListView component
let listviewInstance: ListView = new ListView({
    dataSource: dataSource,
    // Map the appropriate columns to fields property
    fields: { text: 'text', groupBy: 'category' },
    select: change
});

function initializeExportButton(): void {
    if (listviewInstance && drpDownBtn) {
        if (isDropDownButtonCreated) {
            // Destroy previous instances
            listviewInstance.destroy();
            drpDownBtn.destroy();
        }

        drpDownBtn = new DropDownButton({
            target: '#listview',
            cssClass: 'e-caret-hide',
            created: function () {
                isDropDownButtonCreated = true;
            },
        });

        listviewInstance = new ListView({
            dataSource: dataSource,
            fields: {
                text: 'text',
                groupBy: 'category',
            },
            select: change,
        });

        drpDownBtn.appendTo('#dropdownbtn');
        listviewInstance.appendTo('#listview');
    }
}

function change(args: ListSelectEventArgs) {
    let value: string = (args.data as any).id;
    switch (value) {
        case 'docx':
            (window as any).container.documentEditor.save("Sample", 'Docx');
            break;
        case 'sfdt':
            (window as any).container.documentEditor.save("Sample", 'Sfdt');
            break;
        case 'text':
            (window as any).container.documentEditor.save("Sample", 'Txt');
            break;
        case 'dotx':
            (window as any).container.documentEditor.save("Sample", 'Dotx');
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
    args.item.classList.remove('e-active');
}




let container: DocumentEditorContainer = new DocumentEditorContainer({
    height: "590px",
    toolbarMode: 'Ribbon',
    enableToolbar: true,
    documentEditorSettings: { showRuler: true },
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
    toolbarItems: [
        'New',
        'Open',
        toolItem,
        'Separator',
        'Undo',
        'Redo',
        'Separator',
        'Separator',
        'Image',
        'Table',
        'Hyperlink',
        'Bookmark',
        'TableOfContents',
        'Separator',
        'Header',
        'Footer',
        'PageSetup',
        'PageNumber',
        'Break',
        'Separator',
        'Find',
        'Separator',
        'Comments',
        'TrackChanges',
        'Separator',
        'LocalClipboard',
        'Separator',
        'FormFields',
        'UpdateFields',
    ]
});

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
container.serviceUrl = hostUrl;
DocumentEditorContainer.Inject(Toolbar, Ribbon);
container.appendTo('#container');
(window as any).container = container;

let titleBar: TitleBar = new TitleBar(document.getElementById('documenteditor_titlebar'), container.documentEditor, true);
container.documentEditor.open(JSON.stringify((<any>data)));
container.documentEditor.documentName = 'Getting Started';
titleBar.updateDocumentTitle();

// Add toolbar mode toggle switch
let switchObj: Switch = new Switch({ value: 'Toolbar Mode', checked: true, cssClass: 'buttonSwitch' });
switchObj.appendTo('#toolbarSwitch');
switchObj.change = function (args) {
    if (args.checked) {
        container.toolbarMode = 'Ribbon';
    }
    else {
        container.toolbarMode = 'Toolbar';
        // Reinitialize toolbar export components when switching to toolbar mode
        setTimeout(() => {
            initializeExportButton();
        }, 300);
    }
    titleBar.showButtons(container.toolbarMode !== 'Ribbon');
};
titleBar.showButtons(false);
};
