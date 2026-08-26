import termsMarkdown from "@/assets/terms.md?raw";
import { parseLegalMarkdown } from "@/lib/legal-markdown";
import { LegalPage } from "@/pages/LegalPage";

const terms = parseLegalMarkdown(termsMarkdown);

export default function Terms() {
  return <LegalPage {...terms} />;
}
