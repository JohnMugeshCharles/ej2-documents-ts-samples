import { loadCultureFiles } from '../common/culture-loader';
import { Button } from '@syncfusion/ej2-buttons';
import {
    PdfDocument,
    PdfPageSettings,
    PdfMargins,
    PdfPage,
    PdfGraphics,
    PdfBrush,
    PdfStringFormat,
    PdfTextDirection,
    PdfTextAlignment,
    PdfTrueTypeFont
} from '@syncfusion/ej2-pdf';
(window as any).default = (): void => {
    loadCultureFiles();
    // Initialize the actual button in your HTML (use #normalbtn)
    const btn = new Button({}, '#normalbtn');
    btn.element.onclick = createPdf;
    // Also expose for inline onclick="createPdf()" if your HTML uses that
    (window as any).createPdf = createPdf;
    async function createPdf(): Promise<void> {
        // Create a new PDF document
        const pdf: PdfDocument = new PdfDocument();
        const pageSettings = new PdfPageSettings({ margins: new PdfMargins(40) });
        const page: PdfPage = pdf.addPage(pageSettings);
        const g: PdfGraphics = page.graphics;
        // Load TrueType fonts for Arabic and Hebrew
        const [arabicBytes, hebrewBytes] = await Promise.all([
            fetchAsUint8Array(input1),
            fetchAsUint8Array(input2)
        ]);
        // Brush and layout
        const brush = new PdfBrush({ r: 0, g: 0, b: 0 });
        const clientBounds = g.clientSize;
        // Define areas
        const rect = { x: 0, y: 0, width: clientBounds.width, height: clientBounds.height };
        const rect1 = { x: 0, y: 200, width: clientBounds.width, height: clientBounds.height - 200 };
        // Right-to-left string format with right alignment
        const format = new PdfStringFormat();
        format.textDirection = PdfTextDirection.rightToLeft;
        format.alignment = PdfTextAlignment.right;
        // Arabic text
        const arabicFont = new PdfTrueTypeFont(arabicBytes, 13);
        g.drawString(
            `سنبدأ بنظرة عامة مفاهيمية على مستند PDF بسيط. تم تصميم هذا الفصل ليكون توجيهًا مختصرًا قبل الغوص في مستند حقيقي وإنشاءه من البداية.
يمكن تقسيم ملف PDF إلى أربعة أجزاء: الرأس والجسم والجدول الإسناد الترافقي والمقطورة. يضع الرأس الملف كملف PDF ، حيث يحدد النص المستند المرئي ، ويسرد جدول الإسناد الترافقي موقع كل شيء في الملف ، ويوفر المقطع الدعائي تعليمات حول كيفية بدء قراءة الملف.
رأس الصفحة هو ببساطة رقم إصدار PDF وتسلسل عشوائي للبيانات الثنائية. البيانات الثنائية تمنع التطبيقات الساذجة من معالجة ملف PDF كملف نصي. سيؤدي ذلك إلى ملف تالف ، لأن ملف PDF يتكون عادةً من نص عادي وبيانات ثنائية (على سبيل المثال ، يمكن تضمين ملف خط ثنائي بشكل مباشر في ملف PDF).`,
            arabicFont,
            rect,
            brush,
            format
        );
        // Hebrew text
        const hebrewFont = new PdfTrueTypeFont(hebrewBytes, 13);
        g.drawString(
            `לאחר הכותרת והגוף מגיע טבלת הפניה המקושרת. הוא מתעדת את מיקום הבית של כל אובייקט בגוף הקובץ. זה מאפשר גישה אקראית של המסמך, ולכן בעת עיבוד דף, רק את האובייקטים הנדרשים עבור דף זה נקראים מתוך הקובץ. זה עושה מסמכי PDF הרבה יותר מהר מאשר קודמיו PostScript, אשר היה צריך לקרוא את כל הקובץ לפני עיבוד זה.`,
            hebrewFont,
            rect1,
            brush,
            format
        );
        // Save and clean up
        pdf.save('RTLText.pdf');
        pdf.destroy();
    }
};
const input1 = 'https://cdn.syncfusion.com/content/pdf-resources/noto-naskh-arabic-regular.ttf';
const input2 = 'https://cdn.syncfusion.com/content/pdf-resources/noto-sans-hebrew-medium.ttf';
async function fetchAsUint8Array(url: string): Promise<Uint8Array> {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
}

