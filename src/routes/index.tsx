import { createFileRoute } from "@tanstack/react-router";
import { MakerMap } from "@/components/maker-map";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <MakerMap />;
}
