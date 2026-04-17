export const API_URL = import.meta.env.PUBLIC_API_URL as string;
export const TURNSTILE_SITE_KEY = import.meta.env
  .PUBLIC_TURNSTILE_SITE_KEY as string;
export const SHARE_BASE_URL = import.meta.env.PUBLIC_SHARE_BASE_URL as string;

export const OCCASIONS = [
  "Just because",
  "Love letter",
  "Confession",
  "Surprise",
  "Miss you",
  "Thank you",
  "Happy birthday",
  "Congratulations",
  "Apology",
  "Good luck",
] as const;


export type EnvelopeData = {
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverEmail: string;
  occasion: string;
  customOccasionLabel: string;
  customSlug: string;
  notifyReceiver: boolean;
  joinMailingList: boolean;
  stampId: number | null;
};

export const defaultEnvelope = (): EnvelopeData => ({
  senderName: "",
  senderEmail: "",
  receiverName: "",
  receiverEmail: "",
  occasion: "Just because",
  customOccasionLabel: "",
  customSlug: "",
  notifyReceiver: true,
  joinMailingList: true,
  stampId: null,
});

export const inputCls = `
w-full
bg-[#fafafa]
border border-black/15
rounded-md
px-2.5 py-1.5
text-xs

placeholder:text-gray-400
text-gray-700

focus:outline-none
focus:ring-2
focus:ring-[var(--blue-energy)]/25
focus:border-[var(--blue-energy)]/40

transition
`;
