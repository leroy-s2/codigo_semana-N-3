import React from 'react';

interface SlidingToastProps {
  show: boolean;
  title?: string;
  message: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
}

const SlidingToast: React.FC<SlidingToastProps> = ({
  show,
  title = 'Aviso',
  message,
  actionLabel = 'Explorar intervalos',
  onAction,
  onClose,
}) => {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end items-start pointer-events-none"
      aria-hidden="true"
    >
      {/* Fondo semitransparente (opcional) */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Contenedor de la tarjeta */}
      <div
        className={`
          relative z-50 w-[360px] max-w-[90vw] m-4
          transform transition-transform duration-300 ease-out
          ${show ? 'translate-x-0' : 'translate-x-full'}
          pointer-events-auto
        `}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white border border-stone-300 shadow-2xl rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-stone-800">{title}</h4>
              <div className="mt-1 text-sm text-stone-700">{message}</div>
              {onAction && (
                <button
                  type="button"
                  onClick={onAction}
                  className="mt-3 inline-flex items-center px-3 py-1.5 rounded-md text-sm font-semibold bg-red-600 text-white hover:bg-red-700"
                >
                  {actionLabel}
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="ml-2 text-xl text-stone-500 hover:text-stone-700"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlidingToast;
