// src/lib/exporters.ts
import jsPDF from "jspdf";
import autoTable, { RowInput } from "jspdf-autotable";
import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
// Use namespace import to avoid TS "no exported member 'saveAs'" error
import * as FileSaver from "file-saver";

export type ExportColumn = { header: string; dataKey: string };

export function fmtFileName(prefix: string) {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${prefix}_${yyyy}-${mm}-${dd}_${hh}${mi}`;
}

/** Export to PDF using jsPDF + autoTable */
export function exportTableToPDF(opts: {
  title: string;
  columns: ExportColumn[];
  rows: Record<string, any>[];
  orientation?: "p" | "l";
}) {
  const { title, columns, rows, orientation = "p" } = opts;

  const doc = new jsPDF({ orientation, unit: "pt", format: "a4" });

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, 40, 40);

  // Body
  const head: RowInput[] = [columns.map((c) => c.header)];
  const body: RowInput[] = rows.map((r) => columns.map((c) => String(r[c.dataKey] ?? "")));

  autoTable(doc, {
    startY: 60,
    head,
    body,
    styles: {
      font: "helvetica",
      fontSize: 10,
      cellPadding: 6,
    },
    headStyles: {
      fillColor: [0, 163, 231],        // brand #00A3E7
      textColor: 255,
      halign: "left",
    },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 40, right: 40 },
    tableLineColor: [230, 233, 239],
    tableLineWidth: 1,
  });

  const file = fmtFileName(title.replace(/\s+/g, "_"));
  doc.save(`${file}.pdf`);
}

/** Export to Word (.docx) using docx */
export async function exportTableToDocx(opts: {
  title: string;
  columns: ExportColumn[];
  rows: Record<string, any>[];
}) {
  const { title, columns, rows } = opts;

  const headerCells = columns.map(
    (c) =>
      new TableCell({
        children: [
          new Paragraph({
            children: [new TextRun({ text: c.header, bold: true, color: "FFFFFF" })],
          }),
        ],
        shading: { type: "clear", color: "auto", fill: "00A3E7" }, // brand
      })
  );

  const bodyRows = rows.map(
    (r) =>
      new TableRow({
        children: columns.map(
          (c) =>
            new TableCell({
              children: [new Paragraph(String(r[c.dataKey] ?? ""))],
            })
        ),
      })
  );

  const table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [new TableRow({ children: headerCells }), ...bodyRows],
  });

  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
          new Paragraph({ text: "" }),
          table,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const file = fmtFileName(title.replace(/\s+/g, "_"));
  FileSaver.saveAs(blob, `${file}.docx`);
}