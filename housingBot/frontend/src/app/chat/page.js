"use client"; 

import { Suspense } from "react";
import ChatComponent from "@/app/chat/ChatComponent"; 

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading chat....</div>}>
      <ChatComponent />
    </Suspense>
  );
}