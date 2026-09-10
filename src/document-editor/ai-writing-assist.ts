import { loadCultureFiles } from '../common/culture-loader';
import { DocumentEditorContainer, Toolbar, CustomContentMenuEventArgs, CustomToolbarItemModel } from '@syncfusion/ej2-documenteditor';
import { Dialog } from '@syncfusion/ej2-popups';
import { Toolbar as NavigationToolbar, ClickEventArgs, MenuItemModel } from '@syncfusion/ej2-navigations';
import { ComboBox, ChangeEventArgs } from '@syncfusion/ej2-dropdowns';
import { createSpinner, showSpinner, hideSpinner } from '@syncfusion/ej2-popups';
import { TitleBar } from './title-bar';

// Azure part
interface Message {
  role: string;
  content: string;
}
interface AzureAIRequestOptions {
  messages: Message[];
  model: string;
}

(window as any).default = (): void => {
  loadCultureFiles();

  // Document editor
  DocumentEditorContainer.Inject(Toolbar);

  const toolItem: CustomToolbarItemModel = {
    prefixIcon: 'e-icons e-file-new',
    text: 'AI Write',
    id: 'write'
  };

  const container: DocumentEditorContainer = new DocumentEditorContainer({
    enableToolbar: true,
    height: '99%',
    serviceUrl: 'https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/',
    toolbarItems: [
      'New',
      'Open',
      'Separator',
      toolItem,
      'Separator',
      'Undo',
      'Redo',
      'Separator',
      'Image',
      'Table',
      'Hyperlink',
      'Bookmark',
      'TableOfContents',
      'Separator',
      'Header',
      'Footer',
      'PageSetup',
      'PageNumber',
      'Break',
      'InsertFootnote',
      'InsertEndnote',
      'Separator',
      'Find',
      'Separator',
      'Comments',
      'TrackChanges',
      'Separator',
      'LocalClipboard',
      'RestrictEditing',
      'Separator',
      'FormFields',
      'UpdateFields',
      'ContentControl'
    ]
  });

  if (container.documentEditor) {
    container.appendTo('#DocumentEditor');

    const titleBar: TitleBar = new TitleBar(
      document.getElementById('documenteditor_titlebar')!,
      container.documentEditor,
      true
    );

    container.documentEditor.documentName = 'Getting Started';
    titleBar.updateDocumentTitle();

    // Context menu
    const menuItems: MenuItemModel[] = [
      {
        text: 'AI Write',
        id: 'write',
        iconCss: 'e-icons e-file-new'
      }
    ];
    container.documentEditor?.contextMenu.addCustomMenu(menuItems, false);

    // DOM references (declare early)
    const editableDiv = document.getElementById('e-de-editable-div') as HTMLElement | null;

    // State variables (declare before usage everywhere)
    let toneValue: string = 'Professional';
    let formatValue: string = 'Paragraph';
    let lengthValue: string = 'Medium';
    let outList: string[] = [];

    const toneList: string[] = ['Professional', 'Friendly', 'Instructional', 'Marketing', 'Academic', 'Legal', 'Technical', 'Narrative', 'Direct'];
    const formatValueList: string[] = ['Paragraph', 'Blog post', 'Technical Documentation', 'Report', 'Research Papers', 'Tutorial', 'Meeting Notes'];
    const lengthList: string[] = ['Short', 'Medium', 'Long'];

    // Forward declarations for components used in handlers
    let dialog: Dialog;
    let toolbar: NavigationToolbar;

    // Helpers
    const setPlaceholder = (): void => {
      if (!editableDiv) return;
      if (editableDiv.innerHTML.trim() === '') {
        editableDiv.innerHTML = 'Please provide the topic or idea for content generation...';
        editableDiv.classList.add('placeholder');
      }
    };

    const removePlaceholder = (): void => {
      if (!editableDiv) return;
      if (editableDiv.innerHTML === 'Please provide the topic or idea for content generation...') {
        editableDiv.innerHTML = '';
        editableDiv.classList.remove('placeholder');
      }
    };

    const clearContent = (): void => {
      if (!editableDiv) return;
      editableDiv.innerHTML = '';
      setPlaceholder();
      // Ensure we revert to primary toolbar view
      onChangeToolbarVisibility(true);
    };

    // Toolbar visibility/state utils (guarded for early calls)
    const onChangeToolbarVisibility = async (showPryItem: boolean): Promise<void> => {
      if (!toolbar) return; // Guard if dialog opens before toolbar exists
      const isPrimary = showPryItem;
      for (let i = 0; i < 5; i++) {
        toolbar.items[i].visible = isPrimary;
        toolbar.items[i + 5].visible = !isPrimary;
      }
    };

    const onChangeBtnState = async (isShow: boolean): Promise<void> => {
      if (!toolbar) return;
      toolbar.items[0].disabled = isShow;
      toolbar.items[2].disabled = isShow;
      toolbar.refresh();
      updateIndex();
      const element = document.getElementById('total-page')!;
      element.innerHTML = isShow ? ' of 0' : ' of ' + outList.length;
    };

    const updateIndex = (): void => {
      const numeric = document.getElementById('numeric') as HTMLInputElement | null;
      if (!numeric || !editableDiv) return;
      const text = editableDiv.innerHTML;
      numeric.value = outList.length > 0 && outList.indexOf(text) !== -1 ? (outList.indexOf(text) + 1).toString() : '0';
    };

    // Azure interactions
    const onGenerate = async (options: AzureAIRequestOptions): Promise<void> => {
      outList = [];
      for (let i = 0; i < 3; i++) {
        const response = await (window as any).getAzureChatAIRequest(options);
        if (response && outList.indexOf(response) === -1) {
          outList.push(response);
        } else {
          i--;
        }
      }
      if (outList.length > 0 && editableDiv) {
        editableDiv.innerHTML = outList[0];
      }
    };

    const onGenerateClick = async (): Promise<void> => {
      if (!editableDiv) return;
      const dialogElement = document.getElementById('dialog') as HTMLElement;
      createSpinner({ target: dialogElement });
      showSpinner(dialogElement);

      const text = editableDiv.innerText;
      const options: AzureAIRequestOptions = {
        messages: [
          {
            role: 'system',
            content:
              `You are a helpful assistant. Your task is to generate content based on the provided text. ` +
              `Please adjust the text to reflect a tone of '${toneValue}', formatted in '${formatValue}' style, ` +
              `and maintain a length of '${lengthValue}'. Always respond in proper text format not a md format. ` +
              `Always respond in proper HTML format, excluding <html>, <head>, and <body> tags.`
          },
          { role: 'user', content: text }
        ],
        model: 'gpt-4'
      };

      await onGenerate(options);

      // Change 'Generate' to 'Rewrite' after first generation
      if (toolbar && toolbar.items[3].text === 'Generate') {
        toolbar.items[3].text = 'Rewrite';
      }

      hideSpinner(dialogElement);
    };

    const moveToNext = (): void => {
      if (!editableDiv) return;
      const text = editableDiv.innerHTML;
      const index = outList.indexOf(text);
      if (index + 1 < outList.length) {
        editableDiv.innerHTML = outList[index + 1];
        updateIndex();
      }
    };

    const moveToPrevious = (): void => {
      if (!editableDiv) return;
      const text = editableDiv.innerHTML;
      const index = outList.indexOf(text);
      if (index - 1 >= 0) {
        editableDiv.innerHTML = outList[index - 1];
        updateIndex();
      }
    };

    // Dialog events
    const onOpen = async (): Promise<void> => {
      await onChangeToolbarVisibility(true);
      // await onChangeBtnState(true); // if needed later
    };

    const onClose = (): void => {
      clearContent();
    };

    const onToneChange = (args: ChangeEventArgs): void => {
      toneValue = args.value as string;
    };
    const onFormatChange = (args: ChangeEventArgs): void => {
      formatValue = args.value as string;
    };
    const onLengthChange = (args: ChangeEventArgs): void => {
      lengthValue = args.value as string;
    };

    const onInsertContent = (): void => {
      if (!editableDiv) return;
      const response = editableDiv.innerHTML;
      const http = new XMLHttpRequest();
      const url = container.serviceUrl + 'SystemClipboard';
      http.open('POST', url, true);
      http.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      http.onreadystatechange = () => {
        if (http.readyState === 4 && (http.status === 200 || http.status === 304)) {
          container.documentEditor.editor.paste(http.responseText);
          container.documentEditor.editor.onEnter();
          dialog.hide();
        }
      };
      const sfdt = {
        content: response,
        type: '.Html'
      };
      http.send(JSON.stringify(sfdt));
    };

    // Create dialog (but do NOT show it yet; show it only after toolbar is created)
    dialog = new Dialog({
      header: 'Generate Content',
      showCloseIcon: true,
      content: document.getElementById('e-de-editable-div') as HTMLElement | undefined,
      buttons: [
        {
          click: () => {
            onInsertContent();
            clearContent();
          },
          buttonModel: {
            isPrimary: true,
            content: 'Insert',
            cssClass: 'e-dig-insert'
          }
        },
        {
          click: () => {
            clearContent();
            dialog.hide();
          },
          buttonModel: {
            content: 'Cancel',
            cssClass: 'e-flat'
          }
        }
      ],
      visible: false,
      target: document.getElementById('DocumentEditor') as HTMLElement | undefined,
      width: '50%',
      height: 'auto',
      isModal: true,
      close: onClose, // fixed typo from onclose
      beforeOpen: onOpen
    });
    dialog.appendTo('#dialog');

    // Placeholder setup after dialog DOM is available
    setPlaceholder();
    editableDiv?.addEventListener('focus', removePlaceholder);
    editableDiv?.addEventListener('blur', setPlaceholder);
    editableDiv?.addEventListener('input', function () {
      // Enable Generate/Rewrite button when user types
      if (toolbar) {
        toolbar.items[3].disabled = false;
      }
    });

    // Custom toolbar (our own)
    const onToolbarCreated = async (): Promise<void> => {
      updateIndex();
      // Show the dialog after our toolbar is safely ready (prevents hoisting/runtime issues)
      dialog.show();
    };

    toolbar = new NavigationToolbar({
      items: [
        { prefixIcon: 'e-icons e-chevron-left', click: moveToPrevious },
        {
          type: 'Input',
          align: 'Left',
          cssClass: 'page-count',
          template:
            "<div><input type='text' id='numeric' style='width: 20px;padding-left: 10px;'> <span id=total-page> of 3 </span> </input></div>"
        },
        { prefixIcon: 'e-icons e-chevron-right', click: moveToNext },
        { text: 'Generate', align: 'Right', click: onGenerateClick, disabled: true },
        { prefixIcon: 'e-icons e-settings', click: () => onChangeToolbarVisibility(false) },

        // Secondary set
        { prefixIcon: 'e-icons e-close', click: () => onChangeToolbarVisibility(true) },
        {
          type: 'Input',
          align: 'Left',
          template: new ComboBox({
            width: '125px',
            change: onToneChange,
            value: toneValue,
            dataSource: toneList,
            popupWidth: '125px',
            showClearButton: false,
            readonly: false
          })
        },
        {
          type: 'Input',
          align: 'Left',
          template: new ComboBox({
            width: '200px',
            change: onFormatChange,
            value: formatValue,
            dataSource: formatValueList,
            popupWidth: '200px',
            showClearButton: false,
            readonly: false
          })
        },
        {
          type: 'Input',
          align: 'Left',
          template: new ComboBox({
            width: '100px',
            change: onLengthChange,
            value: lengthValue,
            dataSource: lengthList,
            popupWidth: '100px',
            showClearButton: false,
            readonly: false
          })
        },
        { text: 'Rewrite', click: onGenerateClick }
      ],
      created: onToolbarCreated
    });
    toolbar.appendTo('#e-d-toolbar');

    // Initialize toolbar visibility
    onChangeToolbarVisibility(true);

    // Wire context menu and Ribbon toolbar actions to show dialog
    container.customContextMenuSelect = (args: CustomContentMenuEventArgs): void => {
      const item: string = args.id;
      const id: string = container.element.id;
      switch (item) {
        case id + '_editorwrite':
          dialog.show();
          break;
      }
    };

    container.toolbarClick = (args: ClickEventArgs): void => {
      switch (args.item.id) {
        case 'write':
          dialog.show();
          break;
      }
    };
  }
};