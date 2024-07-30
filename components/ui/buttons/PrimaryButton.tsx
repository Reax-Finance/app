import { Box, Button, ButtonProps, useColorMode } from '@chakra-ui/react'
import React from 'react'
import { VARIANT } from '../../../styles/theme'

export default function PrimaryButton({children, ...args}: {children: React.ReactNode} & ButtonProps) {
    const { colorMode } = useColorMode();
    
  return (
    <Box className={args.isDisabled ? `${VARIANT}-${colorMode}-disabledPrimaryButton` : `${VARIANT}-${colorMode}-primaryButton`}>
          <Button
            bg={"transparent"}
            _hover={{ opacity: 0.8 }}
            {...args}
          >
            {children}
          </Button>
        </Box>
  )
}
