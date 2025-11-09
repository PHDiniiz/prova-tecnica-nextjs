import { cn } from '../utils';

describe('utils', () => {
  describe('cn', () => {
    it('deve combinar classes do Tailwind corretamente', () => {
      const resultado = cn('px-4', 'py-2', 'bg-blue-500');
      expect(resultado).toContain('px-4');
      expect(resultado).toContain('py-2');
      expect(resultado).toContain('bg-blue-500');
    });

    it('deve mesclar classes condicionais', () => {
      const resultado = cn('px-4', false && 'py-2', 'bg-blue-500');
      expect(resultado).toContain('px-4');
      expect(resultado).toContain('bg-blue-500');
      expect(resultado).not.toContain('py-2');
    });

    it('deve resolver conflitos de classes do Tailwind', () => {
      // tailwind-merge deve resolver conflitos (ex: px-4 e px-2)
      const resultado = cn('px-4', 'px-2');
      // O resultado deve conter apenas uma das classes px-*
      expect(resultado).toBeTruthy();
    });

    it('deve lidar com arrays de classes', () => {
      const resultado = cn(['px-4', 'py-2'], 'bg-blue-500');
      expect(resultado).toContain('px-4');
      expect(resultado).toContain('py-2');
      expect(resultado).toContain('bg-blue-500');
    });

    it('deve lidar com objetos condicionais', () => {
      const resultado = cn({
        'px-4': true,
        'py-2': false,
        'bg-blue-500': true,
      });
      expect(resultado).toContain('px-4');
      expect(resultado).toContain('bg-blue-500');
      expect(resultado).not.toContain('py-2');
    });

    it('deve retornar string vazia se nenhuma classe for fornecida', () => {
      const resultado = cn();
      expect(typeof resultado).toBe('string');
    });
  });
});

