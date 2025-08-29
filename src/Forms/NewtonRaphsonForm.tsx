import React, { useState } from "react";

interface NewtonRaphsonFormProps {
  entryId: string;
  funcion: string;
  derivada: string;
  x0: string;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

const symbols = [
  { label: "π", insert: "pi" },
  { label: "e", insert: "e" },
  { label: "√()", insert: "sqrt()" },
  { label: "^", insert: "^" },
  { label: "()", insert: "()" },
];

const functions = [
  "sin()", "cos()", "tan()", "cot()", "asin()", "acos()", "atan()",
  "sinh()", "cosh()", "tanh()", "exp()", "log()", "log10()", "abs()",
];

const NewtonRaphsonForm: React.FC<NewtonRaphsonFormProps> = ({
  funcion,
  derivada,
  x0,
  onChange,
  onSubmit,
  canSubmit,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const insertAtCursor = (field: "funcion" | "derivada", text: string) => {
    onChange(field, (field === "funcion" ? funcion : derivada) + text);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-gray-700">
        Función f(x):
      </label>

      {/* Panel de símbolos */}
      <div className="flex flex-wrap gap-2 mb-2">
        {symbols.map((s) => (
          <button
            key={s.label}
            type="button"
            onClick={() => insertAtCursor("funcion", s.insert)}
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
          {functions.map((fn) => (
            <button
              key={fn}
              type="button"
              onClick={() => insertAtCursor("funcion", fn)}
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
        onChange={(e) => onChange("funcion", e.target.value)}
        placeholder="Ej: x^3 - x - 2"
        className="w-full px-3 py-2 border rounded focus:ring-1 focus:border-blue-400"
      />

      <label className="block text-xs font-medium text-gray-700">
        Derivada f'(x):
      </label>
      <input
        type="text"
        value={derivada}
        onChange={(e) => onChange("derivada", e.target.value)}
        placeholder="Ej: 3*x^2 - 1"
        className="w-full px-3 py-2 border rounded focus:ring-1 focus:border-blue-400"
      />

      <div>
        <label className="block text-xs font-medium text-gray-700">
          Valor inicial x₀:
        </label>
        <input
          type="number"
          value={x0}
          onChange={(e) => onChange("x0", e.target.value)}
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

export default NewtonRaphsonForm;
