"use client";

export default function PlantCard({plant, onClick}) {
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
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 group flex flex-col cursor-pointer active:scale-95"
    >
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <img
          src={plant.imageUrl}
          alt={plant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Overlay sutil no hover para indicar clique */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
        
        {/* Bolinha de Status */}
        <div 
          className={`absolute top-2 right-2 w-3 h-3 rounded-full shadow-sm border border-white ${getStatusColor()}`} 
          title="Status do preenchimento"
        />
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-800 truncate" title={plant.name}>
          {plant.name}
        </h3>
      </div>
    </div>
  );
}
