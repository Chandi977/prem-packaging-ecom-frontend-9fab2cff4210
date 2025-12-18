import { useRef } from "react";
import Slider from "react-slick";
import { testimonial } from "../../assets/data";
import styles from "./feedback.module.scss";

const Feedback = () => {
  const sliderRef = useRef();
  var settings = {
    dots: false,
    infinite: true,
    arrows: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    padding: 26,
    centerMode: true,
    centerPadding: 0,
    autoplay: true, // Added for auto-scrolling
    autoplaySpeed: 2000, // Added for auto-scrolling speed (2 seconds)
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          dots: true,
          arrows: false,
        },
      },
      {
        breakpoint: 767,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: true,
          arrows: false,
        },
      },
    ],
  };
  return (
    <div className={styles.feedBack_main}>
      <div
        className={styles.arrowPrev}
        onClick={() => sliderRef.current.slickPrev()}
      >
        <img src="https://res.cloudinary.com/dwxqg9so3/image/upload/v1690811676/Arrow_-_Right_3_ssrdw2.svg"></img>
      </div>
      <div
        className={styles.arrowNext}
        onClick={() => sliderRef.current.slickNext()}
      >
        <img src="https://res.cloudinary.com/dwxqg9so3/image/upload/v1690811676/Arrow_-_Right_3_1_irtfa7.svg"></img>
      </div>
      <div className="yesssss" style={{ marginLeft: "15px" }}>
        <Slider {...settings} ref={sliderRef}>
          {testimonial?.map((tes, index) => {
            return (
              <div className={styles.card} key={index}>
                <div>
                  <div>
                    <p>{tes?.name}</p>
                    <p>{tes?.occupation}</p>
                  </div>
                </div>
                <p className={styles.sub_text}>{tes?.review}</p>
              </div>
            );
          })}
        </Slider>
      </div>
    </div>
  );
};

export default Feedback;
