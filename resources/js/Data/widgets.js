export const WIDGET_DEFAULTS = {
    text: { type: 'text', label: 'Text', placeholder: 'Enter text...', value: '', fontSize: 12, fontWeight: 'normal', align: 'left', color: '#000000', lineHeight: 1.5, letterSpacing: 0 },
    image: { type: 'image', label: 'Image', src: null, fit: 'contain' },
    divider: { type: 'divider', label: 'Divider', style: 'solid', color: '#cccccc', height: 4 },
    barcode: { type: 'barcode', label: 'Barcode', value: '1234567890', format: 'CODE128' },
    qrcode: { type: 'qrcode', label: 'QR Code', value: 'https://example.com' },
    table: { type: 'table', label: 'Table', columns: ['Col 1', 'Col 2', 'Col 3'], rows: 5, data: [] },
    checklist: { type: 'checklist', label: 'Checklist', items: 10 },
    lines: { type: 'lines', label: 'Lines', lineCount: 20, lineSpacing: 8 },
    columns: { type: 'columns', label: 'Kolom', colCount: 2, children: [[], []], fontSize: 12, fontWeight: 'normal' },
    calendar: {
        type: 'calendar', label: 'Kalender',
        month: new Date().getMonth() + 1, year: new Date().getFullYear(),
        startDay: 'monday', showDates: true, showHolidays: true, country: 'ID',
        titleStyle: { show: true, fontSize: 18, fontWeight: 'bold', color: '#0f172a', align: 'center', marginBottom: 5 },
        headerStyle: { fontSize: 10, fontWeight: 'bold', color: '#334155', bg: '#f8fafc', height: 8 },
        dateStyle: { fontSize: 12, fontWeight: '600', color: '#1e293b', bg: '#ffffff', height: 25 },
        holidayStyle: { color: '#dc2626', bg: '#fff1f2', detailSize: 7, detailColor: '#e11d48', detailWeight: 'bold' },
        holidayListStyle: { show: true, fontSize: 8, color: '#1e293b', fontWeight: 'normal' },
        eventStyle: { show: true, color: '#e2e8f0', fontSize: 8 },
        footerEventStyle: { show: false, fontSize: 8, color: '#64748b' }
    },
    weekly_planner: { type: 'weekly_planner', label: 'Weekly Planner', layout: 'vertical', includeWeekend: true },
};
