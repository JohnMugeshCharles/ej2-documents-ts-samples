import { loadCultureFiles } from '../common/culture-loader';
import { BeforeOpenEventArgs, BeforeSaveEventArgs, Spreadsheet } from '@syncfusion/ej2-spreadsheet';
import { Button } from '@syncfusion/ej2-buttons';
import { MultiSelect, CheckBoxSelection } from '@syncfusion/ej2-dropdowns';
import { Uploader } from '@syncfusion/ej2-inputs';
import * as dataSource from './default-data.json';
MultiSelect.Inject(CheckBoxSelection);

(window as any).default = (): void => {
    loadCultureFiles();
    let files: any;
    const spreadsheet: Spreadsheet = new Spreadsheet({
        sheets: [
            {
                name: 'Car Sales Report',
                ranges: [{ dataSource: (dataSource as any).defaultData }],
                rows: [
                    {
                        index: 30,
                        cells: [
                            { index: 4, value: 'Total Amount:', style: { fontWeight: 'bold', textAlign: 'right' } },
                            { formula: '=SUM(F2:F30)', style: { fontWeight: 'bold' } },
                        ]
                    }],
                columns: [
                    { width: 180 }, { width: 130 }, { width: 130 }, { width: 180 },
                    { width: 130 }, { width: 120 }
                ]
            }],
        openUrl: 'https://document.syncfusion.com/web-services/spreadsheet-editor/api/spreadsheet/open',
        saveUrl: 'https://document.syncfusion.com/web-services/spreadsheet-editor/api/spreadsheet/save',

        created: (): void => {
            spreadsheet.cellFormat({ fontWeight: 'bold', textAlign: 'center', verticalAlign: 'middle' }, 'A1:F1');
            spreadsheet.numberFormat('$#,##0.00', 'F2:F31');
            spreadsheet.numberFormat('m/d/yyyy', 'E2:E30');
        },
        beforeOpen: (args: BeforeOpenEventArgs) => {
            args.parseOptions = getSelectedOptions(true);
        },
        beforeSave: (args: BeforeSaveEventArgs) => {
            args.jsonConfig = getSelectedOptions();
        }
    });
    spreadsheet.appendTo('#spreadsheet');

    const multiSelect: MultiSelect = new MultiSelect({
        dataSource: ['Ignore Styles', 'Ignore Charts', 'Ignore Images', 'Ignore Formats',
            'Ignore Formulas', 'Ignore Validations', 'Ignore Merged Cells', 'Ignore Conditional Formats'],
        placeholder: "Select parse options",
        mode: 'CheckBox',
        showDropDownIcon: true,
        popupWidth: '240px'
    });
    multiSelect.appendTo('#open');

    const multiSelectSave: MultiSelect = new MultiSelect({
        dataSource: ['Only Values', 'Ignore Styles', 'Ignore Charts', 'Ignore Images',
            'Ignore Formats', 'Ignore Notes', 'Ignore Wraps', 'Ignore Formulas',
            'Ignore Validations', 'Ignore Freeze Panes', 'Ignore Conditional Formats'],
        placeholder: "Select serialization options",
        mode: 'CheckBox',
        showDropDownIcon: true,
        popupWidth: '240px'
    });
    multiSelectSave.appendTo('#save');

    const uploadObj: Uploader = new Uploader({
        cssClass: 'e-ss-uploader',
        allowedExtensions: '.xls, .xlsx, .csv, .xlsm, .xlsb',
        showFileList: true,
        buttons: { browse: 'Choose file' },
        multiple: false,
        selected: (args: any) => {
            files = args.filesData[0].rawFile;
        }
    });
    uploadObj.appendTo('#parse_upload');

    const openButton: Button = new Button({ isPrimary: true, content: 'Open' }, '#open_button');
    openButton.element.onclick = (): void => {
        if (files) {
            spreadsheet.open({ file: files });
        }
    }

    const saveButton: Button = new Button({ isPrimary: true, content: 'Save' }, '#save_button');
    saveButton.element.onclick = (): void => {
        spreadsheet.save({ fileName: 'Sample', saveType: 'Xlsx' });
    }

    function getSelectedOptions(isOpen?: boolean): { [key: string]: boolean } {
        const optionMap: { [key: string]: string } = {
            "Only Values": "onlyValues", "Ignore Styles": "ignoreStyle",
            "Ignore Charts": "ignoreChart", "Ignore Images": "ignoreImage",
            "Ignore Formats": "ignoreFormat", "Ignore Notes": "ignoreNote",
            "Ignore Wraps": "ignoreWrap", "Ignore Formulas": "ignoreFormula",
            "Ignore Validations": "ignoreValidation", "Ignore Merged Cells": "ignoreMergedCell",
            "Ignore Freeze Panes": "ignoreFreezePane", "Ignore Conditional Formats": "ignoreConditionalFormat"
        };
        const parseOptions: { [key: string]: boolean } = {};
        const selectedValues: string[] = isOpen ? multiSelect.value as string[] : multiSelectSave.value as string[];
        if (selectedValues && selectedValues.length > 0) {
            selectedValues.forEach((value: string) => {
                if (optionMap[value]) {
                    parseOptions[optionMap[value]] = true;
                }
            });
        }
        return parseOptions;
    }
};
