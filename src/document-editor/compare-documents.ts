import { loadCultureFiles } from '../common/culture-loader';
import { DocumentEditorContainer, Toolbar, DocumentEditor } from '@syncfusion/ej2-documenteditor';
import { Button } from '@syncfusion/ej2-buttons';
import * as data from './data-compare-documents.json';
/**
 * Document Comparison sample
 */
(window as any).default = (): void => {
    loadCultureFiles();
    let serviceUrl: string = 'https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/';
    // Load necessary modules
    DocumentEditorContainer.Inject(Toolbar);
    
    // Document editor container references
    let editorContainer1: DocumentEditorContainer;
    let editorContainer2: DocumentEditorContainer;

    // Track files and state
    let originalFile: File | null = null;
    let revisedFile: File | null = null;
    let showResult: boolean = true;
    let compareClicked: boolean = false;
    let showRevisions: boolean = false;

    // Initialize the UI components after the DOM is fully loaded
    createDocumentEditors();
    attachEventListeners();

    function createDocumentEditors(): void {
        // Create the first document editor
        editorContainer1 = new DocumentEditorContainer({
            serviceUrl: serviceUrl,
            enableToolbar: false,
            showPropertiesPane: false,
            height: '550px',
            width: '100%'
        });
        editorContainer1.appendTo('#editorContainer1');

        // Create the second document editor
        editorContainer2 = new DocumentEditorContainer({
            serviceUrl: serviceUrl,
            enableToolbar: false,
            showPropertiesPane: false,
            height: '550px',
            width: '100%'
        });
        editorContainer2.appendTo('#editorContainer2');

        editorContainer1.documentEditor.open(JSON.stringify((<any>data).originalDocument));
        editorContainer2.documentEditor.showRevisions = false;
        editorContainer2.documentEditor.open(JSON.stringify((<any>data).revisedDocument));

        // Sync scroll between editors
        editorContainer1.documentEditor.viewChange = () => {
            const pos = editorContainer1.documentEditor.selection.getScrollPosition();
            editorContainer2.documentEditor.selection.setScrollPosition(pos);
        };

        editorContainer2.documentEditor.viewChange = () => {
            const pos = editorContainer2.documentEditor.selection.getScrollPosition();
            editorContainer1.documentEditor.selection.setScrollPosition(pos);
        };
    }

    function attachEventListeners(): void {
        // Get file input elements
        const originalFileInput = document.getElementById('originalFileInput') as HTMLInputElement;
        const revisedFileInput = document.getElementById('revisedFileInput') as HTMLInputElement;
        const showResultCheckbox = document.getElementById('showResultCheckbox') as HTMLInputElement;
        const removeOriginalFileSpan = document.getElementById('removeOriginalFile') as HTMLElement;
        const removeRevisedFileSpan = document.getElementById('removeRevisedFile') as HTMLElement;

        // Add event listners for clicking the remove icon for file names.
        removeOriginalFileSpan.addEventListener('click', (e: Event) =>{
            originalFile = null;
            compareClicked = false;
            updateButtonStates();
            setOringialFileName();
        });

        removeRevisedFileSpan.addEventListener('click', (e: Event) =>{
            revisedFile = null;
            compareClicked = false;
            updateButtonStates();
            setRevisedFileName();
        });
        
        // Add event listeners for file inputs
        originalFileInput.addEventListener('change', (e: Event) => {
            const input = e.target as HTMLInputElement;
            originalFile = input.files ? input.files[0] : null;
            compareClicked = false;
            updateButtonStates();
            setOringialFileName();
        });
        
        revisedFileInput.addEventListener('change', (e: Event) => {
            const input = e.target as HTMLInputElement;
            revisedFile = input.files ? input.files[0] : null;
            compareClicked = false;
            updateButtonStates();
            setRevisedFileName();
        });
        
        // Show result checkbox listener
        showResultCheckbox.addEventListener('change', (e: Event) => {
            const input = e.target as HTMLInputElement;
            showResult = input.checked;
            updateRightEditorTitle();
        });

        // Compare button
        const compareButton = new Button({
            cssClass: 'e-primary',
            disabled: true
        });
        compareButton.appendTo('#compareButton');

        // Download button
        const downloadButton = new Button({
            cssClass: 'e-outline e-flat e-primary',
            iconCss: 'e-icons e-download',
            disabled: true
        });
        downloadButton.appendTo('#downloadButton');

        const showRevisionsButton = new Button({
            iconCss: 'e-icons e-eye'
        });
        showRevisionsButton.appendTo('#showRevisionsButton');

        // Compare button click handler
        document.getElementById('compareButton')?.addEventListener('click', async () => {
            if (!originalFile || !revisedFile) return;

            var orginalFileFormatType = originalFile.name.slice(originalFile.name.lastIndexOf('.')).toLowerCase();
            var revisedFileFormatType = revisedFile.name.slice(revisedFile.name.lastIndexOf('.')).toLowerCase();
            if(isSupportedFormatType(orginalFileFormatType) && isSupportedFormatType(revisedFileFormatType)){

                compareClicked = true;
                showRevisions = false;
                showRevisionsButton.content = 'Show Review Pane';
                downloadButton.disabled = false;
                showHideWaitingIndicator(true);

                if (showResult) {
                    await openFileInEditor(originalFile, editorContainer1.documentEditor);
                    await loadComparedDocumentAndOpen(editorContainer2.documentEditor, originalFile, revisedFile);
                } else {
                    await openFileInEditor(originalFile, editorContainer1.documentEditor);
                    await openFileInEditor(revisedFile, editorContainer2.documentEditor);
                }

                updateRightEditorTitle();
                showHideWaitingIndicator(false);
            }
            else{
                alert('Unsupported file type is selected. Please use either .docx or .sfdt file.');
                compareButton.disabled = true;
                downloadButton.disabled = true;
            }
        });

        // Download button click handler
        document.getElementById('downloadButton')?.addEventListener('click', () => {
            if (editorContainer2.documentEditor) {
                editorContainer2.documentEditor.save('Result', 'Docx');
            }
        });

        document.getElementById('showRevisionsButton')?.addEventListener('click', () => {
            const editor2 = editorContainer2.documentEditor;
            if (editor2) {
                showRevisions = !showRevisions;
                editor2.showRevisions = showRevisions;
                showRevisionsButton.content = showRevisions ? 'Hide Review Pane' : 'Show Review Pane';
            }
        });
    }

    function updateButtonStates(): void {
        const compareButtonObj = (document.getElementById('compareButton') as any).ej2_instances[0];
        if (compareButtonObj) {
            compareButtonObj.disabled = !(originalFile && revisedFile);
        }

        const downloadButtonObj = (document.getElementById('downloadButton') as any).ej2_instances[0];
        if (downloadButtonObj) {
            downloadButtonObj.disabled = !compareClicked;
        }
    }

    function isSupportedFormatType(formatType: string): boolean {
        switch (formatType) {
            case '.docx':
            case '.sfdt':
                return true;
            default:
                return false;
        }
    }

    async function openFileInEditor(file: File, editor: DocumentEditor): Promise<void> {
        const formatType = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
        if (formatType === '.sfdt') {
            const content = await readFileAsText(file);
            editor.showRevisions = false;
            editor.open(content);
        }
        else if (isSupportedFormatType(formatType)) {
            try {
                const formData = new FormData();
                formData.append('file', file);
                const response = await fetch(serviceUrl + 'Import', {
                    method: 'POST',
                    body: formData
                });

                const sfdtString = await response.text();
                let sfdtObject: any = null;
                try {
                    sfdtObject = JSON.parse(sfdtString);
                } catch (e) {
                    alert("Failed to process the compared document due to no valid JSON. Please try again.");
                }
                if (sfdtObject) {
                    editor.showRevisions = false;
                    editor.open(JSON.stringify(sfdtObject));
                } else {
                    alert("Unable to display the compared document. Please try again.");
                }
            } catch (e) {
                alert('This Compare Documents demo supports only DOCX and SFDT file formats. Please select a valid DOCX or SFDT document and try again.');
            }
        } else {
            alert('Unsupported file type. Please use .docx, or .sfdt file.');
        }
    }

    async function loadComparedDocumentAndOpen(editor: DocumentEditor, originalFile: File, revisedFile: File): Promise<void> {
        const formData = new FormData();
        formData.append("originalFile", originalFile);
        formData.append("revisedFile", revisedFile);
        formData.append("author", "Author");
        formData.append("dateTime", new Date().toISOString());
        try {
            const response = await fetch(serviceUrl + 'CompareDocuments', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                alert("Failed to compare the selected documents. Please try again."); 
                return;
            }

            const sfdtString = await response.text();
            try {
                const sfdtObject = JSON.parse(sfdtString);
                editor.showRevisions = false;
                editor.open(sfdtObject);
            } catch (e) {
                alert("The comparison could not be completed due to no valid JSON. Please try again.");
            }
        } catch (e) {
            alert('Error during document comparison.');
        }
    }

    function readFileAsText(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = event => {
                resolve(event.target?.result as string);
            };
            reader.onerror = error => reject(error);
            reader.readAsText(file);
        });
    }

    function showHideWaitingIndicator(show: boolean): void {
        let waitingPopUp: HTMLElement | null = document.getElementById('waiting-popup');
        let inActiveDiv: HTMLElement | null = document.getElementById('popup-overlay');
        if (waitingPopUp && inActiveDiv){
            inActiveDiv.style.display = show ? 'block' : 'none';
            waitingPopUp.style.display = show ? 'block' : 'none';
        }
    }

    function updateRightEditorTitle(): void {
        const titleElement = document.getElementById('rightEditorTitle');
        if (titleElement) {
            titleElement.textContent = showResult ?
                'Result Document (with tracked changes)' :
                'Revised Document';
        }
        const showRevisionsElement = document.getElementById('showRevisionsButton');
        if(showRevisionsElement){
            showRevisionsElement.style.display = showResult ? 'block' : 'none';
        }
    }

    function setOringialFileName(): void {
        const originalFileNameElement = document.getElementById('originalFileName');
        if(originalFileNameElement)
        {
            if (originalFile) {
                const size = Math.round(originalFile.size / 1024);
                const originalFileName = `${originalFile.name} (${size} KB)`;
                originalFileNameElement.textContent = originalFileName;                
            }
            else {
                originalFileNameElement.textContent = "Supported formats: SFDT, DOCX";
            }
        }
    }

   function setRevisedFileName(): void {
        const revisedFileNameElement = document.getElementById('revisedFileName');
        if(revisedFileNameElement)
        {
            if (revisedFile) {
                const size = Math.round(revisedFile.size / 1024);
                const revisedFileName = `${revisedFile.name} (${size} KB)`;
                revisedFileNameElement.textContent = revisedFileName;            
            }
            else {
                revisedFileNameElement.textContent = "Supported formats: SFDT, DOCX";
            }
        }
    }
};