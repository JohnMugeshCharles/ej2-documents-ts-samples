import { loadCultureFiles } from '../common/culture-loader';
import { DocumentEditorContainer, Toolbar, CommentDeleteEventArgs, Ribbon } from '@syncfusion/ej2-documenteditor';
import { TitleBar } from './title-bar';
import * as data from './data-comments.json';
import {
    DialogUtility,
    createSpinner,
    showSpinner,
    hideSpinner,
} from '@syncfusion/ej2-popups';


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
    let hostUrl: string = 'https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/';
    let mentionData: any = [
        { "Name": "Selma Rose", "Eimg": "3", "EmailId": "selma@mycompany.com" },
        { "Name": "Russo Kay", "Eimg": "8", "EmailId": "russo@mycompany.com" },
        { "Name": "Camden Kate", "Eimg": "9", "EmailId": "camden@mycompany.com" },
        { "Name": "Mary Kate", "Eimg": "4", "EmailId": "marry@mycompany.com" },
        { "Name": "Ursula Ann", "Eimg": "2", "EmailId": "ursula@mycompany.com" },
        { "Name": "Margaret", "Eimg": "5", "EmailId": "margaret@mycompany.com" },
        { "Name": "Laura Grace", "Eimg": "6", "EmailId": "laura@mycompany.com" },
        { "Name": "Robert", "Eimg": "8", "EmailId": "robert@mycompany.com" },
        { "Name": "Albert", "Eimg": "9", "EmailId": "albert@mycompany.com" },
        { "Name": "Michale", "Eimg": "10", "EmailId": "michale@mycompany.com" },
        { "Name": "Andrew James", "Eimg": "7", "EmailId": "james@mycompany.com" },
        { "Name": "Rosalie", "Eimg": "4", "EmailId": "rosalie@mycompany.com" },
        { "Name": "Stella Ruth", "Eimg": "2", "EmailId": "stella@mycompany.com" },
        { "Name": "Richard Rose", "Eimg": "10", "EmailId": "richard@mycompany.com" },
        { "Name": "Gabrielle", "Eimg": "3", "EmailId": "gabrielle@mycompany.com" },
        { "Name": "Thomas", "Eimg": "7", "EmailId": "thomas@mycompany.com" },
        { "Name": "Charles Danny", "Eimg": "8", "EmailId": "charles@mycompany.com" },
        { "Name": "Daniel", "Eimg": "10", "EmailId": "daniel@mycompany.com" },
        { "Name": "Matthew", "Eimg": "7", "EmailId": "matthew@mycompany.com" },
        { "Name": "Donald Krish", "Eimg": "9", "EmailId": "donald@mycompany.com" },
        { "Name": "Yohana", "Eimg": "1", "EmailId": "yohana@mycompany.com" },
        { "Name": "Kevin Paul", "Eimg": "10", "EmailId": "kevin@mycompany.com" },
        { "Name": "Andrew Fuller", "Eimg": "3", "EmailId": "andrew@mycompany.com" }
    ];
    let container: DocumentEditorContainer = new DocumentEditorContainer({
        serviceUrl: hostUrl,
        enableToolbar: true, toolbarMode: 'Ribbon', showPropertiesPane: false,
        height: '590px', documentEditorSettings: { showRuler: true, commentSettings: { highlightCommentsByAuthor : true }, mentionSettings: { dataSource: mentionData, fields: { text: 'Name' } } },
        userColor: '#b70f34', commentDelete: commentDelete,
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
    DocumentEditorContainer.Inject(Toolbar, Ribbon);
    container.appendTo('#container');
    (window as any).container = container;
    container.documentEditor.currentUser = 'Nancy Davolio';
    let titleBar: TitleBar = new TitleBar(document.getElementById('documenteditor_titlebar'), container.documentEditor, true);
    container.documentEditor.open(JSON.stringify((<any>data)));
    container.documentEditor.documentName = 'Comments';
    container.documentEditor.showComments = true;
    titleBar.updateDocumentTitle();
    container.documentChange = (): void => {
        titleBar.updateDocumentTitle();
        container.documentEditor.focusIn();
    };

    function commentDelete(args: CommentDeleteEventArgs): void {
        if (args.author !== container.documentEditor.currentUser) {
            args.cancel = true;
            DialogUtility.alert({
                title: 'Information',
                content: 'Delete restriction enabled. Only the author of the comment can delete it.',
                showCloseIcon: true,
                closeOnEscape: true,
            });
        }
    }
    titleBar.initializeRibbonSwitch(container);
    titleBar.showButtons(false);
};

