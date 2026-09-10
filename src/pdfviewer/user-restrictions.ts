import { loadCultureFiles } from '../common/culture-loader';
import { PdfViewer, Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView,
    ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner,
    PageOrganizer, ToolbarItem } from '@syncfusion/ej2-pdfviewer';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
PdfViewer.Inject(Toolbar, Magnification, Navigation, LinkAnnotation, BookmarkView,
    ThumbnailView, Print, TextSelection, TextSearch, Annotation, FormFields, FormDesigner, PageOrganizer);

const PDF_URL = 'https://cdn.syncfusion.com/content/pdf/pdf-succinctly.pdf';

const RESOURCE_URL = 'https://cdn.syncfusion.com/ej2/23.2.6/dist/ej2-pdfviewer-lib';

interface RoleInfo {
    badge: string;
    badgeBg: string;
    badgeColor: string;
    text: string;
}

const ROLES: { [key: string]: Object }[] = [
    { text: 'Ryan Hodson', value: 'Admin' },
    { text: 'Elton Stoneman', value: 'User' },
    { text: 'Cody Lindley', value: 'ReadOnlyUser' }
];

const ROLE_INFO: { [key: string]: RoleInfo } = {
    Admin: {
        badge: 'Admin',
        badgeBg: '#dcfce7',
        badgeColor: '#15803d',
        text: 'Full access to create, view, edit, delete, and manage all annotations across the application.'
    },
    User: {
        badge: 'User',
        badgeBg: '#dbeafe',
        badgeColor: '#1d4ed8',
        text: 'Can create annotations, modify their own annotations, and reply to annotations created by others.'
    },
    ReadOnlyUser: {
        badge: 'Read-Only User',
        badgeBg: '#fef3c7',
        badgeColor: '#b45309',
        text: 'Can view annotations and PDFs but cannot create, edit, delete, or reply.'
    }
};

/**
 * User restrictions sample
 */
(window as any).default = (): void => {
    loadCultureFiles();
    let viewer: PdfViewer = new PdfViewer();
    let userDropdown: DropDownList;
    let selectedRole: string = 'Admin';

    // Apply role-based permissions to the live viewer. Mirrors the flow
    // used in the shared React platform sample so both samples stay
    // behaviourally equivalent.
    function applyRolePermissions(role: string): void {
        if (!viewer) {
            return;
        }
        const isAdmin: boolean = role === 'Admin';
        const isUser: boolean = role === 'User';

        const currentAuthor: string = userDropdown && userDropdown.text ? userDropdown.text : '';

        // Configure default annotation settings
        viewer.annotationSettings = {
            author: currentAuthor
        };

        if (role === 'ReadOnlyUser') {
            const commentPanel: HTMLElement | null = document.querySelector('.e-pv-comment-panel');
            if (commentPanel && commentPanel.style.display === 'block') {
                (viewer as any).isCommandPanelOpen = true;
                (viewer as any).isCommandPanelOpen = false;
            }
        }

        // Handle existing annotations
        if ((viewer as any).annotationCollection) {
            (viewer as any).annotationCollection.forEach((annotation: any) => {
                if (annotation.annotationSettings) {
                    const annotationAuthor: string = annotation.author || '';

                    if (isAdmin) {
                        annotation.annotationSettings = {
                            author: currentAuthor,
                            isLock: false
                        };
                    } else if (isUser) {
                        // User can only edit own annotations
                        annotation.annotationSettings = {
                            author: currentAuthor,
                            isLock: annotationAuthor !== currentAuthor,
                            allowedInteractions: ['None']
                        };
                    } else {
                        // ReadOnly User
                        annotation.annotationSettings = {
                            isLock: true,
                            allowedInteractions: ['None']
                        };
                    }

                    if ((viewer as any).annotation) {
                        (viewer as any).annotation.editAnnotation(annotation);
                    }
                }
            });
        }

        // Form Field Permissions
        if ((viewer as any).formFieldCollections) {
            (viewer as any).formFieldCollections.forEach((field: any) => {
                if ((viewer as any).formDesignerModule) {
                    (viewer as any).formDesignerModule.updateFormField(field, {
                        isReadOnly: !(isAdmin || isUser)
                    });
                }
            });
        }

        // General permissions
        if (isAdmin || isUser) {
            viewer.enableTextSelection = true;
            viewer.enableDownload = true;
            viewer.enablePageOrganizer = true;
            viewer.contextMenuOption = 'RightClick';
        } else {
            // ReadOnlyUser
            viewer.enableTextSelection = false;
            viewer.enableDownload = false;
            viewer.enablePageOrganizer = false;
            viewer.contextMenuOption = 'None';

            viewer.isFormDesignerToolbarVisible = false;

            if ((viewer as any).toolbarModule) {
                (viewer as any).toolbarModule.showAnnotationToolbar(false);
            }
        }

        // Toolbar settings
        if (isAdmin || isUser) {
            const editorToolbarItems: ToolbarItem[] = [
                'OpenOption', 'UndoRedoTool', 'PageNavigationTool', 'MagnificationTool', 'PanTool',
                'SelectionTool', 'CommentTool', 'SubmitForm', 'AnnotationEditTool',
                'FormDesignerEditTool', 'SearchOption', 'PrintOption', 'DownloadOption'
            ];
            viewer.toolbarSettings = {
                showTooltip: true,
                toolbarItems: editorToolbarItems
            };
        } else {
            const viewToolbarItems: ToolbarItem[] = [
                'OpenOption', 'PageNavigationTool', 'MagnificationTool', 'PanTool', 'PrintOption'
            ];
            viewer.toolbarSettings = {
                showTooltip: true,
                toolbarItems: viewToolbarItems
            };
        }

        viewer.dataBind();
    }

    function updateRoleInfo(role: string): void {
        const roleInfo: RoleInfo = ROLE_INFO[role];
        if (!roleInfo) {
            return;
        }
        const badgeElement = document.querySelector('#roleBadge') as HTMLElement;
        if (badgeElement) {
            badgeElement.textContent = roleInfo.badge;
            badgeElement.style.backgroundColor = roleInfo.badgeBg;
            badgeElement.style.color = roleInfo.badgeColor;
        }
        const textElement = document.querySelector('#roleText') as HTMLElement;
        if (textElement) {
            textElement.textContent = roleInfo.text;
        }
    }

    function handleRoleChange(args: any): void {
        selectedRole = args.value;
        updateRoleInfo(selectedRole);
        applyRolePermissions(selectedRole);
    }

    function documentLoaded(): void {
        applyRolePermissions(selectedRole);
    }

    viewer = new PdfViewer({
        documentPath: PDF_URL,
        resourceUrl: RESOURCE_URL,
        height: '500px',
        documentLoad: documentLoaded
    });
    viewer.appendTo('#pdfViewer');

    userDropdown = new DropDownList({
        dataSource: ROLES,
        fields: { text: 'text', value: 'value' },
        value: selectedRole,
        popupHeight: '120px',
        change: handleRoleChange
    });
    userDropdown.appendTo('#userRestrictionsUser');
    updateRoleInfo(selectedRole);

    const sampleRoute = '/pdfviewer/user-restrictions.html';

    function destroyed(): void {
        if (viewer) {
            viewer.destroy();
        }
        if (userDropdown) {
            userDropdown.destroy();
        }
    }

    function onHashChange(): void {
        if (window.location.hash.indexOf(sampleRoute) === -1) {
            destroyed();
        }
    }

    window.addEventListener('hashchange', onHashChange);
    window.addEventListener('beforeunload', destroyed, { once: true });
}
