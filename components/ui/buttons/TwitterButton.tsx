import { Box, Button, ButtonProps, useColorMode } from '@chakra-ui/react'
import React from 'react'
import { VARIANT } from '../../../styles/theme'

export default function TwitterButton({children, ...args}: {children: React.ReactNode} & ButtonProps) {
    const { colorMode } = useColorMode();
    
  return (
    <Box className={`${VARIANT}-${colorMode}-twitterButton`}>
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
