import { loadCultureFiles } from '../common/culture-loader';
import { Button } from '@syncfusion/ej2-buttons';
import { SelectedEventArgs, Uploader } from '@syncfusion/ej2-inputs';
import { PdfComparer, TextComparisonOptions } from '@syncfusion/ej2-pdfviewer';

const DEFAULT_ORIGINAL_DOC: string = 'https://cdn.syncfusion.com/content/pdf/original-document.pdf';
const DEFAULT_MODIFIED_DOC: string = 'https://cdn.syncfusion.com/content/pdf/modified-document.pdf';
const RESOURCE_URL: string = 'https://cdn.syncfusion.com/ej2/34.2.4/dist/ej2-pdfviewer-lib';

(window as any).default = (): void => {
    loadCultureFiles();

    let originalFile: File | null = null;
    let modifiedFile: File | null = null;
    let originalFilePath: string = DEFAULT_ORIGINAL_DOC;
    let modifiedFilePath: string = DEFAULT_MODIFIED_DOC;
    let pdfComparer: PdfComparer | null = null;
    let originalUploader: Uploader;
    let modifiedUploader: Uploader;
    let compareButton: Button;

    const originalFileName = document.getElementById('originalFileName') as HTMLElement;
    const modifiedFileName = document.getElementById('modifiedFileName') as HTMLElement;
    const originalRemoveButton = document.getElementById('originalRemoveBtn') as HTMLElement;
    const modifiedRemoveButton = document.getElementById('modifiedRemoveBtn') as HTMLElement;
    const compareBtn = document.getElementById('compareBtn') as HTMLButtonElement;
    const textComparison = document.querySelector('.text-comparison') as HTMLElement;

    const updateCompareButton = (): void => {
        const canCompare: boolean = !!(originalFile && modifiedFile);
        compareBtn.disabled = !canCompare;
        compareButton.disabled = !canCompare;
        compareButton.dataBind();
    };

    const refreshFileRow = (isOriginal: boolean): void => {
        const file: File | null = isOriginal ? originalFile : modifiedFile;
        const nameElement: HTMLElement = isOriginal ? originalFileName : modifiedFileName;
        const removeButton: HTMLElement = isOriginal ? originalRemoveButton : modifiedRemoveButton;
        const dropArea: HTMLElement = document.getElementById(isOriginal ? 'originalDropArea' : 'modifiedDropArea') as HTMLElement;
        nameElement.textContent = file ? `${file.name} (${Math.round(file.size / 1024)} KB)` : 'Supported document: PDF';
        removeButton.style.display = file ? 'inline-flex' : 'none';
        dropArea.classList.toggle('text-comparison-has-file', !!file);
    };

    const handleFileChange = (args: SelectedEventArgs, isOriginal: boolean): void => {
        const file: File | undefined = args.filesData && args.filesData[0] ? args.filesData[0].rawFile as File : undefined;
        if (!file) {
            return;
        }
        if (!file.name.toLowerCase().endsWith('.pdf')) {
            alert('Please select a valid PDF file.');
            (isOriginal ? originalUploader : modifiedUploader).clearAll();
            return;
        }

        const fileUrl: string = URL.createObjectURL(file);
        if (isOriginal) {
            if (originalFilePath !== DEFAULT_ORIGINAL_DOC) {
                URL.revokeObjectURL(originalFilePath);
            }
            originalFile = file;
            originalFilePath = fileUrl;
        } else {
            if (modifiedFilePath !== DEFAULT_MODIFIED_DOC) {
                URL.revokeObjectURL(modifiedFilePath);
            }
            modifiedFile = file;
            modifiedFilePath = fileUrl;
        }
        refreshFileRow(isOriginal);
        updateCompareButton();
    };

    const setUploadersVisibility = (show: boolean): void => {
        textComparison.classList.toggle('mobile-uploaders-open', show);
    };

    const removeFile = (isOriginal: boolean): void => {
        if (isOriginal) {
            if (originalFilePath !== DEFAULT_ORIGINAL_DOC) {
                URL.revokeObjectURL(originalFilePath);
            }
            originalFile = null;
            originalFilePath = DEFAULT_ORIGINAL_DOC;
            originalUploader.clearAll();
        } else {
            if (modifiedFilePath !== DEFAULT_MODIFIED_DOC) {
                URL.revokeObjectURL(modifiedFilePath);
            }
            modifiedFile = null;
            modifiedFilePath = DEFAULT_MODIFIED_DOC;
            modifiedUploader.clearAll();
        }
        refreshFileRow(isOriginal);
        updateCompareButton();
    };

    const handleCompare = (): void => {
        if (!originalFile || !modifiedFile) {
            alert('Please select both Original and Modified PDF files before comparing.');
            return;
        }
        try {
            setUploadersVisibility(false);
            if (pdfComparer && typeof (pdfComparer as any).compare === 'function') {
                (pdfComparer as any).compare(originalFilePath, modifiedFilePath);
            }
        } catch (error) {
            console.error('Error comparing documents:', error);
            alert('Error comparing the PDF documents. Please try again.');
        }
    };

    new Button({}).appendTo('#originalFileButton');
    new Button({}).appendTo('#modifiedFileButton');
    new Button({}).appendTo('#originalRemoveBtn');
    new Button({}).appendTo('#modifiedRemoveBtn');
    new Button({}).appendTo('#mobileUploadBtn');
    new Button({}).appendTo('#mobileCloseBtn');
    compareButton = new Button({ isPrimary: true, disabled: true });
    compareButton.appendTo('#compareBtn');

    originalUploader = new Uploader({
        dropArea: document.getElementById('originalDropArea') as HTMLElement,
        multiple: false,
        allowedExtensions: '.pdf',
        selected: (args: SelectedEventArgs): void => handleFileChange(args, true)
    });
    originalUploader.appendTo('#originalFileUploader');
    modifiedUploader = new Uploader({
        dropArea: document.getElementById('modifiedDropArea') as HTMLElement,
        multiple: false,
        allowedExtensions: '.pdf',
        selected: (args: SelectedEventArgs): void => handleFileChange(args, false)
    });
    modifiedUploader.appendTo('#modifiedFileUploader');

    document.getElementById('originalFileButton')!.addEventListener('click', (): void => {
        const browseButton: HTMLButtonElement | null = originalUploader.element.closest('.e-file-select-wrap')?.querySelector(
            'button'
        ) as HTMLButtonElement | null;
        if (browseButton) {
            browseButton.click();
        } else {
            originalUploader.element.click();
        }
    });

    document.getElementById('modifiedFileButton')!.addEventListener('click', (): void => {
        const browseButton: HTMLButtonElement | null = modifiedUploader.element.closest('.e-file-select-wrap')?.querySelector(
            'button'
        ) as HTMLButtonElement | null;
        if (browseButton) {
            browseButton.click();
        } else {
            modifiedUploader.element.click();
        }
    });
    originalRemoveButton.addEventListener('click', (): void => removeFile(true));
    modifiedRemoveButton.addEventListener('click', (): void => removeFile(false));
    compareBtn.addEventListener('click', handleCompare);
    document.getElementById('mobileUploadBtn')!.addEventListener('click', (): void => setUploadersVisibility(true));
    document.getElementById('mobileCloseBtn')!.addEventListener('click', (): void => setUploadersVisibility(false));

    updateCompareButton();
    refreshFileRow(true);
    refreshFileRow(false);

    const container: HTMLElement | null = document.getElementById('comparer-container');
    if (container) {
        const comparisonOptions: TextComparisonOptions = {
            beforeColor: '#FF0000',
            afterColor: '#00FF00',
            beforeColorOpacity: 0.4,
            afterColorOpacity: 0.4,
            enableHighlights: true
        } as TextComparisonOptions;
        pdfComparer = new PdfComparer(
            originalFilePath,
            modifiedFilePath,
            RESOURCE_URL,
            comparisonOptions,
            true,
            true
        );

        (pdfComparer as any).appendTo('#comparer-container');
    }
};
