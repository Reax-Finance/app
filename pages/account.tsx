import {
  Box,
  Divider,
  Flex,
  Heading,
  IconButton,
  Input,
  Text,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useAccount } from "wagmi";
import { useUserData } from "../components/context/UserDataProvider";
import { ChevronRightIcon } from "@chakra-ui/icons";
import axios from "axios";
import AccessCode from "../components/ui/access-code/AccessCode";
import Swiper, { Autoplay, Navigation } from "swiper";
import "swiper/swiper.min.css";
Swiper.use([Autoplay, Navigation]);
export default function Account() {
  const { address } = useAccount();
  const { user } = useUserData();
  const [username, setUsername] = React.useState("");
  const [usernameAdded, setUsernameAdded] = React.useState(false);
  const toast = useToast();

  const [isValidInput, setIsValidInput] = React.useState(false);
  const balance = user?.user?.balance;
  const [accessCodes, setAccessCodes] = React.useState([]);
  const fetchAccessCodes = async () => {
    const data = await axios
      .get("/api/user/get-access-codes", {
        params: { address },
      })
      .then((res) => {
        console.log("Access Codes: ", res.data);
        setAccessCodes(res.data.accessCodes);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    fetchAccessCodes();
  }, []);

  useEffect(() => {
    const data = async () => {
      await fetch(`/api/user/validate-username?username=${username}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.message === "Username is valid") {
            setIsValidInput(true);
          } else {
            setIsValidInput(false);
          }
        });
    };
  }, []);

  useEffect(() => {
    const carousel = new Swiper(".carousel", {
      breakpoints: {
        320: {
          slidesPerView: 1,
        },
        640: {
          slidesPerView: 2,
        },
        1024: {
          slidesPerView: 3,
        },
      },
      grabCursor: true,
      loop: false,
      centeredSlides: false,
      initialSlide: 0,
      spaceBetween: 24,
      autoplay: {
        delay: 7000,
      },
      navigation: {
        nextEl: ".carousel-next",
        prevEl: ".carousel-prev",
      },
    });
  }, []);

  const submitUsername = async () => {
    await axios
      .post("/api/user/add-username", { username, address, balance })
      .then((res) => {
        toast({
          title: "Username added",
          description: "You have earned 100 XP",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        setUsernameAdded(true);
      })
      .catch((err) => {
        toast({
          title: "Error",
          description: "An error occurred",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
        console.error(err);
      });
  };

  return (
    <Box>
      <Flex gap={10}>
        <Box>
          <Heading>Account</Heading>
          <Text>{address}</Text>
        </Box>
        <Box>
          <Heading>{user?.user?.balance}</Heading>
          <Text>XP</Text>
        </Box>
      </Flex>

      <Divider my={4} />
      <Text>
        Joined on:{" "}
        {new Date(user?.user?.createdAt?.toString() as any).toDateString()}
      </Text>
      <Divider my={4} />
      <Box>
        {user?.user?.username ? (
          <Text>Username: {user?.username}</Text>
        ) : (
          <Box>
            <Flex justify={"space-between"}>
              <Heading size={"md"}>Select an username</Heading>
              <Box>
                <Text>Earn</Text>
                <Text>100 XP</Text>
              </Box>
            </Flex>
            <Flex>
              <Input
                mt={2}
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
              />
              <IconButton
                aria-label="Join"
                icon={<ChevronRightIcon />}
                rounded={0}
                isDisabled={!isValidInput}
                bg={"secondary.400"}
                _hover={{ opacity: 0.6 }}
                onClick={submitUsername}
              />
            </Flex>
            <Text mt={4}>{!isValidInput && "Username is invalid"}</Text>
          </Box>
        )}
      </Box>
      <div className="carousel swiper-container">
        <div className="swiper-wrapper">
          {accessCodes.map((code) => (
            <AccessCode code={code} />
          ))}
        </div>
      </div>
      {/* Arrows  */}
      <div className="flex mt-12 space-x-4 justify-end">
        <button className="carousel-prev relative z-20 w-14 h-14 rounded-none flex items-center justify-center group corneredButtonSecondary transition duration-150 ease-in-out">
          <span className="sr-only">Previous</span>
          <svg
            className="w-4 h-4 fill-slate-400 transition duration-150 ease-in-out"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M6.7 14.7l1.4-1.4L3.8 9H16V7H3.8l4.3-4.3-1.4-1.4L0 8z" />
          </svg>
        </button>
        <button className="carousel-next relative z-20 w-14 h-14 rounded-none flex items-center justify-center group corneredButtonSecondary transition duration-150 ease-in-out">
          <span className="sr-only">Next</span>
          <svg
            className="w-4 h-4 fill-slate-400 transition duration-150 ease-in-out"
            viewBox="0 0 16 16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M9.3 14.7l-1.4-1.4L12.2 9H0V7h12.2L7.9 2.7l1.4-1.4L16 8z" />
          </svg>
        </button>
      </div>
    </Box>
  );
}
