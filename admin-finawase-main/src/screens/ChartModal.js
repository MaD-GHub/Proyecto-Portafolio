import React from 'react';

const ChartModal = ({ isOpen, onRequestClose, chartInfo }) => {
  if (!isOpen || !chartInfo) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <button
          onClick={onRequestClose}
          className="absolute top-2 right-2 text-gray-700 text-sm font-bold"
          style={{ fontSize: '16px', cursor: 'pointer' }}
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4">{chartInfo.title}</h2>
        <p className="mb-4"><strong>Descripción:</strong> {chartInfo.description}</p>
        <p><strong>Propósito:</strong> {chartInfo.purpose}</p>
      </div>
    </div>
  );
};

export default ChartModal;
