import { Image } from "@chakra-ui/react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

// If you want to use your own Selectors look up the Advancaed Story book examples
const ImageSlider = ({ slides }: { slides: any }) => {
  return (
    <Carousel
      infiniteLoop
      autoPlay
      width={"100%"}
      dynamicHeight
      showThumbs={false}
      swipeable
    >
      {slides.map((slide: any) => {
        return (
          <Image
            src={slide.image}
            height="300px"
            width="100px"
            key={slide.id}
          />
        );
      })}
    </Carousel>
  );
};

export default ImageSlider;
