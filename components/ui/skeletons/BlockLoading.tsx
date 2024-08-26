import { Flex, Heading } from '@chakra-ui/react';
import React from 'react';

interface EthBlockLoadingAnimationProps {
  size?: number;
  blockSize?: number;
  width?: number;
  height?: number;
  color?: string;
}

const BlockLoading: React.FC<EthBlockLoadingAnimationProps> = ({
  blockSize = 10,
  width = 500,
  height = 120,
  color = '#ff631b'  // Orange color by default
}) => {
  const horizontalBlocks = Math.floor(width / blockSize);
  const verticalBlocks = Math.floor(height / blockSize);
  const blocks = [];

  for (let i = 0; i < verticalBlocks; i++) {
    for (let j = 0; j < horizontalBlocks; j++) {
      blocks.push(
        <rect
          key={`${i}-${j}`}
          x={j * blockSize}
          y={i * blockSize}
          width={blockSize}
          height={blockSize}
          fill={color}
          opacity="0"
        >
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur={`${2 + Math.random() * 2}s`}
            repeatCount="indefinite"
            begin={`${Math.random() * 2}s`}
          />
        </rect>
      );
    }
  }

  return (
    <Flex flexDir={'column'}  align={'center'}>
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height}>
      {blocks}
    </svg>
    <Heading size="md" fontFamily={'MonumentExtended'} color="secondary.500" mt={4} opacity={'0.5'}>
      Bringing you the latest blocks 🟧
    </Heading>
    </Flex>
  );
};

export default BlockLoading;