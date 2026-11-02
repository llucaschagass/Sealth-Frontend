import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SessionService } from '../../core/session.service';
import { HealthService } from '../../services/health.service';
import { HealthRecord } from '../../../types/health-record.type';
import { HealthComponent } from './health.component';

const record = (overrides: Partial<HealthRecord> = {}): HealthRecord => ({
  id: 1,
  measuredAt: '2026-11-02T15:00:00Z',
  weightKg: 74.8,
  heightCm: 175,
  age: 30,
  sex: 'masculino',
  systolic: 120,
  diastolic: 80,
  ...overrides,
});

describe('HealthComponent', () => {
  let fixture: ComponentFixture<HealthComponent>;
  let component: HealthComponent;
  let service: jasmine.SpyObj<HealthService>;
  const element = (): HTMLElement => fixture.nativeElement;
  const defaults = { weight: 70, height: 1.75, age: 30, sex: 'masculino' };

  beforeEach(() => {
    service = jasmine.createSpyObj<HealthService>('HealthService', [
      'getHealthDefaults',
      'getRecords',
      'createRecord',
      'deleteRecord',
    ]);
    service.getRecords.and.returnValue(of([]));
    service.getHealthDefaults.and.returnValue(of(defaults));
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

  const fillValid = () =>
    component.form.patchValue({ weight: '70', height: '175', age: '30', sex: 'masculino' });

  describe('sem medições salvas', () => {
    it('parte dos valores de exemplo (altura em cm) e calcula', () => {
      create();

      expect(component.form.getRawValue()).toEqual({
        weight: '70',
        height: '175',
        age: '30',
        sex: 'masculino',
        systolic: '',
        diastolic: '',
      });
      expect(component.result()?.bmiCategory).toBe('Peso normal');
      expect(element().querySelectorAll('.stat').length).toBe(4);
      expect(element().querySelector('.history .empty')).not.toBeNull();
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

  describe('com histórico', () => {
    beforeEach(() => {
      service.getRecords.and.returnValue(
        of([record(), record({ id: 2, weightKg: 78.5, systolic: null, diastolic: null })]),
      );
    });

    it('preenche o formulário com a medição mais recente', () => {
      create();

      expect(component.form.getRawValue()).toEqual({
        weight: '74.8',
        height: '175',
        age: '30',
        sex: 'masculino',
        systolic: '120',
        diastolic: '80',
      });
      expect(service.getHealthDefaults).not.toHaveBeenCalled();
    });

    it('lista as medições, mostrando a pressão só quando existe', () => {
      create();

      const items = element().querySelectorAll('.history__item');
      expect(items.length).toBe(2);
      expect(items[0].textContent).toContain('120/80 mmHg');
      expect(items[1].textContent).not.toContain('mmHg');
    });

    it('remove uma medição do histórico', () => {
      service.deleteRecord.and.returnValue(of(undefined));
      create();

      (element().querySelector('.history__item button') as HTMLButtonElement).click();
      fixture.detectChanges();

      expect(service.deleteRecord).toHaveBeenCalledWith(1);
      expect(element().querySelectorAll('.history__item').length).toBe(1);
    });

    it('avisa quando não consegue remover', () => {
      service.deleteRecord.and.returnValue(
        throwError(() => ({ status: 404, message: 'Medição não encontrada' })),
      );
      create();

      component.remove(1);
      fixture.detectChanges();

      expect(element().querySelector('.history .alert')?.textContent).toContain(
        'Medição não encontrada',
      );
      expect(component.records().length).toBe(2);
    });
  });

  it('usa os padrões quando o histórico não carrega, mas avisa o erro', () => {
    service.getRecords.and.returnValue(throwError(() => ({ status: 0, message: 'Sem conexão.' })));
    create();

    expect(element().querySelector('.alert')?.textContent).toContain('Sem conexão.');
    expect(component.form.getRawValue().weight).toBe('70');
  });

  it('recalcula os resultados quando o usuário altera os dados', () => {
    create();

    component.form.patchValue({ weight: '95' });
    fixture.detectChanges();

    expect(component.result()?.bmiCategory).toBe('Obesidade');
    expect(element().querySelector('.badge')?.textContent).toContain('Obesidade');
  });

  it('não mostra resultados com dados inválidos', () => {
    create();

    component.form.patchValue({ height: '5' });
    fixture.detectChanges();

    expect(component.result()).toBeNull();
    expect(element().querySelector('.empty')).not.toBeNull();
    expect(component.form.controls.height.errors).toEqual({ range: { min: 50, max: 250 } });
  });

  describe('ao salvar', () => {
    it('envia a medição (pressão opcional vazia vira nulo) e a coloca no topo do histórico', () => {
      service.createRecord.and.returnValue(of(record({ id: 9, systolic: null, diastolic: null })));
      create();
      fillValid();

      component.save();
      fixture.detectChanges();

      expect(service.createRecord).toHaveBeenCalledWith({
        weightKg: 70,
        heightCm: 175,
        age: 30,
        sex: 'masculino',
        systolic: null,
        diastolic: null,
      });
      expect(component.records()[0].id).toBe(9);
      expect(component.saving()).toBeFalse();
      expect(element().querySelector('.alert--success')).not.toBeNull();
    });

    it('envia a pressão arterial quando informada', () => {
      service.createRecord.and.returnValue(of(record()));
      create();
      fillValid();
      component.form.patchValue({ systolic: '130', diastolic: '85', age: '30.4' });

      component.save();

      expect(service.createRecord).toHaveBeenCalledWith(
        jasmine.objectContaining({ systolic: 130, diastolic: 85, age: 30 }),
      );
    });

    it('não envia com dados inválidos', () => {
      create();
      component.form.patchValue({ weight: '' });

      component.save();

      expect(service.createRecord).not.toHaveBeenCalled();
      expect(component.form.controls.weight.touched).toBeTrue();
    });

    it('exige a pressão completa e coerente', () => {
      create();
      fillValid();

      component.form.patchValue({ systolic: '120' });
      expect(component.form.errors?.['bloodPressure']).toContain('sistólica e a diastólica');

      component.form.patchValue({ systolic: '80', diastolic: '120' });
      expect(component.form.errors?.['bloodPressure']).toContain('maior que a diastólica');

      component.save();
      fixture.detectChanges();
      expect(service.createRecord).not.toHaveBeenCalled();
      expect(element().querySelector('.field-error')).not.toBeNull();

      component.form.patchValue({ systolic: '120', diastolic: '80' });
      expect(component.form.errors).toBeNull();
    });

    it('leva os erros do servidor para os campos', () => {
      service.createRecord.and.returnValue(
        throwError(() => ({
          status: 400,
          message: 'Dados inválidos',
          fieldErrors: { weightKg: 'x', age: 'A idade deve estar entre 1 e 120' },
        })),
      );
      create();
      fillValid();

      component.save();

      expect(component.form.controls.age.errors).toEqual({
        server: 'A idade deve estar entre 1 e 120',
      });
      expect(component.saveError()).toBeNull();
      expect(component.saving()).toBeFalse();
    });

    it('mostra a mensagem geral quando o erro não é de campo', () => {
      service.createRecord.and.returnValue(
        throwError(() => ({ status: 0, message: 'Sem conexão.' })),
      );
      create();
      fillValid();

      component.save();
      fixture.detectChanges();

      expect(element().querySelector('.alert--danger')?.textContent).toContain('Sem conexão.');
    });
  });
});
