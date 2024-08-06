import {
  Box,
  Button,
  Flex,
  IconButton,
  Image,
  Text,
  Tooltip,
  useColorMode,
} from "@chakra-ui/react";
import Link from "next/link";
import { MdRefresh } from "react-icons/md";
import { useUserData } from "../context/UserDataProvider";
import { VARIANT } from "../../styles/theme";

export const DISCORD_CONNECT_STATE = "discord-connect";
const DISCORD_SCOPE = ["identify", "guilds", "guilds.members.read"].join(" ");

export const getURLWithQueryParams = (
  baseUrl: string,
  params: Record<string, any>
) => {
  const query = Object.entries(params)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");

  return `${baseUrl}?${query}`;
};

export const getDiscordOAuthUrl = (
  address: string,
  redirectUri = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URL!
) =>
  getURLWithQueryParams(`https://discord.com/oauth2/authorize`, {
    response_type: "code",
    client_id: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
    redirect_uri: redirectUri,
    scope: DISCORD_SCOPE,
    state: DISCORD_CONNECT_STATE.concat(":", address),
    prompt: "consent",
    // code_verifier: "challenge"
  });

export default function DiscordConnect() {
  const { user, refreshUserData } = useUserData();
  const { colorMode } = useColorMode();

  console.log("User Discord", user);

  if (!user?.discord) {
    return (
      <div className="p-14">
        <Link href={getDiscordOAuthUrl(user?.id!)}>
          <Box
            className={`${VARIANT}-${colorMode}-discordButton`}
            _hover={{ opacity: 0.8 }}
            display={"flex"}
            justifyContent={"center"}
            alignItems={"center"}
          >
            <Button
              rounded={0}
              _hover={"none"}
              bg={"transparent"}
              textColor={"white"}
            >
              Join Discord & Win
            </Button>
          </Box>
        </Link>
      </div>
    );
  } else {
    return (
      <>
        <Flex justifyContent={"space-between"}>
          <Flex alignItems={"center"} gap={2}>
            <Image
              style={{ borderRadius: "100%" }}
              src={user?.discord.avatar}
              width={12}
              height={12}
              alt={"DIscord Avatar"}
            />
            <Box>
              <Flex alignItems={"center"} gap={1}>
                <Text fontWeight={"bold"}>{user?.discord.name}</Text>
              </Flex>
              <Text fontSize={"small"}>@{user?.discord.username}</Text>
            </Box>
          </Flex>
          {/* Reconnect Button */}
          <Tooltip
            label="Reconnect Account"
            aria-label="Reconnect Twitter"
            bg={"white"}
          >
            <Link href={getDiscordOAuthUrl(user?.id!)}>
              <IconButton
                aria-label="Reconnect Twitter"
                icon={<MdRefresh size={"20px"} />}
                rounded={"8px"}
                h={"100%"}
                aspectRatio={1}
                mr={2}
                bg={"primary.400"}
                color={"black"}
                _hover={{ bg: "brand", color: "white" }}
                onClick={refreshUserData}
              />
            </Link>
          </Tooltip>
        </Flex>
      </>
    );
  }
}
