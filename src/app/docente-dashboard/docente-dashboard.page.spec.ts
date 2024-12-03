import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DocenteDashboardPage } from './docente-dashboard.page';

describe('DocenteDashboardPage', () => {
  let component: DocenteDashboardPage;
  let fixture: ComponentFixture<DocenteDashboardPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DocenteDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
