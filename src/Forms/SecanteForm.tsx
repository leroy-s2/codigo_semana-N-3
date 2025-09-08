import React, { useState } from "react";

interface SecanteFormProps {
  entryId: string;
  funcion: string;
  x0: string;
  x1: string;
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

const SecanteForm: React.FC<SecanteFormProps> = ({
  funcion,
  x0,
  x1,
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
        Función f(x):
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
        placeholder="Ej: x^3 - x - 2"
        className="w-full px-3 py-2 border rounded focus:ring-1 focus:border-blue-400"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700">x₀:</label>
          <input
            type="number"
            value={x0}
            onChange={e => onChange("x0", e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-1 focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">x₁:</label>
          <input
            type="number"
            value={x1}
            onChange={e => onChange("x1", e.target.value)}
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

export default SecanteForm;