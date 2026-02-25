"use client";

export default function PlantDetailsModal({
  plant,
  onClose,
  isPublicView = false,
}) {
  if (!plant) return null;

  return (
    <div
      className="fixed inset-0 bg-white z-50 overflow-y-auto animate-in slide-in-from-bottom-10 duration-300"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg mx-auto min-h-screen bg-white shadow-none flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative h-64 shrink-0 bg-gray-100">
          <img
            src={plant.imagemUrl}
            alt={plant.nome}
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
            <h2 className="text-2xl font-bold text-gray-800">{plant.nome}</h2>
            {plant.nomeCientifico && (
              <p className="text-gray-500 italic font-medium">
                {plant.nomeCientifico}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex flex-col items-center justify-center text-center gap-1">
              <span className="text-3xl mb-1">
                {plant.luz === "Sol Pleno"
                  ? "☀️"
                  : plant.luz === "Sombra"
                    ? "☁️"
                    : plant.luz === "Luz Difusa"
                      ? "🌤️"
                      : "⛅"}
              </span>
              <span className="font-medium text-yellow-900 text-sm">
                {plant.luz || "Luz"}
              </span>
            </div>

            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex flex-col items-center justify-center text-center gap-1">
              <span className="text-3xl mb-1">
                {plant.intervaloRega <= 3
                  ? "💧"
                  : plant.intervaloRega <= 7
                    ? "💧💧"
                    : "🌵"}
              </span>
              <span className="font-medium text-blue-900 text-sm">
                {plant.intervaloRega} dias
              </span>
            </div>

            {plant.dataAquisicao && (
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col items-center justify-center text-center gap-1">
                <span className="text-3xl mb-1">📅</span>
                <span className="font-medium text-gray-700 text-sm">
                  {new Date(plant.dataAquisicao).toLocaleDateString("pt-BR")}
                </span>
              </div>
            )}

            <div
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-1 ${plant.petFriendly ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"}`}
            >
              <span className="text-3xl mb-1">
                {plant.petFriendly ? "🐶" : "🚫"}
              </span>
              <span
                className={`font-medium text-sm ${plant.petFriendly ? "text-green-900" : "text-red-900"}`}
              >
                {plant.petFriendly ? "Pet Friendly" : "Tóxica"}
              </span>
            </div>
          </div>

          {plant.observacoes && !isPublicView && (
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
