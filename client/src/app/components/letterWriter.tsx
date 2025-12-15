import { LetterOutline } from "./airmailBorder";

export default function LetterWriter() {
  return (
    <div>
      <div className="">
        <LetterOutline>
          <div className="w-[50vw] h-[80vh] max-sm:hidden"></div>

          <div className="hidden max-sm:inline-flex">
            Writing Letters is only availabe on large screens. <br/>Try resizing the browser window or opening the webiste on a desktop. 
          </div>

        </LetterOutline>
      </div>
    </div>
  );
}
