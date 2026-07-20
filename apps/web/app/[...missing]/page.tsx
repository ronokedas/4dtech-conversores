import { permanentRedirect } from "next/navigation";

export default function MissingPage() {
  permanentRedirect("/");
}
