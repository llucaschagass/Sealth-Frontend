import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { toIsoDate } from '../../core/dates';
import { SessionService } from '../../core/session.service';
import { VaccinesService } from '../../services/vaccines.service';
import {
  VaccinationOverview,
  VaccinationRecord,
  Vaccine,
  VaccineStatus,
} from '../../../types/vaccine.type';
import { VaccinesComponent } from './vaccines.component';

const vaccine = (
  code: string,
  status: VaccineStatus,
  overrides: Partial<Vaccine> = {},
): Vaccine => ({
  code,
  name: `Vacina ${code}`,
  description: `Descrição ${code}`,
  totalDoses: 1,
  dosesTaken: 0,
  lastDoseAt: null,
  nextDueDate: null,
  status,
  notice: null,
  ...overrides,
});

const overview = (vaccines: Vaccine[], ageYears: number | null = 30): VaccinationOverview => ({
  ageYears,
  vaccines,
});

const record = (id: number, takenAt = '2026-04-10'): VaccinationRecord => ({
  id,
  vaccineCode: 'a',
  vaccineName: 'Vacina a',
  takenAt,
});

describe('VaccinesComponent', () => {
  let fixture: ComponentFixture<VaccinesComponent>;
  let component: VaccinesComponent;
  let service: jasmine.SpyObj<VaccinesService>;
  const element = (): HTMLElement => fixture.nativeElement;
  const dialog = (index: number): HTMLDialogElement =>
    element().querySelectorAll('dialog')[index] as HTMLDialogElement;
  const text = (): string => element().textContent ?? '';

  beforeEach(() => {
    service = jasmine.createSpyObj<VaccinesService>('VaccinesService', [
      'getOverview',
      'getAlerts',
      'getRecords',
      'addRecord',
      'deleteRecord',
    ]);
    service.getOverview.and.returnValue(of(overview([])));
    service.getRecords.and.returnValue(of([]));
    TestBed.configureTestingModule({
      imports: [VaccinesComponent],
      providers: [
        { provide: VaccinesService, useValue: service },
        provideRouter([]),
        {
          provide: SessionService,
          useValue: jasmine.createSpyObj('SessionService', ['logout'], { firstName: 'Ana' }),
        },
      ],
    });
  });

  const create = () => {
    fixture = TestBed.createComponent(VaccinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  describe('calendário', () => {
    it('separa o que pede atenção, o que está em dia e o que não se aplica', () => {
      service.getOverview.and.returnValue(
        of(
          overview([
            vaccine('a', 'UP_TO_DATE', { dosesTaken: 1, lastDoseAt: '2026-01-10' }),
            vaccine('b', 'DUE', { nextDueDate: '2026-02-01', notice: 'Aviso importante' }),
            vaccine('c', 'NOT_APPLICABLE'),
          ]),
        ),
      );
      create();

      expect(element().querySelectorAll('#attention-title ~ .list .vaccine').length).toBe(1);
      expect(element().querySelectorAll('#uptodate-title ~ .list .vaccine').length).toBe(1);
      expect(element().querySelectorAll('#na-title ~ .list .vaccine').length).toBe(1);
      expect(element().querySelector('#attention-title ~ .list')?.textContent).toContain(
        'Reforço vencido',
      );
      expect(element().querySelector('#attention-title ~ .list')?.textContent).toContain(
        'reforço em 01/02/2026',
      );
      expect(text()).toContain('Aviso importante');
      expect(element().querySelector('#uptodate-title ~ .list')?.textContent).toContain(
        'última dose em 10/01/2026',
      );
    });

    it('avisa que está tudo em dia quando nada pede atenção', () => {
      service.getOverview.and.returnValue(of(overview([vaccine('a', 'UP_TO_DATE')])));
      create();

      expect(element().querySelector('#attention-title')).toBeNull();
      expect(text()).toContain('Tudo em dia por aqui');
    });

    it('sugere salvar uma medição quando a idade é desconhecida', () => {
      service.getOverview.and.returnValue(of(overview([vaccine('a', 'PENDING')], null)));
      create();

      expect(element().querySelector('.hint a')?.getAttribute('href')).toBe('/health');
    });

    it('não mostra a sugestão quando a idade é conhecida', () => {
      service.getOverview.and.returnValue(of(overview([vaccine('a', 'PENDING')], 30)));
      create();

      expect(element().querySelector('.hint')).toBeNull();
    });

    it('mostra o erro de carregamento e tenta novamente', () => {
      service.getOverview.and.returnValues(
        throwError(() => ({ status: 0, message: 'Sem conexão.' })),
        of(overview([vaccine('a', 'PENDING')])),
      );
      create();

      expect(element().querySelector('.retry')?.textContent).toContain('Sem conexão.');

      element().querySelector<HTMLButtonElement>('.retry button')!.click();
      fixture.detectChanges();

      expect(element().querySelector('.retry')).toBeNull();
      expect(element().querySelectorAll('.vaccine').length).toBe(1);
    });
  });

  describe('doses registradas', () => {
    it('mostra o estado vazio', () => {
      create();

      expect(text()).toContain('Você ainda não registrou nenhuma dose');
    });

    it('lista as doses com a data formatada', () => {
      service.getRecords.and.returnValue(of([record(1, '2026-04-10'), record(2, '2025-01-05')]));
      create();

      const items = element().querySelectorAll('.record');
      expect(items.length).toBe(2);
      expect(items[0].textContent).toContain('Vacina a');
      expect(items[0].textContent).toContain('10/04/2026');
    });
  });

  describe('registrar dose', () => {
    beforeEach(() => {
      service.getOverview.and.returnValue(
        of(overview([vaccine('a', 'PENDING'), vaccine('b', 'UP_TO_DATE')])),
      );
    });

    it('oferece todas as vacinas do calendário no formulário', () => {
      create();

      expect(component.vaccineOptions().map((o) => o.value)).toEqual(['', 'a', 'b']);
    });

    it('abre o formulário vazio pelo botão da página', () => {
      create();

      element().querySelector<HTMLButtonElement>('.toolbar .btn--primary')!.click();
      fixture.detectChanges();

      expect(dialog(0).open).toBeTrue();
      expect(component.form.getRawValue()).toEqual({ vaccineCode: '', takenAt: '' });
    });

    it('abre o formulário já com a vacina escolhida pelo cartão', () => {
      create();

      element().querySelector<HTMLButtonElement>('.vaccine button')!.click();
      fixture.detectChanges();

      expect(dialog(0).open).toBeTrue();
      expect(component.form.controls.vaccineCode.value).toBe('a');
    });

    it('fecha o formulário ao cancelar', () => {
      create();
      component.openDose();

      component.closeDose();

      expect(dialog(0).open).toBeFalse();
    });

    it('não envia dados inválidos', () => {
      create();
      component.openDose();

      component.save();

      expect(service.addRecord).not.toHaveBeenCalled();
      expect(component.form.controls.vaccineCode.touched).toBeTrue();
    });

    it('não aceita data futura', () => {
      create();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      component.form.setValue({ vaccineCode: 'a', takenAt: toIsoDate(tomorrow) });

      component.save();

      expect(component.form.controls.takenAt.errors).toEqual({ future: true });
      expect(service.addRecord).not.toHaveBeenCalled();

      component.form.setValue({ vaccineCode: 'a', takenAt: toIsoDate(new Date()) });
      expect(component.form.controls.takenAt.errors).toBeNull();
    });

    it('envia a dose, fecha o diálogo e recarrega a situação das vacinas', () => {
      service.addRecord.and.returnValue(of(record(9)));
      create();
      component.openDose();
      component.form.setValue({ vaccineCode: 'a', takenAt: '2026-04-10' });

      component.save();

      expect(service.addRecord).toHaveBeenCalledWith({ vaccineCode: 'a', takenAt: '2026-04-10' });
      expect(service.getOverview).toHaveBeenCalledTimes(2);
      expect(service.getRecords).toHaveBeenCalledTimes(2);
      expect(dialog(0).open).toBeFalse();
      expect(component.saving()).toBeFalse();
    });

    it('leva o erro de campo do backend para o formulário', () => {
      service.addRecord.and.returnValue(
        throwError(() => ({
          status: 400,
          message: 'Dados inválidos',
          fieldErrors: { vaccineCode: 'A vacina é obrigatória' },
        })),
      );
      create();
      component.openDose();
      component.form.setValue({ vaccineCode: 'a', takenAt: '2026-04-10' });

      component.save();

      expect(component.form.controls.vaccineCode.errors).toEqual({
        server: 'A vacina é obrigatória',
      });
      expect(component.formError()).toBeNull();
      expect(component.saving()).toBeFalse();
    });

    it('mostra a mensagem geral quando o erro não é de campo', () => {
      service.addRecord.and.returnValue(throwError(() => ({ status: 0, message: 'Sem conexão.' })));
      create();
      component.openDose();
      component.form.setValue({ vaccineCode: 'a', takenAt: '2026-04-10' });

      component.save();

      expect(component.formError()).toBe('Sem conexão.');
    });
  });

  describe('excluir dose', () => {
    beforeEach(() => {
      service.getRecords.and.returnValue(of([record(1), record(2)]));
    });

    it('pede confirmação antes de excluir', () => {
      create();

      element().querySelector<HTMLButtonElement>('.record__delete')!.click();
      fixture.detectChanges();

      expect(dialog(1).open).toBeTrue();
      expect(dialog(1).textContent).toContain('Vacina a');
      expect(service.deleteRecord).not.toHaveBeenCalled();

      component.closeDelete();
      expect(dialog(1).open).toBeFalse();
    });

    it('remove a dose e recarrega depois de confirmar', () => {
      service.deleteRecord.and.returnValue(of(undefined));
      create();
      component.askDelete(component.records()[0]);

      component.confirmDelete();

      expect(service.deleteRecord).toHaveBeenCalledWith(1);
      expect(service.getOverview).toHaveBeenCalledTimes(2);
      expect(dialog(1).open).toBeFalse();
      expect(component.deleting()).toBeFalse();
    });

    it('mostra o erro quando não consegue excluir', () => {
      service.deleteRecord.and.returnValue(
        throwError(() => ({ status: 404, message: 'Dose não encontrada' })),
      );
      create();
      component.askDelete(component.records()[0]);

      component.confirmDelete();

      expect(component.deleteError()).toBe('Dose não encontrada');
      expect(component.deleting()).toBeFalse();
    });

    it('ignora a confirmação sem dose selecionada', () => {
      create();

      component.confirmDelete();

      expect(service.deleteRecord).not.toHaveBeenCalled();
    });
  });
});
