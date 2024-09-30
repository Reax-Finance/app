import { Box, Image } from "@chakra-ui/react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const ImageSlider = ({ slides }: { slides: any }) => {
  return (
    <Carousel
      infiniteLoop
      autoPlay
      width="100%"
      dynamicHeight={false}
      showThumbs={false}
      swipeable
    >
      {slides.map((slide: any) => (
        <Box
          key={slide.id}
          width="100%"
          overflow="hidden"
          position="relative"
          aspectRatio={{ base: 16 / 9, md: 16 / 9, lg: 16 / 9 }}
        >
          <Image
            src={slide.image}
            alt={`Slide ${slide.id}`}
            objectFit="cover"
            width="100%"
            height="100%"
          />
        </Box>
      ))}
    </Carousel>
  );
};

export default ImageSlider;
