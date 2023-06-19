import { useContext } from 'react';
import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  Flex,
} from '@chakra-ui/react';
import { FaTwitter, FaDiscord, FaGithub } from 'react-icons/fa';
import { AppDataContext } from './context/AppDataProvider';
import { useNetwork } from 'wagmi';

export default function Footer() {

  const {block} = useContext(AppDataContext);
  const {chain} = useNetwork();

  return (
    <Box
      color={'whiteAlpha.400'}
      bg='transparent'
      >
      <Box
        borderTopWidth={1}
        borderStyle={'solid'}
        borderColor={'whiteAlpha.200'}
        >
        <Container
          as={Stack}
          maxW={'1200px'}
          pt={2}
          direction={{ base: 'column', md: 'row' }}
          spacing={4}
          justify={{ md: 'space-between' }}
          align={{ md: 'center' }}
          color='whiteAlpha.800'
          >
            <Flex align={'center'} gap={1}>
            <Box h={2} w={2} bgColor={block == 0 ? 'red': 'green.400'} rounded='100'></Box>
          <Text fontSize={'xs'}>{chain?.name} ({block == 0 ? 'Not Connected': block})</Text>

          <Text fontSize={'xs'}>| v1.0.0-beta</Text>

            </Flex>
          <Stack direction={'row'} spacing={6}>
            <Link zIndex={1000} target={'_blank'} href={'https://twitter.com/ReaxFinance'}>
              <FaTwitter />
            </Link>
            <Link zIndex={1000} target={'_blank'} href={'https://discord.gg/PbZytGeMhV'}>
              <FaDiscord />
            </Link>
            {/* <Link zIndex={1000} target={'_blank'} href={'https://github.com/synthe-x'}>
              <FaGithub />
            </Link> */}
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}