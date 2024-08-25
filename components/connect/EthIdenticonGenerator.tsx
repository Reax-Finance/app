import React, { useMemo } from 'react';

interface EthIdenticonGeneratorProps {
  ethAddress: string;
  size?: number;
  cellSize?: number;
}

const EthIdenticonGenerator: React.FC<EthIdenticonGeneratorProps> = ({ 
  ethAddress, 
  size = 200, 
  cellSize = 40 
}) => {
  const grid = useMemo(() => {
    // Validate and process the Ethereum address
    const cleanAddress = ethAddress.toLowerCase().replace(/^0x/, '');
    if (!/^[0-9a-f]{40}$/.test(cleanAddress)) {
      console.error('Invalid Ethereum address');
      return null;
    }

    const gridSize = Math.floor(size / cellSize);
    const middleCol = Math.floor(gridSize / 2);

    return Array(gridSize).fill(null).map((_, row) => 
      Array(Math.ceil(gridSize / 2)).fill(null).map((_, col) => {
        // Use 4 bits (1 hex character) to determine if a cell is filled
        const idx = (row * 3 + col) % cleanAddress.length;
        const isFilled = parseInt(cleanAddress[idx], 16) % 2 === 0;
        
        if (isFilled) {
          const orangeShade = `rgba(255, 140, 0, ${0.3 + (parseInt(cleanAddress[idx], 16) / 15) * 0.7})`;
          return (
            <React.Fragment key={`${row}-${col}`}>
              <rect x={col * cellSize} y={row * cellSize} width={cellSize} height={cellSize} fill={orangeShade} />
              {col !== middleCol && (
                <rect 
                  x={(gridSize - 1 - col) * cellSize} 
                  y={row * cellSize} 
                  width={cellSize} 
                  height={cellSize} 
                  fill={orangeShade} 
                />
              )}
            </React.Fragment>
          );
        }
        return null;
      })
    );
  }, [ethAddress, size, cellSize]);

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${size} ${size}`} 
      style={{ backgroundColor: 'transparent' }}
    >
      {grid}
    </svg>
  );
};

export default EthIdenticonGenerator;