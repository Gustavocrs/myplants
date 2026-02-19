"use client";

export default function PlantCard({plant, onClick}) {
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
      </div>
      <div className="p-3">
        <h3 className="font-medium text-gray-800 truncate" title={plant.name}>
          {plant.name}
        </h3>
      </div>
    </div>
  );
}
