import { Box, Button, Flex, IconButton, Image, Text, Tooltip } from "@chakra-ui/react";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { MdRefresh } from "react-icons/md";
import { FaLink, FaXTwitter } from "react-icons/fa6";
import { TWITTER_SCOPE } from "../../src/const";
import { useUserData } from "../context/UserDataProvider";
import TwitterButton from "../ui/buttons/TwitterButton";
import Dark600Box2C from "../ui/boxes/Dark600Box2C";
import Dark400Box2C from "../ui/boxes/Dark400Box2C";

export const TWITTER_CONNECT_STATE = "twitter-connect";

export const getURLWithQueryParams = (
	baseUrl: string,
	params: Record<string, any>
) => {
	const query = Object.entries(params)
		.map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
		.join("&");

	return `${baseUrl}?${query}`;
};

export const getTwitterOAuthUrl = (address: string, redirectUri = process.env.NEXT_PUBLIC_VERCEL_URL + "/callback/twitter") =>
	getURLWithQueryParams(`https://x.com/i/oauth2/authorize`, {
		response_type: "code",
		client_id: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID,
		redirect_uri: redirectUri,
		scope: TWITTER_SCOPE,
		state: TWITTER_CONNECT_STATE.concat(":", address),

		code_challenge: "challenge",
		code_challenge_method: "plain",
	});

export default function XConnectButton() {
	const { user } = useUserData();

	if (!user?.twitter)
		return (
			<>
				<Link
					href={getTwitterOAuthUrl(
						user?.id!
					)}
				>
					<TwitterButton isDisabled={!user} leftIcon={<FaXTwitter />}>
						Link Account
					</TwitterButton>
				</Link>
			</>
		);
	else
		return (
			<>
				<Flex justify={'space-between'} flex={1}>
					<Flex align={"center"} gap={2}>
						<Image
							style={{ borderRadius: "100%" }}
							src={user?.twitter.profileImageUrl}
							width={12}
							height={12}
							alt={""}
						/>
						<Box>
							<Flex align={"center"} gap={1}>
								<Text fontWeight={"bold"}>
									{user?.twitter.name}
								</Text>
							</Flex>
							<Text fontSize={"sm"}>
								@{user?.twitter.username}
							</Text>
						</Box>
					</Flex>

                    {/* Reconnect Button */}
					<Tooltip label="Reconnect Account" aria-label="Reconnect Twitter" bg={'white'}>
                    <Link
                        href={getTwitterOAuthUrl(
                            user?.id!
                        )}
                    >
                        <IconButton
                            aria-label="Reconnect Twitter"
                            icon={<MdRefresh size={'20px'} />}
                            rounded={"8px"}
							h={'100%'}
							aspectRatio={1}
							mr={2}
							bg={'primary.400'}
							color={'black'}
							_hover={{ bg: 'brand', color: 'white' }}
                        />
                    </Link>
					</Tooltip>
				</Flex>
			</>
		);
}
