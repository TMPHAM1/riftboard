import LegalDocument from "@/components/ui/LegalDocument";
import { TERMS_OF_USE } from "@/constants/legal";

export default function TermsOfUseScreen() {
  return <LegalDocument content={TERMS_OF_USE} />;
}
