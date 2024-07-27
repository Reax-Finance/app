import { Box, BoxProps, Flex, FlexProps, useColorMode } from '@chakra-ui/react'
import React from 'react'
import { VARIANT } from '../../../styles/theme';

export default function Dark600Box2C({children, ...args}: {children: React.ReactNode} & FlexProps) {
    const {colorMode} = useColorMode();

  return (
    <Flex
    flexDir={'column'}
        className={`${VARIANT}-${colorMode}-containerBody`}
        {...args}
    >{children}</Flex>
  )
}
