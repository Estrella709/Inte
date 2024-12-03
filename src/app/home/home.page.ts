import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';  // Importar correctamente Firestore

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  loginForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private afAuth: AngularFireAuth,
    private router: Router,
    private firestore: Firestore  // Inyectar Firestore
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  async login() {
    const { email, password } = this.loginForm.value;
    try {
      const userCredential = await this.afAuth.signInWithEmailAndPassword(email, password);
      const userId = userCredential.user?.uid;
      
      // Aquí está la corrección, usas el método doc() de forma modular
      const userDocRef = doc(this.firestore, 'users', userId!);  // Referencia al documento
      const userDoc = await getDoc(userDocRef);  // Obtener el documento

      if (userDoc.exists()) {
        const userData = userDoc.data() as { role: string };
        if (userData?.role) {
          const userRole = userData.role;
          // Redirigir según el rol
          if (userRole === 'docente') {
            this.router.navigate(['/docente-dashboard']);
          } else if (userRole === 'administrativo') {
            this.router.navigate(['/admin-dashboard']);
          }
        } else {
          console.error('No se encontró el rol del usuario');
        }
      } else {
        console.error('El documento del usuario no existe');
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error de inicio de sesión:', error.message);
      } else {
        console.error('Error desconocido:', error);
      }
    }
  }
}
