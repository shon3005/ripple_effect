import { Suspense } from "react";

import Message from "../components/Message";
import NetworkGraph from "@/components/NetworkGraph";
import InputForm from "@/components/InputForm";

import CompletionContextProvider from "@/contexts/completion-context";

export default async function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <CompletionContextProvider>
          <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
            <InputForm />
            <Suspense>
              <Message />
            </Suspense>
            <Suspense>
              <NetworkGraph />
            </Suspense>
          </ol>
        </CompletionContextProvider>
      </main>
    </div>
  );
}
