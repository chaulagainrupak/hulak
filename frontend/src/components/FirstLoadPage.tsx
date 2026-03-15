import { useState, useEffect } from "react";
import { LetterOutline } from "./AirMailBorder";
// @ts-ignore
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";

export default function FirstLoadPage() {
  const [isFirstLoad, setIsFirstLoad] = useState<boolean | null>(null);

  // Check localStorage
  useEffect(() => {
    const visited = localStorage.getItem("isFirstLoad");
    setIsFirstLoad(!visited);
  }, []);

  // Disable scrolling when overlay is visible
  useEffect(() => {
    if (isFirstLoad) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [isFirstLoad]);

  // Wait until localStorage is checked
  if (isFirstLoad === null) return null;

  // If not first load → render nothing
  if (!isFirstLoad) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-[var(--wheat)] px-4 sm:px-6 md:px-8 z-[200]">
      <LetterOutline paperClassName="shadow-sm">
        <div className="text-center w-full max-w-2xl text-[var(--onyx)] p-6">

          <div className="title-area mb-6 grid grid-cols-[1fr_auto_1fr] items-start">
            <div />

            <div className="flex flex-col items-center text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl font-semibold mb-3 underline">
                हुलाक
              </div>

              <div className="text-gray-400 italic text-sm sm:text-base md:text-lg">
                /hu-laak/ Post Office
              </div>
            </div>

            <img
              src="/Stamp.png"
              alt="Stamp"
              className="h-34 justify-self-end"
            />
          </div>

          <div className="description-area text-left text-gray-800 space-y-4 mb-6 px-2 sm:px-4 md:px-5 text-sm sm:text-base md:text-lg">
            <p>
              हुलाक is a simple app for sending thoughtful messages, like a
              digital letter / postcard. Write something meaningful and send it
              to someone special.
            </p>

            <p>
              No feeds. No noise. Just one message delivered with intention;
              the way good old letters used to be.
            </p>

            <p>
              Whether it’s a confession, surprise, or reminder, हुलाक turns
              messages into moments worth opening.
            </p>
          </div>

          <button
            onClick={() => {
              localStorage.setItem("isFirstLoad", "true");
              setIsFirstLoad(false);
            }}
            className="shadow-lg flex items-center gap-2 mx-auto px-4 py-2 sm:px-6 sm:py-3 bg-[var(--blue-energy)] text-white rounded-lg font-semibold text-sm sm:text-base hover:scale-105 hover:rotate-2 cursor-pointer transition"
          >
            Try Sending Something
            <FontAwesomeIcon icon={faPaperPlane} className="w-4 h-4" />
          </button>

        </div>
      </LetterOutline>
    </div>
  );
}