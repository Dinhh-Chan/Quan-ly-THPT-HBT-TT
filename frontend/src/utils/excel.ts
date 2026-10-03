import ExcelJS from "exceljs";
import { BRAND } from "@/config/brand";

export interface SheetSpec {
    name: string;
    title?: string;
    /** Hàng tiêu đề; nhiều hàng = tiêu đề gộp */
    header: (string | number)[][];
    rows: (string | number | null | undefined)[][];
    widths?: number[];
    merges?: string[];
}

const border: Partial<ExcelJS.Borders> = {
    top: { style: "thin" },
    left: { style: "thin" },
    bottom: { style: "thin" },
    right: { style: "thin" },
};

export async function exportXlsx(filename: string, sheets: SheetSpec[]) {
    const wb = new ExcelJS.Workbook();
    for (const s of sheets) {
        const ws = wb.addWorksheet(s.name.slice(0, 31));
        let offset = 0;
        if (s.title) {
            const cols = Math.max(...s.header.map((h) => h.length), 1);
            const half = Math.max(Math.ceil(cols / 2), 1);
            // Tiêu đề kiểu văn bản hành chính: cơ quan chủ quản / tên trường, rồi tên bảng
            ws.addRow([BRAND.authority.toUpperCase()]);
            ws.addRow([BRAND.fullName.toUpperCase()]);
            ws.addRow([]);
            ws.addRow([s.title]);
            ws.mergeCells(1, 1, 1, half);
            ws.mergeCells(2, 1, 2, half);
            ws.mergeCells(4, 1, 4, cols);
            ws.getCell(1, 1).alignment = { horizontal: "center" };
            ws.getCell(2, 1).font = { bold: true, underline: true };
            ws.getCell(2, 1).alignment = { horizontal: "center" };
            ws.getCell(4, 1).font = { bold: true, size: 14 };
            ws.getCell(4, 1).alignment = { horizontal: "center" };
            offset = 4;
        }
        s.header.forEach((h) => {
            const row = ws.addRow(h);
            row.eachCell((cell) => {
                cell.font = { bold: true };
                cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDDEBF7" } };
                cell.border = border;
            });
        });
        (s.merges || []).forEach((m) => ws.mergeCells(shiftRange(m, offset)));
        s.rows.forEach((r) => {
            const row = ws.addRow(r.map((v) => (v === undefined ? null : v)));
            row.eachCell({ includeEmpty: true }, (cell) => {
                cell.border = border;
                cell.alignment = { vertical: "top", wrapText: true };
            });
        });
        (s.widths || []).forEach((w, i) => (ws.getColumn(i + 1).width = w));
    }
    const buf = await wb.xlsx.writeBuffer();
    downloadBlob(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${filename}.xlsx`);
}

const shiftRange = (range: string, offset: number) => range.replace(/(\d+)/g, (n) => String(Number(n) + offset));

export const downloadBlob = (blob: Blob, name: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
};

/** Đọc sheet đầu tiên thành mảng dòng (giá trị ô dạng chuỗi/ngày) */
export async function readXlsx(file: File): Promise<unknown[][]> {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(await file.arrayBuffer());
    const ws = wb.worksheets[0];
    const rows: unknown[][] = [];
    ws?.eachRow({ includeEmpty: false }, (row) => {
        const values = (row.values as unknown[]).slice(1).map((v) => {
            if (v && typeof v === "object" && "text" in (v as object)) return (v as { text: string }).text;
            if (v && typeof v === "object" && "result" in (v as object)) return (v as { result: unknown }).result;
            if (v && typeof v === "object" && "richText" in (v as object))
                return (v as { richText: { text: string }[] }).richText.map((t) => t.text).join("");
            return v;
        });
        rows.push(values);
    });
    return rows;
}
