'use client';

interface QuantitySelectorProps {
  quantity: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function QuantitySelector({
  quantity,
  onChange,
  min = 1,
  max = 999,
  size = 'md',
}: QuantitySelectorProps) {
  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-10 text-sm',
    lg: 'h-12 text-base',
  };

  const btnSize = {
    sm: 'w-8',
    md: 'w-10',
    lg: 'w-12',
  };

  return (
    <div className={`inline-flex items-center border border-gray-200 rounded-sm overflow-hidden bg-white ${sizeClasses[size]}`}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, quantity - 1))}
        disabled={quantity <= min}
        className={`${btnSize[size]} flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-semibold`}
      >
        −
      </button>
      <input
        type="number"
        value={quantity}
        onChange={(e) => {
          const val = parseInt(e.target.value) || min;
          onChange(Math.max(min, Math.min(max, val)));
        }}
        className={`w-14 text-center border-x border-gray-200 bg-white text-gray-900 font-semibold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${sizeClasses[size]}`}
        min={min}
        max={max}
      />
      <button
        type="button"
        onClick={() => onChange(Math.min(max, quantity + 1))}
        disabled={quantity >= max}
        className={`${btnSize[size]} flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-semibold`}
      >
        +
      </button>
    </div>
  );
}