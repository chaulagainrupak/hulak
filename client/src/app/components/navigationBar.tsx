"use client";

import { useState } from "react";

export default function NavigationBar() {
  const [hoverRotation, setHoverRotation] = useState(0);

  const getRandomRotation = () => Math.random() * 10 - 5;

  return (
    <div className="absolute w-[100%] flex justify-between p-2 px-6">
      <div
        className="cursor-pointer transition-transform duration-200"
        onMouseEnter={() => setHoverRotation(getRandomRotation())}
        onMouseLeave={() => setHoverRotation(0)}
        style={{ transform: `rotate(${hoverRotation}deg)` }}
      >
        <a className="font-bold text-3xl" href="/">
          हुलाक
        </a>
      </div>

      <div className="flex flex-col">
        <div className="flex">
          <a href="https://ko-fi.com/R5R21CWC4P" target="_blank">
            <img
              className="h-[36px]"
              src="https://storage.ko-fi.com/cdn/kofi5.png?v=6"
              alt="Buy Me a Coffee at ko-fi.com"
            />
          </a>

          <a
            href="https://github.com/chaulagainrupak"
            target="_blank"
            className="mx-2"
          >
            <img
              className="w-[36px] rounded-2xl"
              src="https://avatars.githubusercontent.com/u/86196413?v=2"
              alt="Profile Picture"
            />
          </a>
        </div>

        <div className="text-gray-400 italic text-xs">
          <a href="https://chaulagainrupak.com.np">Developer: Rupak Chaulagain</a>
        </div>
      </div>
    </div>
  );
}
