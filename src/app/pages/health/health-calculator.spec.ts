import {
  calculateBmi,
  calculateHealth,
  classifyBmi,
  formatDecimal,
  normalizeSex,
  parseDecimal,
  parseHealthInput,
} from './health-calculator';

describe('health-calculator', () => {
  const man = { weightKg: 70, heightCm: 175, age: 30, sex: 'masculino' as const };
  const woman = { weightKg: 60, heightCm: 165, age: 30, sex: 'feminino' as const };

  describe('IMC', () => {
    it('calcula peso / altura²', () => {
      expect(calculateBmi(70, 175)).toBeCloseTo(22.86, 2);
    });

    it('classifica nas faixas da OMS, incluindo os limites', () => {
      expect(classifyBmi(18.4)).toBe('Abaixo do peso');
      expect(classifyBmi(18.5)).toBe('Peso normal');
      expect(classifyBmi(24.99)).toBe('Peso normal');
      expect(classifyBmi(25)).toBe('Sobrepeso');
      expect(classifyBmi(29.99)).toBe('Sobrepeso');
      expect(classifyBmi(30)).toBe('Obesidade');
    });
  });

  describe('calculateHealth', () => {
    it('água: 35 ml/kg para homens e 31 ml/kg para mulheres', () => {
      expect(calculateHealth(man).waterLiters).toBeCloseTo(2.45, 2);
      expect(calculateHealth(woman).waterLiters).toBeCloseTo(1.86, 2);
    });

    it('calorias em repouso ficam na casa de centenas/milhares de kcal (não divididas por 1000)', () => {
      // Harris-Benedict revisada: 88,362 + 13,397*70 + 4,799*175 - 5,677*30
      expect(calculateHealth(man).restingKcal).toBeCloseTo(1695.7, 0);
      // 447,593 + 9,247*60 + 3,098*165 - 4,330*30
      expect(calculateHealth(woman).restingKcal).toBeCloseTo(1383.5, 0);
    });

    it('peso ideal estimado: (altura - 100) x 0,9 para homens e (altura - 110) x 0,9 para mulheres', () => {
      expect(calculateHealth(man).idealWeightKg).toBeCloseTo(67.5, 1);
      expect(calculateHealth(woman).idealWeightKg).toBeCloseTo(49.5, 1);
    });

    it('faixa saudável acompanha a altura (IMC 18,5 a 24,9)', () => {
      const { min, max } = calculateHealth(man).healthyRangeKg;

      expect(min).toBeCloseTo(56.66, 1);
      expect(max).toBeCloseTo(76.26, 1);
    });

    it('o estado do peso considera a altura, não um intervalo fixo em kg', () => {
      // 70 kg está dentro da faixa para 175 cm, mas acima dela para 150 cm
      expect(calculateHealth({ ...man, heightCm: 175 }).weightStatus).toBe('dentro');
      expect(calculateHealth({ ...man, heightCm: 150 }).weightStatus).toBe('acima');
      expect(calculateHealth({ ...man, weightKg: 45 }).weightStatus).toBe('abaixo');
    });

    it('nunca devolve peso ideal negativo', () => {
      expect(calculateHealth({ ...woman, heightCm: 100 }).idealWeightKg).toBe(0);
    });
  });

  describe('entrada', () => {
    it('parseDecimal aceita vírgula e rejeita texto', () => {
      expect(parseDecimal('70,5')).toBe(70.5);
      expect(parseDecimal(' 70.5 ')).toBe(70.5);
      expect(parseDecimal('abc')).toBeNaN();
      expect(parseDecimal('')).toBeNaN();
    });

    it('normalizeSex só reconhece "feminino"; o resto vira masculino', () => {
      expect(normalizeSex('Feminino')).toBe('feminino');
      expect(normalizeSex('masculino')).toBe('masculino');
      expect(normalizeSex('outro')).toBe('masculino');
    });

    it('parseHealthInput converte campos válidos', () => {
      expect(
        parseHealthInput({ weight: '70,5', height: '175', age: '30', sex: 'masculino' }),
      ).toEqual({
        weightKg: 70.5,
        heightCm: 175,
        age: 30,
        sex: 'masculino',
      });
    });

    it('parseHealthInput devolve null quando algo está vazio ou fora dos limites', () => {
      expect(
        parseHealthInput({ weight: '', height: '175', age: '30', sex: 'masculino' }),
      ).toBeNull();
      expect(
        parseHealthInput({ weight: '70', height: '10', age: '30', sex: 'masculino' }),
      ).toBeNull();
      expect(
        parseHealthInput({ weight: '70', height: '175', age: '200', sex: 'feminino' }),
      ).toBeNull();
    });

    it('formatDecimal usa vírgula decimal (pt-BR)', () => {
      expect(formatDecimal(22.857, 1)).toBe('22,9');
      expect(formatDecimal(1594.4, 0)).toBe('1.594');
    });
  });
});
