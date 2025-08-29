import { evaluate } from "mathjs";

export interface Iteration {
  i: number;
  x?: number;
  x0?: number;
  x1?: number;
  error: number | string; // puede ser número o "Invalid"
}

export interface MethodResult {
  funcion: string;
  raiz: number | null;
  errorPermitido: number;
  x0?: number;
  x1?: number;
  a?: number;
  b?: number;
  iteraciones: Iteration[];
  plot: { x: number[]; y: number[] };
  mensaje?: string; // en caso de error
}

function isInvalid(val: any): boolean {
  return !isFinite(val) || isNaN(val);
}

/* ========== MÉTODO PUNTO FIJO ========== */
export function metodoPuntoFijo(
  x0: number,
  g: string,
  tol = 0.01,
  maxIter = 50
): MethodResult {
  const iteraciones: Iteration[] = [];
  let x = x0;
  let raiz: number | null = null;
  for (let i = 1; i <= maxIter; i++) {
    const x1 = evaluate(g, { x });
    if (isInvalid(x1)) {
      return {
        funcion: g,
        raiz: null,
        errorPermitido: tol * 100,
        x0,
        iteraciones,
        plot: { x: [], y: [] },
        mensaje: `Iteración ${i}: valor inválido (NaN o ∞).`,
      };
    }
    const error = Math.abs((x1 - x) / (x1 || 1));
    iteraciones.push({ i, x0: x, x: x1, error });
    if (error < tol) {
      raiz = x1;
      break;
    }
    x = x1;
  }
  return {
    funcion: g,
    raiz,
    errorPermitido: tol * 100,
    x0,
    iteraciones,
    plot: { x: iteraciones.map((it) => it.i), y: iteraciones.map((it) => it.x ?? 0) },
  };
}

/* ========== MÉTODO NEWTON-RAPHSON ========== */
export function metodoNewtonRaphson(
  x0: number,
  f: string,
  df: string,
  tol = 0.01,
  maxIter = 50
): MethodResult {
  const iteraciones: Iteration[] = [];
  let x = x0;
  let raiz: number | null = null;
  for (let i = 1; i <= maxIter; i++) {
    const fx = evaluate(f, { x });
    const dfx = evaluate(df, { x });

    if (isInvalid(dfx) || dfx === 0) {
      return {
        funcion: f,
        raiz: null,
        errorPermitido: tol * 100,
        x0,
        iteraciones,
        plot: { x: [], y: [] },
        mensaje: `Iteración ${i}: derivada inválida o división por cero.`,
      };
    }

    const x1 = x - fx / dfx;
    if (isInvalid(x1)) {
      return {
        funcion: f,
        raiz: null,
        errorPermitido: tol * 100,
        x0,
        iteraciones,
        plot: { x: [], y: [] },
        mensaje: `Iteración ${i}: valor inválido (NaN o ∞).`,
      };
    }

    const error = Math.abs((x1 - x) / (x1 || 1));
    iteraciones.push({ i, x0: x, x: x1, error });
    if (error < tol) {
      raiz = x1;
      break;
    }
    x = x1;
  }
  return {
    funcion: f,
    raiz,
    errorPermitido: tol * 100,
    x0,
    iteraciones,
    plot: { x: iteraciones.map((it) => it.i), y: iteraciones.map((it) => it.x ?? 0) },
  };
}

/* ========== MÉTODO DE LA SECANTE ========== */
export function metodoSecante(
  x0: number,
  x1: number,
  f: string,
  tol = 0.01,
  maxIter = 50
): MethodResult {
  const iteraciones: Iteration[] = [];
  let prev = x0,
    curr = x1;
  let raiz: number | null = null;
  for (let i = 1; i <= maxIter; i++) {
    const f0 = evaluate(f, { x: prev });
    const f1 = evaluate(f, { x: curr });

    if (isInvalid(f1 - f0) || (f1 - f0) === 0) {
      return {
        funcion: f,
        raiz: null,
        errorPermitido: tol * 100,
        x0,
        x1,
        iteraciones,
        plot: { x: [], y: [] },
        mensaje: `Iteración ${i}: división por cero en fórmula de la secante.`,
      };
    }

    const next = curr - (f1 * (curr - prev)) / (f1 - f0);
    if (isInvalid(next)) {
      return {
        funcion: f,
        raiz: null,
        errorPermitido: tol * 100,
        x0,
        x1,
        iteraciones,
        plot: { x: [], y: [] },
        mensaje: `Iteración ${i}: valor inválido (NaN o ∞).`,
      };
    }

    const error = Math.abs((next - curr) / (next || 1));
    iteraciones.push({ i, x0: prev, x1: curr, x: next, error });
    if (error < tol) {
      raiz = next;
      break;
    }
    prev = curr;
    curr = next;
  }
  return {
    funcion: f,
    raiz,
    errorPermitido: tol * 100,
    x0,
    x1,
    iteraciones,
    plot: { x: iteraciones.map((it) => it.i), y: iteraciones.map((it) => it.x ?? 0) },
  };
}

/* ========== MÉTODO DE BISECCIÓN ========== */
export function metodoBiseccion(
  a: number,
  b: number,
  f: string,
  tol = 0.01,
  maxIter = 50
): MethodResult {
  const iteraciones: Iteration[] = [];
  let xl = a,
    xu = b,
    xr = (a + b) / 2;
  let raiz: number | null = null;

  for (let i = 1; i <= maxIter; i++) {
    const fxl = evaluate(f, { x: xl });
    const fxr = evaluate(f, { x: xr });

    if (isInvalid(fxl) || isInvalid(fxr)) {
      return {
        funcion: f,
        raiz: null,
        errorPermitido: tol * 100,
        a,
        b,
        iteraciones,
        plot: { x: [], y: [] },
        mensaje: `Iteración ${i}: valores inválidos en función (NaN o ∞).`,
      };
    }

    const sign = fxl * fxr;
    if (sign < 0) xu = xr;
    else xl = xr;

    const xrNew = (xl + xu) / 2;
    if (isInvalid(xrNew)) {
      return {
        funcion: f,
        raiz: null,
        errorPermitido: tol * 100,
        a,
        b,
        iteraciones,
        plot: { x: [], y: [] },
        mensaje: `Iteración ${i}: raíz inválida (NaN o ∞).`,
      };
    }

    const error = Math.abs((xrNew - xr) / (xrNew || 1));
    iteraciones.push({ i, x0: xl, x1: xu, x: xrNew, error });
    if (error < tol) {
      raiz = xrNew;
      break;
    }
    xr = xrNew;
  }

  return {
    funcion: f,
    raiz,
    errorPermitido: tol * 100,
    a,
    b,
    iteraciones,
    plot: { x: iteraciones.map((it) => it.i), y: iteraciones.map((it) => it.x ?? 0) },
  };
}
