
import { Suspense } from "react";
import ConversationsClient from "@/app/conversations/ConversationsClient";

export default function ConversationsPage() {
  return (
    <Suspense fallback={<div>Loading conversations...</div>}>
      <ConversationsClient />
    </Suspense>
  );
}