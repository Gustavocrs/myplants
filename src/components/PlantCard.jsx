"use client";

export default function PlantCard({plant, onClick, onEdit}) {
  // Lógica para a cor da bolinha de status
  const getStatusColor = () => {
    const hasScientific = !!plant.nomeCientifico;
    const hasNotes = !!plant.observacoes;
    const hasDate = !!plant.dataAquisicao;

    // Verde: Totalmente preenchida (considerando os campos opcionais principais)
    if (hasScientific && hasNotes && hasDate) return "bg-green-500";
    // Vermelho: Apenas o básico (foto e nome são obrigatórios, então checamos a falta do resto)
    if (!hasScientific && !hasNotes && !hasDate) return "bg-red-500";
    // Amarelo: Parcial
    return "bg-yellow-500";
  };

  return (
    <div
      onClick={() => onClick(plant)}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 group flex flex-col cursor-pointer active:scale-95 relative"
    >
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <img
          src={plant.imagemUrl}
          alt={plant.nome}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Overlay sutil no hover para indicar clique */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />

        {/* Bolinha de Status - Movida para a esquerda */}
        <div
          className={`absolute top-2 left-2 w-3 h-3 rounded-full shadow-sm border border-white ${getStatusColor()}`}
          title="Status do preenchimento"
        />

        {/* Botão de Editar - Aparece no Hover (Desktop) ou Sempre (Mobile) */}
        {onEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(plant);
            }}
            className="absolute top-2 right-2 bg-white text-gray-700 p-2 rounded-full shadow-md hover:bg-gray-50 transition-all duration-200 opacity-100 md:opacity-0 md:group-hover:opacity-100 z-10"
            title="Editar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </button>
        )}
      </div>
      <div className="p-3">
        <h3
          className="font-medium text-gray-800 truncate mb-1"
          title={plant.nome}
        >
          {plant.nome}
        </h3>
        <div className="flex gap-3 text-sm text-gray-500">
          <span title={plant.luz}>
            {plant.luz === "Sol Pleno"
              ? "☀️"
              : plant.luz === "Sombra"
                ? "☁️"
                : plant.luz === "Luz Difusa"
                  ? "🌤️"
                  : "⛅"}
          </span>
          <span title={`Rega a cada ${plant.intervaloRega} dias`}>
            {plant.intervaloRega <= 3
              ? "💧"
              : plant.intervaloRega <= 7
                ? "💧💧"
                : "🌵"}
          </span>
          {plant.petFriendly && <span title="Pet Friendly">🐶</span>}
        </div>
      </div>
    </div>
  );
}
