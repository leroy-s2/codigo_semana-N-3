import React, { useState } from "react";

interface PuntoFijoFormProps {
  entryId: string;
  funcion: string;
  x0: string;
  a: string;
  b: string;
  error: string;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

const symbols = [
  { label: "π", insert: "pi" },
  { label: "e", insert: "e" },
  { label: "√()", insert: "sqrt()" },
  { label: "^", insert: "^" },
  { label: "()", insert: "()" }
];

const functions = [
  "sin()", "cos()", "tan()", "cot()", "asin()", "acos()", "atan()",
  "sinh()", "cosh()", "tanh()", "exp()", "log()", "log10()", "abs()"
];

const PuntoFijoForm: React.FC<PuntoFijoFormProps> = ({
  funcion,
  x0,
  a,
  b,
  error,
  onChange,
  onSubmit,
  canSubmit
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const insertAtCursor = (text: string) => {
    onChange("funcion", funcion + text);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-gray-700">
        Función g(x):
      </label>

      <div className="flex flex-wrap gap-2 mb-2">
        {symbols.map(s => (
          <button
            key={s.label}
            type="button"
            onClick={() => insertAtCursor(s.insert)}
            className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm"
          >
            {s.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs text-blue-600 underline"
        >
          {showAdvanced ? "Ocultar avanzados" : "Mostrar avanzados"}
        </button>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-3 gap-2 mb-2">
          {functions.map(fn => (
            <button
              key={fn}
              type="button"
              onClick={() => insertAtCursor(fn)}
              className="px-2 py-1 bg-gray-50 border rounded text-xs hover:bg-gray-100"
            >
              {fn}
            </button>
          ))}
        </div>
      )}

      <input
        type="text"
        value={funcion}
        onChange={e => onChange("funcion", e.target.value)}
        placeholder="Ej: (x^2+2)/3"
        className="w-full px-3 py-2 border rounded focus:ring-1 focus:border-blue-400"
      />

      <div>
        <label className="block text-xs font-medium text-gray-700">
          Valor inicial x₀:
        </label>
        <input
          type="number"
          value={x0}
          onChange={e => onChange("x0", e.target.value)}
          className="w-full px-3 py-2 border rounded focus:ring-1 focus:border-blue-400"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700">
            a (límite inferior):
          </label>
            <input
            type="number"
            value={a}
            onChange={e => onChange("a", e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-1 focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">
            b (límite superior):
          </label>
          <input
            type="number"
            value={b}
            onChange={e => onChange("b", e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-1 focus:border-blue-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-700">
          Error permitido (%) :
        </label>
        <input
          type="number"
          min="0"
          step="0.0001"
          value={error}
          onChange={e => onChange("error", e.target.value)}
          placeholder="Ej: 1"
          className="w-full px-3 py-2 border rounded focus:ring-1 focus:border-blue-400"
        />
      </div>
      

      <button
        type="button"
        disabled={!canSubmit}
        onClick={onSubmit}
        className="bg-red-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
      >
        Calcular
      </button>
    </div>
  );
};

export default PuntoFijoForm;