"use client";

export default function PlantDetailsModal({plant, onClose}) {
  if (!plant) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-64 shrink-0 bg-gray-100">
          <img
            src={plant.imageUrl}
            alt={plant.name}
            className="w-full h-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 backdrop-blur-md transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{plant.name}</h2>
            {plant.nomeCientifico && (
              <p className="text-gray-500 italic font-medium">
                {plant.nomeCientifico}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="block text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">
                Luminosidade
              </span>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                ☀️ {plant.luz || "Não informado"}
              </span>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="block text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">
                Rega
              </span>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                💧 A cada {plant.intervaloRega} dias
              </span>
            </div>
            {plant.dataAquisicao && (
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="block text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">
                  Adquirida em
                </span>
                <span className="font-medium text-gray-700 flex items-center gap-2">
                  📅 {new Date(plant.dataAquisicao).toLocaleDateString("pt-BR")}
                </span>
              </div>
            )}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
              <span className="block text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">
                Pet Friendly
              </span>
              <span className="font-medium text-gray-700 flex items-center gap-2">
                {plant.petFriendly ? "🐶 Sim" : "⚠️ Não"}
              </span>
            </div>
          </div>

          {plant.observacoes && (
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <span className="block text-green-700 text-xs uppercase tracking-wider font-bold mb-2">
                Observações & Cuidados
              </span>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed text-sm">
                {plant.observacoes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
