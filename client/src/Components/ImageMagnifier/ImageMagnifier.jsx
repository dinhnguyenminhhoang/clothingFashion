import React, { useState } from "react";

const ImageMagnifier = ({
  src,
  width,
  height,
  magnifierHeight = 150,
  magnifierWidth = 150,
  zoomLevel = 2.5,
  alt = "",
}) => {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [xy, setXY] = useState([0, 0]);
  const [imgSize, setImgSize] = useState([0, 0]);
  const [showMask, setShowMask] = useState(false);

  return (
    <div
      className="relative inline-block w-full h-full overflow-hidden rounded-2xl bg-gray-100"
      style={{
        height: height,
        width: width,
      }}
    >
      <img
        src={src}
        className="w-full h-full object-contain" // Changed to object-contain to fix whitespace issue if aspect ratio differs
        onMouseEnter={(e) => {
          // update image size and turn-on magnifier
          const elem = e.currentTarget;
          const { width, height } = elem.getBoundingClientRect();
          setImgSize([width, height]);
          setShowMagnifier(true);
        }}
        onMouseMove={(e) => {
          // update cursor position
          const elem = e.currentTarget;
          const { top, left } = elem.getBoundingClientRect();

          // calculate cursor position on the image
          const x = e.pageX - left - window.pageXOffset;
          const y = e.pageY - top - window.pageYOffset;
          setXY([x, y]);
        }}
        onMouseLeave={() => {
          // close magnifier
          setShowMagnifier(false);
        }}
        alt={alt}
      />

      <div
        style={{
          display: showMagnifier ? "" : "none",
          position: "absolute",

          // prevent magnifier blocks the mousemove event of img
          pointerEvents: "none",
          // set size of magnifier
          height: `${magnifierHeight}px`,
          width: `${magnifierWidth}px`,
          // move element center to cursor pos
          top: `${xy[1] - magnifierHeight / 2}px`,
          left: `${xy[0] - magnifierWidth / 2}px`,
          opacity: "1", // reduce opacity so you can verify position
          border: "1px solid lightgray",
          backgroundColor: "white",
          backgroundImage: `url('${src}')`,
          backgroundRepeat: "no-repeat",

          //calculate zoomed image size
          backgroundSize: `${imgSize[0] * zoomLevel}px ${
            imgSize[1] * zoomLevel
          }px`,

          //calculate position of zoomed image.
          backgroundPositionX: `${-xy[0] * zoomLevel + magnifierWidth / 2}px`,
          backgroundPositionY: `${-xy[1] * zoomLevel + magnifierHeight / 2}px`,
          borderRadius: "50%", // Circle shape
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
          zIndex: 100,
        }}
      ></div>
    </div>
  );
};

export default ImageMagnifier;
