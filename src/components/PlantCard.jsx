export default function PlantCard({plant, onEdit, onDelete}) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex flex-col">
      <div className="aspect-square relative overflow-hidden bg-gray-100">
        <img
          src={plant.imageUrl}
          alt={plant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-3 flex flex-col flex-1">
        <h3
          className="font-medium text-gray-800 truncate mb-3"
          title={plant.name}
        >
          {plant.name}
        </h3>

        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onEdit(plant)}
            className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
            title="Editar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
              <path d="m15 5 4 4" />
            </svg>
            Editar
          </button>
          <button
            onClick={() => onDelete(plant.id)}
            className="flex-1 bg-red-50 text-red-600 hover:bg-red-100 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
            title="Excluir"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18" />
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              <line x1="10" x2="10" y1="11" y2="17" />
              <line x1="14" x2="14" y1="11" y2="17" />
            </svg>
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
