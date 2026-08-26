import privacyMarkdown from "@/assets/privacy.md?raw";
import { parseLegalMarkdown } from "@/lib/legal-markdown";
import { LegalPage } from "@/pages/LegalPage";

const privacy = parseLegalMarkdown(privacyMarkdown);

export default function Privacy() {
  return <LegalPage {...privacy} />;
}
