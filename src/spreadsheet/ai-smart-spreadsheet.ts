import { loadCultureFiles } from '../common/culture-loader';
import { SheetModel, Spreadsheet, AIAssist, AIAssistSettingsModel, PromptRequestEventArgs } from '@syncfusion/ej2-spreadsheet';
import { grossPay } from './data-source';

(window as any).default = (): void => {
    loadCultureFiles();

    // Inject the AI Assist module into the Spreadsheet component for enabling AI features.
    Spreadsheet.Inject(AIAssist);

    /* custom code start */
    let visitorId: string | null = null;
    fingerPrint().then((id) => {
        visitorId = id;
    });
    /* custom code end */

    let sheet: SheetModel[] = [
        {
            ranges: [{
                dataSource: grossPay,
                startCell: 'A3'
            },
            ],
            name: 'Gross Pay',
            rows: [{
                cells: [{
                    value: 'Gross Pay Calculation',
                    style: {
                        fontSize: '20pt', fontWeight: 'bold', textAlign: 'center', backgroundColor: '#B3FFB3',
                        verticalAlign: 'middle'
                    }
                }]
            },
            {
                index: 13,
                cells: [{
                    index: 7, value: 'Total Gross',
                    style: { border: '1px solid #A6A6A6', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }
                },
                {
                    index: 8, formula: '=Sum(I4:I13)', format: '$#,##0.00',
                    style: { border: '1px solid #A6A6A6', textAlign: 'center', verticalAlign: 'middle', fontWeight: 'bold' }
                }]
            }
            ],
            columns: [
                { width: 88, }, { width: 120 }, { width: 106 }, { width: 98 }, { width: 110 },
                { width: 110 }, { width: 110 }, { width: 98 }, { width: 130 }
            ]
        }];

    let requestUrl: string = 'Enter your AI SERVICE URL' + '/api/AIAssist/Chat';
    // custom code start
    requestUrl = 'https://document.syncfusion.com/web-services/ej2-documents-ai-service/api/AIAssist/Chat';
    // custom code end

    const aiAssistSettings: AIAssistSettingsModel = {
        requestUrl: requestUrl,
        placeholder: 'Ask the AI about this sheet.',
        promptSuggestions: [
            'Analyze this dataset and summarize',
            'Highlight important values in this sheet',
            'Format this sheet for better readability'
        ]
    };

    function onCreate(this: Spreadsheet): void {
        const spreadSheet: Spreadsheet = this;
        spreadSheet.merge('A1:I2');
        spreadSheet.setBorder({ border: '1px solid #A6A6A6' }, 'A1:I13');
        spreadSheet.cellFormat({ textAlign: 'center', verticalAlign: 'middle' }, 'A3:I13');
        spreadSheet.cellFormat({ backgroundColor: '#B3FFB3', fontWeight: 'bold' }, 'A3:I3');
        spreadSheet.numberFormat('$#,##0.00', 'H4:I13');
        spreadSheet.wrap('H3:I3');
        spreadSheet.addDataValidation({ type: 'Time', operator: 'LessThan', value1: '9:00:00 AM', ignoreBlank: false }, 'E4:E13');
        spreadSheet.addDataValidation({ type: 'Time', operator: 'LessThan', value1: '6:00:00 PM', ignoreBlank: false }, 'F4:F13');
        spreadSheet.addDataValidation({ type: 'WholeNumber', operator: 'LessThan', value1: '10', ignoreBlank: false }, 'G4:G13');
        spreadSheet.addDataValidation({ type: 'WholeNumber', operator: 'LessThan', value1: '250', ignoreBlank: false }, 'H4:H13');
        spreadSheet.addDataValidation({ type: 'WholeNumber', operator: 'LessThan', value1: '300', ignoreBlank: false }, 'I4:I13');
    }

    /* custom code start */
    async function sha256(str: string): Promise<string> {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => ('0' + b.toString(16)).slice(-2)).join('');
    }

    async function fingerPrint(): Promise<string | null> {
        try {
            const canvas: HTMLCanvasElement = document.createElement('canvas');
            canvas.width = 600;
            canvas.height = 300;
            canvas.style.display = 'none';
            document.body.appendChild(canvas);
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Canvas context not available');
            }
            const size = 24;
            const diamondSize = 28;
            const gap = 4;
            const startX = 30;
            const startY = 30;
            const blue = '#1A3276';
            const orange = '#F28C00';
            const colorMap = [
                ['blue', 'blue', 'diamond'],
                ['blue', 'orange', 'blue'],
                ['blue', 'blue', 'blue']
            ];
            const drawSquare = (x: number, y: number, color: string): void => {
                ctx.fillStyle = color;
                ctx.fillRect(x, y, size, size);
            };
            const drawDiamond = (cx: number, cy: number, s: number, color: string): void => {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(cx, cy - s / 2);
                ctx.lineTo(cx + s / 2, cy);
                ctx.lineTo(cx, cy + s / 2);
                ctx.lineTo(cx - s / 2, cy);
                ctx.closePath();
                ctx.fill();
            }
            for (let row = 0; row < 3; row++) {
                for (let col = 0; col < 3; col++) {
                    const type = colorMap[row][col];
                    const x = startX + col * (size + gap);
                    const y = startY + row * (size + gap);

                    if (type === 'blue') drawSquare(x, y, blue);
                    else if (type === 'orange') drawSquare(x, y, orange);
                    else drawDiamond(x + size / 2, y + size / 2, diamondSize, orange);
                }
            }
            ctx.font = '20px Arial';
            ctx.fillStyle = blue;
            ctx.textBaseline = 'middle';
            ctx.fillText('Syncfusion', startX + 3 * (size + gap) + 20, startY + size + gap);
            ctx.globalCompositeOperation = 'multiply';
            ctx.fillStyle = 'rgb(255,0,255)';
            ctx.beginPath(); ctx.arc(50, 200, 50, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgb(0,255,255)';
            ctx.beginPath(); ctx.arc(100, 200, 50, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgb(255,255,0)';
            ctx.beginPath(); ctx.arc(75, 250, 50, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = 'rgb(255,0,255)';
            ctx.beginPath();
            ctx.arc(200, 200, 75, 0, Math.PI * 2, true);
            ctx.arc(200, 200, 25, 0, Math.PI * 2, true);
            ctx.fill('evenodd');
            const visitorID = await sha256(canvas.toDataURL());
            document.body.removeChild(canvas);
            return visitorID;
        } catch {
            return null;
        }
    }
    /* custom code end */

    function onPromptRequestHandler(args: PromptRequestEventArgs): void {
        // You can handle custom logic, such as adding headers or modifying request data, here.
        /* custom code start */
        if (args.requestData) {
            if (visitorId) {
                (args.requestData as any).body.visitorId = visitorId;
            }
        }
        /* custom code end */
    }

    let spreadsheet: Spreadsheet = new Spreadsheet({
        sheets: sheet,
        height: '708px',
        openUrl: 'https://document.syncfusion.com/web-services/spreadsheet-editor/api/spreadsheet/open',
        saveUrl: 'https://document.syncfusion.com/web-services/spreadsheet-editor/api/spreadsheet/save',
        created: onCreate,
        enableAIAssist: true,
        aiAssistSettings: aiAssistSettings,
        promptRequest: onPromptRequestHandler
    });
    spreadsheet.appendTo('#spreadsheet');
    
}
