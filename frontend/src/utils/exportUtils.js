import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportToCSV = (data, filename = 'attendance_report.csv') => {
  if (!data || data.length === 0) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');
  XLSX.writeFile(workbook, filename);
};

export const exportToPDF = (data, title = 'Student Attendance Report', filename = 'attendance_report.pdf') => {
  if (!data || data.length === 0) return;

  const doc = new jsPDF('p', 'pt');

  // Title & Header
  doc.setFontSize(18);
  doc.setTextColor(30, 41, 59); // Slate-800
  doc.text(title, 40, 40);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Generated on: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`, 40, 58);

  // Table columns & rows mapping
  const tableColumn = ["Roll No", "Student Name", "Class", "Total", "Present", "Absent", "Late", "Excused", "Percentage"];
  const tableRows = data.map(item => [
    item.rollNumber || item.roll || 'N/A',
    item.studentName || item.name || 'N/A',
    item.className || item.class || 'N/A',
    item.totalSessions ?? item.total ?? 0,
    item.present ?? 0,
    item.absent ?? 0,
    item.late ?? 0,
    item.excused ?? 0,
    `${item.percentage}%`
  ]);

  doc.autoTable({
    startY: 75,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: [12, 148, 232], // Brand blue
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252]
    },
    styles: {
      fontSize: 9,
      cellPadding: 6,
    },
    didParseCell: function(data) {
      if (data.column.index === 8) { // Percentage column
        const val = parseFloat(data.cell.text[0]);
        if (val < 75) {
          data.cell.styles.textColor = [220, 38, 38]; // Red for low attendance
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  doc.save(filename);
};
