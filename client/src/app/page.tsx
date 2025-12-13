import FirstLoadPage from "./components/firstload";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <main className="flex min-h-screen w-full ">
        <FirstLoadPage></FirstLoadPage>
      </main>
    </div>
  );
}
