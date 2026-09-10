
import { loadCultureFiles } from '../common/culture-loader';
import {
    PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView,
    ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner, PageOrganizer,
    RectangleSettings
} from '@syncfusion/ej2-pdfviewer';
// tslint:disable-next-line:max-line-length

import { MenuItemModel } from '@syncfusion/ej2-navigations';
import { Button, CheckBox, ChangeEventArgs } from '@syncfusion/ej2-buttons';
import { MultiSelect, CheckBoxSelection } from '@syncfusion/ej2-dropdowns';

PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView, ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner, PageOrganizer);
MultiSelect.Inject(CheckBoxSelection);

/**
 * Context Menu PDF Viewer sample
 */
(window as any).default = (): void => {
    loadCultureFiles();
    let viewer: PdfViewer = new PdfViewer();
    viewer.documentPath = "https://cdn.syncfusion.com/content/pdf/pdf-succinctly.pdf";
    viewer.resourceUrl = "https://cdn.syncfusion.com/ej2/23.2.6/dist/ej2-pdfviewer-lib";
    // Default: right-click must trigger customContextMenuBeforeOpen so the custom
    // menu can be wired up before the first user interaction.
    viewer.contextMenuOption = 'RightClick';
    var menuItems: MenuItemModel[] = [
        {
            text: 'Search In Google',
            id: 'search_in_google',
            iconCss: 'e-icons e-de-ctnr-find'
        },
        {
            text: 'Lock Annotation',
            iconCss: 'e-icons e-lock',
            id: 'lock_annotation'
        },
        {
            text: 'Unlock Annotation',
            iconCss: 'e-icons e-unlock',
            id: 'unlock_annotation'
        },
        {
            text: 'Add Rectangle',
            id: 'add_rectangle',
            iconCss: 'e-icons e-rectangle'
        },
    ];

    var annotationSelectedIds: string[] = ['lock_annotation', 'unlock_annotation'];
    var textSelectionSelectedIds: string[] = ['search_in_google', 'add_rectangle'];
    var formFieldsSelectedIds: string[] = ['read_only_true', 'read_only_false'];
    var selectedMenuIds: string[] = annotationSelectedIds.concat(textSelectionSelectedIds);
    var lastTextSelectionBounds: any[] = [];
    var lastTextSelectionPageNumber: number = 1;

    var annotationData: { id: string, text: string }[] = [
        { id: 'lock_annotation', text: 'Lock Annotation' },
        { id: 'unlock_annotation', text: 'Unlock Annotation' }
    ];
    var textSelectionData: { id: string, text: string }[] = [
        { id: 'search_in_google', text: 'Search In Google' },
        { id: 'add_rectangle', text: 'Add Rectangle' }
    ];
    var formFieldsData: { id: string, text: string }[] = [
        { id: 'read_only_true', text: 'Set Read Only' },
        { id: 'read_only_false', text: 'Remove Read Only' }
    ];


    viewer.appendTo('#pdfViewer');

    var isInitialRender: boolean = true;
    viewer.documentLoad = function (args: any): void {
        if (!isInitialRender) {
            return;
        }
        isInitialRender = false;
        // Initial right-click handling so customContextMenuBeforeOpen is fired.
        viewer.contextMenuOption = 'RightClick';
        // Only register the custom menu up-front when the user wants it.
        if (positionCheckBoxObj.checked) {
            var initialIds: string[] = selectedMenuIds.concat(formFieldsSelectedIds);
            applyMenuConfiguration(initialIds, defaultCheckBoxObj.checked, true);
        }
    }

    viewer.customContextMenuSelect = function (args: any) {
        switch (args.id) {
            case 'search_in_google':
                var textSelectionModule: any = viewer.textSelectionModule;
                if (!(textSelectionModule && textSelectionModule.isTextSelection && textSelectionModule.selectionRangeArray)) {
                    break;
                }
                var ranges: any[] = textSelectionModule.selectionRangeArray || [];
                var selectedText: string = '';
                for (var i: number = 0; i < ranges.length; i++) {
                    var piece: string = (ranges[i] && ranges[i].textContent) ? ranges[i].textContent : '';
                    if (/\S/.test(piece)) {
                        selectedText += (selectedText ? ' ' : '') + piece;
                    }
                }
                selectedText = selectedText.trim();
                if (selectedText) {
                    window.open('https://www.google.com/search?q=' + encodeURIComponent(selectedText), '_blank', 'noopener,noreferrer');
                }
                break;
            case 'add_rectangle':
                addRectangleFromSelection();
                break;
            case 'lock_annotation':
                lockAnnotations(args);
                break;
            case 'unlock_annotation':
                unlockAnnotations(args);
                break;
            case 'read_only_true':
                setReadOnlyTrue(args);
                break;
            case 'read_only_false':
                setReadOnlyFalse(args);
                break;
            case 'formfield properties':
                break;
            default:
                break;
        }
    };

    viewer.customContextMenuBeforeOpen = function (args: any) {
        var hideDefaultChecked: boolean = defaultCheckBoxObj.checked;
        var showCustomBottomChecked: boolean = positionCheckBoxObj.checked;
        var customMenuOptions: HTMLElement = document.getElementById('custom-menu-options');
        if (customMenuOptions) {
            customMenuOptions.style.display = showCustomBottomChecked ? '' : 'none';
        }

        // With defaults visible and no custom-at-bottom, the framework already
        // manages visibility of the built-in items (Copy/Highlight/etc.). Only
        // hide every registered custom item and re-show the ones that match the
        // current selection context.
        if (!hideDefaultChecked && !showCustomBottomChecked) {
            for (var i = 0; i < args.ids.length; i++) {
                var searchNoCustom: HTMLElement = document.getElementById(args.ids[i]);
                if (searchNoCustom) {
                    searchNoCustom.style.display = 'none';
                }
            }
            return;
        }

        // Hide defaults only (no custom items): cancel the open and let defaults decide.
        if (hideDefaultChecked && !showCustomBottomChecked) {
            viewer.contextMenuOption = 'None';
            args.cancel = true;
            return;
        }

        selectedMenuIds = getSelectedMenuIds();

        var isTextSelected: boolean = !!(viewer.textSelectionModule && viewer.textSelectionModule.isTextSelection);
        var hasAnnotations: boolean = !!(viewer.selectedItems && viewer.selectedItems.annotations && viewer.selectedItems.annotations.length > 0);
        var hasFormFields: boolean = !!(viewer.selectedItems && viewer.selectedItems.formFields && viewer.selectedItems.formFields.length > 0);

        for (var i = 0; i < args.ids.length; i++) {
            var id: string = args.ids[i];
            var search: HTMLElement = document.getElementById(id);
            if (!search) {
                continue;
            }
            search.style.display = 'none';

            var shown: boolean = false;

            // TEXT-SELECTION context.
            if (isTextSelected) {
                if (id === 'search_in_google' && textSelectionSelectedIds.indexOf('search_in_google') !== -1) {
                    shown = true;
                } else if (id === 'add_rectangle' && textSelectionSelectedIds.indexOf('add_rectangle') !== -1
                    && lastTextSelectionBounds.length > 0) {
                    shown = true;
                }
            }
            // ANNOTATION context.
            else if (hasAnnotations) {
                if ((id === 'lock_annotation' || id === 'unlock_annotation')
                    && annotationSelectedIds.indexOf(id) !== -1
                    && shouldShowAnnotationAction(id)) {
                    shown = true;
                }
            }
            // FORM-FIELD context.
            else if (hasFormFields) {
                if ((id === 'read_only_true' || id === 'read_only_false')
                    && formFieldsSelectedIds.indexOf(id) !== -1
                    && shouldShowReadOnlyAction(id)) {
                    shown = true;
                } else if (id === 'formfield properties') {
                    shown = true;
                }
            }

            if (shown) {
                search.style.display = 'block';
            }
        }
    };

    function shouldShowAnnotationAction(id: string): boolean {
        var isLockOption: boolean = id === 'lock_annotation';
        var signatureTypes: Set<string> = new Set<string>([
            'HandWrittenSignature', 'SignatureText', 'SignatureImage'
        ]);
        var annotations: any[] = (viewer.selectedItems && viewer.selectedItems.annotations) || [];
        if (!annotations.length) {
            return false;
        }
        for (var i: number = 0; i < annotations.length; i++) {
            var annotation: any = annotations[i];
            if (!annotation || !annotation.annotationSettings) {
                continue;
            }
            if (isLockOption && signatureTypes.has(annotation.shapeAnnotationType)) {
                continue;
            }
            var isLocked: boolean = !!annotation.annotationSettings.isLock;
            if (isLockOption ? !isLocked : isLocked) {
                return true;
            }
        }
        return false;
    }

    function shouldShowReadOnlyAction(id: string): boolean {
        var setReadOnly: boolean = id === 'read_only_true';
        var fields: any[] = (viewer.selectedItems && viewer.selectedItems.formFields) || [];
        if (!fields.length) {
            return false;
        }
        for (var i: number = 0; i < fields.length; i++) {
            var field: any = fields[i];
            if (!field) {
                continue;
            }
            var isReadonly: boolean = !!(field.isReadonly !== undefined ? field.isReadonly : field.isReadOnly);
            if (setReadOnly ? !isReadonly : isReadonly) {
                return true;
            }
        }
        return false;
    }

    function setAnnotationLock(isLocked: boolean, args: any): void {
        var annotations: any[] = (viewer.selectedItems && viewer.selectedItems.annotations) || [];
        var selectedKeys: Set<string> = new Set<string>();
        for (var a: number = 0; a < annotations.length; a++) {
            var sel: any = annotations[a];
            if (!sel) {
                continue;
            }
            var key: string = sel.id || sel.uniqueKey;
            if (key !== undefined && key !== null && key !== '') {
                selectedKeys.add(String(key));
            }
        }
        if (!selectedKeys.size) {
            args.cancel = false;
            return;
        }
        var collection: any[] = viewer.annotationCollection || [];
        for (var i: number = 0; i < collection.length; i++) {
            var item: any = collection[i];
            if (!item) {
                continue;
            }
            var id: string = String(item.id !== undefined && item.id !== null ? item.id : item.uniqueKey);
            if (!selectedKeys.has(id)) {
                continue;
            }
            item.annotationSettings = item.annotationSettings || {};
            item.annotationSettings.isLock = isLocked;
            item.isCommentLock = isLocked;
            viewer.annotation.editAnnotation(item);
        }
        args.cancel = false;
    }

    function lockAnnotations(args: any): void {
        setAnnotationLock(true, args);
    }

    function unlockAnnotations(args: any): void {
        setAnnotationLock(false, args);
    }

    function setReadOnlyTrue(args: any) {
        var selectedFormFields = viewer.selectedItems.formFields;
        for (var i = 0; i < selectedFormFields.length; i++) {
            var selectedFormField = selectedFormFields[i];
            if (selectedFormField) {
                viewer.formDesignerModule.updateFormField(selectedFormField, {
                    isReadOnly: true,
                } as any);
            }
            args.cancel = false;
        }
    }

    function setReadOnlyFalse(args: any) {
        var selectedFormFields = viewer.selectedItems.formFields;
        for (var i = 0; i < selectedFormFields.length; i++) {
            var selectedFormField = selectedFormFields[i];
            if (selectedFormField) {
                viewer.formDesignerModule.updateFormField(selectedFormField, {
                    isReadOnly: false,
                } as any);
            }
            args.cancel = false;
        }
    }

    function getCustomItems(ids: string[]): MenuItemModel[] {
        return ids.filter((id: string) => id === 'read_only_true' || id === 'read_only_false').map((id: string) => ({
            text: id === 'read_only_true' ? 'Set Read Only' : 'Remove Read Only',
            id: id,
            iconCss: id === 'read_only_true' ? 'e-icons e-lock' : 'e-icons e-unlock'
        }));
    }

    function getSelectedMenuIds(): string[] {
        return (annotationSelectObj ? annotationSelectObj.value as string[] : annotationSelectedIds)
            .concat(textSelectionSelectObj ? textSelectionSelectObj.value as string[] : textSelectionSelectedIds)
            .concat(formFieldsSelectObj ? formFieldsSelectObj.value as string[] : formFieldsSelectedIds);
    }

    function applyMenuConfiguration(ids: string[], hideDefault: boolean, showBottom: boolean): void {
        var baseItems: MenuItemModel[] = menuItems.filter((item: MenuItemModel) => ids.indexOf(item.id) !== -1);
        viewer.addCustomMenu(baseItems.concat(getCustomItems(ids)), hideDefault, showBottom);
    }

    // Build and append the property-pane controls FIRST so that documentLoad
    // can safely read defaultCheckBoxObj/positionCheckBoxObj state.
    let defaultCheckBoxObj: CheckBox = new CheckBox({
        change: contextmenuHelper,
        cssClass: 'multiline',
    });
    defaultCheckBoxObj.appendTo('#hide-default-context-menu');

    let positionCheckBoxObj: CheckBox = new CheckBox({
        change: contextmenuHelper,
        cssClass: 'multiline',
    });
    positionCheckBoxObj.appendTo('#show-custom-menu-bottom');

    var annotationSelectObj: MultiSelect = new MultiSelect({
        dataSource: annotationData,
        fields: { text: 'text', value: 'id' },
        value: annotationSelectedIds,
        width: '220px',
        mode: 'CheckBox',
        showSelectAll: false,
        showDropDownIcon: true,
        placeholder: 'Select annotation options',
        change: handleCategoryChange
    });
    annotationSelectObj.appendTo('#annotation-menu-select');

    var textSelectionSelectObj: MultiSelect = new MultiSelect({
        dataSource: textSelectionData,
        fields: { text: 'text', value: 'id' },
        value: textSelectionSelectedIds,
        width: '220px',
        mode: 'CheckBox',
        showSelectAll: false,
        showDropDownIcon: true,
        placeholder: 'Select text selection options',
        change: handleCategoryChange
    });
    textSelectionSelectObj.appendTo('#text-selection-menu-select');

    var formFieldsSelectObj: MultiSelect = new MultiSelect({
        dataSource: formFieldsData,
        fields: { text: 'text', value: 'id' },
        value: formFieldsSelectedIds,
        width: '220px',
        mode: 'CheckBox',
        showSelectAll: false,
        showDropDownIcon: true,
        placeholder: 'Select form fields options',
        change: handleCategoryChange
    });
    formFieldsSelectObj.appendTo('#form-fields-menu-select');

    const applyMenuBtn: Button = new Button({
        content: 'Customize',
        isPrimary: true,
        cssClass: 'e-block'
    });
    applyMenuBtn.appendTo('#apply-menu-btn');
    applyMenuBtn.element.addEventListener('click', applyContextMenu);

    function handleCategoryChange(): void {
        annotationSelectedIds = annotationSelectObj.value as string[];
        textSelectionSelectedIds = textSelectionSelectObj.value as string[];
        formFieldsSelectedIds = formFieldsSelectObj.value as string[];
    }

    viewer.textSelectionEnd = function (args: any): void {
        lastTextSelectionPageNumber = args.pageNumber;
        lastTextSelectionBounds = args.textBounds || [];
    };

    function addRectangleFromSelection(): void {
        if (!lastTextSelectionBounds.length) {
            return;
        }
        var firstBound: any = lastTextSelectionBounds[0];
        var lastBound: any = lastTextSelectionBounds[lastTextSelectionBounds.length - 1];

        var left: number = Number(firstBound.left !== undefined ? firstBound.left : firstBound.x) || 0;
        var top: number = Number(firstBound.top !== undefined ? firstBound.top : firstBound.y) || 0;
        var lastRight: number = lastBound.right;
        if (lastRight === undefined) {
            var lastX: number = Number(lastBound.left !== undefined ? lastBound.left : lastBound.x) || 0;
            var lastW: number = Number(lastBound.width) || 0;
            lastRight = lastX + lastW;
        }
        var lastBottom: number = lastBound.bottom;
        if (lastBottom === undefined) {
            var lastY: number = Number(lastBound.top !== undefined ? lastBound.top : lastBound.y) || 0;
            var lastH: number = Number(lastBound.height) || 0;
            lastBottom = lastY + lastH;
        }
        var right: number = Number(lastRight) || 0;
        var bottom: number = Number(lastBottom) || 0;

        viewer.annotation.addAnnotation('Rectangle', {
            offset: { x: left, y: top },
            pageNumber: lastTextSelectionPageNumber || viewer.currentPageNumber,
            width: Math.max(1, right - left),
            height: Math.max(1, bottom - top)
        } as RectangleSettings);
    }

    function applyContextMenu(): void {
        // Pull the latest multi-select values before re-registering the custom menu.
        handleCategoryChange();
        if (!positionCheckBoxObj.checked) {
            // Custom menu disabled: clear any prior registration and restore defaults.
            viewer.addCustomMenu([], defaultCheckBoxObj.checked, false);
            viewer.contextMenuOption = defaultCheckBoxObj.checked ? 'None' : 'RightClick';
            selectedMenuIds = [];
            return;
        }
        // Custom menu enabled: ensure right-click firing so customContextMenuBeforeOpen runs.
        viewer.contextMenuOption = 'RightClick';
        selectedMenuIds = getSelectedMenuIds();
        applyMenuConfiguration(selectedMenuIds, defaultCheckBoxObj.checked, true);
    }

    function contextmenuHelper(args: ChangeEventArgs): void {
        var showCustomBottomChecked: boolean = positionCheckBoxObj.checked;
        var hideDefaultChecked: boolean = defaultCheckBoxObj.checked;
        var customMenuOptions: HTMLElement = document.getElementById('custom-menu-options');
        if (customMenuOptions) {
            customMenuOptions.style.display = showCustomBottomChecked ? '' : 'none';
        }
        if (!showCustomBottomChecked) {
            selectedMenuIds = [];
            viewer.addCustomMenu([], hideDefaultChecked, false);
            viewer.contextMenuOption = hideDefaultChecked ? 'None' : 'RightClick';
            return;
        }
        viewer.contextMenuOption = 'RightClick';
        selectedMenuIds = getSelectedMenuIds();
        applyMenuConfiguration(selectedMenuIds, hideDefaultChecked, true);
    }
};