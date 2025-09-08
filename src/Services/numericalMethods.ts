import { evaluate } from "mathjs";

export interface Iteration {
  i: number;
  x?: number;
  x0?: number;
  x1?: number;
  error: number | string; // fracción (no *100) o texto (“-”)
  fx?: number;
}

export interface MethodResult {
  funcion: string;
  raiz: number | null;
  errorPermitido: number; // en %
  x0?: number;
  x1?: number;
  a?: number;
  b?: number;
  iteraciones: Iteration[];
  plot: { x: number[]; y: number[] };
  mensaje?: string;

  // Para comparación con respuesta del usuario
  respuestaUsuario?: number;
  errorRealAbs?: number;
  errorRealRelPercent?: number;

  // Residual en la raíz encontrada
  residual?: number;
}

function isInvalid(val: any): boolean {
  return !isFinite(val) || isNaN(val);
}

type ErrorMode = "relative" | "absolute";

function computeIterationError(prev: number, next: number, mode: ErrorMode = "relative") {
  if (mode === "absolute") return Math.abs(next - prev);
  return Math.abs((next - prev) / (next || 1));
}

/* ===================== MÉTODO PUNTO FIJO ===================== */
export function metodoPuntoFijo(
  x0: number,
  g: string,
  tol = 0.01,          // fracción
  maxIter = 50,
  a?: number,
  b?: number,
  respuestaUsuario?: number,
  errorMode: ErrorMode = "relative"
): MethodResult {
  const iteraciones: Iteration[] = [];

  if (a !== undefined && b !== undefined) {
    if (a >= b) {
      return {
        funcion: g, raiz: null, errorPermitido: tol * 100,
        x0, a, b, iteraciones, plot: { x: [], y: [] },
        mensaje: "Intervalo inválido: a debe ser menor que b."
      };
    }
    if (x0 < a || x0 > b) {
      return {
        funcion: g, raiz: null, errorPermitido: tol * 100,
        x0, a, b, iteraciones, plot: { x: [], y: [] },
        mensaje: "x₀ fuera del intervalo [a,b]."
      };
    }
  }

  let x = x0;
  let raiz: number | null = null;

  iteraciones.push({ i: 0, x0, x: x0, error: "-", fx: NaN });

  for (let i = 1; i <= maxIter; i++) {
    let x1: number;
    try {
      x1 = evaluate(g, { x });
    } catch (e: any) {
      return {
        funcion: g, raiz: null, errorPermitido: tol * 100,
        x0, a, b, iteraciones, plot: { x: [], y: [] },
        mensaje: `Error al evaluar g(x) en iteración ${i}: ${e.message}`
      };
    }
    if (isInvalid(x1)) {
      return {
        funcion: g, raiz: null, errorPermitido: tol * 100,
        x0, a, b, iteraciones, plot: { x: [], y: [] },
        mensaje: `Iteración ${i}: g(x) inválido (NaN/∞).`
      };
    }
    if (a !== undefined && b !== undefined && (x1 < a || x1 > b)) {
      return {
        funcion: g, raiz: null, errorPermitido: tol * 100,
        x0, a, b, iteraciones, plot: { x: [], y: [] },
        mensaje: `Iteración ${i}: g(x) salió de [a,b].`
      };
    }
    const errFrac = computeIterationError(x, x1, errorMode);
    iteraciones.push({ i, x0: x, x: x1, error: errFrac, fx: NaN });
    if (errFrac < tol) { raiz = x1; break; }
    x = x1;
  }

  const result: MethodResult = {
    funcion: g,
    raiz,
    errorPermitido: tol * 100,
    x0, a, b,
    iteraciones,
    plot: {
      x: iteraciones.map(it => it.i),
      y: iteraciones.map(it => (typeof it.x === "number" ? it.x : NaN))
    }
  };

  if (raiz !== null && respuestaUsuario !== undefined && !isNaN(respuestaUsuario)) {
    result.respuestaUsuario = respuestaUsuario;
    result.errorRealAbs = Math.abs(raiz - respuestaUsuario);
    result.errorRealRelPercent = Math.abs((raiz - respuestaUsuario) / (respuestaUsuario || 1)) * 100;
  }

  return result;
}

/* ===================== NEWTON-RAPHSON (mejorado) ===================== */
export function metodoNewtonRaphson(
  x0: number,
  f: string,
  df: string,
  tol = 0.01,          // fracción
  maxIter = 50,
  respuestaUsuario?: number,
  errorMode: ErrorMode = "relative",
  tolResidual?: number,
  epsDeriv = 1e-12,
  maxMagnitude = 1e6
): MethodResult {
  const iteraciones: Iteration[] = [];
  let x = x0;
  let raiz: number | null = null;
  const residualTol = tolResidual ?? tol;

  iteraciones.push({ i: 0, x0: x0, x: x0, error: "-", fx: NaN });

  for (let i = 1; i <= maxIter; i++) {
    let fx: number, dfx: number;
    try {
      fx = evaluate(f, { x });
      dfx = evaluate(df, { x });
    } catch (e: any) {
      return {
        funcion: f, raiz: null, errorPermitido: tol * 100,
        x0, iteraciones, plot: { x: [], y: [] },
        mensaje: `Iteración ${i}: error al evaluar f o f': ${e.message}`
      };
    }

    if (isInvalid(fx)) {
      return {
        funcion: f, raiz: null, errorPermitido: tol * 100,
        x0, iteraciones, plot: { x: [], y: [] },
        mensaje: `Iteración ${i}: f(x) inválida.`
      };
    }

    // Criterio residual
    if (Math.abs(fx) < residualTol) {
      raiz = x;
      iteraciones.push({ i, x0: x, x: x, error: 0, fx });
      break;
    }

    if (isInvalid(dfx) || Math.abs(dfx) < epsDeriv) {
      // Intento fallback tipo secante local
      const h = 1e-6 * (Math.abs(x) + 1);
      let fxh: number;
      try {
        fxh = evaluate(f, { x: x + h });
      } catch {
        return {
          funcion: f, raiz: null, errorPermitido: tol * 100,
          x0, iteraciones, plot: { x: [], y: [] },
          mensaje: `Iteración ${i}: derivada casi cero y fallback falló.`
        };
      }
      const dApprox = (fxh - fx) / h;
      if (Math.abs(dApprox) < epsDeriv) {
        return {
          funcion: f, raiz: null, errorPermitido: tol * 100,
          x0, iteraciones, plot: { x: [], y: [] },
          mensaje: `Iteración ${i}: derivada (exacta y aproximada) ≈ 0.`
        };
      }
      dfx = dApprox;
    }

    const x1 = x - fx / dfx;
    if (isInvalid(x1)) {
      return {
        funcion: f, raiz: null, errorPermitido: tol * 100,
        x0, iteraciones, plot: { x: [], y: [] },
        mensaje: `Iteración ${i}: paso inválido (NaN/∞).`
      };
    }
    if (Math.abs(x1) > maxMagnitude) {
      return {
        funcion: f, raiz: null, errorPermitido: tol * 100,
        x0, iteraciones, plot: { x: [], y: [] },
        mensaje: `Divergencia: |x| excedió ${maxMagnitude}.`
      };
    }

    const errFrac = computeIterationError(x, x1, errorMode);
    iteraciones.push({ i, x0: x, x: x1, error: errFrac, fx });

    if (errFrac < tol) {
      raiz = x1;
      try {
        const fres = evaluate(f, { x: raiz });
        iteraciones[iteraciones.length - 1].fx = fres;
      } catch { /* ignorar */ }
      break;
    }
    x = x1;
  }

  const result: MethodResult = {
    funcion: f,
    raiz,
    errorPermitido: tol * 100,
    x0,
    iteraciones,
    plot: { x: iteraciones.map(it => it.i), y: iteraciones.map(it => (typeof it.x === "number" ? it.x : NaN)) }
  };

  if (raiz !== null) {
    try {
      result.residual = evaluate(f, { x: raiz });
    } catch {
      result.residual = NaN;
    }
  }

  if (raiz !== null && respuestaUsuario !== undefined && !isNaN(respuestaUsuario)) {
    result.respuestaUsuario = respuestaUsuario;
    result.errorRealAbs = Math.abs(raiz - respuestaUsuario);
    result.errorRealRelPercent = Math.abs((raiz - respuestaUsuario) / (respuestaUsuario || 1)) * 100;
  }

  return result;
}

/* ===================== SECANTE ===================== */
export function metodoSecante(
  x0: number,
  x1: number,
  f: string,
  tol = 0.01,
  maxIter = 50,
  respuestaUsuario?: number,
  errorMode: ErrorMode = "relative",
  tolResidual?: number
): MethodResult {
  const iteraciones: Iteration[] = [];
  let prev = x0, curr = x1;
  let raiz: number | null = null;
  const residualTol = tolResidual ?? tol;

  iteraciones.push({ i: 0, x0: prev, x1: curr, x: prev, error: "-", fx: NaN });

  for (let i = 1; i <= maxIter; i++) {
    let f0: number, f1: number;
    try {
      f0 = evaluate(f, { x: prev });
      f1 = evaluate(f, { x: curr });
    } catch (e: any) {
      return {
        funcion: f, raiz: null, errorPermitido: tol * 100,
        x0, x1, iteraciones, plot: { x: [], y: [] },
        mensaje: `Iteración ${i}: error al evaluar f: ${e.message}`
      };
    }
    if (isInvalid(f0) || isInvalid(f1)) {
      return {
        funcion: f, raiz: null, errorPermitido: tol * 100,
        x0, x1, iteraciones, plot: { x: [], y: [] },
        mensaje: `Iteración ${i}: f(x) inválida.`
      };
    }

    if (Math.abs(f1) < residualTol) {
      raiz = curr;
      iteraciones.push({ i, x0: prev, x1: curr, x: curr, error: 0, fx: f1 });
      break;
    }

    if (isInvalid(f1 - f0) || (f1 - f0) === 0) {
      return {
        funcion: f, raiz: null, errorPermitido: tol * 100,
        x0, x1, iteraciones, plot: { x: [], y: [] },
        mensaje: `Iteración ${i}: división por cero en secante.`
      };
    }

    const next = curr - (f1 * (curr - prev)) / (f1 - f0);
    if (isInvalid(next)) {
      return {
        funcion: f, raiz: null, errorPermitido: tol * 100,
        x0, x1, iteraciones, plot: { x: [], y: [] },
        mensaje: `Iteración ${i}: paso inválido (NaN/∞).`
      };
    }

    const errFrac = computeIterationError(curr, next, errorMode);
    iteraciones.push({ i, x0: prev, x1: curr, x: next, error: errFrac, fx: f1 });

    if (errFrac < tol) { raiz = next; break; }
    prev = curr;
    curr = next;
  }

  const result: MethodResult = {
    funcion: f,
    raiz,
    errorPermitido: tol * 100,
    x0, x1,
    iteraciones,
    plot: { x: iteraciones.map(it => it.i), y: iteraciones.map(it => (typeof it.x === "number" ? it.x : NaN)) }
  };

  if (raiz !== null) {
    try { result.residual = evaluate(f, { x: raiz }); } catch { result.residual = NaN; }
  }

  if (raiz !== null && respuestaUsuario !== undefined && !isNaN(respuestaUsuario)) {
    result.respuestaUsuario = respuestaUsuario;
    result.errorRealAbs = Math.abs(raiz - respuestaUsuario);
    result.errorRealRelPercent = Math.abs((raiz - respuestaUsuario) / (respuestaUsuario || 1)) * 100;
  }

  return result;
}

/* ===================== BISECCIÓN ===================== */
export function metodoBiseccion(
  a: number,
  b: number,
  f: string,
  tol = 0.01,
  maxIter = 50,
  respuestaUsuario?: number
): MethodResult {
  const iteraciones: Iteration[] = [];
  if (a >= b) {
    return {
      funcion: f, raiz: null, errorPermitido: tol * 100,
      a, b, iteraciones, plot: { x: [], y: [] },
      mensaje: "Intervalo inválido: a < b requerido."
    };
  }
  let xl = a, xu = b, xr = (a + b) / 2;
  iteraciones.push({ i: 0, x0: xl, x1: xu, x: xr, error: "-", fx: NaN });
  let raiz: number | null = null;

  for (let i = 1; i <= maxIter; i++) {
    let fxl: number, fxr: number;
    try {
      fxl = evaluate(f, { x: xl });
      fxr = evaluate(f, { x: xr });
    } catch (e: any) {
      return {
        funcion: f, raiz: null, errorPermitido: tol * 100,
        a, b, iteraciones, plot: { x: [], y: [] },
        mensaje: `Iteración ${i}: error al evaluar f: ${e.message}`
      };
    }
    if (isInvalid(fxl) || isInvalid(fxr)) {
      return {
        funcion: f, raiz: null, errorPermitido: tol * 100,
        a, b, iteraciones, plot: { x: [], y: [] },
        mensaje: `Iteración ${i}: f(x) inválida (NaN/∞).`
      };
    }

    if (fxl * fxr < 0) xu = xr; else xl = xr;
    const xrNew = (xl + xu) / 2;
    if (isInvalid(xrNew)) {
      return {
        funcion: f, raiz: null, errorPermitido: tol * 100,
        a, b, iteraciones, plot: { x: [], y: [] },
        mensaje: `Iteración ${i}: xr inválido.`
      };
    }

    const errFrac = Math.abs((xrNew - xr) / (xrNew || 1));
    iteraciones.push({ i, x0: xl, x1: xu, x: xrNew, error: errFrac, fx: fxr });
    if (errFrac < tol) { raiz = xrNew; break; }
    xr = xrNew;
  }

  const result: MethodResult = {
    funcion: f,
    raiz,
    errorPermitido: tol * 100,
    a, b,
    iteraciones,
    plot: { x: iteraciones.map(it => it.i), y: iteraciones.map(it => (typeof it.x === "number" ? it.x : NaN)) }
  };

  if (raiz !== null) {
    try { result.residual = evaluate(f, { x: raiz }); } catch { result.residual = NaN; }
  }

  if (raiz !== null && respuestaUsuario !== undefined && !isNaN(respuestaUsuario)) {
    result.respuestaUsuario = respuestaUsuario;
    result.errorRealAbs = Math.abs(raiz - respuestaUsuario);
    result.errorRealRelPercent = Math.abs((raiz - respuestaUsuario) / (respuestaUsuario || 1)) * 100;
  }

  return result;
}