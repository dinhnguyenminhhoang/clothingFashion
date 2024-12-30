import React from "react";
import TextShapeLine from "../../svg/TextShapeLine";

const TitleResuable = ({ title, description }) => {
  return (
    <div className="text-center my-12">
      <span className="relative text-lg font-medium text-[#821F40] uppercase tracking-wide flex items-center justify-center">
        {title}
        <div className="absolute">
          <TextShapeLine />
        </div>
      </span>
      <h3 className="text-4xl font-semibold text-gray-800 mt-2">
        {description}
      </h3>
    </div>
  );
};

export default TitleResuable;
