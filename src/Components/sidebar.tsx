import React, { useState } from "react";
import { PlusIcon, ChevronDownIcon, ChevronRightIcon, TrashIcon } from "@heroicons/react/24/outline";
import type { ServiceId } from "./Header";

// Importamos los 3 formularios
import PuntoFijoForm from "../Forms/PuntoFijoForm";
import NewtonRaphsonForm from "../Forms/NewtonRaphsonForm";
import SecanteForm from "../Forms/SecanteForm";

export interface Entry {
  id: string;
  name: string;
  isExpanded: boolean;
  // Campos opcionales según el método
  funcion?: string;
  derivada?: string;
  x0?: string;
  x1?: string;
  a?: string;
  b?: string;
  error?: string;
}


interface SidebarProps {
  selectedService: ServiceId;
  entries: Entry[];
  onAddEntry: (entry: Entry) => void;
  onUpdateEntry: (entryId: string, field: keyof Entry, value: string) => void;
  onDeleteEntry: (entryId: string) => void;
  onCalcularPuntoFijo?: (entry: Entry) => void;
  onCalcularNewton?: (entry: Entry) => void;
  onCalcularSecante?: (entry: Entry) => void;
  onCalcularBiseccion?: (entry: Entry) => void; // ✅ añadido
}


const Sidebar: React.FC<SidebarProps> = ({
  selectedService,
  entries,
  onAddEntry,
  onUpdateEntry,
  onDeleteEntry,
  onCalcularPuntoFijo,
  onCalcularNewton,
  onCalcularSecante,
}) => {
  const [expandedEntries, setExpandedEntries] = useState<Record<string, boolean>>({});

  const addEntry = () => {
    const newEntry: Entry = {
      id: Date.now().toString(),
      name: `Entrada ${entries.length + 1}`,
      isExpanded: true,
    };
    onAddEntry(newEntry);
    setExpandedEntries((prev) => ({ ...prev, [newEntry.id]: true }));
  };

  const toggleEntry = (entryId: string) => {
    setExpandedEntries((prev) => ({ ...prev, [entryId]: !prev[entryId] }));
  };

  return (
    <aside className="w-80 bg-white border-r-4 border-red-600 flex flex-col">
      {/* Header del panel lateral */}
      <div className="border-b border-gray-200 flex items-center">
        <button
          onClick={addEntry}
          className="p-4 border-r border-gray-200 hover:bg-gray-50 transition-colors duration-200"
        >
          <PlusIcon className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1 px-4 py-4">
          <span className="text-gray-700 font-medium">Entradas - {selectedService}</span>
        </div>
      </div>

      {/* Lista de entradas */}
      <div className="flex-1 overflow-y-auto hide-scrollbar">
        {entries.map((entry) => {
          const isExpanded = expandedEntries[entry.id] ?? entry.isExpanded;
          return (
            <div key={entry.id} className="border-b border-gray-100">
              {/* Header de cada entrada */}
              <div className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors duration-200">
                <div
                  className="flex items-center flex-1 cursor-pointer"
                  onClick={() => toggleEntry(entry.id)}
                >
                  <span className="text-gray-700 font-medium">{entry.name}</span>
                  <div className="ml-2">
                    {isExpanded ? (
                      <ChevronDownIcon className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4 text-gray-500" />
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteEntry(entry.id)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200"
                  title="Eliminar entrada"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Formulario de la entrada */}
              {isExpanded && (
                <div className="px-4 pb-4 bg-gray-50 text-sm text-gray-600">
                  {selectedService === "punto-fijo" && (
                    <PuntoFijoForm
                      entryId={entry.id}
                      x0={entry.x0 || ""}
                      funcion={entry.funcion || ""}
                      onChange={(field, value) => onUpdateEntry(entry.id, field as keyof Entry, value)}
                      onSubmit={() => onCalcularPuntoFijo?.(entry)}
                      canSubmit={!!entry.funcion && !!entry.x0}
                    />
                  )}

                  {selectedService === "newton-raphson" && (
                    <NewtonRaphsonForm
                      entryId={entry.id}
                      funcion={entry.funcion || ""}
                      derivada={entry.derivada || ""}
                      x0={entry.x0 || ""}
                      onChange={(field, value) => onUpdateEntry(entry.id, field as keyof Entry, value)}
                      onSubmit={() => onCalcularNewton?.(entry)}
                      canSubmit={!!entry.funcion && !!entry.derivada && !!entry.x0}
                    />
                  )}

                  {selectedService === "secante" && (
                    <SecanteForm
                      entryId={entry.id}
                      funcion={entry.funcion || ""}
                      x0={entry.x0 || ""}
                      x1={entry.x1 || ""}
                      onChange={(field, value) => onUpdateEntry(entry.id, field as keyof Entry, value)}
                      onSubmit={() => onCalcularSecante?.(entry)}
                      canSubmit={!!entry.funcion && !!entry.x0 && !!entry.x1}
                    />
                  )}

                  {selectedService === "future" && (
                    <p className="text-gray-500">Este método estará disponible próximamente.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {entries.length === 0 && (
          <div className="p-4 text-center text-gray-500">
            <p>No hay entradas</p>
            <p className="text-sm mt-1">Haz clic en el botón "+" para agregar una entrada</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
