import { loadCultureFiles } from '../common/culture-loader';
import { PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView, ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner, PageOrganizer, ExtractTextOption } from '@syncfusion/ej2-pdfviewer';
import { Toolbar as Tool, ItemModel, ClickEventArgs } from '@syncfusion/ej2-navigations';
import { Dialog } from '@syncfusion/ej2-popups';
import { Browser } from '@syncfusion/ej2-base';
import { MultiSelect, CheckBoxSelection, ChangeEventArgs as MultiChangeEventArgs } from '@syncfusion/ej2-dropdowns';
import { SplitButton, ItemModel as SplitButtonItemModel } from '@syncfusion/ej2-splitbuttons';
PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView, ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner, PageOrganizer);
MultiSelect.Inject(CheckBoxSelection);

/** PDF Text Extractor sample */
(window as any).default = (): void => {
    loadCultureFiles();

    const uiStrings: { [key: string]: string } = { selectArea: 'Select Area', extractSelectedText: 'Extract selected text', extractText: 'Extract Text', previousPage: 'Previous Page', nextPage: 'Next Page', zoomIn: 'Zoom In', zoomOut: 'Zoom Out', textSelection: 'Text Selection', pan: 'Pan', print: 'Print', cancel: 'Cancel', extract: 'Extract', copy: 'Copy to clipboard', copied: 'Copied!', currentPage: 'Current page', noPage: 'No page', allPages: 'All pages', noPageSelected: 'No page selected', noTextSelected: 'No text selected' };

    const pdfviewer: PdfViewer = new PdfViewer({
        documentPath: 'https://cdn.syncfusion.com/content/pdf/pdf-succinctly.pdf',
        resourceUrl: 'https://cdn.syncfusion.com/ej2/23.2.6/dist/ej2-pdfviewer-lib',
        enableToolbar: false, enableNavigationToolbar: false, enableAnnotationToolbar: false,
        enableCommentPanel: false, contextMenuOption: 'None',
        pageChange : onPageChange,
         zoomChange : onZoomChange,   
        rectangleSettings: { author: 'Guest', fillColor: 'transparent', strokeColor: '#0078D4', thickness: 2, opacity: 1 },
        annotationAdd: onAnnotationAdd, documentLoad: onDocumentLoad
    });
    pdfviewer.appendTo('#container');

    let extractionMode: 'direct' | 'bounded' = 'direct';
    let pageTexts: { page: number; text: string }[] = [];
    let totalPages: number = 0;
    let isLoading: boolean = false;
    let copySuccess: boolean = false;
    const runtimeRectangles: { [key: string]: any }[] = [];
    let selectedArea: { x: number; y: number; width: number; height: number } | null = null;
    let isMobile: boolean = Browser.isDevice || window.innerWidth <= 768;

    interface PageTextResult {
        pageText?: string;
        textData?: { text?: string; bounds?: RectLike; Bounds?: RectLike }[];
    }

    interface RectLike {
        x?: number; y?: number; width?: number; height?: number;
        X?: number; Y?: number; Width?: number; Height?: number;
        left?: number; top?: number; Left?: number; Top?: number;
    }
        interface TextItem {
        text?: string;
        Text?: string;
        bounds?: RectLike;
        Bounds?: RectLike;
        }

    function getBounds(b: RectLike | null | undefined): { x: number; y: number; width: number; height: number } {
        if (!b) { return { x: 0, y: 0, width: 0, height: 0 }; }
        return { x: (b.x != null ? b.x : b.X != null ? b.X : b.left != null ? b.left : b.Left) || 0, y: (b.y != null ? b.y : b.Y != null ? b.Y : b.top != null ? b.top : b.Top) || 0, width: (b.width != null ? b.width : b.Width) || 0, height: (b.height != null ? b.height : b.Height) || 0 };
    }

    function getPageText(result: PageTextResult | string | null | undefined): string {
        if (!result) { return ''; }
        if (typeof result === 'string') { return result; }
        if (result.pageText) { return result.pageText; }
        if (Array.isArray(result.textData)) { return result.textData.map((item) => item.text || '').join('\n'); }
        return '';
    }

        const buildTextFromBounds = (
        items: TextItem[],
        spaceItems: TextItem[] = []
        ): string => {
        const lines: string[] = [];
        let currentLine = '';
        let previousY: number | null = null;
        let previousHeight: number | null = null;
        let previousBounds: { x: number; y: number; width: number; height: number } | null = null;
        const punctuationRegex = /^[.,;:!?)\]}]/;
        const hasExplicitSpaceBetween = (
            previousCharacterBounds: { x: number; y: number; width: number; height: number },
            currentCharacterBounds: { x: number; y: number; width: number; height: number }
        ): boolean => {
            const previousRight = previousCharacterBounds.x + previousCharacterBounds.width;
            const currentLeft = currentCharacterBounds.x;
            return spaceItems.some((spaceItem: TextItem) => {
            const spaceBounds = getBounds(spaceItem.bounds || spaceItem.Bounds);
            const spaceLeft = spaceBounds.x;
            const spaceRight = spaceBounds.x + spaceBounds.width;
            const previousBottom = previousCharacterBounds.y + previousCharacterBounds.height;
            const currentBottom =currentCharacterBounds.y + currentCharacterBounds.height;
            const lineBottom = (previousBottom + currentBottom) / 2;
            const verticalTolerance = Math.max(previousCharacterBounds.height,currentCharacterBounds.height,4 ) * 0.5;
            const belongsToSameLine = Math.abs(spaceBounds.y - lineBottom) <= verticalTolerance;
            const liesBetweenCharacters = spaceLeft >= previousRight - 1 && spaceRight <= currentLeft + 1;
            return belongsToSameLine && liesBetweenCharacters;
            });
        };
        items.forEach((item: TextItem) => {
            const text = item.text ?? item.Text ?? '';
            const itemBounds = getBounds(item.bounds || item.Bounds);
            if (!text.trim()) {return; }
            const lineTolerance = Math.max(itemBounds.height, previousHeight ?? itemBounds.height) * 0.45;
             const isNewLine = previousY !== null && Math.abs(itemBounds.y - previousY) > lineTolerance;
            if (isNewLine) {
            if (currentLine.trim()) {
                lines.push(currentLine.trim());
            }
            currentLine = '';
            previousBounds = null;
            }
            if (previousBounds && currentLine) {
            const previousRight = previousBounds.x + previousBounds.width;
            const gap = itemBounds.x - previousRight;
            const explicitSpace = hasExplicitSpaceBetween(previousBounds, itemBounds);
            if (
                explicitSpace &&
                !punctuationRegex.test(text) &&
                !currentLine.endsWith(' ')
            ) {
                currentLine += ' ';
            } else if (!explicitSpace) {
                const averageHeight = (previousBounds.height + itemBounds.height) / 2;
                const fallbackWordGap = averageHeight * 0.55;
                if (gap > fallbackWordGap && !punctuationRegex.test(text) && !currentLine.endsWith(' ')) {
                currentLine += ' ';
                }
            }
            }
            currentLine += text.trim();
            previousBounds = itemBounds;
            previousY = itemBounds.y;
            previousHeight = itemBounds.height;
        });
        if (currentLine.trim()) {
            lines.push(currentLine.trim());
        }
        return lines
            .join('\n')
            .replace(/\s+([.,;:!?])/g, '$1')
            .trim();
        };

    function buildAllPagesText(): string {
        if (!pageTexts || pageTexts.length === 0) { return ''; }
        return pageTexts.map((p) => (p.text || '').trim()).filter(Boolean).join('\n');
    }

    function escapeHtml(str: string): string { return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
    function selectedValues(): string[] { return (pageSelectorObj && (pageSelectorObj.value as string[])) || []; }

    const splitItems: SplitButtonItemModel[] = [{ text: uiStrings.extractSelectedText, iconCss: 'e-icons e-extract-page', id: 'extractSelectedText' }];
    function handleSplitSelect(args: { item: ItemModel }): void {
    const hasRectangleAnnotation = pdfviewer.annotationCollection.some(
    (annotation: any) =>
      annotation.shapeAnnotationType === 'Square' ||
      annotation.shapeAnnotationType === 'Rectangle'
    );
    if (args.item.id === 'extractSelectedText') {
        if (!hasRectangleAnnotation) {
        return;
        }
        onExtractSelectedAreaText();
    }
    }
    function handleSelectArea(): void {
        pdfviewer.rectangleSettings = { author: 'Guest', fillColor: 'transparent', strokeColor: '#0078D4', thickness: 2, opacity: 1 };
        pdfviewer.annotationModule.setAnnotationMode('Rectangle');
    }

    const desktopToolbarObj: Tool = new Tool({
        items: [
            { prefixIcon: 'e-icons e-folder', id: 'file_Open', tooltipText: 'Open' },
            { prefixIcon: 'e-icons e-save', tooltipText: 'Save', id: 'save' },
            { prefixIcon: 'e-icons e-chevron-left', id: 'previous_page', tooltipText: uiStrings.previousPage, align: 'Center' },
            { prefixIcon: 'e-icons e-chevron-right', id: 'next_page', tooltipText: uiStrings.nextPage, align: 'Center' },
            { prefixIcon: 'e-icons e-circle-add', id: 'zoom_in', tooltipText: uiStrings.zoomIn, align: 'Center' },
            { prefixIcon: 'e-icons e-circle-remove', id: 'zoom_out', tooltipText: uiStrings.zoomOut, align: 'Center' },
            { type: 'Separator', tooltipText: 'separator', align: 'Center' },
            { prefixIcon: 'e-icons e-mouse-pointer', id: 'text_selection_tool', align: 'Center', tooltipText: uiStrings.textSelection },
            { prefixIcon: 'e-icons e-pan', id: 'pan_tool', align: 'Center', tooltipText: uiStrings.pan },
            { type: 'Separator', tooltipText: 'separator', align: 'Center' },
            { template: '<button id="desktopSelectArea"></button>', align: 'Center', tooltipText: uiStrings.selectArea },
            { id: 'extractText', prefixIcon: 'e-icons e-extract-page', tooltipText: uiStrings.extractText, align: 'Center' },
            { prefixIcon: 'e-icons e-print', tooltipText: uiStrings.print, id: 'print', align: 'Right' }
        ],
        clicked: handleDesktopToolbarClick , cssClass: 'e-pv-toolbar',
    });
    desktopToolbarObj.appendTo('#desktopToolbarContainer');

    const mobileToolbarObj: Tool = new Tool({
        overflowMode: 'Scrollable',
        items: [
            { prefixIcon: 'e-icons e-chevron-left', id: 'mobilePreviousPage', tooltipText: uiStrings.previousPage, align: 'Center' },
            { prefixIcon: 'e-icons e-chevron-right', id: 'mobileNextPage', tooltipText: uiStrings.nextPage, align: 'Center' },
            { prefixIcon: 'e-icons e-zoom-in', id: 'mobileZoomIn', tooltipText: uiStrings.zoomIn, align: 'Center' },
            { prefixIcon: 'e-icons e-zoom-out', id: 'mobileZoomOut', tooltipText: uiStrings.zoomOut, align: 'Center' },
            { prefixIcon: 'e-icons e-mouse-pointer', id: 'mobileSelection', tooltipText: uiStrings.textSelection, align: 'Center' },
            { prefixIcon: 'e-icons e-pan', id: 'mobilePan', tooltipText: uiStrings.pan, align: 'Center' },
            { template: '<button id="mobileSelectArea"></button>', align: 'Center', tooltipText: uiStrings.selectArea },
            { prefixIcon: 'e-icons e-extract-page', id: 'mobileExtractText', tooltipText: uiStrings.extractText, align: 'Center' },
            { prefixIcon: 'e-icons e-print', id: 'mobilePrint', tooltipText: uiStrings.print, align: 'Center' }
        ],
        clicked: handleMobileToolbarClick
    });
    mobileToolbarObj.appendTo('#mobileToolbarContainer');

    const selectAreaSplitBtn: SplitButton = new SplitButton({ iconCss: 'e-icons e-frame-custom', items: splitItems, click: handleSelectArea, select: handleSplitSelect });
    selectAreaSplitBtn.appendTo('#desktopSelectArea');

    const mobileSelectAreaSplitBtn: SplitButton = new SplitButton({ iconCss: 'e-icons e-frame-custom', items: splitItems, click: handleSelectArea, select: handleSplitSelect });
    mobileSelectAreaSplitBtn.appendTo('#mobileSelectArea');

    let dialogObj: Dialog;

    function updateToolbarVisibility(): void {
        isMobile = Browser.isDevice || window.innerWidth <= 768;
        const desktopToolbarContainerEl: HTMLElement | null = document.getElementById('desktopToolbarContainer');
        if (desktopToolbarContainerEl) { desktopToolbarContainerEl.style.display = isMobile ? 'none' : ''; }
        const mobileToolbarContainerEl: HTMLElement | null = document.getElementById('mobileToolbarContainer');
        if (mobileToolbarContainerEl) { mobileToolbarContainerEl.style.display = isMobile ? '' : 'none'; }
        const containerDiv: HTMLElement | null = document.getElementById('container');
        if (containerDiv) { containerDiv.style.height = isMobile ? '500px' : '640px'; }
        if (dialogObj) { dialogObj.width = isMobile ? '95%' : '560px'; dialogObj.dataBind(); }
    }
    updateToolbarVisibility();
    window.addEventListener('resize', updateToolbarVisibility);

    const fileInput: HTMLElement | null = document.getElementById('fileUpload');
    if (fileInput) {
        fileInput.addEventListener('change', (e: Event) => {
            const target: HTMLInputElement = e.target as HTMLInputElement;
            const file: File | undefined = target.files ? target.files[0] : undefined;
            if (!file) { return; }
            const reader: FileReader = new FileReader();
            reader.onload = (ev: ProgressEvent<FileReader>) => {
                runtimeRectangles.length = 0;
                selectedArea = null;
                const fr: FileReader | null = ev.currentTarget as FileReader | null;
                if (!fr || typeof fr.result !== 'string') { return; }
                pdfviewer.documentPath = fr.result;
                pdfviewer.fileName = file.name;
                pdfviewer.downloadFileName = file.name;
            };
            reader.readAsDataURL(file);
        });
    }

    function handleDesktopToolbarClick(args: ClickEventArgs): void {
        const itemId: string | undefined = args.item && args.item.id;
        if (!itemId) { return; }
        switch (itemId) {
            case 'file_Open': document.getElementById('fileUpload').click(); break;
            case 'text_selection_tool': 
             var selectedItem = document.getElementById(args.item?.id || '');
            const panTool = document.getElementById('pan_tool');
            if (selectedItem) {
                selectedItem.classList.add('e-pv-tbar-btn', 'e-pv-select');
            }
            if (panTool) {
                panTool.classList.remove('e-pv-select');
            }
            pdfviewer.interactionMode = 'TextSelection'; break;
            case 'pan_tool': 
            var selectedItem = document.getElementById(args.item?.id || '');
            const selectTool = document.getElementById('text_selection_tool');
            if (selectedItem) {
                selectedItem.classList.add('e-pv-tbar-btn', 'e-pv-select');
            }
            if (selectTool) {
                selectTool.classList.remove('e-pv-select');
            }
            pdfviewer.interactionMode = 'Pan'; break;
            case 'previous_page': pdfviewer.navigation.goToPreviousPage(); break;
            case 'next_page': pdfviewer.navigation.goToNextPage(); break;
            case 'zoom_in': pdfviewer.magnification.zoomIn(); break;
            case 'zoom_out': pdfviewer.magnification.zoomOut(); break;
            case 'extractText': onExtractPageText(); break;
            case 'save': pdfviewer.download(); break;
            case 'print': pdfviewer.print.print(); break;
        }
    }

    function handleMobileToolbarClick(args: ClickEventArgs): void {
        const itemId: string | undefined = args.item && args.item.id;
        if (!itemId) { return; }
        switch (itemId) {
            case 'mobileSelection': pdfviewer.interactionMode = 'TextSelection'; break;
            case 'mobilePan': pdfviewer.interactionMode = 'Pan'; break;
            case 'mobilePreviousPage': pdfviewer.navigation.goToPreviousPage(); break;
            case 'mobileNextPage': pdfviewer.navigation.goToNextPage(); break;
            case 'mobileZoomIn': pdfviewer.magnification.zoomIn(); break;
            case 'mobileZoomOut': pdfviewer.magnification.zoomOut(); break;
            case 'mobileExtractText': onExtractPageText(); break;
            case 'mobilePrint': pdfviewer.print.print(); break;
        }
    }

    function onAnnotationAdd(args: any): void {
        if (args.annotationType === 'Rectangle') {
            runtimeRectangles.push({ pageIndex: args.pageIndex, bounds: args.bounds || args.annotationBound, annotation: args.annotation });
            if (args.annotationSettings) { args.annotationSettings.strokeColor = '#0078D4'; args.annotationSettings.fillColor = 'transparent'; args.annotationSettings.thickness = 2; }
            if (args.annotation) { args.annotation.strokeColor = '#0078D4'; args.annotation.fillColor = 'transparent'; args.annotation.thickness = 2; }
            let bounds: { x: number; y: number; width: number; height: number } | null = null;
            if (args.annotationBound) { bounds = { x: args.annotationBound.left != null ? args.annotationBound.left : (args.annotationBound.x || 0), y: args.annotationBound.top != null ? args.annotationBound.top : (args.annotationBound.y || 0), width: args.annotationBound.width || 0, height: args.annotationBound.height || 0 }; }
            else if (args.bounds) { bounds = { x: args.bounds.x || 0, y: args.bounds.y || 0, width: args.bounds.width || 0, height: args.bounds.height || 0 }; }
            if (bounds) { selectedArea = bounds; pdfviewer.annotationModule.setAnnotationMode('None'); }
        }
    }

    function onDocumentLoad(): void {
        updatePageNavigation();
        const selectTool = document.getElementById('text_selection_tool');
        if (selectTool) {
            selectTool.classList.add('e-pv-tbar-btn', 'e-pv-select');
        }
        const panTool = document.getElementById('pan_tool');

        if (panTool) {
            panTool.classList.remove('e-pv-select');
        }
        totalPages = pdfviewer.pageCount || 0;
        refreshPageOptions();
        runtimeRectangles.length = 0;
        selectedArea = null;
    }
    function onPageChange(): void {
        updatePageNavigation();
        refreshPageOptions();
    }
    function updatePageNavigation() {
        const viewer = pdfviewer;
        if (!viewer) { return; }
        const previousPageEl: HTMLElement | null = document.getElementById('previous_page');
        const nextPageEl: HTMLElement | null = document.getElementById('next_page');
        const previousPageParent: HTMLElement | null = previousPageEl ? previousPageEl.parentElement : null;
        const nextPageParent: HTMLElement | null = nextPageEl ? nextPageEl.parentElement : null;
        if (!previousPageParent || !nextPageParent) { return; }
        if (viewer.currentPageNumber === 1) {
            desktopToolbarObj.enableItems(previousPageParent, false);
            desktopToolbarObj.enableItems(nextPageParent, true);
        } else if (viewer.currentPageNumber === viewer.pageCount) {
            desktopToolbarObj.enableItems(previousPageParent, true);
            desktopToolbarObj.enableItems(nextPageParent, false);
        } else {
            desktopToolbarObj.enableItems(previousPageParent, true);
            desktopToolbarObj.enableItems(nextPageParent, true);
        }
    }
   function onZoomChange(args: { zoomValue: number; }) {
    if (args.zoomValue === 10) {
       desktopToolbarObj.enableItems((document.getElementById('zoom_in') as HTMLElement).parentElement as HTMLElement,true );
      desktopToolbarObj.enableItems((document.getElementById('zoom_out')as HTMLElement).parentElement as HTMLElement,false );
    } else if (args.zoomValue === 400) {
         desktopToolbarObj.enableItems((document.getElementById('zoom_in') as HTMLElement).parentElement as HTMLElement,false);
       desktopToolbarObj.enableItems((document.getElementById('zoom_out')as HTMLElement).parentElement as HTMLElement,true);
    } else {
         desktopToolbarObj.enableItems((document.getElementById('zoom_in')as HTMLElement).parentElement as HTMLElement,true );
       desktopToolbarObj.enableItems((document.getElementById('zoom_out')as HTMLElement).parentElement as HTMLElement,true  );
    }
  }
    function performExtraction(pagesToExtract: Set<number> | number[]): void {
        isLoading = true;
        pageTexts = [];
        renderDialogBody();
        let pagesToProcess: number[] = Array.from(pagesToExtract as Set<number> | number[]).sort((a: number, b: number) => a - b);
        if (pagesToProcess.indexOf(0) !== -1) { const seen: Set<number> = new Set<number>(); seen.add(pdfviewer.currentPageNumber || 1); pagesToProcess.forEach((p: number) => { if (p !== 0) { seen.add(p); } }); pagesToProcess = Array.from(seen).sort((a: number, b: number) => a - b); }
        const collected: { page: number; text: string }[] = [];
        (async () => {
            for (let i: number = 0; i < pagesToProcess.length; i++) {
                const pageNum: number = pagesToProcess[i];
                const pageIndex: number = pageNum - 1;
                try { const result: PageTextResult = await pdfviewer.extractText(pageIndex, pageIndex, ExtractTextOption.TextOnly) as PageTextResult; collected.push({ page: pageNum, text: getPageText(result).trim() || '[No text found]' }); }
                catch (e) { collected.push({ page: pageNum, text: '[Error extracting page]' }); }
                pageTexts = collected.slice();
                renderDialogBody();
            }
            pageTexts = collected;
            isLoading = false;
            renderDialogBody();
        })();
    }

    function onExtractPageText(): void {
        extractionMode = 'direct';
        totalPages = pdfviewer.pageCount || 0;
        const pagesSet: Set<number> = new Set<number>([0]);
        performExtraction(pagesSet);
        setTimeout(() => {
            dialogObj.show();
            setTimeout(() => { if (pageSelectorObj) { pageSelectorObj.value = ['current']; pageSelectorObj.dataBind(); } }, 100);
        }, 50);
    }

    function onExtractSelectedAreaText(): void {
        extractionMode = 'bounded';
        isLoading = true;
        renderDialogBody();
        dialogObj.show();

        const rectangles: any[] = (pdfviewer.annotationCollection || []).filter((annotation: any) => annotation.shapeAnnotationType === 'Square' || annotation.subject === 'Rectangle');
        if (!rectangles.length) { pageTexts = []; isLoading = false; renderDialogBody(); return; }

        (async (): Promise<void> => {
            const collected: { page: number; text: string }[] = [];
            try {
                for (let i: number = 0; i < rectangles.length; i++) {
                    const rect: any = rectangles[i];
                    const annotationBounds: RectLike | undefined = rect.bounds || (rect.annotation && rect.annotation.bounds) || (rect.annotation && rect.annotation.wrapper && rect.annotation.wrapper.bounds);
                    const bounds: { x: number; y: number; width: number; height: number } = { x: annotationBounds?.x ?? annotationBounds?.left ?? 0, y: annotationBounds?.y ?? annotationBounds?.top ?? 0, width: annotationBounds?.width ?? 0, height: annotationBounds?.height ?? 0 };
                    const pageIndex: number = typeof rect.pageIndex === 'number' ? rect.pageIndex : typeof rect.pageNumber === 'number' ? rect.pageNumber - 1 : 0;
                    try {
                       const result: PageTextResult = await pdfviewer.extractText(
                        rect.pageNumber,
                        rect.pageNumber,
                        ExtractTextOption.TextAndBounds
                    ) as PageTextResult;

                    const items: any[] = (result?.textData as any[]) || [];
                    const bx = bounds.x;
                    const by = bounds.y;
                    const bw = bounds.width;
                    const bh = bounds.height;
                    const selectedItems = items.filter((item: any) => {
                        const text: string = item.text ?? item.Text ?? '';
                        if (
                            text === '\r' ||
                            text === '\n' ||
                            text === '\r\n'
                        ) {
                            return false;
                        }
                        const ib = getBounds(item.bounds || item.Bounds);
                        const centerX = ib.x + ib.width / 2;
                        const centerY = ib.y + ib.height / 2;
                        return ( centerX >= bx && centerX <= bx + bw && centerY >= by && centerY <= by + bh );
                    });
                    const spaceItems = selectedItems.filter((item: any) => {
                        const text: string = item.text ?? item.Text ?? '';
                        return text === ' ';
                    });
                    const filteredItems = selectedItems
                        .filter((item: any) => {
                            const text: string = item.text ?? item.Text ?? '';
                            return text.trim() !== '';
                        })
                        .sort((a: any, b: any) => {
                            const A = getBounds(a.bounds || a.Bounds);
                            const B = getBounds(b.bounds || b.Bounds);

                            const tolerance =
                                Math.max(A.height, B.height) * 0.45;

                            return Math.abs(A.y - B.y) > tolerance
                                ? A.y - B.y
                                : A.x - B.x;
                        });

                    const rectangleText: string = buildTextFromBounds(
                        filteredItems,
                        spaceItems
                    )
                        .replace(/\n/g, ' ')
                        .replace(/\s+/g, ' ')
                        .replace(/[.,]/g, '')
                        .replace(/\s+([.,;:!?])/g, '$1')
                        .trim();
                        if (rectangleText) { collected.push({ page: pageIndex + 1, text: rectangleText }); }
                    } catch (e) { console.error('Error extracting rectangle text', e); }
                    pageTexts = collected.slice();
                    renderDialogBody();
                }
                pageTexts = collected;
                renderDialogBody();
            } finally {
                isLoading = false;
                renderDialogBody();
            }
        })();
    }

    let pageOptions: { text: string; value: string }[] = [];

    function refreshPageOptions(): void {
        const currentPage: number = pdfviewer.currentPageNumber || 1;
        pageOptions = [{ text: uiStrings.currentPage, value: 'current' }].concat(Array.from({ length: totalPages }, (_, i: number) => i + 1)
            .filter((pageNumber: number) => pageNumber !== currentPage)
            .map((pageNumber: number) => { return { text: String(pageNumber), value: String(pageNumber) }; }));
        if (pageSelectorObj) { pageSelectorObj.dataSource = pageOptions; pageSelectorObj.dataBind(); }
    }

    const pageSelectorObj: MultiSelect = new MultiSelect({
        width: '200px', popupWidth: '200px', popupHeight: '250px', mode: 'CheckBox',
        showDropDownIcon: true, showSelectAll: true, showClearButton: false,
        dataSource: pageOptions, value: ['current'], fields: { text: 'text', value: 'value' },
        change: handlePageSelection
    });
    pageSelectorObj.appendTo('#pageSelector');

    function handlePageSelection(args: MultiChangeEventArgs): void {
        const values: string[] = (args.value as string[]) || [];
        if (values.length === 0) { pageTexts = []; renderDialogBody(); return; }
        if (values.indexOf('current') !== -1 && values.length === 1) { performExtraction(new Set<number>([0])); return; }
        const selectedSet: Set<number> = new Set<number>();
        values.forEach((v: string) => { if (v === 'current') { selectedSet.add(0); return; } const p: number = parseInt(v, 10); if (!isNaN(p)) { selectedSet.add(p); } });
        if (selectedSet.size === 0) { pageTexts = []; renderDialogBody(); return; }
        performExtraction(selectedSet);
    }

    dialogObj = new Dialog({
        buttons: [
            { buttonModel: { content: uiStrings.cancel, cssClass: 'e-outline' }, click: closeDialog },
            { buttonModel: { content: uiStrings.extract, isPrimary: true }, click: handleExtractClick }
        ],
        isModal: true, visible: false, showCloseIcon: true, closeOnEscape: true, width: '560px',
        header: uiStrings.extractText
    });
    dialogObj.appendTo('#extractTextDialog');

    function getStatusLine(): string {
        const sv: string[] = selectedValues();
        if (!sv.length) { return 'No page selected'; }
        if (sv.indexOf('current') !== -1 && sv.length === 1) { return 'Current page selected'; }
        const numericPages: number = sv.filter((x: string) => x !== 'current').length;
        const selectedPageCount: number = numericPages + (sv.indexOf('current') !== -1 ? 1 : 0);
        if (selectedPageCount === totalPages) { return 'All pages selected'; }
        return selectedPageCount + ' of ' + totalPages + ' pages selected';
    }

    function renderDialogBody(): void {
        const headerTitle: HTMLElement | null = document.getElementById('cardHeaderTitle');
        const contentArea: HTMLElement | null = document.getElementById('dialogCardContentArea');
        if (!headerTitle || !contentArea) { return; }

        if (extractionMode === 'bounded') { headerTitle.textContent = uiStrings.selectArea; }
        else if (pageTexts.length === 0) { headerTitle.textContent = uiStrings.noPage; }
        else {
            const sv: string[] = selectedValues();
            if (sv.indexOf('current') !== -1 && sv.length === 1) { headerTitle.textContent = uiStrings.currentPage; }
            else if (pageTexts.length === totalPages) { headerTitle.textContent = totalPages + ' ' + uiStrings.allPages; }
            else { headerTitle.textContent = pageTexts.length + ' ' + uiStrings.allPages; }
        }

        const statusEl: HTMLElement | null = document.getElementById('extractionStatusText');
        if (statusEl && extractionMode === 'direct') { statusEl.textContent = getStatusLine(); }
        const directOptions: HTMLElement | null = document.getElementById('directExtractionOptions');
        if (directOptions) { directOptions.style.display = extractionMode === 'direct' ? '' : 'none'; }

        if (isLoading && pageTexts.length === 0) { contentArea.innerHTML = '<span style="color:#aaa;font-style:italic;opacity:0.7;">' + uiStrings.extractText + '…</span>'; }
        else if (!isLoading && pageTexts.length === 0) { contentArea.innerHTML = '<span style="color:#aaa;font-style:italic;opacity:0.7;">' + (extractionMode === 'bounded' ? uiStrings.noTextSelected : uiStrings.noPageSelected) + '</span>'; }
        else if (extractionMode === 'direct') {
            contentArea.innerHTML = pageTexts.map((pt: { page: number; text: string }) => {
                return '<div style="margin-bottom:18px;"><div style="font-weight:700;margin-bottom:6px;">Page ' + pt.page + '</div><div>' + escapeHtml(pt.text) + '</div></div>';
            }).join('');
        }
        else { contentArea.textContent = buildAllPagesText(); }

        const hasText: boolean = pageTexts.some((item) => item.text && item.text.trim().length > 0);
        const extractBtn: HTMLButtonElement | null = document.querySelector('#extractTextDialog .e-footer-content button:last-child');
        if (extractBtn) {
            if (!hasText || isLoading) { extractBtn.classList.add('extract-disabled'); extractBtn.disabled = true; }
            else { extractBtn.classList.remove('extract-disabled'); extractBtn.disabled = false; }
        }
    }

    const observer: MutationObserver = new MutationObserver(() => {
        const copyBtn: HTMLElement | null = document.getElementById('dialogClipboardCopyBtn');
        if (copyBtn && !(copyBtn as any).__bound) { copyBtn.addEventListener('click', handleCopyClick); (copyBtn as any).__bound = true; }
    });
    const extractDialogEl: HTMLElement | null = document.getElementById('extractTextDialog');
    if (extractDialogEl) { observer.observe(extractDialogEl, { childList: true, subtree: true }); }

    function fallbackCopyToClipboard(text: string): void {
        try {
            const textArea: HTMLTextAreaElement = document.createElement('textarea');
            textArea.value = text;
            textArea.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0;pointer-events:none;z-index:-1;';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) { /* ignore clipboard errors silently */ }
    }

    function copyToClipboard(text: string): void {
        if (!text || !text.trim()) { return; }
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(text).then(() => { setCopySuccess(true); setTimeout(() => setCopySuccess(false), 2000); }).catch(() => { fallbackCopyToClipboard(text); });
        } else { fallbackCopyToClipboard(text); }
    }

    function setCopySuccess(flag: boolean): void {
        copySuccess = flag;
        const btn: HTMLElement | null = document.getElementById('dialogClipboardCopyBtn');
        if (!btn) { return; }
        btn.title = copySuccess ? uiStrings.copied : uiStrings.copy;
        const icon: HTMLElement | null = btn.querySelector('.e-icons');
        if (icon) {
            if (copySuccess) { icon.classList.remove('e-copy'); icon.classList.add('e-check'); }
            else { icon.classList.remove('e-check'); icon.classList.add('e-copy'); }
        }
    }

    function handleCopyClick(): void {
        const text: string = buildAllPagesText();
        if (text && text.trim()) { copyToClipboard(text); }
    }

    function handleExtractClick(): void {
        const text: string = buildAllPagesText();
        if (text && text.trim() && text.indexOf('[No text found]') === -1) {
            try {
                const el: HTMLAnchorElement = document.createElement('a');
                el.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
                el.download = 'extracted-text-' + Date.now() + '.txt';
                document.body.appendChild(el);
                el.click();
                document.body.removeChild(el);
                URL.revokeObjectURL(el.href);
            } catch (err) {
                // ignore download errors silently
            }
        }
        closeDialog();
    }

    function closeDialog(): void {
        try { dialogObj.hide(); } catch (e) { /* noop */ }
        pageTexts = [];
        copySuccess = false;
        extractionMode = 'direct';
        if (pageSelectorObj) {
            pageSelectorObj.value = ['current'];
            pageSelectorObj.dataBind();
        }
    }
};