import { loadCultureFiles } from '../common/culture-loader';
import { DocumentEditorContainer, Ribbon, Toolbar } from '@syncfusion/ej2-documenteditor';
import { TitleBar } from './title-bar';
import * as data from './data-web-layout.json';
import { Button } from '@syncfusion/ej2-buttons';
import {
    createSpinner,
    showSpinner,
    hideSpinner,
} from '@syncfusion/ej2-popups';

/**
 * Content navigation document editor sample
 */

interface Finding {
    bookmark: string;
    pageNumber: number;
    preview: string;
}

const PARAGRAPHS: { [key: string]: string }[] = [
    {
        bookmark: 'Para_Bookmark_1',
        text: 'The giant panda, which only lives in China outside of captivity, has captured the hearts of people of all ages across the globe.'
    },
    {
        bookmark: 'Para_Bookmark_2',
        text: 'DNA analysis has put one mystery to rest. It has revealed that while the red panda is a distant relation, '
            + 'the giant panda\'s closest relative is the spectacled bear from South America.'
    },
    {
        bookmark: 'Para_Bookmark_3',
        text: 'Researchers have recently discovered that the gene responsible for tasting savory or umami flavors, '
            + 'such as meat, is inactive in giant pandas.'
    }
];

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

    let container: DocumentEditorContainer = new DocumentEditorContainer({
        serviceUrl: hostUrl,
        toolbarMode: 'Ribbon',
        enableToolbar: true,
        height: '590px',
        showPropertiesPane: false,
        documentEditorSettings: { showRuler: true, showNavigationPane: false },
        toolbarItems: [
            'Undo',
            'Redo',
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
            'UpdateFields'
        ],
        fileMenuItems: [
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

    let titleBar: TitleBar = new TitleBar(document.getElementById('documenteditor_titlebar'), container.documentEditor, true);
    container.documentEditor.open(JSON.stringify((<any>data)));
    container.documentEditor.documentName = 'Content Navigation';
    titleBar.updateDocumentTitle();

    container.documentChange = (): void => {
        titleBar.updateDocumentTitle();
        container.documentEditor.focusIn();
    };
    titleBar.initializeRibbonSwitch(container);
    titleBar.showButtons(false);

    let findings: Finding[] = [];
    let activeIndex: number = 0;

    let getPreview = (text: string): string => {
        return text.split(' ').slice(0, 8).join(' ') + '...';
    };

    let createBookmarks = (): void => {
        let editor: any = container.documentEditor;
        if (!editor) {
            return;
        }
        let findingsData: Finding[] = [];
        for (let i: number = 0; i < PARAGRAPHS.length; i++) {
            editor.search.findAll(PARAGRAPHS[i].text);
            let results: any = editor.search.searchResults;
            if (results.length > 0) {
                editor.search.searchResults.index = 0;
                let pageNumber: number = editor.selection.startPage;
                editor.selection.characterFormat.highlightColor = 'Yellow';
                editor.editor.insertBookmark(PARAGRAPHS[i].bookmark);
                findingsData.push({
                    bookmark: PARAGRAPHS[i].bookmark,
                    pageNumber: pageNumber,
                    preview: getPreview(PARAGRAPHS[i].text)
                });
            }
            results.clear();
        }
        editor.selection.moveToDocumentStart();
        findings = findingsData;
        renderFindings();
        editor.isReadOnly = true;
    };

    let navigateToBookmark = (bookmark: string, index: number): void => {
        let editor: any = container.documentEditor;
        if (!editor) {
            return;
        }
        editor.selection.selectBookmark(bookmark);
        activeIndex = index;
        renderFindings();
    };

    let nextHighlight = (): void => {
        if (findings.length === 0) {
            return;
        }
        let nextIndex: number = (activeIndex + 1) % findings.length;
        navigateToBookmark(findings[nextIndex].bookmark, nextIndex);
    };

    let renderFindings = (): void => {
        let findingsPanel: HTMLElement = document.getElementById('findings-list');
        if (!findingsPanel) {
            return;
        }
        findingsPanel.innerHTML = '';
        let hitsLabel: HTMLElement = document.getElementById('hits-count');
        if (hitsLabel) {
            hitsLabel.innerHTML = '<b>' + findings.length + ' hits</b>';
        }
        for (let i: number = 0; i < findings.length; i++) {
            let card: HTMLElement = document.createElement('div');
            card.className = 'finding-card' + (activeIndex === i ? ' active' : '');
            card.setAttribute('title', 'Navigate to this finding');
            let pageNumberElement: HTMLElement = document.createElement('div');
            pageNumberElement.className = 'result-page';
            pageNumberElement.innerHTML = 'Page ' + findings[i].pageNumber;
            let previewElement: HTMLElement = document.createElement('div');
            previewElement.className = 'result-highlight';
            previewElement.innerHTML = findings[i].preview;
            card.appendChild(pageNumberElement);
            card.appendChild(previewElement);
            card.addEventListener('click', (): void => {
                navigateToBookmark(findings[i].bookmark, i);
            });
            findingsPanel.appendChild(card);
        }
    };

    // Create bookmarks once the document is opened and laid out.
    setTimeout((): void => { createBookmarks(); }, 500);

    let nextButton: Button = new Button({});
    nextButton.appendTo('#nextHighlight');
    nextButton.element.addEventListener('click', nextHighlight);
};
