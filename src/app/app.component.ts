import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {

  constructor(private router: Router) {}

  // Método para navegar a la página de asistencia
  goToAttendance() {
    this.router.navigate(['/attendance']);
  }

  // Método para navegar a la página de reportes
  goToReports() {
    this.router.navigate(['/reports']);
  }

  goToUsuarios() {
    this.router.navigate(['/usuarios']);
  }
  
}
