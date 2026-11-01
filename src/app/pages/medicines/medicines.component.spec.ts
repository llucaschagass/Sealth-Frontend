import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { SessionService } from '../../core/session.service';
import { MedicinesService } from '../../services/medicines.service';
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

describe('MedicinesComponent', () => {
  let fixture: ComponentFixture<MedicinesComponent>;
  let service: jasmine.SpyObj<MedicinesService>;
  const element = (): HTMLElement => fixture.nativeElement;

  beforeEach(() => {
    service = jasmine.createSpyObj<MedicinesService>('MedicinesService', ['getMedicinesPDFs']);
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
    fixture.detectChanges();
  };

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
    service.getMedicinesPDFs.and.returnValue(of([]));
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
