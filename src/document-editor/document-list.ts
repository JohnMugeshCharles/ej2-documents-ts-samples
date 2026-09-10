import { loadCultureFiles } from '../common/culture-loader';
// tslint:disable-next-line:max-line-length
import { DocumentEditorContainer, Toolbar} from '@syncfusion/ej2-documenteditor';
import { Dialog } from '@syncfusion/ej2-popups';
import { TitleBar } from './title-bar';
import { gridData } from './grid-datasoruce';
import * as Default from './data-default.json';
import * as CharacterFormatting from './data-character-formatting.json';
import * as ParagraphFormatting from './data-paragraph-formatting.json';
import * as Styles from './data-styles.json';
import * as WebLayout from './data-web-layout.json';

(window as any).default = (): void => {
    loadCultureFiles();

    let dialogObj: Dialog= new Dialog({
        width: '90%',
        height: '90%',
        visible: false,
        enableResize: true,
        isModal: true,
        zIndex: 1500,
        position: { X: 'center', Y: 'center' }
      });
    dialogObj.appendTo('#defaultDialog');

    let hostUrl: string = 'https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/';
    let container: DocumentEditorContainer = new DocumentEditorContainer({ height:"90%", serviceUrl:hostUrl, enableToolbar: true , zIndex: 3000 , documentEditorSettings:{ showRuler: true}});
    DocumentEditorContainer.Inject(Toolbar);
    container.appendTo('#container'); 
    let titleBar: TitleBar = new TitleBar(document.getElementById('documenteditor_titlebar'), container.documentEditor, true, false, dialogObj);
    container.documentChange = (): void => {
        titleBar.updateDocumentTitle();
        container.documentEditor.focusIn();
    };

    let commandClick: any = function(args:any){
        let mode = args.mode;
        let currentDocument = args.rowData.FileName;
        container.documentEditor.documentName = currentDocument.replace(".docx", "");
        titleBar.updateDocumentTitle();
        switch (currentDocument) {
            case "Getting Started.docx":
                container.documentEditor.open(JSON.stringify((<any>Default))); break;
            case "Character Formatting.docx":
                container.documentEditor.open(JSON.stringify((<any>CharacterFormatting))); break;
            case "Paragraph Formatting.docx":
                container.documentEditor.open(JSON.stringify((<any>ParagraphFormatting))); break;
            case "Styles.docx":
                container.documentEditor.open(JSON.stringify((<any>Styles))); break;
            case "Web layout.docx":
                container.documentEditor.open(JSON.stringify((<any>WebLayout))); break;
        }
        if(mode === 'View'){
            container.documentEditor.enableContextMenu = false;
            container.documentEditor.isReadOnly = true;
            container.showPropertiesPane = false;
            const share = document.getElementById('documenteditor-share');
            if (share) share.style.display = 'none';
            container.toolbarItems = ['Open', 'Separator', 'Find'];
        } else {
            container.documentEditor.enableContextMenu = true;
            container.documentEditor.isReadOnly = false;
            container.showPropertiesPane = true;
            const share = document.getElementById('documenteditor-share');
            if (share) share.style.display = 'block';
            container.toolbarItems = ['New', 'Open', 'Separator', 'Undo', 'Redo', 'Separator', 'Image', 'Table', 'Hyperlink', 'Bookmark', 'TableOfContents', 'Separator', 'Header', 'Footer', 'PageSetup', 'PageNumber', 'Break', 'InsertFootnote', 'InsertEndnote', 'Separator', 'Find', 'Separator', 'Comments', 'TrackChanges', 'Separator', 'LocalClipboard', 'RestrictEditing', 'Separator', 'FormFields', 'UpdateFields'];
        }
        dialogObj.show();
    };

    function createTableHeader() {
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        const headerCells: string[] = ['File Name', 'Author', 'Actions'];
        headerCells.forEach((headerText) => {
            const th = document.createElement('th');
            th.setAttribute('scope', 'col');
            th.textContent = headerText;
            if (headerText === 'Actions') {
                th.classList.add('e-de-table-actions-header');
            }
            tr.appendChild(th);
        });
        thead.appendChild(tr);
        return thead;
    }

    function createIconSpan(iconClass: any) {
        const span = document.createElement('span');
        span.className = 'e-icons ' + iconClass + ' e-flat';
        if (iconClass.includes('e-eye')) {
            span.classList.add('e-de-view-icon');
        } else if (iconClass.includes('e-edit')) {
            span.classList.add('e-de-edit-icon');
        }
        return span;
    }

    function renderBootstrapTable(): void {
        const gridContainer = document.querySelector('#Grid');
        const tplScript = document.getElementById('fileNameTemplate') as HTMLScriptElement;
        const tplHtml = tplScript ? tplScript.innerHTML.trim() : '';
        let tplNode: HTMLElement | undefined;
        if (tplHtml) {
            const tmp = document.createElement('div');
            tmp.innerHTML = tplHtml;
            tplNode = tmp.firstElementChild as HTMLElement;
        }

        const table = document.createElement('table');
        table.className = 'table table-hover table-borderless align-middle';
        table.appendChild(createTableHeader());
        const tbody = document.createElement('tbody');

        gridData.forEach((row: any) => {
            const tr = document.createElement('tr');

            // File name cell (with template)
            const fileNameTd = document.createElement('td');
            if (tplNode) {
                const clone = tplNode.cloneNode(true) as HTMLElement;
                const span = clone.querySelector('span');
                if (span) { span.textContent = row.FileName; }
                fileNameTd.appendChild(clone);
            } else {
                fileNameTd.textContent = row.FileName;
            }
            tr.appendChild(fileNameTd);

            // Author cell
            const authorTd = document.createElement('td');
            authorTd.textContent = row.Author;
            authorTd.classList.add('e-de-table-author-cell');
            tr.appendChild(authorTd);

            // Actions cell
            const actionTd = document.createElement('td');
            actionTd.classList.add('e-de-table-actions-cell');

            const viewBtn = document.createElement('button');
            viewBtn.type = 'button';
            viewBtn.className = 'btn btn-sm btn-link text-secondary p-2 e-de-view-btn';
            viewBtn.title = 'View';
            viewBtn.appendChild(createIconSpan('e-eye'));
            viewBtn.addEventListener('click', () => {
                commandClick({ mode: 'View', rowData: row });
            });

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'btn btn-sm btn-link text-secondary p-2 e-de-edit-btn';
            editBtn.title = 'Edit';
            editBtn.appendChild(createIconSpan('e-edit'));
            editBtn.addEventListener('click', () => {
                commandClick({ mode: 'Edit', rowData: row });
            });

            actionTd.appendChild(viewBtn);
            actionTd.appendChild(editBtn);
            tr.appendChild(actionTd);
            tbody.appendChild(tr);
        });

        table.appendChild(tbody);
        (gridContainer as HTMLElement).innerHTML = '';
        (gridContainer as HTMLElement).appendChild(table);
    }

    function destroyed() {
        container.destroy();
        dialogObj.destroy();
    }

    // Initial render
    renderBootstrapTable();

    // cleanup on unload
    window.addEventListener('beforeunload', destroyed, { once: true });
};
