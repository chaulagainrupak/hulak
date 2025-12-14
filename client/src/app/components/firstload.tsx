"use client";

import { useState, useEffect } from "react";
import { LetterOutline } from "./airmailBorder";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-regular-svg-icons";

export default function FirstLoadPage() {
  const [isFirstLoad, setIsFirstLoad] = useState<boolean | null>(null);

  useEffect(() => {
    const localState = localStorage.getItem("isFirstLoad");

    if (!localState) {
      setIsFirstLoad(true);
    } else {
      setIsFirstLoad(false);
    }
  }, []);

  if (!isFirstLoad) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent px-4 sm:px-6 md:px-8">
      <LetterOutline>
        <div className="text-center w-full max-w-2xl text-[var(--onyx)]">
          <div className="title-area mb-6">
            <div className="text-4xl sm:text-5xl md:text-6xl font-semibold mb-3 underline">
              हुलाक
            </div>
            <div className="text-gray-400 italic text-sm sm:text-base md:text-lg">
              /hu-laak/ Post Office
            </div>
          </div>

          <div className="description-area text-left text-gray-800 space-y-4 mb-6 px-2 sm:px-4 md:px-5 text-sm sm:text-base md:text-lg">
            <p>
              हुलाक is a simple app for sending thoughtful messages, like a
              digital letter / postcard. Write something meaningful, send it to
              someone special, and let them unlock it when the moment feels
              right.
            </p>
            <p>
              No feeds. No noise. Just one message, delivered with intention -
              the way good old letters used to be.
            </p>
            <p>
              Whether it’s a confession, a surprise, or a small reminder, हुलाक
              turns messages into moments worth opening.
            </p>
          </div>

          <button
            onClick={() => {
              setIsFirstLoad(false);
              localStorage.setItem("isFirstLoad", "true");
            }}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-[var(--blue-energy)] text-white rounded-lg font-semibold text-sm sm:text-base hover:scale-104 hover:rotate-2 cursor-pointer transition "
          >
            Try Sending Something <FontAwesomeIcon icon={faPaperPlane} />
          </button>
        </div>
      </LetterOutline>
    </div>
  );
}
