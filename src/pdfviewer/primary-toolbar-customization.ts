import { loadCultureFiles } from '../common/culture-loader';
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView,
    ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner
} from '@syncfusion/ej2-pdfviewer';
import { PdfDocument, PdfBitmap } from '@syncfusion/ej2-pdf';
/* eslint-disable @typescript-eslint/no-explicit-any */

let primaryToolbarViewer: any;

const defaultSelectedToolbarItems: string[] = [
    'OpenOption',
    'PageNavigationTool',
    'MagnificationTool',
    'AnnotationEditTool',
    'SearchOption',
    'PrintOption',
    'DownloadOption'
];

const availableIcons: string[] = [
    'e-export-pdf',
    'e-header',
    'e-protect-sheet',
    'e-paste-text-only',
    'e-show-hide-panel',
    'e-filter-clear',
    'e-edit',
    'e-comment-show',
    'e-print-layout',
    'e-link-remove',
    'e-break-page',
    'e-bookmark',
    'e-password',
    'e-timeline-today',
    'e-text-alternative',
    'e-more-vertical-1'
];

type TextStyles = {
    fontSize: string;
    fontColor: string;
    backgroundColor: string;
    borderColor: string;
};

type PendingButton =
    | { type: 'text'; text: string; tooltipText: string; styles: TextStyles }
    | { type: 'icon'; icon: string };

let customToolItems: any[] = [];
let customButtonMappings: { [id: string]: string } = {};
let pendingButton: PendingButton | null = null;
let pendingApi: string | null = null;
let pendingItemType: string = '';
let selectedIcon: string = 'e-edit';

const apiMap: { [key: string]: () => void } = {
    lockPdf: (): void => {
        const viewer: any = primaryToolbarViewer;
        viewer.annotationSettings = {
            isLock: true,
            allowedInteractions: ['None']
        };
        const annotations = viewer.annotationCollection;
        if (annotations && typeof annotations.forEach === 'function') {
            annotations.forEach((annotation: any) => {
                annotation.annotationSettings = { isLock: true };
                if (viewer.annotation && typeof viewer.annotation.editAnnotation === 'function') {
                    viewer.annotation.editAnnotation(annotation);
                }
            });
        }
        if (viewer.formFieldCollections && typeof viewer.formFieldCollections.forEach === 'function') {
            viewer.formFieldCollections.forEach((field: any) => {
                if (viewer.formDesignerModule && typeof viewer.formDesignerModule.updateFormField === 'function') {
                    viewer.formDesignerModule.updateFormField(field, { isReadOnly: true });
                }
            });
        }
        viewer.isFormDesignerToolbarVisible = false;
        if (viewer.toolbarModule && typeof viewer.toolbarModule.showAnnotationToolbar === 'function') {
            viewer.toolbarModule.showAnnotationToolbar(false);
        }
    },
    flattenPdf: (): void => {
        const viewer: any = primaryToolbarViewer;
        if (typeof viewer.saveAsBlob !== 'function') {
            return;
        }
        viewer.saveAsBlob().then((value: Blob) => {
            const reader = new FileReader();
            reader.readAsDataURL(value);
            reader.onload = (): void => {
                const base64data: string = reader.result as string;
                const document: any = new (PdfDocument as any)(base64data.split(',')[1]);
                document.flatten = true;
                const flattened: any = document.save();
                document.destroy();
                viewer.load(flattened);
            };
        });
    },
    addWatermark: (): void => {
        const viewer: any = primaryToolbarViewer;
        if (!viewer || typeof viewer.saveAsBlob !== 'function') {
            return;
        }
        viewer.saveAsBlob().then((value: Blob) => {
            const reader = new FileReader();
            reader.readAsDataURL(value);
            reader.onload = (): void => {
                try {
                    const base64data: string = reader.result as string;
                    const loadedDocument: any = new (PdfDocument as any)(base64data.split(',')[1]);
                    const watermarkLabel: string = (viewer && viewer.fileName)
                        ? viewer.fileName.replace(/\.pdf$/i, '')
                        : 'CONFIDENTIAL';

                    const firstPage: any = loadedDocument.getPage(0);
                    if (!firstPage || !firstPage.size) {
                        return;
                    }
                    const imageDataUrl: string = createTileImageDataUrl(watermarkLabel, {
                        width: firstPage.size.width,
                        height: firstPage.size.height
                    });
                    const base64Image: string = imageDataUrl.split(',')[1];
                    if (!base64Image) {
                        return;
                    }
                    const bitmap: any = new (PdfBitmap as any)(base64Image);
                    for (let i = 0; i < loadedDocument.pageCount; i++) {
                        const page: any = loadedDocument.getPage(i);
                        const pageGraphics: any = page.graphics;
                        const state: any = pageGraphics.save();
                        pageGraphics.setTransparency(0.3);
                        pageGraphics.drawImage(bitmap, {
                            x: 0,
                            y: 0,
                            width: page.size.width,
                            height: page.size.height
                        });
                        pageGraphics.restore(state);
                    }
                    const watermarked: any = loadedDocument.save();
                    loadedDocument.destroy();
                    viewer.load(watermarked);
                } catch (err) {
                    // Fail silently if page size/graphics API issues occur
                }
            };
        });
    }
};

function createTileImageDataUrl(label: string, pageSize: { width: number; height: number }): string {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.width = pageSize.width;
    canvas.height = pageSize.height;
    const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d');
    if (!ctx) {
        return canvas.toDataURL();
    }
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const text: string = label || 'CONFIDENTIAL';
    const fontSize: number = Math.min(canvas.width, canvas.height) * 0.06;
    ctx.font = 'bold ' + fontSize + 'px Arial';
    ctx.fillStyle = 'rgba(255, 0, 0, 1)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.globalAlpha = 0.3;
    const textWidth: number = ctx.measureText(text).width;
    const textHeight: number = fontSize;
    const padding: number = Math.min(canvas.width, canvas.height) * 0.1;
    const spacingX: number = textWidth + padding;
    const spacingY: number = textHeight + padding;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(-Math.PI / 4);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
    for (let y = -canvas.height; y < canvas.height * 2; y += spacingY) {
        for (let x = -canvas.width; x < canvas.width * 2; x += spacingX) {
            ctx.fillText(text, x, y);
        }
    }
    return canvas.toDataURL();
}

export function initializePdfViewer(): void {
    PdfViewer.Inject(
        Toolbar,
        Magnification,
        Navigation,
        TextSearch,
        Print,
        Annotation,
        TextSelection,
        LinkAnnotation,
        BookmarkView,
        ThumbnailView,
        FormFields,
        FormDesigner
    );

    primaryToolbarViewer = new PdfViewer({
        documentPath:
            'https://cdn.syncfusion.com/content/pdf/pdf-succinctly.pdf',
        resourceUrl:
            'https://cdn.syncfusion.com/ej2/23.2.6/dist/ej2-pdfviewer-lib',
        showNotificationDialog: false,
        toolbarSettings: {
            showTooltip: true,
            toolbarItems: defaultSelectedToolbarItems.slice() as string[] as any
        }
    });

    primaryToolbarViewer.toolbarClick = (args: any): void => {
        executeMappedApi(args);
    };

    primaryToolbarViewer.appendTo('#pdfViewer');

    initializeSample();
}

function initializeSample(): void {
    setDefaultSelections();
    wireToolbarDropdown();
    updateSelectionSummary();
    populateIconGrid();
    wireCustomItemTypeDropdown();
    wirePreviewListeners();
    wireModal();
    wireApiDropdown();

    document
        .getElementById('customizeToolbar')
        ?.addEventListener('click', updateToolbar);

    document
        .getElementById('fileUpload')
        ?.addEventListener('change', onFileChange);

    document
        .getElementById('addToolbarButton')
        ?.addEventListener('click', addToolbarButton);
}

function updateToolbar(): void {
    primaryToolbarViewer.toolbarSettings = {
        showTooltip: true,
        toolbarItems: customToolItems.concat(getSelectedToolbarItems())
    };

    primaryToolbarViewer.dataBind();
}

function getSelectedToolbarItems(): string[] {
    const checkedItems = document.querySelectorAll<HTMLInputElement>(
        '#toolbarItems input[type="checkbox"]:checked'
    );

    return Array.from(checkedItems).map(item => item.value);
}

function setDefaultSelections(): void {
    const checkboxItems = document.querySelectorAll<HTMLInputElement>(
        '#toolbarItems input[type="checkbox"]'
    );

    checkboxItems.forEach(item => {
        item.checked = defaultSelectedToolbarItems.indexOf(item.value) !== -1;
    });
}

function wireToolbarDropdown(): void {
    const dropdownWrapper =
        document.querySelector<HTMLElement>('.toolbar-dropdown');

    const dropdownButton =
        document.getElementById('toolbarDropdownButton');

    if (!dropdownWrapper || !dropdownButton) {
        return;
    }

    const checkboxItems = document.querySelectorAll<HTMLInputElement>(
        '#toolbarItems input[type="checkbox"]'
    );

    dropdownButton.addEventListener('click', event => {
        event.stopPropagation();

        const isOpen: boolean = dropdownWrapper.classList.toggle('open');

        dropdownButton.setAttribute(
            'aria-expanded',
            isOpen ? 'true' : 'false'
        );
    });

    document.addEventListener('click', event => {
        const target = event.target as Node;

        if (!dropdownWrapper.contains(target)) {
            dropdownWrapper.classList.remove('open');
            dropdownButton.setAttribute('aria-expanded', 'false');
        }
    });

    checkboxItems.forEach(item => {
        item.addEventListener('change', updateSelectionSummary);
    });
}

function updateSelectionSummary(): void {
    const dropdownText =
        document.getElementById('toolbarDropdownText');

    if (dropdownText) {
        dropdownText.textContent = `${getSelectedToolbarItems().length} selected`;
    }
}

function wireCustomItemTypeDropdown(): void {
    const customItemType = document.getElementById('customItemType') as HTMLSelectElement | null;
    const textSection = document.getElementById('textSection');
    const iconSection = document.getElementById('iconSection');

    if (!customItemType || !textSection || !iconSection) {
        return;
    }

    customItemType.addEventListener('change', () => {
        const value: string = customItemType.value;
        textSection.style.display = (value === 'text') ? '' : 'none';
        iconSection.style.display = (value === 'icon') ? '' : 'none';

        if (value !== pendingItemType) {
            pendingButton = null;
            updateTextSummary();
            updateIconSummary();
        }
        pendingItemType = value;
    });
}

function wirePreviewListeners(): void {
    const previewInputs: string[] = [
        'buttonLabelInput',
        'fontSizeInput',
        'fontColorInput',
        'backgroundColorInput'
    ];

    previewInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updateButtonPreview);
            el.addEventListener('change', updateButtonPreview);
        }
    });
}

function wireApiDropdown(): void {
    const apiDropdown = document.getElementById('apiDropdown') as HTMLSelectElement | null;
    if (!apiDropdown) {
        return;
    }

    apiDropdown.addEventListener('change', () => {
        pendingApi = apiDropdown.value || null;
    });
}

function wireModal(): void {
    const modal = document.getElementById('textButtonModal');
    const createBtn = document.getElementById('createTextButtonBtn');
    const cancelBtn = document.getElementById('popupCancelButton');
    const createPopupBtn = document.getElementById('popupCreateButton');

    createBtn?.addEventListener('click', () => {
        resetPopupState();
        if (modal) {
            modal.style.display = 'flex';
        }
    });

    cancelBtn?.addEventListener('click', () => {
        if (modal) {
            modal.style.display = 'none';
        }
    });

    createPopupBtn?.addEventListener('click', createPendingTextButton);
}

function resetPopupState(): void {
    (document.getElementById('buttonLabelInput') as HTMLInputElement).value = '';
    (document.getElementById('tooltipTextInput') as HTMLInputElement).value = '';
    (document.getElementById('fontSizeInput') as HTMLInputElement).value = '14';
    (document.getElementById('fontColorInput') as HTMLInputElement).value = '#ffffff';
    (document.getElementById('backgroundColorInput') as HTMLInputElement).value = '#0d6efd';
    (document.getElementById('borderColorInput') as HTMLInputElement).value = '#000000';
    updateButtonPreview();

    const err = document.getElementById('popupError');
    if (err) {
        err.classList.remove('visible');
        err.textContent = '';
    }
}

function generateUniqueId(prefix: string): string {
    return prefix + '_' + (customToolItems.length + 1) + '_' + Date.now();
}

function addToolbarButton(): void {
    const customItemType = document.getElementById('customItemType') as HTMLSelectElement | null;
    const apiDropdown = document.getElementById('apiDropdown') as HTMLSelectElement | null;
    if (!customItemType || !apiDropdown) {
        return;
    }

    const type: string = customItemType.value;

    if (type === 'icon') {
        if (!pendingButton || pendingButton.type !== 'icon') {
            pendingButton = { type: 'icon', icon: selectedIcon };
        } else if (pendingButton.type === 'icon') {
            pendingButton.icon = selectedIcon;
        }
    }

    const noButton: boolean = !pendingButton;
    const isTextButton: boolean = !!pendingButton && pendingButton.type === 'text';
    const noIconChoice: boolean = type === 'icon' && (!pendingButton || pendingButton.type !== 'icon' || !pendingButton.icon);
    const textButton: { type: 'text'; text: string; tooltipText: string; styles: TextStyles } | null =
        isTextButton ? (pendingButton as { type: 'text'; text: string; tooltipText: string; styles: TextStyles }) : null;
    const noTextBuild: boolean = type === 'text' && (!textButton || !textButton.text);
    const noApi: boolean = !pendingApi;

    if (noButton && noApi) {
        primaryToolbarViewer.showNotificationPopup(
            'Please complete the following:\n\n\u2022 Create or Select a Button\n\u2022 Select an API Action'
        );
        return;
    }
    if (noButton) {
        primaryToolbarViewer.showNotificationPopup('Please create a button before adding.');
        return;
    }
    if (noIconChoice) {
        primaryToolbarViewer.showNotificationPopup('Please select an icon.');
        return;
    }
    if (noTextBuild) {
        primaryToolbarViewer.showNotificationPopup('Please create a text button.');
        return;
    }
    if (noApi) {
        primaryToolbarViewer.showNotificationPopup('Please select an API Action.');
        return;
    }
    if (!pendingButton || !pendingApi) {
        return;
    }

    const uniqueId: string = generateUniqueId(pendingButton.type === 'text' ? 'customButton' : 'iconButton');
    let item: any;

    if (pendingButton.type === 'text') {
        const styles: TextStyles = pendingButton.styles;
        item = {
            id: uniqueId,
            type: 'text',
            text: pendingButton.text,
            tooltipText: pendingButton.tooltipText || pendingButton.text,
            cssClass: uniqueId,
            align: 'right'
        };
        customToolItems.push(item);

        const css: string = '.' + uniqueId + '{' +
            'background:' + (styles.backgroundColor || '#0d6efd') + ';' +
            'color:' + (styles.fontColor || '#ffffff') + ';' +
            'font-size:' + (styles.fontSize || 14) + 'px;' +
            'border:1px solid ' + (styles.borderColor || '#000000') + ';' +
            '}';
        const styleTag: HTMLStyleElement = document.createElement('style');
        styleTag.innerHTML = css;
        document.head.appendChild(styleTag);
    } else {
        const iconClass: string = pendingButton.icon || '';
        const prefixIcon: string = iconClass.indexOf('e-icons ') === 0 ? iconClass : 'e-icons ' + iconClass;
        item = {
            id: uniqueId,
            prefixIcon: prefixIcon,
            tooltipText: iconClass.replace('e-', ''),
            align: 'right'
        };
        customToolItems.push(item);
    }

    customButtonMappings[uniqueId] = pendingApi;
    updateToolbar();

    pendingButton = null;
    pendingApi = null;
    apiDropdown.value = '';
    updateTextSummary();

    if (type === 'text') {
        (document.getElementById('buttonLabelInput') as HTMLInputElement).value = '';
        (document.getElementById('tooltipTextInput') as HTMLInputElement).value = '';
    }

    primaryToolbarViewer.showNotificationPopup('Custom toolbar button added successfully.');
}

function createPendingTextButton(): void {
    const labelInput = document.getElementById('buttonLabelInput') as HTMLInputElement | null;
    if (!labelInput) {
        return;
    }
    const label: string = labelInput.value.trim();
    const err: HTMLElement | null = ensurePopupErrorNode();
    if (!label) {
        if (err) {
            err.textContent = 'Please enter Button Name.';
            err.classList.add('visible');
        }
        return;
    }
    if (err) {
        err.classList.remove('visible');
        err.textContent = '';
    }

    const tooltipInput = document.getElementById('tooltipTextInput') as HTMLInputElement | null;
    const tooltip: string = tooltipInput?.value.trim() || label;

    pendingButton = {
        type: 'text',
        text: label,
        tooltipText: tooltip,
        styles: {
            fontSize: (document.getElementById('fontSizeInput') as HTMLInputElement | null)?.value || '14',
            fontColor: (document.getElementById('fontColorInput') as HTMLInputElement | null)?.value || '#ffffff',
            backgroundColor: (document.getElementById('backgroundColorInput') as HTMLInputElement | null)?.value || '#0d6efd',
            borderColor: (document.getElementById('borderColorInput') as HTMLInputElement | null)?.value || '#000000'
        }
    };

    updateTextSummary();

    const modal = document.getElementById('textButtonModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function ensurePopupErrorNode(): HTMLElement | null {
    let err = document.getElementById('popupError');
    if (err) {
        return err;
    }
    err = document.createElement('div');
    err.id = 'popupError';
    err.className = 'ptc-field-error';
    const labelInput = document.getElementById('buttonLabelInput');
    if (labelInput?.parentNode) {
        labelInput.parentNode.appendChild(err);
    }
    return err;
}

function updateTextSummary(): void {
    const wrap = document.getElementById('textSelectedSummary');
    const name = document.getElementById('textSelectedName');
    if (pendingButton && pendingButton.type === 'text') {
        if (name) {
            name.textContent = pendingButton.text;
        }
        if (wrap) {
            wrap.style.display = '';
        }
    } else {
        if (name) {
            name.textContent = '';
        }
        if (wrap) {
            wrap.style.display = 'none';
        }
    }
}

function updateIconSummary(): void {
    const iconDisplay = document.getElementById('selectedIconDisplay');
    if (iconDisplay) {
        iconDisplay.innerHTML = '<span class="e-icons ' + selectedIcon + '"></span>';
    }
}

function executeMappedApi(args: any): void {
    if (!args || !args.item || !args.item.id) {
        return;
    }
    const mapped: string | undefined = customButtonMappings[args.item.id];
    if (mapped && typeof apiMap[mapped] === 'function') {
        try {
            apiMap[mapped]();
        } catch (err) {
            // Silently fail to prevent unmapped items from breaking the viewer
        }
    }
}

function populateIconGrid(): void {
    const iconGrid = document.getElementById('iconGrid');
    if (!iconGrid) {
        return;
    }
    iconGrid.innerHTML = '';
    availableIcons.forEach(iconClass => {
        const iconItem: HTMLDivElement = document.createElement('div');
        iconItem.className = 'icon-grid-item';
        if (iconClass === selectedIcon) {
            iconItem.classList.add('selected');
        }
        iconItem.innerHTML = '<span class="e-icons ' + iconClass + '"></span>';
        iconItem.title = iconClass;
        iconItem.dataset.icon = iconClass;
        iconItem.addEventListener('click', (e: MouseEvent) => {
            const target = e.currentTarget as HTMLDivElement;
            selectIcon(target.dataset.icon || '');
        });
        iconGrid.appendChild(iconItem);
    });
}

function selectIcon(iconClass: string): void {
    selectedIcon = iconClass;
    populateIconGrid();
    pendingButton = { type: 'icon', icon: iconClass };
    updateIconSummary();
}

function updateButtonPreview(): void {
    const preview = document.getElementById('buttonPreview');
    if (!preview) {
        return;
    }
    const labelInput = document.getElementById('buttonLabelInput') as HTMLInputElement | null;
    const fontSizeInput = document.getElementById('fontSizeInput') as HTMLInputElement | null;
    const fontColorInput = document.getElementById('fontColorInput') as HTMLInputElement | null;
    const bgColorInput = document.getElementById('backgroundColorInput') as HTMLInputElement | null;

    const label: string = labelInput?.value || 'Custom Button';
    const fontSize: string = fontSizeInput?.value || '14';
    const fontColor: string = fontColorInput?.value || '#ffffff';
    const bgColor: string = bgColorInput?.value || '#0d6efd';

    preview.innerHTML = label;
    preview.style.fontSize = fontSize + 'px';
    preview.style.color = fontColor;
    preview.style.backgroundColor = bgColor;
    preview.style.borderRadius = '4px';
}

function onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files?.length) {
        return;
    }

    const uploadedFile: File = input.files[0];
    const reader = new FileReader();

    reader.readAsDataURL(uploadedFile);

    reader.onload = (e: ProgressEvent<FileReader>) => {
        const result = e.target?.result as string;

        primaryToolbarViewer.load(result, null);
        primaryToolbarViewer.downloadFileName = uploadedFile.name;
    }
};

(window as any).refreshPrimaryToolbarSample = (): void => {
    customToolItems = [];
    customButtonMappings = {};
    pendingButton = null;
    pendingApi = null;
    pendingItemType = '';
    updateTextSummary();
    updateIconSummary();
    updateToolbar();
};


(window as any).default = (): void => {
    loadCultureFiles();
    initializePdfViewer();
};