// Single source of truth for the in-app legal screens. The hostable markdown in
// docs/legal/ mirrors this content for publishing at riftboard.net/privacy & /terms.

export const RIOT_DISCLAIMER =
  "Riftboard was created under Riot Games' “Legal Jibber Jabber” policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.";

export const DATA_SOURCE_NOTE =
  "Card data and images are provided by RiftCodex (api.riftcodex.com), which sources its data from the Riot Games API. Riftboard is pursuing official Riot Games API access; until it is approved, RiftCodex is used as the interim data source.";

export const SUPPORT_EMAIL = "tienmpham.dev@gmail.com";
export const EFFECTIVE_DATE = "June 30, 2026";

export interface LegalSection {
  heading: string;
  paragraphs: string[];
}

export interface LegalContent {
  title: string;
  effectiveDate: string;
  sections: LegalSection[];
}

export const PRIVACY_POLICY: LegalContent = {
  title: "Privacy Policy",
  effectiveDate: EFFECTIVE_DATE,
  sections: [
    {
      heading: "Overview",
      paragraphs: [
        "Riftboard is a free, fan-made companion app for Riot Games' Riftbound trading card game. This policy explains what data the app handles. In short: we do not collect personal information, and your decks stay on your device.",
      ],
    },
    {
      heading: "Information We Collect",
      paragraphs: [
        "None. Riftboard has no user accounts, no advertising, no analytics, no crash reporting, and no tracking of any kind. We do not collect names, email addresses, device identifiers, or location.",
      ],
    },
    {
      heading: "Data Stored on Your Device",
      paragraphs: [
        "Decks and sideboard plans you create are stored locally on your device only. This data is never uploaded to us or anyone else. Removing the app, or using “Clear local data” in Settings, permanently deletes it.",
      ],
    },
    {
      heading: "Network Requests",
      paragraphs: [
        DATA_SOURCE_NOTE,
        "When you import a deck or search for cards, the card names and search terms you enter are sent to RiftCodex over a secure (HTTPS) connection to look up card details. No personal information is included in these requests.",
      ],
    },
    {
      heading: "Data Sharing",
      paragraphs: [
        "We do not sell, rent, or share any data. We have no data to share, because we do not collect any.",
      ],
    },
    {
      heading: "Children's Privacy",
      paragraphs: [
        "Riftboard does not knowingly collect personal information from anyone, including children under 13.",
      ],
    },
    {
      heading: "Changes to This Policy",
      paragraphs: [
        "We may update this policy as the app evolves. Material changes will be reflected here with a new effective date.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [`Questions? Reach us at ${SUPPORT_EMAIL}.`],
    },
  ],
};

export const TERMS_OF_USE: LegalContent = {
  title: "Terms of Use",
  effectiveDate: EFFECTIVE_DATE,
  sections: [
    {
      heading: "Fan Project Disclaimer",
      paragraphs: [RIOT_DISCLAIMER],
    },
    {
      heading: "Acceptance",
      paragraphs: [
        "By using Riftboard you agree to these terms. If you do not agree, please do not use the app.",
      ],
    },
    {
      heading: "License & Acceptable Use",
      paragraphs: [
        "Riftboard is provided free of charge for personal, non-commercial use — building decks and planning sideboards for the Riftbound trading card game. You agree not to misuse the app or use it to violate any applicable law or Riot Games' terms.",
      ],
    },
    {
      heading: "Intellectual Property",
      paragraphs: [
        "Riftbound and all related names, logos, cards, and imagery are the property of Riot Games, Inc. Riftboard claims no ownership of Riot Games intellectual property.",
        DATA_SOURCE_NOTE,
      ],
    },
    {
      heading: "No Warranty",
      paragraphs: [
        "Riftboard is provided “as is,” without warranties of any kind. Card data comes from a third-party source and may be incomplete or inaccurate. We do not guarantee the app will be error-free or uninterrupted.",
      ],
    },
    {
      heading: "Limitation of Liability",
      paragraphs: [
        "To the fullest extent permitted by law, Riftboard and its maintainers are not liable for any damages arising from your use of the app.",
      ],
    },
    {
      heading: "Changes to These Terms",
      paragraphs: [
        "We may update these terms as the app evolves. Continued use after changes means you accept the updated terms.",
      ],
    },
    {
      heading: "Contact",
      paragraphs: [`Questions? Reach us at ${SUPPORT_EMAIL}.`],
    },
  ],
};
