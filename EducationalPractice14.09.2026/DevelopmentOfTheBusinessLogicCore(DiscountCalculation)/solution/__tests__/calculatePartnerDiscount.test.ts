import { calculatePartnerDiscount } from '../calculatePartnerDiscount.js';

describe('calculatePartnerDiscount', () => {
  describe('Уровень 0% (объём < 10 000)', () => {
    it('возвращает 0 для нуля', () => {
      expect(calculatePartnerDiscount(0)).toBe(0);
    });

    it('возвращает 0 для значения на верхней границе предыдущего диапазона (9999)', () => {
      expect(calculatePartnerDiscount(9999)).toBe(0);
    });

    it('возвращает 0 для очень маленького значения', () => {
      expect(calculatePartnerDiscount(1)).toBe(0);
    });
  });

  describe('Уровень 5% (10 000 <= объём < 50 000)', () => {
    it('возвращает 5 на нижней границе (10000)', () => {
      expect(calculatePartnerDiscount(10_000)).toBe(5);
    });

    it('возвращает 5 для значения внутри диапазона (25000)', () => {
      expect(calculatePartnerDiscount(25_000)).toBe(5);
    });

    it('возвращает 5 на верхней границе диапазона (49999)', () => {
      expect(calculatePartnerDiscount(49_999)).toBe(5);
    });
  });

  describe('Уровень 10% (50 000 <= объём < 300 000)', () => {
    it('возвращает 10 на нижней границе (50000)', () => {
      expect(calculatePartnerDiscount(50_000)).toBe(10);
    });

    it('возвращает 10 для значения внутри диапазона (150000)', () => {
      expect(calculatePartnerDiscount(150_000)).toBe(10);
    });

    it('возвращает 10 на верхней границе диапазона (299999)', () => {
      expect(calculatePartnerDiscount(299_999)).toBe(10);
    });
  });

  describe('Уровень 15% (объём >= 300 000)', () => {
    it('возвращает 15 на нижней границе (300000)', () => {
      expect(calculatePartnerDiscount(300_000)).toBe(15);
    });

    it('возвращает 15 для значения выше границы (500000)', () => {
      expect(calculatePartnerDiscount(500_000)).toBe(15);
    });

    it('возвращает 15 для очень большого значения', () => {
      expect(calculatePartnerDiscount(10_000_000)).toBe(15);
    });
  });

  /**
   * Невалидные входы.
   * По ТЗ поведение не описано, но фиксируем текущее:
   * отрицательные числа попадают в ветку "< 10 000" → 0.
   */
  describe('Невалидные входы (текущее поведение)', () => {
    it('отрицательное значение возвращает 0', () => {
      expect(calculatePartnerDiscount(-1)).toBe(0);
    });

    it('очень большое отрицательное значение возвращает 0', () => {
      expect(calculatePartnerDiscount(-1_000_000)).toBe(0);
    });
  });
});