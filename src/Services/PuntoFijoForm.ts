export function calcularErrores(valorVerdadero: number, valorAproximado: number) {
  const errorAbsoluto = Math.abs(valorVerdadero - valorAproximado);
  const errorRelativo = valorVerdadero !== 0 ? errorAbsoluto / Math.abs(valorVerdadero) : null;
  const errorPorcentual = errorRelativo !== null ? errorRelativo * 100 : null;

  return { errorAbsoluto, errorRelativo, errorPorcentual };
}
