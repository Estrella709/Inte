import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Storage } from '@ionic/storage-angular';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-attendance',
  templateUrl: './attendance.page.html',
  styleUrls: ['./attendance.page.scss'],
})
export class AttendancePage implements OnInit {
  attendanceForm!: FormGroup;
  usuarioForm!: FormGroup; // Nuevo formulario para usuarios
  attendanceRecords: any[] = [];
  userId?: string;
  docentesList: any[] = [];
  registrosAsistencia: any[] = [];
  usuariosList: any[] = [];

  storageInitialized = false;

  constructor(
    private fb: FormBuilder,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private storage: Storage
  ) {}

  async ngOnInit() {
    // Inicializar formularios
    this.attendanceForm = this.fb.group({
      docente: ['', Validators.required],
      tipoAsistencia: ['', Validators.required],
    });

    this.usuarioForm = this.fb.group({
      docente: ['', Validators.required],
      tipoAsistencia: ['', Validators.required],
    });

    // Obtener usuario autenticado
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
      }
    });

    // Inicializar almacenamiento y cargar datos
    await this.initializeStorage();
    this.loadUsuarios();
    this.loadDocentes();
    this.loadAttendanceRecords();
  }

  async initializeStorage() {
    await this.storage.create();
    this.storageInitialized = true;
  }

  loadUsuarios() {
    this.firestore.collection('usuarios').snapshotChanges().subscribe((data) => {
      const firestoreUsuarios = data.map((e) => ({
        id: e.payload.doc.id,
        ...(e.payload.doc.data() as Record<string, any>),
      }));

      this.storage.get('usuarios').then((localUsuarios) => {
        if (localUsuarios) {
          this.usuariosList = [...firestoreUsuarios, ...localUsuarios];
        } else {
          this.usuariosList = firestoreUsuarios;
        }
      });
    });
  }

  loadDocentes() {
    this.firestore
      .collection('usuarios', (ref) => ref.where('puesto', '==', 'docente'))
      .snapshotChanges()
      .subscribe((data) => {
        this.docentesList = data.map((e) => ({
          id: e.payload.doc.id,
          ...(e.payload.doc.data() as Record<string, any>),
        }));
      });
  }

  loadAttendanceRecords() {
    this.firestore
      .collection('attendance')
      .snapshotChanges()
      .subscribe((data) => {
        this.attendanceRecords = data.map((e) => ({
          id: e.payload.doc.id,
          ...(e.payload.doc.data() as Record<string, any>),
        }));
        this.registrosAsistencia = this.attendanceRecords;
      });
  }

  // Registrar usuario
  registerUser() {
    if (this.usuarioForm.valid) {
      const { docente, tipoAsistencia } = this.usuarioForm.value;

      // Verificar duplicados
      const exists = this.usuariosList.some((usuario) => usuario.docente === docente);
      if (exists) {
        alert('Este usuario ya existe.');
        return;
      }

      const nuevoUsuario = {
        docente,
        tipoAsistencia,
        id: this.firestore.createId(),
      };

      this.firestore
        .collection('usuarios')
        .add(nuevoUsuario)
        .then(() => {
          this.usuariosList.push(nuevoUsuario);

          this.storage.get('usuarios').then((localUsuarios: any[]) => {
            const updatedList = localUsuarios ? [...localUsuarios, nuevoUsuario] : [nuevoUsuario];
            this.storage.set('usuarios', updatedList);
          });

          this.usuarioForm.reset();
          alert('Usuario registrado exitosamente.');
        })
        .catch((error) => {
          console.error('Error al registrar el usuario:', error);
        });
    } else {
      alert('Formulario inválido. Por favor, completa todos los campos.');
    }
  }

  registerAttendance() {
    if (this.attendanceForm.valid) {
      const { docente, tipoAsistencia } = this.attendanceForm.value;
      const horaEntrada = new Date();

      const registro = {
        docente: this.docentesList.find((d) => d.id === docente)?.nombre,
        tipoAsistencia,
        horaEntrada,
      };

      this.firestore
        .collection('asistencias')
        .add(registro)
        .then(() => {
          this.registrosAsistencia.push(registro);
          this.attendanceForm.reset();
        })
        .catch((error) => {
          console.error('Error al registrar la asistencia:', error);
        });
    } else {
      console.log('Formulario no válido');
    }
  }

  generatePDF() {
    const doc = new jsPDF();
    doc.text('Reporte de Asistencia', 10, 10);

    let y = 20;
    doc.text('Nombre', 10, y);
    doc.text('Fecha y Hora', 60, y);
    doc.text('Estado', 120, y);

    y += 10;
    this.attendanceRecords.forEach((record) => {
      doc.text(record.docente, 10, y);
      doc.text(record.horaEntrada.toString(), 60, y);
      doc.text(record.tipoAsistencia, 120, y);
      y += 10;
    });

    doc.save('reporte_asistencia.pdf');
  }

  generateExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.attendanceRecords);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Asistencia');
    XLSX.writeFile(wb, 'reporte_asistencia.xlsx');
  }
}
