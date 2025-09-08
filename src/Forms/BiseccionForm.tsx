import React from "react";

interface BiseccionFormProps {
  entryId: string;
  funcion: string;
  a: string;
  b: string;
  error: string;
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
  canSubmit: boolean;
}

const BiseccionForm: React.FC<BiseccionFormProps> = ({
  funcion,
  a,
  b,
  error,
  onChange,
  onSubmit,
  canSubmit
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-xs font-medium text-gray-700">
        Función f(x):
      </label>
      <input
        type="text"
        value={funcion}
        onChange={e => onChange("funcion", e.target.value)}
        placeholder="Ej: x^3 - x - 2"
        className="w-full px-3 py-2 border rounded focus:ring-1 focus:border-blue-400"
      />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-700">a:</label>
          <input
            type="number"
            value={a}
            onChange={e => onChange("a", e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-1 focus:border-blue-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700">b:</label>
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
          placeholder="Ej: 0.5"
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

export default BiseccionForm;