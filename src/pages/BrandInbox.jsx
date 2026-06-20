import React from "react";
import Chat from "./Chat";

export default function BrandInbox() {
  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-20px)] overflow-hidden">
      <Chat />
    </div>
  );
}
