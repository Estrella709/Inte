import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Storage } from '@ionic/storage-angular';

// Definir la interfaz de Usuario para tener un tipo más seguro
interface Usuario {
  id: string;
  nombre: string;
  puesto: string;
  horaEntrada: string;
}

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.page.html',
  styleUrls: ['./usuarios.page.scss'],
})
export class UsuariosPage implements OnInit {
  usuariosForm!: FormGroup;
  usuariosList: Usuario[] = [];
  storageInitialized = false;

  constructor(
    private fb: FormBuilder,
    private firestore: AngularFirestore,
    private storage: Storage
  ) {}

  async ngOnInit() {
    // Inicialización del formulario
    this.usuariosForm = this.fb.group({
      nombre: ['', Validators.required],
      puesto: ['', Validators.required],
      horaEntrada: ['', Validators.required],
    });

    // Inicializar el almacenamiento y cargar usuarios
    await this.initializeStorage();
  }

  // Inicialización del almacenamiento local
  async initializeStorage() {
    await this.storage.create();
    this.storageInitialized = true;
    this.loadUsuarios();
  }

  // Cargar usuarios desde Firestore y almacenamiento local
  loadUsuarios() {
    // Obtener usuarios de Firestore
    this.firestore.collection('usuarios').snapshotChanges().subscribe(data => {
      // Asegurarse de que los datos de Firestore son convertidos correctamente
      const firestoreUsuarios: Usuario[] = data.map(e => {
        const usuarioData = e.payload.doc.data() as { nombre: string, puesto: string, horaEntrada: string }; // Definir explícitamente los tipos de usuarioData
        return {
          id: e.payload.doc.id,
          nombre: usuarioData.nombre,  // Acceso directo a los campos
          puesto: usuarioData.puesto,
          horaEntrada: usuarioData.horaEntrada
        } as Usuario; // Aseguramos que sea tratado como objeto Usuario
      });

      // Mezclar con usuarios locales
      this.mergeUsuariosWithLocal(firestoreUsuarios);
    });
  }

  // Mezclar usuarios locales y de Firestore
  mergeUsuariosWithLocal(firestoreUsuarios: Usuario[]) {
    this.storage.get('usuarios').then((localUsuarios: Usuario[] | null) => {  // Definir tipo de localUsuarios como Usuario[]
      const combinedUsuarios: Usuario[] = [...firestoreUsuarios];

      // Agregar usuarios locales si no están ya en la lista
      if (localUsuarios) {
        localUsuarios.forEach((local: Usuario) => {
          if (!combinedUsuarios.some((user) => user.id === local.id)) {
            combinedUsuarios.push(local);
          }
        });
      }

      this.usuariosList = combinedUsuarios;
    });
  }

  // Agregar un nuevo usuario
  addUsuario() {
    if (this.usuariosForm.valid) {
      const usuario = this.usuariosForm.value;

      // Guardar en Firestore
      this.firestore.collection('usuarios').add(usuario)
  .then(() => {
    console.log('Usuario registrado en Firestore');
    this.saveUsuarioLocally(usuario); // Guardar localmente
    this.loadUsuarios(); // Actualizar la lista
    this.usuariosForm.reset(); // Limpiar formulario
  })
  .catch((error) => {
    console.error('Error al registrar usuario:', error);
  });
    } else {
      console.log('Formulario no válido');
    }
  }

  // Guardar usuario localmente
  async saveUsuarioLocally(usuario: Usuario) {
    if (this.storageInitialized) {
      const usuariosStored: Usuario[] = (await this.storage.get('usuarios')) || [];
      usuariosStored.push(usuario);
      await this.storage.set('usuarios', usuariosStored);
    }
  }
}
