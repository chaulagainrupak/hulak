import FirstLoadPage from "./components/firstload";
import LetterWriter from "./components/letterWriter";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex min-h-screen w-full">
        <FirstLoadPage />
        <div className="mx-6 mt-[82px]">
          <LetterWriter />
        </div>
      </main>
    </div>
  );
}
