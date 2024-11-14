import { MessageSquareCode, Wrench } from "lucide-react";


export function DevelopmentComponent() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <Wrench className="w-32 h-32 text-gray-500 mb-4" />
      {/* <MessageSquareCode /> */}
      <p className="text-lg font-semibold text-gray-700">En Desarrollo</p>
    </div>
  );
}
