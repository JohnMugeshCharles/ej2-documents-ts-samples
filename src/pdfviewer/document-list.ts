import { loadCultureFiles } from '../common/culture-loader';
import { PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView,
ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner, PageOrganizer } from '@syncfusion/ej2-pdfviewer';
// tslint:disable-next-line:max-line-length
import { data } from './document-list-data';
import { Dialog } from '@syncfusion/ej2-popups';

PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView, ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner, PageOrganizer);

(window as any).default = (): void => {
    loadCultureFiles();
    let dialogObj: Dialog;
    let viewer: PdfViewer = new PdfViewer();
    renderdialog();
    renderPDFViewer();
    renderBootstrapTable();
    var mode:any;
    var SAMPLE_ROUTE = '/pdfviewer/document-list.html';
    function documentLoaded(){
        if (mode === 'View') {
            viewer.enablePageOrganizer = false;
        }
        else {
            viewer.enablePageOrganizer = true;
        }
    }
    let commandClick: any = function(args:any){
      mode = args.mode;
      var documentPath = args.Document;
      dialogObj.header = args.FileName;
      if(mode === 'View'){
          viewer.enableStickyNotesAnnotation=false;
          viewer.enableAnnotationToolbar = false;
          viewer.isFormDesignerToolbarVisible = false;
          viewer.toolbarSettings = { showTooltip : true, toolbarItems: ['OpenOption', 'PageNavigationTool', 'MagnificationTool', 'PanTool', 'PrintOption']};
          viewer.annotationSettings = {  
              isLock:true, author: 'Guest',      
          };
          viewer.textFieldSettings = {        
              isReadOnly: true,
          };
          viewer.radioButtonFieldSettings = {
              isReadOnly: true,
          };
          viewer.DropdownFieldSettings = {        
              isReadOnly: true,        
          };
          viewer.checkBoxFieldSettings = {         
              isReadOnly: true,         
          };
          viewer.signatureFieldSettings = {
              isReadOnly: true,
          };
          viewer.initialFieldSettings = {
            isReadOnly: true,
          };
          viewer.listBoxFieldSettings = {
            isReadOnly: true,
          };
          viewer.passwordFieldSettings = {
            isReadOnly: true,
          };
          viewer.contextMenuOption = 'None';
      } else {
          viewer.enableStickyNotesAnnotation = true;
          viewer.enableAnnotationToolbar = true;
          viewer.toolbarSettings = {
              showTooltip: true,
              toolbarItems: ['OpenOption', 'UndoRedoTool', 'PageNavigationTool', 'MagnificationTool',
                  'PanTool', 'SelectionTool', 'CommentTool', 'SubmitForm', 'AnnotationEditTool',
                  'FormDesignerEditTool', 'SearchOption', 'PrintOption', 'DownloadOption'],
              annotationToolbarItems: ['HighlightTool', 'UnderlineTool', 'StrikethroughTool', 'SquigglyTool',
                  'ColorEditTool', 'OpacityEditTool', 'AnnotationDeleteTool', 'StampAnnotationTool',
                  'HandWrittenSignatureTool', 'InkAnnotationTool', 'InkEraserTool', 'ShapeTool', 'CalibrateTool',
                  'StrokeColorEditTool', 'ThicknessEditTool', 'FreeTextAnnotationTool', 'FontFamilyAnnotationTool',
                  'FontSizeAnnotationTool', 'FontStylesAnnotationTool', 'FontAlignAnnotationTool',
                  'FontColorAnnotationTool', 'CommentPanelTool'],
              formDesignerToolbarItems: ['TextboxTool', 'PasswordTool', 'CheckBoxTool',
                  'RadioButtonTool', 'DropdownTool', 'ListboxTool', 'DrawSignatureTool', 'DeleteTool']
          };
          viewer.annotationSettings = {  
              isLock:false, author: 'Guest',      
          };
          viewer.textFieldSettings = {        
              isReadOnly: false,
          };
          viewer.radioButtonFieldSettings = {
              isReadOnly: false,
          };
          viewer.DropdownFieldSettings = {        
              isReadOnly: false,        
          };
          viewer.checkBoxFieldSettings = {         
              isReadOnly: false,         
          };
          viewer.signatureFieldSettings = {
              isReadOnly: false,
          };
          viewer.initialFieldSettings = {
            isReadOnly: false,
          };
          viewer.listBoxFieldSettings = {
            isReadOnly: false,
          };
          viewer.passwordFieldSettings = {
            isReadOnly: false,
          };
          viewer.contextMenuOption = 'RightClick';
      }
      dialogObj.show();
      viewer.dataBind();
      viewer.load(documentPath ,null);
    };
    function createTableHeader() {
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        
        const headerCells: string[] = ['File Name', 'Author', 'Actions'];
        headerCells.forEach(function(headerText) {
            const th = document.createElement('th');
            th.setAttribute('scope', 'col');
            th.textContent = headerText;
            if (headerText === 'Actions') {
                th.classList.add('e-pv-table-actions-header');
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
            span.classList.add('e-pv-view-icon');
        } else if (iconClass.includes('e-edit')) {
            span.classList.add('e-pv-edit-icon');
        }
        return span;
    }
    function renderBootstrapTable(): void {
        const gridContainer = document.querySelector('#Grid');
        const tplScript = document.getElementById('fileNameTemplate') as HTMLScriptElement;
        const tplHtml = tplScript ? tplScript.innerHTML.trim() : '';
        let tplNode: HTMLElement;
        if (tplHtml) {
            const tmp = document.createElement('div');
            tmp.innerHTML = tplHtml;
            tplNode = tmp.firstElementChild as HTMLElement;
        }
        const table = document.createElement('table');
        table.className = 'table table-hover table-borderless align-middle';
        table.appendChild(createTableHeader());
        const tbody = document.createElement('tbody');
        data.forEach((row: any) => {
            const tr = document.createElement('tr');
            const fileNameTd = document.createElement('td');
            if (tplNode) {
                const clone = tplNode.cloneNode(true) as HTMLElement;
                const span = clone.querySelector('span');
                if (span) span.textContent = row.FileName;
                fileNameTd.appendChild(clone);
            } else {
                fileNameTd.textContent = row.FileName;
            }
            tr.appendChild(fileNameTd);
            const authorTd = document.createElement('td');
            authorTd.textContent = row.Author;
            authorTd.classList.add('e-pv-table-author-cell');
            tr.appendChild(authorTd);
            const actionTd = document.createElement('td');
            actionTd.classList.add('e-pv-table-actions-cell');
            const viewBtn = document.createElement('button');
            viewBtn.type = 'button';
            viewBtn.className = 'btn btn-sm btn-link text-secondary p-2 e-pv-view-btn';
            viewBtn.title = 'View';
            viewBtn.appendChild(createIconSpan('e-eye'));
            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'btn btn-sm btn-link text-secondary p-2 e-pv-edit-btn';
            editBtn.title = 'Edit';
            editBtn.appendChild(createIconSpan('e-edit'));
            viewBtn.addEventListener('click', () => {
                commandClick({
                    mode: 'View',
                    Document: row.Document,
                    FileName: row.FileName,
                    rowData: row
                });
            });
            editBtn.addEventListener('click', () => {
                commandClick({
                    mode: 'Edit',
                    Document: row.Document,
                    FileName: row.FileName,
                    rowData: row
                });
            });
            actionTd.appendChild(viewBtn);
            actionTd.appendChild(editBtn);
            tr.appendChild(actionTd);
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);
        (gridContainer as HTMLElement).innerHTML = '';
        gridContainer.appendChild(table);
    }

    function renderdialog(): void {
      dialogObj = new Dialog({
        header: '',
        animationSettings: { effect: 'None' },
        showCloseIcon: true,
        width: '90%',
        height: '90%',
        minHeight: '90%',
        visible: false,
        isModal: true,
        enableResize: true,
        position: { X: 'center', Y: 'center' }
      });
      dialogObj.appendTo('#defaultDialog');
    }

    function renderPDFViewer(): void {
      viewer.documentPath = "";
      viewer.resourceUrl = 'https://cdn.syncfusion.com/ej2/23.2.6/dist/ej2-pdfviewer-lib';
      viewer.documentLoad = documentLoaded;
      viewer.height ="775px";
      viewer.appendTo('#pdfViewer');
    }
    function onBeforeUnload() { destroyed(); }
    function onHashChange() {
        if (window.location.hash.indexOf(SAMPLE_ROUTE) !== -1) {
            return;
        }
        destroyed();
    }
 
    function destroyed() {
        if (viewer) {
            viewer.destroy();
            viewer = null;
        }
        if (dialogObj) {
            dialogObj.destroy();
            dialogObj = null;
        }
        window.removeEventListener('beforeunload', onBeforeUnload);
        window.removeEventListener('hashchange', onHashChange);
    }
    window.addEventListener('beforeunload', onBeforeUnload, { once: true });
    window.addEventListener('hashchange', onHashChange);
};
