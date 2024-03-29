"use client";

import Chat from "@/app/components/Chat";
import Slider from "@/app/components/Slider";

export default function Home() {
  return (
    <div className="flex h-screen justify-center items-center">
      <div className="h-full w-full flex">
        <div className="w-sliderWidth hidden md:block">
          <Slider></Slider>
        </div>
        <div className="w-full">
          <Chat></Chat>
        </div>
      </div>
    </div>
  );
}
