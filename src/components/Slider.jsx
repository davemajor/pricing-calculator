import { useState, useEffect, useRef } from "preact/hooks";
import { h, Fragment } from "preact";

export default function Slider(props) {
  const [position, setPosition] = useState(0);
  const rangeRef = useRef(null);
  const containerRef = useRef(null);

  // Update position when value changes or on window resize
  useEffect(() => {
    updatePosition();
    window.addEventListener("resize", updatePosition);

    // Run after a small delay to ensure all styles are applied
    const timer = setTimeout(updatePosition, 50);

    return () => {
      window.removeEventListener("resize", updatePosition);
      clearTimeout(timer);
    };
  }, [props.value]);

  // Calculate and set the position of the custom thumb
  const updatePosition = () => {
    if (!rangeRef.current) return;

    const rangeInput = rangeRef.current;
    const min = parseInt(rangeInput.min);
    const max = parseInt(rangeInput.max);
    const percent = (props.value - min) / (max - min);

    // Get the width and calculate position accounting for thumb width
    const rangeWidth = rangeInput.offsetWidth;
    const thumbWidth = 40; // Width of thumb in pixels

    // Calculate the precise position for the thumb
    const calculatedPosition =
      percent * (rangeWidth - thumbWidth) + thumbWidth / 2;
    setPosition(calculatedPosition);
  };

  return (
    <div ref={containerRef} className="relative w-4/5 max-w-4xl py-10">
      {/* Full track - this is the gray background track */}
      <div className="absolute w-full h-2 bg-gray-200 rounded-full top-12" />

      {/* Colored track - this is the blue filled portion */}
      <div
        className="absolute h-2 bg-count-blue rounded-full pointer-events-none"
        style={{
          width: `${position}px`,
          top: "48px",
          left: "0",
        }}
      />

      {/* Invisible range input for functionality */}
      <input
        {...props}
        ref={rangeRef}
        type="range"
        onInput={props.onChange}
        onChange={props.onChange}
        className="w-full h-2 absolute opacity-0 cursor-pointer top-12 z-10"
      />

      {/* Custom numbered handle */}
      <div
        className="absolute w-10 h-10 flex items-center justify-center bg-count-purple-150 text-count-blue border-1 border-count-blue rounded-full text-mono font-bold pointer-events-none shadow-md"
        style={{
          left: `${position}px`,
          top: "32px",
          transform: "translateX(-50%)",
          zIndex: 20,
        }}
      >
        {props.value}
      </div>
    </div>
  );
}
