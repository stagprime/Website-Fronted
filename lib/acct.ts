import { T } from "./loc";
export const acctKeys = ["Saved.", "Network error — please use WhatsApp or email.", "Sending…", "Attach files (optional)", "Submit requirements", "Message", "Write a message to our team…", "Attach a file", "Send", "Accept delivery", "Request a revision", "What should we change?", "Full name", "Language", "Save", "Email verified — you can log in now.", "Password updated — you can log in now.", "New password", "Set new password", "Verify my email", "Login"];
export const acctT = () => Object.fromEntries(acctKeys.map(k => [k, T(k)]));
export const STEPS = ["pending", "in_progress", "delivered", "revision", "completed"] as const;
export const stepLabel: Record<string, string> = { pending: "Pending", in_progress: "In progress", delivered: "Delivered", revision: "Revision", completed: "Completed", cancelled: "Cancelled", refunded: "Refunded" };
