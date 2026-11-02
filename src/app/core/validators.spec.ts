import { FormControl, FormGroup } from '@angular/forms';
import { matchesPassword, numberBetween } from './validators';

describe('numberBetween', () => {
  const validate = (value: unknown) => numberBetween(20, 400)(new FormControl(value));

  it('aceita valores dentro do intervalo, inclusive nos limites', () => {
    expect(validate('70')).toBeNull();
    expect(validate('20')).toBeNull();
    expect(validate('400')).toBeNull();
  });

  it('aceita vírgula como separador decimal', () => {
    expect(validate('70,5')).toBeNull();
  });

  it('rejeita valores fora do intervalo informando os limites', () => {
    expect(validate('19.9')).toEqual({ range: { min: 20, max: 400 } });
    expect(validate('401')).toEqual({ range: { min: 20, max: 400 } });
  });

  it('rejeita texto que não é número', () => {
    expect(validate('abc')).toEqual({ number: true });
  });

  it('deixa vazio e nulo para o validador required', () => {
    expect(validate('')).toBeNull();
    expect(validate('   ')).toBeNull();
    expect(validate(null)).toBeNull();
  });
});

describe('matchesPassword', () => {
  const build = (password: string, confirm: string) => {
    const group = new FormGroup({
      password: new FormControl(password),
      passwordConfirm: new FormControl(confirm, matchesPassword),
    });
    group.controls.passwordConfirm.updateValueAndValidity(); // agora o campo já tem o formulário pai
    return group;
  };

  it('aceita quando a confirmação é igual à senha', () => {
    expect(build('abc123', 'abc123').controls.passwordConfirm.errors).toBeNull();
  });

  it('rejeita quando é diferente', () => {
    expect(build('abc123', 'abc124').controls.passwordConfirm.errors).toEqual({ mismatch: true });
  });
});
