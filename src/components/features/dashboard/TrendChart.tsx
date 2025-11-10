'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

/**
 * Dados de ponto no gráfico de tendência
 */
export interface TrendDataPoint {
  label: string; // Label do ponto (ex: "Jan", "Fev")
  valor: number; // Valor numérico
  data?: Date; // Data opcional para ordenação
}

/**
 * Props do componente TrendChart
 */
interface TrendChartProps {
  dados: TrendDataPoint[];
  titulo?: string;
  cor?: string;
  altura?: number;
  className?: string;
  formatoValor?: (valor: number) => string;
}

/**
 * Componente para visualizar tendências ao longo do tempo
 * Implementa gráfico de linha simples usando SVG nativo
 * 
 * @example
 * ```tsx
 * <TrendChart
 *   dados={[
 *     { label: 'Jan', valor: 10 },
 *     { label: 'Fev', valor: 15 },
 *     { label: 'Mar', valor: 12 }
 *   ]}
 *   titulo="Evolução de Indicações"
 * />
 * ```
 */
export function TrendChart({
  dados,
  titulo = 'Tendência',
  cor = '#3b82f6',
  altura = 300,
  className,
  formatoValor = (v) => v.toString(),
}: TrendChartProps) {
  // Ordenar dados por data se disponível, senão manter ordem original
  const dadosOrdenados = useMemo(() => {
    if (dados.length === 0) return [];
    
    const temDatas = dados.some((d) => d.data);
    if (temDatas) {
      return [...dados].sort((a, b) => {
        if (!a.data || !b.data) return 0;
        return a.data.getTime() - b.data.getTime();
      });
    }
    return dados;
  }, [dados]);

  // Calcular dimensões do gráfico
  const dimensoes = useMemo(() => {
    if (dadosOrdenados.length === 0) {
      return {
        largura: 0,
        alturaGrafico: altura - 80,
        paddingX: 40,
        paddingY: 40,
        maxValor: 1,
        minValor: 0,
      };
    }

    const valores = dadosOrdenados.map((d) => d.valor);
    const maxValor = Math.max(...valores, 1);
    const minValor = Math.min(...valores, 0);

    return {
      largura: 600,
      alturaGrafico: altura - 80,
      paddingX: 40,
      paddingY: 40,
      maxValor,
      minValor,
    };
  }, [dadosOrdenados, altura]);

  // Calcular pontos do gráfico
  const pontos = useMemo(() => {
    if (dadosOrdenados.length === 0) return [];

    const { largura, alturaGrafico, paddingX, paddingY, maxValor, minValor } = dimensoes;
    const larguraUtil = largura - paddingX * 2;
    const alturaUtil = alturaGrafico - paddingY * 2;
    const rangeValor = maxValor - minValor || 1;

    return dadosOrdenados.map((ponto, index) => {
      const x =
        paddingX + (larguraUtil / (dadosOrdenados.length - 1 || 1)) * index;
      const y =
        paddingY +
        alturaUtil -
        ((ponto.valor - minValor) / rangeValor) * alturaUtil;

      return {
        ...ponto,
        x,
        y,
      };
    });
  }, [dadosOrdenados, dimensoes]);

  // Gerar path SVG para a linha
  const pathLinha = useMemo(() => {
    if (pontos.length === 0) return '';

    const primeiro = pontos[0];
    let path = `M ${primeiro.x} ${primeiro.y}`;

    for (let i = 1; i < pontos.length; i++) {
      const ponto = pontos[i];
      path += ` L ${ponto.x} ${ponto.y}`;
    }

    return path;
  }, [pontos]);

  // Gerar path SVG para área preenchida
  const pathArea = useMemo(() => {
    if (pontos.length === 0) return '';

    const { largura, alturaGrafico, paddingX, paddingY } = dimensoes;
    const primeiro = pontos[0];
    const ultimo = pontos[pontos.length - 1];

    return `${pathLinha} L ${ultimo.x} ${alturaGrafico - paddingY} L ${paddingX} ${
      alturaGrafico - paddingY
    } Z`;
  }, [pathLinha, pontos, dimensoes]);

  if (dadosOrdenados.length === 0) {
    return (
      <Card variant="outlined" className={cn('', className)}>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">{titulo}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 py-8">
            Nenhum dado disponível para exibir tendência
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="outlined" className={cn('', className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <svg
            width={dimensoes.largura}
            height={altura}
            viewBox={`0 0 ${dimensoes.largura} ${altura}`}
            className="w-full"
          >
            {/* Grade de fundo */}
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={cor} stopOpacity="0.3" />
                <stop offset="100%" stopColor={cor} stopOpacity="0.05" />
              </linearGradient>
            </defs>

            {/* Linhas de grade horizontais */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y =
                dimensoes.paddingY +
                (1 - ratio) * (dimensoes.alturaGrafico - dimensoes.paddingY * 2);
              const valor = dimensoes.minValor + ratio * (dimensoes.maxValor - dimensoes.minValor);

              return (
                <g key={ratio}>
                  <line
                    x1={dimensoes.paddingX}
                    y1={y}
                    x2={dimensoes.largura - dimensoes.paddingX}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={dimensoes.paddingX - 10}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="12"
                    fill="#6b7280"
                  >
                    {formatoValor(valor)}
                  </text>
                </g>
              );
            })}

            {/* Área preenchida */}
            <path
              d={pathArea}
              fill="url(#gradient)"
              opacity="0.6"
            />

            {/* Linha do gráfico */}
            <path
              d={pathLinha}
              fill="none"
              stroke={cor}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Pontos do gráfico */}
            {pontos.map((ponto, index) => (
              <g key={index}>
                <circle
                  cx={ponto.x}
                  cy={ponto.y}
                  r="4"
                  fill={cor}
                  stroke="white"
                  strokeWidth="2"
                />
                {/* Tooltip hover (simplificado) */}
                <title>
                  {ponto.label}: {formatoValor(ponto.valor)}
                </title>
              </g>
            ))}

            {/* Labels do eixo X */}
            {pontos.map((ponto, index) => {
              // Mostrar todos os labels se houver poucos pontos, senão mostrar apenas alguns
              const mostrarLabel =
                pontos.length <= 6 ||
                index === 0 ||
                index === pontos.length - 1 ||
                index % Math.ceil(pontos.length / 6) === 0;

              if (!mostrarLabel) return null;

              return (
                <text
                  key={index}
                  x={ponto.x}
                  y={altura - 10}
                  textAnchor="middle"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {ponto.label}
                </text>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

