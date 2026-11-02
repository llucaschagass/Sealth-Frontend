import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SessionService } from '../../core/session.service';
import { MedicinesService } from '../../services/medicines.service';
import { Medication } from '../../../types/medication.type';
import { MedicinesComponent } from './medicines.component';
import { medicinePdfUrl } from './medicine-pdf';

describe('medicinePdfUrl', () => {
  it('gera o caminho em minúsculas', () => {
    expect(medicinePdfUrl('Paracetamol')).toBe('/assets/pdf/paracetamol.pdf');
  });

  it('remove acentos e troca espaços por hífen', () => {
    expect(medicinePdfUrl('Ácido Acetilsalicílico ')).toBe(
      '/assets/pdf/acido-acetilsalicilico.pdf',
    );
  });
});

const medication = (id: number, overrides: Partial<Medication> = {}): Medication => ({
  id,
  name: `Remédio ${id}`,
  dosage: '50 mg',
  times: ['08:00', '20:00'],
  startDate: null,
  endDate: null,
  notes: null,
  active: true,
  ...overrides,
});

describe('MedicinesComponent', () => {
  let fixture: ComponentFixture<MedicinesComponent>;
  let component: MedicinesComponent;
  let service: jasmine.SpyObj<MedicinesService>;
  const element = (): HTMLElement => fixture.nativeElement;
  const dialog = (index: number): HTMLDialogElement =>
    element().querySelectorAll('dialog')[index] as HTMLDialogElement;

  beforeEach(() => {
    service = jasmine.createSpyObj<MedicinesService>('MedicinesService', [
      'getMedicinesPDFs',
      'getMine',
      'createMedication',
      'updateMedication',
      'deleteMedication',
    ]);
    service.getMedicinesPDFs.and.returnValue(of([]));
    service.getMine.and.returnValue(of([]));
    TestBed.configureTestingModule({
      imports: [MedicinesComponent],
      providers: [
        { provide: MedicinesService, useValue: service },
        provideRouter([]),
        {
          provide: SessionService,
          useValue: jasmine.createSpyObj('SessionService', ['logout'], { firstName: 'Ana' }),
        },
      ],
    });
  });

  const create = () => {
    fixture = TestBed.createComponent(MedicinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const fillForm = (overrides: Record<string, string> = {}) =>
    component.form.setValue({
      name: 'Losartana',
      dosage: '50 mg',
      times: '20:00, 8:00',
      startDate: '',
      endDate: '',
      notes: '',
      ...overrides,
    });

  describe('bulas', () => {
    it('lista cada medicamento com um link real para a bula', () => {
      service.getMedicinesPDFs.and.returnValue(of(['Paracetamol', 'Omeprazol']));
      create();

      const links = Array.from(element().querySelectorAll<HTMLAnchorElement>('.medicine a'));
      expect(links.map((a) => a.getAttribute('href'))).toEqual([
        '/assets/pdf/paracetamol.pdf',
        '/assets/pdf/omeprazol.pdf',
      ]);
      expect(links[0].target).toBe('_blank');
      expect(links[0].rel).toContain('noopener');
    });

    it('mostra mensagem quando a lista está vazia', () => {
      create();

      expect(element().textContent).toContain('Nenhum medicamento disponível');
    });

    it('mostra o erro do backend e permite tentar novamente', () => {
      service.getMedicinesPDFs.and.returnValues(
        throwError(() => ({ status: 0, message: 'Não foi possível conectar ao servidor.' })),
        of(['Metformina']),
      );
      create();

      expect(element().querySelector('.alert')?.textContent).toContain('conectar ao servidor');

      element().querySelector<HTMLButtonElement>('.alert button')!.click();
      fixture.detectChanges();

      expect(element().querySelector('.alert')).toBeNull();
      expect(element().querySelectorAll('.medicine').length).toBe(1);
    });
  });

  describe('meus medicamentos', () => {
    it('mostra o estado vazio', () => {
      create();

      expect(element().querySelector('.mine')).toBeNull();
      expect(element().textContent).toContain('Você ainda não cadastrou medicamentos');
    });

    it('lista dosagem, horários e período, marcando os encerrados', () => {
      service.getMine.and.returnValue(
        of([
          medication(1, { notes: 'Em jejum', startDate: '2026-01-10' }),
          medication(2, { active: false, endDate: '2026-01-20', times: ['06:00'] }),
        ]),
      );
      create();

      const items = element().querySelectorAll('.mine__item');
      expect(items.length).toBe(2);
      expect(items[0].textContent).toContain('50 mg');
      expect(items[0].textContent).toContain('08:00');
      expect(items[0].textContent).toContain('20:00');
      expect(items[0].textContent).toContain('Desde 10/01/2026 · uso contínuo');
      expect(items[0].textContent).toContain('Em jejum');
      expect(items[0].querySelector('.badge')).toBeNull();
      expect(items[1].classList).toContain('mine__item--ended');
      expect(items[1].querySelector('.badge')?.textContent).toContain('Encerrado');
    });

    it('mostra o erro e permite tentar novamente', () => {
      service.getMine.and.returnValues(
        throwError(() => ({ status: 0, message: 'Sem conexão.' })),
        of([medication(1)]),
      );
      create();

      expect(element().querySelector('.alert')?.textContent).toContain('Sem conexão.');

      element().querySelector<HTMLButtonElement>('.alert button')!.click();
      fixture.detectChanges();

      expect(element().querySelectorAll('.mine__item').length).toBe(1);
    });
  });

  describe('cadastro e edição', () => {
    it('abre o diálogo vazio ao cadastrar', () => {
      create();

      element().querySelector<HTMLButtonElement>('.toolbar .btn--primary')!.click();
      fixture.detectChanges();

      expect(dialog(0).open).toBeTrue();
      expect(component.editing()).toBeNull();
      expect(component.form.getRawValue().name).toBe('');
    });

    it('fecha o diálogo ao cancelar', () => {
      create();
      component.openCreate();

      component.closeForm();

      expect(dialog(0).open).toBeFalse();
    });

    it('envia o cadastro com horários normalizados e recarrega a lista', () => {
      service.createMedication.and.returnValue(of(medication(9)));
      create();
      component.openCreate();
      fillForm({ notes: '  Em jejum ', startDate: '2026-02-01' });

      component.save();

      expect(service.createMedication).toHaveBeenCalledWith({
        name: 'Losartana',
        dosage: '50 mg',
        times: ['08:00', '20:00'],
        startDate: '2026-02-01',
        endDate: null,
        notes: 'Em jejum',
      });
      expect(service.getMine).toHaveBeenCalledTimes(2);
      expect(dialog(0).open).toBeFalse();
      expect(component.saving()).toBeFalse();
    });

    it('preenche o formulário ao editar e envia a atualização', () => {
      service.getMine.and.returnValue(of([medication(3, { notes: 'x', endDate: '2026-12-31' })]));
      service.updateMedication.and.returnValue(of(medication(3)));
      create();

      component.openEdit(component.mine()[0]);

      expect(component.form.getRawValue()).toEqual({
        name: 'Remédio 3',
        dosage: '50 mg',
        times: '08:00, 20:00',
        startDate: '',
        endDate: '2026-12-31',
        notes: 'x',
      });

      component.form.patchValue({ dosage: '100 mg' });
      component.save();

      expect(service.updateMedication).toHaveBeenCalledWith(
        3,
        jasmine.objectContaining({ dosage: '100 mg', endDate: '2026-12-31' }),
      );
    });

    it('não envia dados inválidos', () => {
      create();
      component.openCreate();
      fillForm({ name: '', times: '25:00' });

      component.save();

      expect(service.createMedication).not.toHaveBeenCalled();
      expect(component.form.controls.name.touched).toBeTrue();
      expect(component.form.controls.times.errors).toEqual({ times: true });
    });

    it('exige término igual ou posterior ao início', () => {
      create();
      component.openCreate();
      fillForm({ startDate: '2026-05-10', endDate: '2026-05-09' });
      component.form.markAllAsTouched();
      fixture.detectChanges();

      expect(component.form.errors?.['period']).toContain('anterior');
      expect(element().querySelector('.field-error')).not.toBeNull();

      component.save();
      expect(service.createMedication).not.toHaveBeenCalled();

      fillForm({ startDate: '2026-05-10', endDate: '2026-05-10' });
      expect(component.form.errors).toBeNull();
    });

    it('leva os erros do servidor para os campos', () => {
      service.createMedication.and.returnValue(
        throwError(() => ({
          status: 400,
          message: 'Dados inválidos',
          fieldErrors: { name: 'O nome é obrigatório' },
        })),
      );
      create();
      component.openCreate();
      fillForm();

      component.save();

      expect(component.form.controls.name.errors).toEqual({ server: 'O nome é obrigatório' });
      expect(component.formError()).toBeNull();
      expect(component.saving()).toBeFalse();
    });

    it('mostra a mensagem geral quando o erro não é de campo', () => {
      service.createMedication.and.returnValue(
        throwError(() => ({ status: 0, message: 'Sem conexão.' })),
      );
      create();
      component.openCreate();
      fillForm();

      component.save();

      expect(component.formError()).toBe('Sem conexão.');
    });
  });

  describe('exclusão', () => {
    beforeEach(() => {
      service.getMine.and.returnValue(of([medication(1), medication(2)]));
    });

    it('pede confirmação antes de excluir', () => {
      create();

      element().querySelector<HTMLButtonElement>('.mine__delete')!.click();
      fixture.detectChanges();

      expect(dialog(1).open).toBeTrue();
      expect(dialog(1).textContent).toContain('Remédio 1');
      expect(service.deleteMedication).not.toHaveBeenCalled();

      component.closeDelete();
      expect(dialog(1).open).toBeFalse();
    });

    it('remove da lista após confirmar', () => {
      service.deleteMedication.and.returnValue(of(undefined));
      create();
      component.askDelete(component.mine()[0]);

      component.confirmDelete();
      fixture.detectChanges();

      expect(service.deleteMedication).toHaveBeenCalledWith(1);
      expect(element().querySelectorAll('.mine__item').length).toBe(1);
      expect(dialog(1).open).toBeFalse();
    });

    it('mostra o erro quando não consegue excluir', () => {
      service.deleteMedication.and.returnValue(
        throwError(() => ({ status: 404, message: 'Medicamento não encontrado' })),
      );
      create();
      component.askDelete(component.mine()[0]);

      component.confirmDelete();

      expect(component.deleteError()).toBe('Medicamento não encontrado');
      expect(component.mine().length).toBe(2);
      expect(component.deleting()).toBeFalse();
    });

    it('ignora a confirmação sem medicamento selecionado', () => {
      create();

      component.confirmDelete();

      expect(service.deleteMedication).not.toHaveBeenCalled();
    });
  });
});
