import { loadCultureFiles } from '../common/culture-loader';
import { Spreadsheet, SheetModel, ColumnModel, RowModel, CellRenderEventArgs, getFormatFromType } from '@syncfusion/ej2-spreadsheet';
import * as dataSource from './cell-formatting-data.json';

/**
 * Cell Formatting sample
 */
(window as any).default = (): void => {
    loadCultureFiles();

    let columns: ColumnModel[] = [{ width: 80 }, { width: 130 }, { width: 180 }, { width: 90 }, { width: 160 }, { width: 80 },
    { width: 100 }, { width: 130 }, { width: 80 }];

    let rows: RowModel[] = [
        {
            height: 36,
            //Applying cell formatting through cell binding
            cells: [{ style: { textAlign: 'right' } }, { style: { textIndent: '2pt' } }, { style: { textAlign: 'center' }}, { style: { textAlign: 'right' } },
                { style: { textIndent: '2pt' } }, { index: 6, style: { textAlign: 'right' } },
                { index: 8, style: { textAlign: 'center' } }, { index: 9, style: { textAlign: 'right' } }]
        }, { height: 42 }, { height: 42 }, { height: 42 }, { height: 42 }, { height: 42 },
        { height: 42 }, { height: 42 }, { height: 42 }, { height: 42 }, { height: 42 }, { height: 42 }, { height: 42 }, { height: 42 },
        { height: 42 }, { height: 42 }];

    let sheet: SheetModel[] = [{
        name: 'Order Details',
        ranges: [{ dataSource: (dataSource as any).orderDetails }],
        columns: columns,
        rows: rows,
        showGridLines: false
    }];

    //Initialize Spreadsheet component
    let spreadsheet: Spreadsheet = new Spreadsheet({
        sheets: sheet,
        showFormulaBar: false,
        showRibbon: false,
        created: createdHandler,
        beforeCellRender: beforeCellRender
    });

    spreadsheet.appendTo('#spreadsheet');

    function createdHandler(): void {
        // Temporarily suspends UI rendering to batch model updates for better performance.
        spreadsheet.suspendRefresh();
        /* custom code start: for another cultures*/
        if (spreadsheet.locale !== 'en-US') {
            setTimeout(() => {
                performActions();
                spreadsheet.resumeRefresh();
            });
            return;
        }
        /* custom code end */
        // Applies styles, number formatting, borders, and superscript/subscript formatting.
        performActions();
        // Resumes rendering and applies all queued UI updates at once.
        spreadsheet.resumeRefresh();
    }

    function performActions(): void {
        spreadsheet.cellFormat({ fontWeight: 'bold', backgroundColor: '#4b5366', color: '#ffffff', fontSize: '12pt' }, 'A1:J1');
        spreadsheet.cellFormat({ fontWeight: 'bold', textIndent: '2pt' }, 'B2:B16');
        spreadsheet.cellFormat({ fontStyle: 'italic', textIndent: '2pt' }, 'E2:E16');
        spreadsheet.cellFormat({ textIndent: '2pt' }, 'F1:F16');
        spreadsheet.cellFormat({ textIndent: '2pt' }, 'G1:G16');
        spreadsheet.cellFormat({ textAlign: 'center', fontWeight: 'bold' }, 'I2:I16');
        spreadsheet.cellFormat({ fontFamily: 'Helvetica New', verticalAlign: 'middle' }, 'A1:J16');
        //Applying border to a range
        spreadsheet.setBorder({ border: '1px solid #e0e0e0' }, 'A1:J16', 'Outer');
        spreadsheet.setBorder({ border: '1px solid #e0e0e0' }, 'A2:J15', 'Horizontal');
        // Applying a short date format to a range.
        spreadsheet.numberFormat('m/d/yyyy', 'D2:D16');
        // Applying currency format to a range.
        spreadsheet.numberFormat('$#,##0.00', 'J2:J16');
        // Applying subscript and superscript format.
        spreadsheet.updateCell({ richText: [
                { text: 'Mineral Water H' },
                { text: '2', style: { verticalAlign: 'sub' } },
                { text: 'O' }
            ] }, 'C2');
        spreadsheet.updateCell({ richText: [
                { text: 'Energy Supplement C' },
                { text: '6', style: { verticalAlign: 'sub' } },
                { text: 'H' },
                { text: '12', style: { verticalAlign: 'sub' } },
                { text: 'O' },
                { text: '6', style: { verticalAlign: 'sub' } }
            ] }, 'C4');
        spreadsheet.updateCell({ richText: [
                { text: 'Refrigerant Gas CO' },
                { text: '2', style: { verticalAlign: 'sub' } }
            ] }, 'C6');
        spreadsheet.updateCell({ richText: [
                { text: 'Water Purifier H' },
                { text: '2', style: { verticalAlign: 'sub' } },
                { text: 'O System' }
            ] }, 'C10');
        spreadsheet.updateCell({ richText: [
                { text: 'n' },
                { text: 'o', style: { verticalAlign: 'super' } },
                { text: ' 59 rue de l Abbaye' }
            ] }, 'E2');
        spreadsheet.updateCell({ richText: [
                { text: '2' },
                { text: 'e', style: { verticalAlign: 'super' } },
                { text: ' rue du Commerce' }
            ] }, 'E5');
        spreadsheet.updateCell({ richText: [
                { text: '22' },
                { text: 'nd', style: { verticalAlign: 'super' } },
                { text: ' Carrera con Ave. Carlos Soublette' }
            ] }, 'E11');
        spreadsheet.updateCell({ richText: [
                { text: '6' },
                { text: 'th', style: { verticalAlign: 'super' } },
                { text: ' street, Kirchgasse' }
            ] }, 'E12');
        spreadsheet.updateCell({ richText: [
                { text: '101 4' },
                { text: 'th', style: { verticalAlign: 'super' } },
                { text: ' Street, San Francisco' }
            ] }, 'E16');
    }

    function beforeCellRender(args: CellRenderEventArgs): void {
        if (!spreadsheet.isOpen && spreadsheet.activeSheetIndex === 0) {
            if (args.cell && args.cell.value) {
                //Applying cell formatting before rendering the particular cell
                switch (args.cell.value) {
                    case 'Delivered':
                        spreadsheet.cellFormat({ color: '#10c469', textDecoration: 'line-through' }, args.address);
                        break;
                    case 'Shipped':
                        spreadsheet.cellFormat({ color: '#62c9e8' }, args.address);
                        break;
                    case 'Pending':
                        spreadsheet.cellFormat({ color: '#FFC107', textDecoration: 'underline' }, args.address);
                        break;
                    case 'Cancelled':
                        spreadsheet.cellFormat({ color: '#ff5b5b' }, args.address);
                        break;
                }
            }
        }
    }
};
