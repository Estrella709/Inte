import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { QuerySnapshot } from '@angular/fire/compat/firestore';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';


@Component({
  selector: 'app-docente-dashboard',
  templateUrl: './docente-dashboard.page.html',
  styleUrls: ['./docente-dashboard.page.scss'],
})
export class DocenteDashboardPage implements OnInit {
   // Datos de ejemplo para los reportes (esto debería ser dinámico en tu caso)
   attendanceRecords = [
    { name: 'Juan Pérez', date: '2024-12-01', status: 'Presente' },
    { name: 'Ana García', date: '2024-12-01', status: 'Ausente' }
  ];
  reports: any[] = [];  // Variable para almacenar los reportes
  nameFilter: string = '';         // Filtro por nombre
  departmentFilter: string = '';   // Filtro por departamento
  startDate: string = '';          // Filtro por fecha de inicio
  endDate: string = '';            // Filtro por fecha de fin

  constructor(private firestore: AngularFirestore) {}

  ngOnInit() {
    this.loadDailyReports();
  }

  // Método para cargar los reportes diarios
  loadDailyReports() {
    const currentDate = new Date();
    const startDate = new Date(currentDate.setHours(0, 0, 0, 0));  // 00:00 de hoy
    const endDate = new Date(currentDate.setHours(23, 59, 59, 999));  // 23:59 de hoy
    this.loadReports(startDate, endDate);
  }

  // Método para cargar los reportes semanales
  loadWeeklyReports() {
    const currentDate = new Date();
    const firstDayOfWeek = currentDate.getDate() - currentDate.getDay(); // Día del inicio de la semana
    const startDate = new Date(currentDate.setDate(firstDayOfWeek)).setHours(0, 0, 0, 0); // Lunes 00:00
    const endDate = new Date(currentDate.setDate(firstDayOfWeek + 6)).setHours(23, 59, 59, 999); // Domingo 23:59
    this.loadReports(new Date(startDate), new Date(endDate));
  }

  // Método para cargar los reportes mensuales
  loadMonthlyReports() {
    const currentDate = new Date();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);  // Primer día del mes
    const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);  // Último día del mes
    this.loadReports(startDate, endDate);
  }

  // Método común para cargar los reportes desde Firestore según las fechas proporcionadas
  loadReports(startDate: Date, endDate: Date) {
    let query = this.firestore.collection('attendance', ref =>
      ref.where('datetime', '>=', startDate.toISOString())
         .where('datetime', '<=', endDate.toISOString())
    );

    query.snapshotChanges().subscribe(data => {
      this.reports = data.map(e => {
        const data = e.payload.doc.data();
        return data ? { ...data, id: e.payload.doc.id } : null;
      }).filter(report => report !== null); // Filtramos los nulls si no hay datos válidos
      console.log(this.reports);  // Muestra los reportes obtenidos
    });
  }

  // Función para aplicar los filtros por nombre, departamento y fechas
  applyFilters() {
    let query = this.firestore.collection('attendance');

    // Filtro por nombre
    if (this.nameFilter) {
      query = this.firestore.collection('attendance', ref => ref.where('name', '==', this.nameFilter));
    }

    // Filtro por departamento
    if (this.departmentFilter) {
      query = this.firestore.collection('attendance', ref => ref.where('department', '==', this.departmentFilter));
    }

    // Filtro por fechas
    if (this.startDate && this.endDate) {
      const startDate = new Date(this.startDate).toISOString();
      const endDate = new Date(this.endDate).toISOString();
      query = this.firestore.collection('attendance', ref => ref.where('datetime', '>=', startDate).where('datetime', '<=', endDate));
    }

    // Obtener los reportes filtrados
    query.snapshotChanges().subscribe(snapshot => {
      this.reports = snapshot.map(e => {
        const data = e.payload.doc.data();
        return data ? { ...data, id: e.payload.doc.id } : null;
      }).filter(report => report !== null);
    });
  }
   // Función para generar el reporte en PDF
   generatePDF() {
    const doc = new jsPDF();
    doc.text('Reporte de Asistencia Docentes', 10, 10);
    let yPosition = 20;

    // Agregar los registros al PDF
    this.attendanceRecords.forEach(record => {
      doc.text(`${record.name} - ${record.date} - ${record.status}`, 10, yPosition);
      yPosition += 10;
    });

    doc.save('reporte_asistencia_docentes.pdf');
  }

  // Función para generar el reporte en Excel
  generateExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.attendanceRecords);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencia');
    XLSX.writeFile(wb, 'reporte_asistencia_docentes.xlsx');
  }
}