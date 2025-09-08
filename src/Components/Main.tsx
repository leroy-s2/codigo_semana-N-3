import React from "react";
import Plot from "react-plotly.js";

interface MainProps {
  selectedService: string;
  results: any[];
}

const Main: React.FC<MainProps> = ({ selectedService, results }) => {
  const getServiceTitle = () => {
    switch (selectedService) {
      case "punto-fijo": return "Método Punto Fijo";
      case "newton-raphson": return "Método Newton-Raphson";
      case "secante": return "Método de la Secante";
      case "biseccion": return "Método de la Bisección";
      case "future": return "Próximamente";
      default: return "GeoNuméricos";
    }
  };

  if (results.length === 0) {
    return (
      <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Resultados - {getServiceTitle()}</h2>
        <p className="text-gray-500">No hay resultados para esta sección.</p>
      </main>
    );
  }

  const last = results[results.length - 1];

  return (
    <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
      <h2 className="text-2xl font-bold mb-4">{getServiceTitle()}</h2>

      <div className="bg-white shadow-md rounded-xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {last.funcion && <Info label="Función" value={last.funcion} />}
          {last.a !== undefined && last.b !== undefined && (
            <Info label="Intervalo" value={`[${last.a}, ${last.b}]`} />
          )}
          {last.x0 !== undefined && <Info label="x₀" value={last.x0} />}
          {last.x1 !== undefined && <Info label="x₁" value={last.x1} />}
          {last.errorPermitido !== undefined && (
            <Info label="Error permitido" value={`${last.errorPermitido.toFixed(2)}%`} />
          )}
          {last.residual !== undefined && (
            <Info label="f(raíz)" value={Number.isFinite(last.residual) ? last.residual.toExponential(6) : "—"} />
          )}
          {last.respuestaUsuario !== undefined && (
            <Info label="Respuesta usuario" value={last.respuestaUsuario} />
          )}
          {last.errorRealAbs !== undefined && (
            <Info label="Error real (abs)" value={last.errorRealAbs.toExponential(6)} />
          )}
          {last.errorRealRelPercent !== undefined && (
            <Info label="Error real (%)" value={last.errorRealRelPercent.toFixed(6) + "%"} />
          )}
          {last.raiz !== null && (
            <Info label="Raíz aproximada" value={last.raiz.toFixed(6)} highlight />
          )}
        </div>

        {last.plot && (
          <Plot
            data={[
              {
                x: last.plot.x,
                y: last.plot.y,
                type: "scatter",
                mode: "lines+markers",
                line: { color: "red", shape: "spline" },
                marker: { size: 5 },
              },
            ]}
            layout={{
              autosize: true,
              width: 700,
              height: 400,
              xaxis: { title: "Iteraciones", zeroline: true, gridcolor: "#ddd" },
              yaxis: { title: "Aproximaciones", zeroline: true, gridcolor: "#ddd" },
              margin: { l: 50, r: 20, t: 20, b: 40 },
            }}
            style={{ width: "100%", height: "100%" }}
            config={{ responsive: true }}
          />
        )}

        {last.iteraciones && (
          <div>
            <h3 className="font-semibold mb-2 text-blue-700">Iteraciones</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full text-xs md:text-sm text-left border">
                <thead className="bg-gray-100">
                  <tr>
                    <Th>n</Th>
                    <Th>X₀</Th>
                    {last.x1 !== undefined || last.a !== undefined ? <Th>X₁/Xu</Th> : null}
                    <Th>Xr/x</Th>
                    <Th>f(x)</Th>
                    <Th>Error (%)</Th>
                  </tr>
                </thead>
                <tbody>
                  {last.iteraciones.map((it: any) => (
                    <tr key={it.i}>
                      <Td>{it.i}</Td>
                      <Td>{it.x0 ?? "-"}</Td>
                      {last.x1 !== undefined || last.a !== undefined ? (
                        <Td>{it.x1 ?? "-"}</Td>
                      ) : null}
                      <Td>{it.x?.toFixed ? it.x.toFixed(6) : it.x}</Td>
                      <Td>
                        {typeof it.fx === "number" && isFinite(it.fx)
                          ? it.fx.toExponential(3)
                          : "-"}
                      </Td>
                      <Td>
                        {typeof it.error === "number"
                          ? (it.error * 100).toFixed(6) + "%"
                          : it.error}
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

const Info: React.FC<{ label: string; value: any; highlight?: boolean }> = ({
  label,
  value,
  highlight,
}) => (
  <div className={`p-3 rounded ${highlight ? "bg-red-100" : "bg-gray-50"}`}>
    <p className="text-sm font-medium text-blue-600">{label}</p>
    <p className={`text-sm ${highlight ? "text-red-700 font-bold text-lg" : "text-gray-800 font-semibold"}`}>
      {value}
    </p>
  </div>
);

const Th: React.FC<React.PropsWithChildren> = ({ children }) => (
  <th className="border px-2 py-1">{children}</th>
);
const Td: React.FC<React.PropsWithChildren> = ({ children }) => (
  <td className="border px-2 py-1">{children}</td>
);

export default Main;