"use client";

export interface EmergencyContactItem {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  priority: "Primary" | "Secondary";
}

const STORAGE_KEY = "zivan-emergency-contacts";

const DEFAULT_CONTACTS: EmergencyContactItem[] = [
  {
    id: "contact_1",
    name: "Dr. Ananya Sharma",
    phone: "+91 98765 43210",
    relationship: "Family Doctor",
    priority: "Primary",
  },
  {
    id: "contact_2",
    name: "Rajesh Kumar",
    phone: "+91 98123 45678",
    relationship: "Spouse",
    priority: "Primary",
  },
  {
    id: "contact_3",
    name: "Priya Roy",
    phone: "+91 97111 22334",
    relationship: "Sister",
    priority: "Secondary",
  },
];

function canUseStorage() {
  return typeof window !== "undefined";
}

export function getEmergencyContacts(): EmergencyContactItem[] {
  if (!canUseStorage()) return DEFAULT_CONTACTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONTACTS;
    const parsed = JSON.parse(raw) as EmergencyContactItem[];
    return parsed.length > 0 ? parsed : DEFAULT_CONTACTS;
  } catch {
    return DEFAULT_CONTACTS;
  }
}

export function saveEmergencyContacts(contacts: EmergencyContactItem[]): void {
  if (!canUseStorage()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  window.dispatchEvent(new CustomEvent("zivan-contacts-updated", { detail: contacts }));
}

export function addEmergencyContact(contact: Omit<EmergencyContactItem, "id">): EmergencyContactItem {
  const newContact: EmergencyContactItem = {
    ...contact,
    id: `contact_${Date.now()}`,
  };
  const current = getEmergencyContacts();
  const updated = [newContact, ...current];
  saveEmergencyContacts(updated);
  return newContact;
}

export function removeEmergencyContact(id: string): void {
  const current = getEmergencyContacts();
  const updated = current.filter((c) => c.id !== id);
  saveEmergencyContacts(updated);
}

export function subscribeEmergencyContacts(
  listener: (contacts: EmergencyContactItem[]) => void,
) {
  if (!canUseStorage()) return () => undefined;
  const emit = () => listener(getEmergencyContacts());
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) emit();
  };
  const onCustom = () => emit();

  window.addEventListener("storage", onStorage);
  window.addEventListener("zivan-contacts-updated", onCustom);
  emit();

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("zivan-contacts-updated", onCustom);
  };
}
