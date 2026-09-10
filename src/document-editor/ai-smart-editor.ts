import { loadCultureFiles } from '../common/culture-loader';
import { DocumentEditorContainer, Toolbar } from '@syncfusion/ej2-documenteditor';
import { Dialog, OpenEventArgs } from '@syncfusion/ej2-popups';
import { Toolbar as NavigationToolbar, MenuItemModel } from '@syncfusion/ej2-navigations';
import { ComboBox, MultiSelect, CheckBoxSelection, ChangeEventArgs, MultiSelectChangeEventArgs } from '@syncfusion/ej2-dropdowns';
import { CustomContentMenuEventArgs } from '@syncfusion/ej2-documenteditor';
import { Splitter } from '@syncfusion/ej2-layouts';
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

  // Document Editor
  DocumentEditorContainer.Inject(Toolbar);
  const container: DocumentEditorContainer = new DocumentEditorContainer({
    enableToolbar: true,
    height: '99%',
    width: '100%',
    serviceUrl: 'https://document.syncfusion.com/web-services/docx-editor/api/documenteditor/'
  });

  container.created = () => {
    const sfdt: string = '{\"sfdt\":\"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\"}';
    container.documentEditor.open(sfdt);
  };
  container.appendTo('#DocumentEditor');

  if (container.documentEditor) {

    const titleBar: TitleBar = new TitleBar(document.getElementById('documenteditor_titlebar')!, container.documentEditor, true);
    if (container.documentEditor) {
      container.documentEditor.documentName = 'Getting Started';
    }
    titleBar.updateDocumentTitle();

    // Spinner host must exist when created
    createSpinner({
      target: document.getElementById('dialog') as HTMLElement
    });

    // State variables (declare before usage)
    let toneValue: string = 'Professional';
    let formatValue: string = 'Paragraph';
    let lengthValue: string = 'Medium';
    let outList: string[] = [];
    let translateValue: string = 'French';
    let grammerList: string[] = [];

    const toneList: string[] = ['Professional', 'Friendly', 'Instructional', 'Marketing', 'Academic', 'Legal', 'Technical', 'Narrative', 'Direct'];
    const formatValueList: string[] = ['Paragraph', 'Blog post', 'Technical Documentation', 'Report', 'Research Papers', 'Tutorial', 'Meeting Notes'];
    const lengthList: string[] = ['Short', 'Medium', 'Long'];
    const languageList: string[] = ['Simplified Chinese', 'Spanish', 'French', 'Arabic', 'Portuguese', 'Russian', 'Urdu', 'Indonesian', 'German', 'Japanese'];

    MultiSelect.Inject(CheckBoxSelection);

    const grammer: { [key: string]: Object }[] = [
      { id: 'SVA', name: 'Subject-Verb Agreement' },
      { id: 'TC', name: 'Tense Consistency' },
      { id: 'PA', name: 'Pronoun Agreement' },
      { id: 'CU', name: 'Comma Usage' },
      { id: 'PS', name: 'Parallel Structure' },
      { id: 'MM', name: 'Misplaced Modifiers' },
      { id: 'DM', name: 'Dangling Modifiers' },
      { id: 'WC', name: 'Word Choice' },
      { id: 'R', name: 'Redundancy' },
      { id: 'UA', name: 'Use of Articles' },
      { id: 'PM', name: 'Punctuation Marks' },
      { id: 'APC', name: 'Apostrophes for Possessives and Contractions' },
      { id: 'SE', name: 'Spelling Errors' }
    ];

    // DOM references (declare before any function reads them)
    const questionDiv = document.getElementById('e-de-qus-div') as HTMLElement;
    const editableDiv = document.getElementById('e-de-editable-div') as HTMLElement;

    // Forward declarations for variables used inside functions
    let toolbar: NavigationToolbar;
    let multiSelect: MultiSelect;
    let dialog: Dialog;

    // Functions (function declarations are hoisted; variables referenced are ensured to be assigned before invocation)

    const onChangeToolbarVisibility = (
      showPryItem: boolean,
      showTranslateItem: boolean,
      showGrammerItem: boolean
    ): void => {
      let isPrimary = false;
      let isSecondary = true;
      let isTranslate = false;
      let isGrammer = false;

      if (showPryItem) {
        isPrimary = true;
        isSecondary = false;
      } else if (showTranslateItem) {
        isTranslate = true;
        isSecondary = false;
      } else if (showGrammerItem) {
        isGrammer = true;
        isSecondary = false;
      }

      for (let i = 0; i < 5; i++) {
        toolbar.items[i].visible = isPrimary;
        toolbar.items[i + 5].visible = isSecondary;
      }
      toolbar.items[10].visible = isTranslate;
      toolbar.items[11].visible = isTranslate;
      toolbar.items[12].visible = isGrammer;
      toolbar.items[13].visible = isGrammer;
    };

    const onBeforeOpen = (): void => {
      onChangeToolbarVisibility(true, false, false);
    };

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
      if (outList.length > 0) {
        editableDiv!.innerHTML = outList[0];
        updateIndex();
      }
    };

    const reframeContent = async (options: AzureAIRequestOptions): Promise<void> => {
      const response = await (window as any).getAzureChatAIRequest(options);
      if (response) {
        editableDiv!.innerHTML = response;
      }
    };

    const onRewriteClick = async (): Promise<void> => {
      const dialogElement = document.getElementById('dialog') as HTMLElement;
      showSpinner(dialogElement);
      const text: string = questionDiv!.innerText;
      const options: AzureAIRequestOptions = {
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant. Your task is to analyze the provided text and rephrase it. Please adjust the text to reflect a tone of '${toneValue}', formatted in '${formatValue}' style, and maintain a length of '${lengthValue}'. Always respond in proper HTML format, excluding <html>, <head>, and <body> tags.`
          },
          { role: 'user', content: text }
        ],
        model: 'gpt-4'
      };
      await onGenerate(options);
      hideSpinner(dialogElement);
    };

    const onTranslateClick = async (): Promise<void> => {
      const dialogElement = document.getElementById('dialog') as HTMLElement;
      showSpinner(dialogElement);
      const text: string = questionDiv!.innerText;
      const options: AzureAIRequestOptions = {
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant. Your task is to translate the provided text into '${translateValue}'. Always respond in proper HTML format, excluding <html> and <head> tags.`
          },
          { role: 'user', content: text }
        ],
        model: 'gpt-4'
      };
      await reframeContent(options);
      hideSpinner(dialogElement);
    };

    const onGrammerCheckClick = async (): Promise<void> => {
      const dialogElement = document.getElementById('dialog') as HTMLElement;
      showSpinner(dialogElement);
      let systemPrompt = '';

      if (grammerList.length > 0) {
        const value = grammerList.join(', ');
        systemPrompt = `You are a helpful assistant. Your task is to analyze the provided text and perform the following grammar checks: ${value}. Please ensure that the revised text reflects these corrections. Always respond in proper HTML format, but do not include <html>, <head>, or <body> tags.`;
      } else {
        systemPrompt =
          'You are a helpful assistant. Your task is to analyze the provided text, check for and correct any grammatical errors, and rephrase it. Always respond in proper HTML format, but do not include <html>, <head>, or <body> tags.';
      }

      const text: string = questionDiv!.innerText;
      const options: AzureAIRequestOptions = {
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text }
        ],
        model: 'gpt-4'
      };
      await reframeContent(options);
      hideSpinner(dialogElement);
    };

    const moveToNext = (): void => {
      const text = editableDiv!.innerHTML;
      const index = outList.indexOf(text);
      if (index + 1 < outList.length) {
        editableDiv!.innerHTML = outList[index + 1];
        updateIndex();
      }
    };

    const moveToPrevious = (): void => {
      const text = editableDiv!.innerHTML;
      const index = outList.indexOf(text);
      if (index - 1 >= 0) {
        editableDiv!.innerHTML = outList[index - 1];
        updateIndex();
      }
    };

    const moveToNextPara = (): void => {
      editableDiv!.innerHTML = '';
      container.documentEditor.selection.moveToParagraphEnd();
      container.documentEditor.selection.moveToNextLine();
      container.documentEditor.selection.selectParagraph();
      questionDiv!.innerText = container.documentEditor.selection.text;
      if (dialog.header === 'AI Translate') {
        onTranslateClick();
      } else if (dialog.header === 'AI Rephrase') {
        onRewriteClick();
      } else {
        onGrammerCheckClick();
      }
    };

    const moveToPreviousPara = (): void => {
      editableDiv!.innerHTML = '';
      container.documentEditor.selection.moveToParagraphStart();
      container.documentEditor.selection.moveToPreviousLine();
      container.documentEditor.selection.selectParagraph();
      questionDiv!.innerText = container.documentEditor.selection.text;
      if (dialog.header === 'AI Translate') {
        onTranslateClick();
      } else if (dialog.header === 'AI Rephrase') {
        onRewriteClick();
      } else {
        onGrammerCheckClick();
      }
    };

    const updateIndex = (): void => {
      const element = document.getElementById('numeric')! as HTMLInputElement;
      const text = editableDiv!.innerHTML;
      const index = outList.indexOf(text);
      element.value = index !== -1 ? (index + 1).toString() : '0';
    };

    const onInsertContent = async (): Promise<void> => {
      const response: string = editableDiv!.innerHTML;
      const http = new XMLHttpRequest();
      const url: string = container.serviceUrl + 'SystemClipboard';
      http.open('POST', url, true);
      http.setRequestHeader('Content-Type', 'application/json;charset=UTF-8');
      http.onreadystatechange = () => {
        if (http.readyState === 4 && (http.status === 200 || http.status === 304)) {
          container.documentEditor.editor.paste(http.responseText);
          container.documentEditor.editor.onEnter();
          clearContent();
          dialog.hide();
        }
      };
      const sfdt = {
        content: response,
        type: '.Html'
      };
      http.send(JSON.stringify(sfdt));
    };

    const clearContent = (): void => {
      editableDiv!.innerHTML = '';
      questionDiv!.innerText = '';
    };

    const onSettingsClick = (): void => {
      onChangeToolbarVisibility(false, false, false);
    };

    const onCloseSecndaryToolbar = (): void => {
      onChangeToolbarVisibility(true, false, false);
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

    const onLanguageChange = (args: ChangeEventArgs): void => {
      translateValue = args.value as string;
    };

    const ValueChangeHandler = (args: MultiSelectChangeEventArgs): void => {
      grammerList = args.value as string[];
    };

    const onClose = (): void => {
      clearContent();
    };

    const onOpen = (args: OpenEventArgs): void => {
      args.preventFocus = true;
    };

    const onRewrite = (): void => {
      dialog.header = 'AI Rephrase';
      dialog.show();
      questionDiv!.innerText = container.documentEditor.selection.text;
      onChangeToolbarVisibility(true, false, false);
      onRewriteClick();
    };

    const onTranslate = (): void => {
      dialog.header = 'AI Translate';
      dialog.show();
      questionDiv!.innerText = container.documentEditor.selection.text;
      onChangeToolbarVisibility(false, true, false);
      onTranslateClick();
    };

    const onGrammerCheck = (): void => {
      dialog.header = 'Grammer';
      dialog.show();
      questionDiv!.innerText = container.documentEditor.selection.text;
      onChangeToolbarVisibility(false, false, true);
      onGrammerCheckClick();
    };

    // Context menu items
    const menuItems: MenuItemModel[] = [
      { text: 'Rewrite', id: 'rewrite', iconCss: 'e-icons e-edit' },
      { text: 'Translate', id: 'translate', iconCss: 'e-icons e-transform-right' },
      { text: 'Grammar', id: 'grammer', iconCss: 'e-icons e-redaction' }
    ];

    container.documentEditor?.contextMenu.addCustomMenu(menuItems, false);

    if (container.documentEditor) {
      // Use any to avoid redacted type
      container.documentEditor.customContextMenuBeforeOpen = (args: any): void => {
        const isEmpty: boolean = container.documentEditor.selection.isEmpty;
        for (let i = 0; i < args.ids.length; i++) {
          const element: HTMLElement = document.getElementById(args.ids[i])!;
          element.style.display = isEmpty ? 'none' : 'block';
        }
      };
    }

    container.customContextMenuSelect = (args: CustomContentMenuEventArgs): void => {
      const item: string = args.id;
      const id: string = container.element.id;
      switch (item) {
        case id + '_editorrewrite':
          onRewrite();
          break;
        case id + '_editortranslate':
          onTranslate();
          break;
        case id + '_editorgrammer':
          onGrammerCheck();
          break;
      }
    };

    // Dialog
    dialog = new Dialog({
      header: 'AI Rephrase',
      showCloseIcon: true,
      content: document.getElementById('splitter') as HTMLElement | undefined,
      buttons: [
        {
          click: () => {
            onInsertContent();
          },
          buttonModel: {
            isPrimary: true,
            content: 'Replace'
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
      close: onClose,       // fixed typo (was onclose)
      beforeOpen: onBeforeOpen,
      open: onOpen
    });
    dialog.appendTo('#dialog');

    // Splitter
    const splitter: Splitter = new Splitter({
      height: 'auto',
      paneSettings: [
        { size: 'auto', collapsible: true },
        { size: 'auto', collapsible: true }
      ],
      orientation: 'Vertical',
      width: '100%'
    });
    splitter.appendTo('#splitter');

    // Question navigation toolbar
    const qusToolbar: NavigationToolbar = new NavigationToolbar({
      items: [
        { prefixIcon: 'e-icons e-chevron-left', align: 'Center', click: moveToPreviousPara },
        { prefixIcon: 'e-icons e-chevron-right', align: 'Center', click: moveToNextPara }
      ]
    });
    qusToolbar.appendTo('#e-de-qus-toolbar');

    // AI options toolbar
    const onToolbarCreated = (): void => {
      updateIndex();
    };


    toolbar = new NavigationToolbar({
      items: [
        // 1st row
        { prefixIcon: 'e-icons e-chevron-left', click: moveToPrevious },
        {
          type: 'Input',
          align: 'Left',
          cssClass: 'page-count',
          template: "<div><input type='text' id='numeric' style='width: 20px;padding-left: 10px;'> <span class=total-page> of 3 </span> </input></div>"
        },
        { prefixIcon: 'e-icons e-chevron-right', click: moveToNext },
        { text: 'Rewrite', align: 'Right', click: onRewriteClick },
        { prefixIcon: 'e-icons e-settings', click: onSettingsClick },

        // 2nd row (Rewrite Settings)
        { prefixIcon: 'e-icons e-close', click: onCloseSecndaryToolbar },
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
        { text: 'Rewrite', click: onRewriteClick },

        // 3rd row (Translate)
        {
          type: 'Input',
          align: 'Left',
          template: new ComboBox({
            width: '160px',
            change: onLanguageChange,
            value: 'French',
            dataSource: languageList,
            popupWidth: '160px',
            showClearButton: false,
            readonly: false
          })
        },
        { text: 'Translate', click: onTranslateClick },

        // 4th row (Grammar)
        {
          type: 'Input',
          align: 'Left',
          template: (multiSelect = new MultiSelect({
            width: '250px',
            change: ValueChangeHandler,
            dataSource: grammer,
            fields: { text: 'name', value: 'name' },
            placeholder: 'e.g. Spelling Errors',
            mode: 'CheckBox',
            showSelectAll: true,
            selectAllText: 'Select All',
            showDropDownIcon: true,
            enableSelectionOrder: true,
            filterBarPlaceholder: 'Search grammar suggestion'
          }))
        },
        { text: 'Rewrite', align: 'Right', click: onGrammerCheckClick }
      ],
      created: onToolbarCreated
    });
    toolbar.appendTo('#e-d-toolbar');

    // Initial visible toolbar section
    onChangeToolbarVisibility(true, false, false);

  }
};