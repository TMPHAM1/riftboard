import LegalDocument from "@/components/ui/LegalDocument";
import { PRIVACY_POLICY } from "@/constants/legal";

export default function PrivacyPolicyScreen() {
  return <LegalDocument content={PRIVACY_POLICY} />;
}
