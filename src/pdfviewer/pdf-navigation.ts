import { loadCultureFiles } from '../common/culture-loader';
import { 
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView,
    ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner
} from '@syncfusion/ej2-pdfviewer';
import { Toolbar as EjToolbar, ItemModel, ClickEventArgs } from '@syncfusion/ej2-navigations';

PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView, ThumbnailView, 
                Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner);

/**
 * PDF Navigation PdfViewer sample
 */
(window as any).default = (): void => {
    loadCultureFiles();
    
    interface Bookmark {
        id: string;
        title: string;
        pageIndex: number;
        y: number;
        depth: number;
    }

    // State variables
    let bookmarks: Bookmark[] = [];
    let currentPageNumber: string = '1';
    let totalPageCount: number = 0;
    let matchCase: boolean = false;
    let bookmarkScrollPosition: number = 0;
    let pageHandlerAttached: boolean = false;
    let viewer: PdfViewer | null = null;
    let toolbar: EjToolbar | null = null;

    // Normalize bookmark results from different API response formats
    function normalizeBookmarkResult(result: any): Bookmark[] {
        if (!result) return [];
        const typedResult = result;
        const bookmarkRoot = typedResult.bookmarks || typedResult.Bookmarks;
        const roots =
            (bookmarkRoot && (bookmarkRoot.bookMark || bookmarkRoot.bookmark || bookmarkRoot.BookMark)) ||
            bookmarkRoot ||
            (Array.isArray(result) ? result : []);
        const destinationRoot =
            typedResult.bookmarksDestination || typedResult.BookmarksDestination || {};
        const destinations =
            destinationRoot.bookMarkDestination ||
            destinationRoot.bookmarkDestination ||
            destinationRoot.BookMarkDestination ||
            destinationRoot;
        const flattened: Bookmark[] = [];

        const visit = (nodes: any, depth: number = 0): void => {
            if (!Array.isArray(nodes)) return;
            nodes.forEach((node: any, index: number) => {
                const typedNode = node;
                const id = typedNode.Id || typedNode.id || typedNode.BookmarkId || index;
                const destination =
                    (destinations && (destinations[Number(id)] || destinations[id])) ||
                    typedNode.destination ||
                    typedNode.Destination ||
                    {};
                const destinationTyped = destination;
                const pageIndex =
                    destinationTyped.PageIndex ||
                    destinationTyped.pageIndex ||
                    typedNode.PageIndex ||
                    typedNode.pageIndex;
                const y =
                    destinationTyped.Y ||
                    destinationTyped.y ||
                    typedNode.Y ||
                    typedNode.y ||
                    0;
                flattened.push({
                    id: depth + '-' + id + '-' + flattened.length,
                    title:
                        typedNode.Title ||
                        typedNode.title ||
                        typedNode.Text ||
                        typedNode.text ||
                        'Bookmark ' + (flattened.length + 1),
                    pageIndex: Number(pageIndex),
                    y: Number(y),
                    depth: depth
                });
                visit(
                    typedNode.Child || typedNode.child || typedNode.Children || typedNode.children,
                    depth + 1
                );
            });
        };
        visit(roots);
        return flattened.filter((bookmark) => Number.isFinite(bookmark.pageIndex));
    }

    // Create bookmark template element
    function bookmarkTemplate(data: Bookmark): HTMLDivElement {
        const div = document.createElement('div');
        div.className = 'bookmarks-list-item';
        div.style.paddingLeft = (data.depth * 16) + 'px';

        const header = document.createElement('div');
        header.className = 'e-list-item-header';
        header.textContent = 'Page ' + (data.pageIndex + 1);

        const content = document.createElement('div');
        content.className = 'e-list-content';
        content.textContent = data.title;

        div.appendChild(header);
        div.appendChild(content);
        return div;
    }

    // Retrieve bookmarks from PDF
    function retrieveBookmarks(): void {
        if (!viewer) return;
        try {
            const result = viewer.bookmark && viewer.bookmark.getBookmarks();
            bookmarks = normalizeBookmarkResult(result);
            renderBookmarks();
        } catch (error) {
            console.error('Error retrieving bookmarks:', error);
            bookmarks = [];
            renderBookmarks();
        }
    }

    // Handle bookmark selection
    function handleBookmarkSelect(index: number): void {
        if (!viewer) return;
        const bookmarkContainer = document.querySelector('#bookmark_content_area') as HTMLElement;
        if (bookmarkContainer) {
            bookmarkScrollPosition = bookmarkContainer.scrollTop;
        }
        const selected = bookmarks[index];
        if (viewer.bookmark) {
            viewer.bookmark.goToBookmark(selected.pageIndex, 0);
        }
        setTimeout(() => {
            const bookmarkContainerAfter = document.querySelector('#bookmark_content_area') as HTMLElement;
            if (bookmarkContainerAfter) {
                bookmarkContainerAfter.scrollTop = bookmarkScrollPosition;
            }
        }, 100);
    }

    // Render bookmarks in sidebar
    function renderBookmarks(): void {
        const contentArea = document.getElementById('bookmark_content_area') as HTMLElement;
        if (!contentArea) return;

        contentArea.innerHTML = '';

        if (bookmarks.length > 0) {
            const statsDiv = document.createElement('div');
            statsDiv.style.cssText = 'font-size: 13px; font-weight: 600; color: #333; margin-bottom: 12px; padding: 8px 0; flex-shrink: 0;';
            statsDiv.innerHTML = 'Total Bookmarks: <strong>' + bookmarks.length + '</strong>';
            contentArea.appendChild(statsDiv);

            const listContainer = document.createElement('div');
            listContainer.style.cssText = 'flex: 1; overflow: auto; min-height: 0;';
            listContainer.className = 'bookmarks-listview';

            const listDiv = document.createElement('div');
            listDiv.id = 'bookmark_listview';
            listDiv.style.cssText = 'padding: 0; margin: 0;';

            bookmarks.forEach((bookmark, index) => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'e-list-item';
                itemDiv.appendChild(bookmarkTemplate(bookmark));
                itemDiv.onclick = () => { handleBookmarkSelect(index); };
                listDiv.appendChild(itemDiv);
            });

            listContainer.appendChild(listDiv);
            contentArea.appendChild(listContainer);
        } else {
            const emptyDiv = document.createElement('div');
            emptyDiv.style.cssText = 'text-align: center; color: #666; padding: 24px 12px; font-size: 13px;';
            emptyDiv.innerHTML =
                '<p style="margin: 0 0 8px 0;">No bookmarks found</p>' +
                '<p style="margin: 0; color: #999; font-size: 12px;">This PDF does not contain any navigable bookmarks.</p>';
            contentArea.appendChild(emptyDiv);
        }
    }

    // Handle toolbar clicks
    function attachBookmarkKeyboardSupport(): void {
        const contentArea = document.getElementById('bookmark_content_area') as HTMLElement;
        if (!contentArea || (contentArea as any).dataset.keyboardAttached === 'true') {
            return;
        }

        contentArea.setAttribute('tabindex', '0');
        contentArea.setAttribute('role', 'region');
        contentArea.setAttribute('aria-label', 'Bookmarks panel');
        (contentArea as any).dataset.keyboardAttached = 'true';

        contentArea.addEventListener('keydown', (event: KeyboardEvent) => {
            const scrollStep = 48;
            switch (event.key) {
                case 'ArrowDown':
                    event.preventDefault();
                    contentArea.scrollTop += scrollStep;
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    contentArea.scrollTop -= scrollStep;
                    break;
                case 'PageDown':
                    event.preventDefault();
                    contentArea.scrollTop += contentArea.clientHeight;
                    break;
                case 'PageUp':
                    event.preventDefault();
                    contentArea.scrollTop -= contentArea.clientHeight;
                    break;
                case 'Home':
                    event.preventDefault();
                    contentArea.scrollTop = 0;
                    break;
                case 'End':
                    event.preventDefault();
                    contentArea.scrollTop = contentArea.scrollHeight;
                    break;
                default:
                    return;
            }
        });
    }

    function handleToolbarClick(args: ClickEventArgs): void {
        if (!viewer) return;
        const itemId = args.item && (args.item as any).id;
        switch (itemId) {
            case 'first_page':
                viewer.navigation.goToFirstPage();
                break;
            case 'previous_page':
                viewer.navigation.goToPreviousPage();
                break;
            case 'next_page':
                viewer.navigation.goToNextPage();
                break;
            case 'last_page':
                viewer.navigation.goToLastPage();
                break;
            case 'open_option': {
                let fileUpload = document.getElementById('fileUpload') as HTMLInputElement;
                if (!fileUpload) {
                    const input = document.createElement('input') as HTMLInputElement;
                    input.id = 'fileUpload';
                    input.type = 'file';
                    input.accept = '.pdf';
                    input.setAttribute('aria-label', 'Open PDF document');
                    input.style.display = 'none';
                    input.onchange = (e: Event) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files && files[0]) {
                            const file = files[0];
                            const reader = new FileReader();
                            reader.onload = (event: ProgressEvent<FileReader>) => {
                                if (event.target && event.target.result && viewer) {
                                    viewer.documentPath = event.target.result as string;
                                }
                            };
                            reader.readAsDataURL(file);
                        }
                    };
                    document.body.appendChild(input);
                    fileUpload = input;
                }
                if (fileUpload) {
                    fileUpload.click();
                }
                break;
            }
            case 'pan_tool': {
                const panSelectedItem = document.getElementById((args.item && (args.item as any).id) || '');
                const selectTool = document.getElementById('selection_tool');
                if (panSelectedItem) {
                    panSelectedItem.classList.add('e-pv-tbar-btn', 'e-pv-select');
                }
                if (selectTool) {
                    selectTool.classList.remove('e-pv-select');
                }
                if (viewer) {
                    viewer.interactionMode = 'Pan';
                }
                break;
            }
            case 'selection_tool': {
                const selectionSelectedItem = document.getElementById((args.item && (args.item as any).id) || '');
                const panTool = document.getElementById('pan_tool');
                if (selectionSelectedItem) {
                    selectionSelectedItem.classList.add('e-pv-tbar-btn', 'e-pv-select');
                }
                if (panTool) {
                    panTool.classList.remove('e-pv-select');
                }
                if (viewer) {
                    viewer.interactionMode = 'TextSelection';
                }
                break;
            }
            case 'text_search': {
                const searchToolbar = document.getElementById('textSearchToolbar') as HTMLElement;
                if (searchToolbar && searchToolbar.style.display === 'block') {
                    if (viewer) {
                        viewer.textSearch.cancelTextSearch();
                    }
                    const textSearchinput = document.getElementById('pv_search_input') as HTMLInputElement;
                    if (textSearchinput) textSearchinput.value = '';
                    searchToolbar.style.display = 'none';
                } else if (searchToolbar) {
                    searchToolbar.style.display = 'block';
                    const searchInput = document.getElementById('pv_search_input') as HTMLInputElement;
                    if (searchInput) {
                        searchInput.focus();
                    }
                }
                break;
            }
            case 'zoom_in':
                if (viewer) {
                    viewer.magnification.zoomIn();
                }
                break;
            case 'zoom_out':
                if (viewer) {
                    viewer.magnification.zoomOut();
                }
                break;
            case 'fit_page':
                if (viewer) {
                    viewer.magnification.fitToPage();
                }
                break;
        }
    }

    // Update page navigation buttons state
    function updatePageNavigation(): void {
        if (!viewer || !toolbar) {
            return;
        }
        const currentPage = viewer.currentPageNumber;
        const totalPages = viewer.pageCount;
        const firstPageEl = document.getElementById('first_page');
        const previousPageEl = document.getElementById('previous_page');
        const nextPageEl = document.getElementById('next_page');
        const lastPageEl = document.getElementById('last_page');

        if (currentPage === 1) {
            toolbar.enableItems(firstPageEl && firstPageEl.parentElement, false);
            toolbar.enableItems(previousPageEl && previousPageEl.parentElement, false);
            toolbar.enableItems(nextPageEl && nextPageEl.parentElement, true);
            toolbar.enableItems(lastPageEl && lastPageEl.parentElement, true);
        } else if (currentPage === totalPages) {
            toolbar.enableItems(firstPageEl && firstPageEl.parentElement, true);
            toolbar.enableItems(previousPageEl && previousPageEl.parentElement, true);
            toolbar.enableItems(nextPageEl && nextPageEl.parentElement, false);
            toolbar.enableItems(lastPageEl && lastPageEl.parentElement, false);
        } else {
            toolbar.enableItems(firstPageEl && firstPageEl.parentElement, true);
            toolbar.enableItems(previousPageEl && previousPageEl.parentElement, true);
            toolbar.enableItems(nextPageEl && nextPageEl.parentElement, true);
            toolbar.enableItems(lastPageEl && lastPageEl.parentElement, true);
        }
    }

    // Handle zoom change
    function onZoomChange(args: any): void {
        const zoomInEl = document.getElementById('zoom_in');
        const zoomOutEl = document.getElementById('zoom_out');
        if (!zoomInEl || !zoomOutEl || !zoomInEl.parentElement || !zoomOutEl.parentElement) {
            return;
        }
        if (args.zoomValue === 10) {
            toolbar!.enableItems(zoomInEl.parentElement, true);
            toolbar!.enableItems(zoomOutEl.parentElement, false);
        } else if (args.zoomValue === 400) {
            toolbar!.enableItems(zoomInEl.parentElement, false);
            toolbar!.enableItems(zoomOutEl.parentElement, true);
        } else {
            toolbar!.enableItems(zoomInEl.parentElement, true);
            toolbar!.enableItems(zoomOutEl.parentElement, true);
        }
    }

    // Handle document load
    function onDocumentLoad(): void {
        if (!viewer) return;
        attachBookmarkKeyboardSupport();
        retrieveBookmarks();
        const selectTool = document.getElementById('selection_tool');
        if (selectTool) {
            selectTool.classList.add('e-pv-tbar-btn', 'e-pv-select');
        }
        const panTool = document.getElementById('pan_tool');
        if (panTool) {
            panTool.classList.remove('e-pv-select');
        }
        totalPageCount = viewer.pageCount;
        const total = document.getElementById('totalPage');
        if (total) {
            total.textContent = 'of ' + viewer.pageCount;
        }
        const input = document.getElementById('currentPage') as HTMLInputElement;
        if (input) {
            input.value = '1';
        }
        if (input && !pageHandlerAttached) {
            pageHandlerAttached = true;
            input.addEventListener('keypress', (e: KeyboardEvent) => {
                if (e.key === 'Enter' && input && viewer) {
                    const pageNumber = parseInt(input.value, 10);
                    if (
                        !isNaN(pageNumber) &&
                        pageNumber > 0 &&
                        pageNumber <= viewer.pageCount
                    ) {
                        viewer.navigation.goToPage(pageNumber);
                    } else {
                        input.value = viewer.currentPageNumber.toString();
                    }
                }
            });
        }
        updatePageNavigation();
    }

    // Handle page change
    function onPageChange(): void {
        if (!viewer) return;
        currentPageNumber = viewer.currentPageNumber.toString();
        const input = document.getElementById('currentPage') as HTMLInputElement;
        if (input) {
            input.value = currentPageNumber;
        }
        updatePageNavigation();
    }

    // Create toolbar
    toolbar = new EjToolbar({
        clicked: handleToolbarClick,
        items: [
            { id: 'open_option', prefixIcon: 'e-icons e-folder', tooltipText: 'Open', align: 'Left' } as ItemModel,
            { type: 'Separator', align: 'Left' } as ItemModel,
            { id: 'first_page', prefixIcon: 'e-icons e-first-page', tooltipText: 'First Page', align: 'Left' } as ItemModel,
            { id: 'previous_page', prefixIcon: 'e-icons e-chevron-left', tooltipText: 'Previous Page', align: 'Left' } as ItemModel,
            { id: 'next_page', prefixIcon: 'e-icons e-chevron-right', tooltipText: 'Next Page', align: 'Left' } as ItemModel,
            { id: 'last_page', prefixIcon: 'e-icons e-last-page', tooltipText: 'Last Page', align: 'Left' } as ItemModel,
            { type: 'Separator', align: 'Left' } as ItemModel,
            { template: '<input type="text" id="currentPage" class="e-pv-current-page-number" aria-label="Current page number" inputmode="numeric" />', tooltipText: 'Page Number', type: 'Input', align: 'Left' } as ItemModel,
            { template: '<div style="margin: 0px 6px; font-size: 13px; color: #1f1f1f;"><span id="totalPage">of 0</span></div>', align: 'Left', tooltipText: 'Page Number' } as ItemModel,
            { type: 'Separator', align: 'Left' } as ItemModel,
            { id: 'zoom_out', prefixIcon: 'e-icons e-circle-remove', tooltipText: 'Zoom Out', align: 'Left' } as ItemModel,
            { id: 'zoom_in', prefixIcon: 'e-icons e-circle-add', tooltipText: 'Zoom In', align: 'Left' } as ItemModel,
            { id: 'fit_page', prefixIcon: 'e-icons e-pv-fit-page-icon', tooltipText: 'Fit Page', align: 'Left' } as ItemModel,
            { type: 'Separator', align: 'Left' } as ItemModel,
            { id: 'selection_tool', prefixIcon: 'e-icons e-mouse-pointer', tooltipText: 'Selection', align: 'Left' } as ItemModel,
            { id: 'pan_tool', prefixIcon: 'e-icons e-pan', tooltipText: 'Pan', align: 'Left' } as ItemModel,
            { id: 'text_search', prefixIcon: 'e-icons e-search', tooltipText: 'Search', align: 'Right' } as ItemModel
        ],
        cssClass: 'e-pv-toolbar'
    }, '#toolbar');

    attachBookmarkKeyboardSupport();

    // Create PDF Viewer
    viewer = new PdfViewer({
        documentPath: 'https://cdn.syncfusion.com/content/pdf/pdf-succinctly.pdf',
        resourceUrl: 'https://cdn.syncfusion.com/ej2/23.2.6/dist/ej2-pdfviewer-lib',
        enablePageOrganizer: false,
        enableNavigationToolbar: false,
        enableAnnotationToolbar: false,
        enableCommentPanel: false,
        enableToolbar: false,
        documentLoad: onDocumentLoad,
        pageChange: onPageChange,
        zoomChange: onZoomChange
    });
    viewer.appendTo('#pdfviewer_container');

    // Setup text search event listeners
    const searchInput = document.getElementById('pv_search_input') as HTMLInputElement;
    if (searchInput) {
        searchInput.addEventListener('keypress', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                const searchText = searchInput.value;
                if (viewer && searchText.trim()) {
                    viewer.textSearch.searchText(searchText, matchCase);
                }
            }
        });

        searchInput.addEventListener('change', (e: Event) => {
            if (!(e.target as HTMLInputElement).value.trim()) {
                if (viewer) {
                    viewer.textSearch.cancelTextSearch();
                }
            }
        });
    }

    const searchIcon = document.getElementById('pv_search_box_icon');
    if (searchIcon) {
        searchIcon.addEventListener('click', () => {
            const input = document.getElementById('pv_search_input') as HTMLInputElement;
            if (viewer && input && input.value.trim()) {
                viewer.textSearch.searchText(input.value, matchCase);
            }
        });
    }

    const prevBtn = document.getElementById('pv_prev_occurrence');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const input = document.getElementById('pv_search_input') as HTMLInputElement;
            if (viewer && input && input.value.trim()) {
                viewer.textSearch.searchPrevious();
            }
        });
    }

    const nextBtn = document.getElementById('pv_next_occurrence');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const input = document.getElementById('pv_search_input') as HTMLInputElement;
            if (viewer && input && input.value.trim()) {
                viewer.textSearch.searchNext();
            }
        });
    }

    const matchCaseCheckbox = document.getElementById('pv_match_case') as HTMLInputElement;
    if (matchCaseCheckbox) {
        matchCaseCheckbox.addEventListener('change', (e: Event) => {
            matchCase = (e.target as HTMLInputElement).checked;
        });
    }
};