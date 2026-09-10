import { loadCultureFiles } from '../common/culture-loader';
import { DocumentEditorContainer, Ribbon, Toolbar } from '@syncfusion/ej2-documenteditor';
import { CheckBox } from '@syncfusion/ej2-buttons';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import { TitleBar } from './title-bar';
import * as data from './data-spellcheck-functionalities.json';
import { Switch } from '@syncfusion/ej2-buttons';
import {
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
    let container: DocumentEditorContainer = new DocumentEditorContainer({
        serviceUrl: hostUrl, enableToolbar: true, toolbarMode: 'Ribbon', enableSpellCheck: true, height: '590px', documentEditorSettings: { showRuler: true, colorPickerSettings: { mode: 'Palette', modeSwitcher: true, showButtons: true } },
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
    let titleBar: TitleBar = new TitleBar(document.getElementById('documenteditor_titlebar'), container.documentEditor, true);
    container.documentEditor.open(JSON.stringify((<any>data).englishSfdt));
    container.documentEditor.documentName = 'Spell Checking';
    titleBar.updateDocumentTitle();
    container.documentChange = (): void => {
        titleBar.updateDocumentTitle();
        container.documentEditor.focusIn();
    };

    let switchObj: Switch = new Switch({ value: 'Toolbar Mode', checked: true, cssClass: 'buttonSwitch' });
    switchObj.appendTo('#toolbarSwitch');
    switchObj.change = function (args) {
        if (args.checked) {
            container.toolbarMode = 'Ribbon';
        }
        else {
            container.toolbarMode = 'Toolbar';
        }
        titleBar.showButtons(container.toolbarMode !== 'Ribbon');
    }
    titleBar.showButtons(false);

    let languageID = 1033;
    //Accessing spell checker.
    let spellChecker = container.documentEditor.spellChecker;
    //Set language id to map dictionary in server side.;
    spellChecker.languageID = languageID;
    spellChecker.removeUnderline = false;
    //Allow suggetion for miss spelled word/
    spellChecker.allowSpellCheckAndSuggestion = true;

    // Create language dropdown (two values: "1033" and "1034") and wire select event
    let languageData = [
    { text: 'English', value: 1033 },
    { text: 'Spanish', value: 1034 },
    ];

    let languageDropDown = new DropDownList({
    dataSource: languageData,
    fields: { text: 'text', value: 'value' },
    value: languageData.filter((lang) => lang.value === languageID)[0].value,
    index: languageData.indexOf(
        languageData.filter((lang) => lang.value === languageID)[0]
    ),
    placeholder: 'Select language',
    select: function (args) {
        let selected = (args.itemData).value;
        spellChecker.languageID = languageID = parseInt(selected, 10);
        let langData: string;
        if (container.documentEditor.spellChecker.languageID === 1033) {
            langData = JSON.stringify((<any>data).englishSfdt);
            } else {
            langData = JSON.stringify((<any>data).spanishSfdt);
            }
            container.documentEditor.open(langData);
        },
    });
    languageDropDown.appendTo('#languageDropdown');

    //unchecked state.
    let removeUnderlineCheckbox = new CheckBox({
    label: 'Show Underline',
    checked: !container.documentEditor.spellChecker.removeUnderline,
    change: (args) => {
        container.documentEditor.spellChecker.removeUnderline = !args.checked;
    },
    });
    removeUnderlineCheckbox.appendTo('#checkbox2');

    let suggestioncheckbox = new CheckBox({
    label: 'Show Suggestions',
    checked: true,
    change: (args) => {
        container.documentEditor.spellChecker.allowSpellCheckAndSuggestion =
        args.checked;
    },
    });

    // Render initialized CheckBox.
    suggestioncheckbox.appendTo('#checkbox3');

    //checked state.
    let enableSpellCheckerCheckbox = new CheckBox({
    label: 'Enable Spelling',
    checked: container.documentEditor.spellChecker.enableSpellCheck,
    change: (args) => {
        container.documentEditor.spellChecker.enableSpellCheck = args.checked;
        suggestioncheckbox.disabled =
        removeUnderlineCheckbox.disabled =
            !args.checked;
    },
    });
    enableSpellCheckerCheckbox.appendTo('#checkbox1');

    container.documentEditor.selectionChange = () => {
        if (spellChecker.enableSpellCheck !== enableSpellCheckerCheckbox.checked) {
            enableSpellCheckerCheckbox.checked = spellChecker.enableSpellCheck;
            suggestioncheckbox.disabled =
            removeUnderlineCheckbox.disabled =
                !enableSpellCheckerCheckbox.checked;
        }
        if (spellChecker.removeUnderline === removeUnderlineCheckbox.checked) {
            removeUnderlineCheckbox.checked = !spellChecker.removeUnderline;
        }
    };
};