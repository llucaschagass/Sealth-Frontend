import { FormControl, FormGroup } from '@angular/forms';
import { applyServerErrors } from './form-errors';

describe('applyServerErrors', () => {
  const buildForm = () =>
    new FormGroup({ email: new FormControl(''), password: new FormControl('') });

  it('aplica erros por campo e não devolve mensagem geral', () => {
    const form = buildForm();

    const result = applyServerErrors(form, {
      status: 400,
      message: 'Dados inválidos',
      fieldErrors: { email: 'E-mail inválido' },
    });

    expect(result).toBeNull();
    expect(form.controls.email.errors).toEqual({ server: 'E-mail inválido' });
    expect(form.controls.email.touched).toBeTrue();
  });

  it('devolve a mensagem geral quando não há erros de campo', () => {
    const form = buildForm();

    const result = applyServerErrors(form, { status: 409, message: 'E-mail já cadastrado' });

    expect(result).toBe('E-mail já cadastrado');
    expect(form.controls.email.errors).toBeNull();
  });

  it('ignora campos que não existem no formulário', () => {
    const result = applyServerErrors(buildForm(), {
      status: 400,
      message: 'Dados inválidos',
      fieldErrors: { naoExiste: 'x' },
    });

    expect(result).toBe('Dados inválidos');
  });
});
