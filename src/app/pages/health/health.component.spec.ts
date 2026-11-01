import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SessionService } from '../../core/session.service';
import { HealthService } from '../../services/health.service';
import { HealthComponent } from './health.component';

describe('HealthComponent', () => {
  let fixture: ComponentFixture<HealthComponent>;
  let component: HealthComponent;
  let service: jasmine.SpyObj<HealthService>;
  const element = (): HTMLElement => fixture.nativeElement;

  beforeEach(() => {
    service = jasmine.createSpyObj<HealthService>('HealthService', ['getHealthDefaults']);
    TestBed.configureTestingModule({
      imports: [HealthComponent],
      providers: [
        { provide: HealthService, useValue: service },
        provideRouter([]),
        {
          provide: SessionService,
          useValue: jasmine.createSpyObj('SessionService', ['logout'], { firstName: 'Ana' }),
        },
      ],
    });
  });

  const create = () => {
    fixture = TestBed.createComponent(HealthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('preenche o formulário com os valores do backend (altura em cm) e calcula', () => {
    service.getHealthDefaults.and.returnValue(
      of({ weight: 70, height: 1.75, age: 30, sex: 'masculino' }),
    );
    create();

    expect(component.form.getRawValue()).toEqual({
      weight: '70',
      height: '175',
      age: '30',
      sex: 'masculino',
    });
    expect(component.result()?.bmiCategory).toBe('Peso normal');
    expect(element().querySelectorAll('.stat').length).toBe(4);
  });

  it('recalcula os resultados quando o usuário altera os dados', () => {
    service.getHealthDefaults.and.returnValue(
      of({ weight: 70, height: 1.75, age: 30, sex: 'masculino' }),
    );
    create();

    component.form.patchValue({ weight: '95' });
    fixture.detectChanges();

    expect(component.result()?.bmiCategory).toBe('Obesidade');
    expect(element().querySelector('.badge')?.textContent).toContain('Obesidade');
  });

  it('não mostra resultados com dados inválidos', () => {
    service.getHealthDefaults.and.returnValue(
      of({ weight: 70, height: 1.75, age: 30, sex: 'masculino' }),
    );
    create();

    component.form.patchValue({ height: '5' });
    fixture.detectChanges();

    expect(component.result()).toBeNull();
    expect(element().querySelector('.empty')).not.toBeNull();
    expect(component.form.controls.height.errors).toEqual({ range: { min: 50, max: 250 } });
  });

  it('exibe o erro e mantém o formulário utilizável quando os padrões não carregam', () => {
    service.getHealthDefaults.and.returnValue(
      throwError(() => ({ status: 0, message: 'Não foi possível conectar ao servidor.' })),
    );
    create();

    expect(element().querySelector('.alert')?.textContent).toContain('conectar ao servidor');
    component.form.patchValue({ weight: '60', height: '165', age: '25', sex: 'feminino' });

    expect(component.result()).not.toBeNull();
  });
});
