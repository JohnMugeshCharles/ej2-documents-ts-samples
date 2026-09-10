
import { loadCultureFiles } from '../common/culture-loader';
import { PdfDocument, PdfForm, PdfTextBoxField, PdfCheckBoxField, PdfListFieldItem, PdfComboBoxField, PdfRadioButtonListField } from '@syncfusion/ej2-pdf';
import { CheckBox, Button } from '@syncfusion/ej2-buttons';
import { DatePicker } from '@syncfusion/ej2-calendars';
import { DropDownList } from '@syncfusion/ej2-dropdowns';
import { TextBox } from '@syncfusion/ej2-inputs';
(window as any).default = (): void => {
    loadCultureFiles();
    (window as any).viewPdf = viewPdf;
    (window as any).fillPdf = fillPdf;
    let viewBusy = false;
    let fillBusy = false;
    new TextBox({
        value: 'John Milton',
        placeholder: 'Enter your name'
    }, '#name');
    new TextBox({
        value: 'john.milton@example.com',
        placeholder: 'Enter your email'
    }, '#email');
    new DropDownList({
        dataSource: ['Male', 'Female', 'Other'],
        value: 'Male'
    }, '#gender');
    new DropDownList({
        dataSource: ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California'],
        value: 'Alabama'
    }, '#state');
    new DatePicker({
        value: new Date('2012-12-05'),
        format: 'yyyy-MM-dd'
    }, '#dob');
    new CheckBox({}, '#newsletter');
    const btnView = new Button({}, '#btnViewTemplate');
    const btnFill = new Button({}, '#btnFillForm');
    const btnFlatten = new Button({}, '#btnFillFlatten');
    btnView.element.onclick = viewPdf;
    btnFill.element.onclick = () => fillPdf('fill');
    btnFlatten.element.onclick = () => fillPdf('flatten');
    async function fillPdf(mode: 'fill' | 'flatten'): Promise<void> {
        if (fillBusy) return;
        fillBusy = true;
        try {
            // Fetch the form-filling PDF from Syncfusion CDN as bytes
            const pdfBytes = await fetchAsUint8Array('https://cdn.syncfusion.com/content/pdf-resources/form-filling-document.pdf');
            // Read current form values from the page
            const values = getFormValues();
            // Create a PdfDocument from the fetched bytes
            const pdf = new PdfDocument(pdfBytes);
            // Get the PdfForm
            const form = pdf.form;
            // Map and set each field if present, then set appearance
            const nameField = findByName(form, 'name') as PdfTextBoxField | undefined;
            if (nameField) {
                nameField.text = values.name;
                nameField.setAppearance(true);
            }
            const gender = findByName(form, 'gender') as PdfRadioButtonListField | undefined;
            if (gender) {
                switch (values.gender) {
                    case 'Male': gender.selectedIndex = 0; break;
                    case 'Other': gender.selectedIndex = 1; break;
                    case 'Female': gender.selectedIndex = 2; break;
                }
                gender.setAppearance(true);
            }
            const dobField = findByName(form, 'dob') as PdfTextBoxField | undefined;
            if (dobField) {
                dobField.text = values.dob;
                dobField.setAppearance(true);
            }
            const emailField = findByName(form, 'email') as PdfTextBoxField | undefined;
            if (emailField) {
                emailField.text = values.email;
                emailField.setAppearance(true);
            }
            const stateField = findByName(form, 'state') as PdfComboBoxField | undefined;
            if (stateField) {
                for (let i = 0; i < stateField.itemsCount; i++) {
                    const item = stateField._options[i] as any;
                    if (item === values.state) {
                        stateField.selectedIndex = i;
                        break;
                    }
                }
                stateField.setAppearance(true);
            }
            const newsField = findByName(form, 'newsletter');
            if (newsField && 'checked' in newsField) {
                (newsField as PdfCheckBoxField).checked = values.newsletter;
                (newsField as PdfCheckBoxField).setAppearance(true);
            }
            if (mode === 'flatten') {
                pdf.flatten = true;
            }
            // Save and download the document
            pdf.save(mode === 'flatten' ? 'FormFillFlatten.pdf' : 'FormFillings.pdf');
            // Destroy the document
            pdf.destroy();
        } catch (err) {
            console.error(err);
            alert('Failed to fill the PDF.');
        } finally {
            fillBusy = false;
        }
    }
    function downloadBlob(blob: Blob, fileName: string): void {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    async function viewPdf(): Promise<void> {
        if (viewBusy) return;
        viewBusy = true;
        try {
            const pdfBytes = await fetchAsUint8Array('https://cdn.syncfusion.com/content/pdf-resources/form-filling-document.pdf');
            downloadBlob(new Blob([pdfBytes], { type: 'application/pdf' }), 'FormFillings.pdf');
        } catch (err) {
            console.error(err);
            alert('Failed to load the PDF.');
        } finally {
            viewBusy = false;
        }
    }
    function getFormValues() {
        function getInstance(id: string): any {
            const el = document.getElementById(id) as any;
            return el?.ej2_instances?.[0];
        }
        const name = (document.getElementById('name') as HTMLInputElement)?.value || '';
        const email = (document.getElementById('email') as HTMLInputElement)?.value || '';
        const gender = getInstance('gender')?.value || 'Male';
        const state = getInstance('state')?.value || '';
        const newsletter = !!getInstance('newsletter')?.checked;
        let dob = '';
        const dobInst = getInstance('dob');
        if (dobInst?.value) {
            const d = dobInst.value;
            const mm = pad(d.getMonth() + 1);
            const dd = pad(d.getDate());
            const yyyy = d.getFullYear();
            dob = `${mm}/${dd}/${yyyy}`;
        }
        return {
            name,
            gender,
            dob,
            email,
            state,
            newsletter
        };
    }
    function pad(val: number): string {
        return val < 10 ? '0' + val : String(val);
    }
    function findByName(form: PdfForm, name: string) {
        for (let i = 0; i < form.count; i++) {
            const field = form.fieldAt(i);
            if (field && field.name === name) return field;
        }
        return undefined;
    }
};
async function fetchAsUint8Array(url: string): Promise<Uint8Array> {
    const res = await fetch(url, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
    const buf = await res.arrayBuffer();
    return new Uint8Array(buf);
}
