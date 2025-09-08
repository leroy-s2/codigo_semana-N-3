import React, { useState } from "react";
import Header from "../Components/Header";
import type { ServiceId } from "../Components/Header";
import Sidebar from "../Components/sidebar";
import type { Entry } from "../Components/sidebar";
import Main from "../Components/Main";
import Plot from "react-plotly.js";
import { evaluate } from "mathjs";

import {
  metodoPuntoFijo,
  metodoNewtonRaphson,
  metodoSecante,
  metodoBiseccion
} from "../Services/numericalMethods";

import SlidingToast from "../Components/SlidingToast";

const AppLogic: React.FC = () => {
  const [selectedService, setSelectedService] = useState<ServiceId>("punto-fijo");

  const [entriesByService, setEntriesByService] = useState<Record<ServiceId, Entry[]>>({
    "punto-fijo": [],
    "newton-raphson": [],
    secante: [],
    biseccion: [],
    future: []
  });

  const [resultsByService, setResultsByService] = useState<Record<ServiceId, any[]>>({
    "punto-fijo": [],
    "newton-raphson": [],
    secante: [],
    biseccion: [],
    future: []
  });

  const [toastOpen, setToastOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<React.ReactNode>(null);
  const [explorerOpen, setExplorerOpen] = useState(false);
  const [lastFunction, setLastFunction] = useState<string>("");

  const [rangeMin, setRangeMin] = useState(-20);
  const [rangeMax, setRangeMax] = useState(20);
  const [angleMode, setAngleMode] = useState<"rad" | "deg">("rad");

  const handleAddEntry = (entry: Entry) => {
    setEntriesByService(prev => ({
      ...prev,
      [selectedService]: [...prev[selectedService], entry]
    }));
  };

  const handleUpdateEntry = (entryId: string, field: keyof Entry, value: string) => {
    setEntriesByService(prev => ({
      ...prev,
      [selectedService]: prev[selectedService].map(e =>
        e.id === entryId ? { ...e, [field]: value } : e
      )
    }));
  };

  const handleDeleteEntry = (entryId: string) => {
    setEntriesByService(prev => ({
      ...prev,
      [selectedService]: prev[selectedService].filter(e => e.id !== entryId)
    }));
    setResultsByService(prev => ({
      ...prev,
      [selectedService]: prev[selectedService].filter(r => r.entryId !== entryId)
    }));
  };

  // Normalización opcional (descomenta si quieres permitir 2x -> 2*x)
  // const normalizeExpr = (s: string) =>
  //   s
  //     .replace(/(\d)([a-zA-Z(])/g, "$1*$2")
  //     .replace(/([a-zA-Z)0-9])(\()/g, "$1*(");

  const parseTol = (entry: Entry, fallbackPercent = 1) => {
    const p = parseFloat(entry.error || `${fallbackPercent}`);
    const pct = isNaN(p) || p <= 0 ? fallbackPercent : p;
    return pct / 100; // fracción
  };

  const handleCalcular = (entry: Entry) => {
    let result: any = null;
    const tol = parseTol(entry, 1);
    const respuesta = entry.respuesta ? parseFloat(entry.respuesta) : undefined;

    try {
      switch (selectedService) {
        case "punto-fijo":
          result = metodoPuntoFijo(
            parseFloat(entry.x0 || "0"),
            entry.funcion!,
            tol,
            50,
            entry.a ? parseFloat(entry.a) : undefined,
            entry.b ? parseFloat(entry.b) : undefined,
            respuesta
          );
          break;
        case "newton-raphson":
          result = metodoNewtonRaphson(
            parseFloat(entry.x0 || "0"),
            entry.funcion!,
            entry.derivada!,
            tol,
            50,
            respuesta
          );
          break;
        case "secante":
          result = metodoSecante(
            parseFloat(entry.x0 || "0"),
            parseFloat(entry.x1 || "0"),
            entry.funcion!,
            tol,
            50,
            respuesta
          );
          break;
        case "biseccion":
          result = metodoBiseccion(
            parseFloat(entry.a || "0"),
            parseFloat(entry.b || "0"),
            entry.funcion!,
            tol,
            50,
            respuesta
          );
          break;
      }

      if (result?.mensaje) {
        setToastMsg(result.mensaje);
        setLastFunction(entry.funcion || "");
        setToastOpen(true);
        return;
      }

      const newResult = {
        ...result,
        entryId: entry.id,
        timestamp: new Date().toLocaleString()
      };

      setResultsByService(prev => {
        const updated = prev[selectedService].filter(r => r.entryId !== entry.id);
        return { ...prev, [selectedService]: [...updated, newResult] };
      });
    } catch (err: any) {
      setToastMsg(`Error en el cálculo: ${err.message}`);
      setLastFunction(entry.funcion || "");
      setToastOpen(true);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <Header selectedService={selectedService} onServiceChange={setSelectedService} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          selectedService={selectedService}
          entries={entriesByService[selectedService]}
          onAddEntry={handleAddEntry}
          onUpdateEntry={handleUpdateEntry}
          onDeleteEntry={handleDeleteEntry}
          onCalcularPuntoFijo={handleCalcular}
          onCalcularNewton={handleCalcular}
          onCalcularSecante={handleCalcular}
          onCalcularBiseccion={handleCalcular}
        />

        <Main
          selectedService={selectedService}
          results={resultsByService[selectedService]}
        />
      </div>

      <SlidingToast
        show={toastOpen}
        title="Problema detectado"
        message={toastMsg ?? ""}
        actionLabel="Explorar función"
        onAction={() => {
          setToastOpen(false);
          setExplorerOpen(true);
        }}
        onClose={() => setToastOpen(false)}
      />

      {explorerOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-xl w-[850px] max-w-full">
            <h2 className="text-lg font-bold mb-4">Explorador de función</h2>

            <div className="flex flex-wrap gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium">Mínimo X</label>
                <input
                  type="number"
                  value={rangeMin}
                  onChange={e => setRangeMin(parseFloat(e.target.value))}
                  className="px-2 py-1 border rounded w-24"
                />
              </div>
              <div>
                <label className="block text-xs font-medium">Máximo X</label>
                <input
                  type="number"
                  value={rangeMax}
                  onChange={e => setRangeMax(parseFloat(e.target.value))}
                  className="px-2 py-1 border rounded w-24"
                />
              </div>
              <div className="flex items-end">
                <label className="mr-2 text-sm">Modo:</label>
                <select
                  value={angleMode}
                  onChange={e => setAngleMode(e.target.value as "rad" | "deg")}
                  className="px-2 py-1 border rounded"
                >
                  <option value="rad">Radianes</option>
                  <option value="deg">Grados</option>
                </select>
              </div>
            </div>

            <Plot
              data={[
                {
                  x: Array.from({ length: 4001 }, (_, i) => rangeMin + i * ((rangeMax - rangeMin) / 4000)),
                  y: Array.from({ length: 4001 }, (_, i) => {
                    const x = rangeMin + i * ((rangeMax - rangeMin) / 4000);
                    try {
                      const input = angleMode === "deg" ? (x * Math.PI) / 180 : x;
                      return evaluate(lastFunction, { x: input });
                    } catch {
                      return NaN;
                    }
                  }),
                  type: "scatter",
                  mode: "lines",
                  line: { color: "blue", shape: "spline" }
                }
              ]}
              layout={{
                autosize: true,
                width: 800,
                height: 500,
                margin: { l: 60, r: 20, t: 20, b: 50 },
                xaxis: { title: "x", zeroline: true, gridcolor: "#ddd" },
                yaxis: { title: "f(x)", zeroline: true, gridcolor: "#ddd" }
              }}
              style={{ width: "100%", height: "100%" }}
              useResizeHandler={true}
            />

            <p className="mt-3 text-sm text-gray-600">
              💡 Busca intervalos donde f(x) cambie de signo para métodos con intervalo.
            </p>

            <button
              onClick={() => setExplorerOpen(false)}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppLogic;