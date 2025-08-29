import React, { useState } from 'react';
import { FingerPrintIcon, BeakerIcon, ArrowsRightLeftIcon, Square3Stack3DIcon } from '@heroicons/react/24/outline';
import logoGeoNumericos from '../assets/numericoslogo.png';

// Usa un tipo común para el id del servicio
export type ServiceId =
  | "punto-fijo"
  | "newton-raphson"
  | "secante"
  | "biseccion"
  | "future";


interface Service {
  id: ServiceId;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const services: Service[] = [
  { id: 'punto-fijo',    name: 'Método Punto Fijo',        icon: FingerPrintIcon },
  { id: 'newton-raphson',name: 'Método Newton-Raphson',    icon: BeakerIcon },
  { id: 'secante',       name: 'Método de la Secante',     icon: ArrowsRightLeftIcon },
  { id: 'future',        name: 'Próximamente',             icon: Square3Stack3DIcon },
];

interface HeaderProps {
  selectedService: ServiceId;
  onServiceChange: (serviceId: ServiceId) => void;
}

const Header: React.FC<HeaderProps> = ({ selectedService, onServiceChange }) => {
  const [hoveredService, setHoveredService] = useState<ServiceId | null>(null);

  return (
    <header className="bg-green-900/80 border-b border-green-950 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Servicios en la izquierda */}
        <div className="flex items-center space-x-4">
          {services.map((service) => {
            const IconComponent = service.icon;
            const isSelected = selectedService === service.id;

            return (
              <div key={service.id} className="relative">
                <button
                  className={`p-3 rounded-lg border transition-all duration-200 ${
                    isSelected
                      ? 'bg-red-100 border-red-400 shadow-md text-red-700'
                      : 'bg-white border-stone-300 shadow-sm hover:shadow-md hover:bg-green-900/20 text-stone-700'
                  }`}
                  onMouseEnter={() => setHoveredService(service.id)}
                  onMouseLeave={() => setHoveredService(null)}
                  onClick={() => onServiceChange(service.id)}
                >
                  <IconComponent className="w-6 h-6" />
                </button>

                {hoveredService === service.id && (
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="bg-gray-800 text-white text-sm px-3 py-1 rounded-md whitespace-nowrap">
                      {service.name}
                      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Logo en la derecha */}
        <div className="flex items-center">
          <img
            src={logoGeoNumericos}
            alt="GeoNumericos"
            className="h-12 w-auto"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
