import React from "react";

export default function WateringStatus({plants = [], onUpdateWatering}) {
  const getNextWateringDate = (ultimaRega, intervaloRega) => {
    if (!ultimaRega || !intervaloRega) return "Não configurado";
    const date = new Date(ultimaRega);
    date.setDate(date.getDate() + Number(intervaloRega));
    return date.toLocaleDateString("pt-BR");
  };

  const handleWater = (plant) => {
    const today = new Date().toISOString();
    // Chama a função passada pelo componente pai (ex: Settings ou Page) para atualizar na API
    if (onUpdateWatering) {
      onUpdateWatering(plant.id || plant._id, today);
    }
  };

  return (
    <div className="bg-white rounded-xl">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800 mb-6">
        <p>
          Acompanhe e atualize rapidamente o status de rega de todas as suas
          plantas em um só lugar.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b-2 border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
              <th className="p-3 pb-4 font-semibold">Planta</th>
              <th className="p-3 pb-4 font-semibold">Última Rega</th>
              <th className="p-3 pb-4 font-semibold">Próxima Rega</th>
              <th className="p-3 pb-4 font-semibold text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {plants.length === 0 ? (
              <tr>
                <td colSpan="4" className="p-6 text-center text-gray-500">
                  Nenhuma planta cadastrada para exibir o status.
                </td>
              </tr>
            ) : (
              plants.map((plant) => (
                <tr
                  key={plant.id || plant._id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                >
                  <td className="p-3 flex items-center gap-4">
                    {/* Miniatura da Foto */}
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200 shadow-sm">
                      {plant.imagemUrl ? (
                        <img
                          src={plant.imagemUrl}
                          alt={plant.nome || "Planta"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          🌱
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700 block">
                        {plant.nome ||
                          plant.nomeCientifico ||
                          "Planta sem nome"}
                      </span>
                    </div>
                  </td>

                  {/* Data da Última Rega */}
                  <td className="p-3 text-gray-600">
                    {plant.ultimaRega
                      ? new Date(plant.ultimaRega).toLocaleDateString("pt-BR")
                      : "Nunca regada"}
                  </td>

                  {/* Data da Próxima Rega (Cálculo) */}
                  <td className="p-3 font-medium text-emerald-600">
                    {getNextWateringDate(plant.ultimaRega, plant.intervaloRega)}
                  </td>

                  {/* Botão de Ação */}
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleWater(plant)}
                      className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium py-1.5 px-4 rounded-lg shadow-sm transition-colors text-sm flex items-center gap-2 ml-auto"
                    >
                      <span>💦</span> Atualizar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
