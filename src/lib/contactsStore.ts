"use client";

import {
  addEmergencyContact as addSupabaseContact,
  fetchEmergencyContacts as fetchSupabaseContacts,
  removeEmergencyContact as removeSupabaseContact,
  getActiveUserId,
  isSupabaseConfigured,
} from "@/lib/supabase";

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

function getUserStorageKey(userId = getActiveUserId()) {
  return `${STORAGE_KEY}_${userId}`;
}

export function getEmergencyContacts(userId = getActiveUserId()): EmergencyContactItem[] {
  const isDemo = userId === "demo-user" || userId === "abhi@zivan.health";
  if (!canUseStorage()) return isDemo ? DEFAULT_CONTACTS : [];
  try {
    const raw = localStorage.getItem(getUserStorageKey(userId));
    if (raw) {
      return JSON.parse(raw) as EmergencyContactItem[];
    }
    const legacyRaw = localStorage.getItem(STORAGE_KEY);
    if (legacyRaw && isDemo) {
      const parsed = JSON.parse(legacyRaw) as EmergencyContactItem[];
      return parsed.length > 0 ? parsed : DEFAULT_CONTACTS;
    }
    return isDemo ? DEFAULT_CONTACTS : [];
  } catch {
    return isDemo ? DEFAULT_CONTACTS : [];
  }
}

export function saveEmergencyContacts(contacts: EmergencyContactItem[], userId = getActiveUserId()): void {
  if (!canUseStorage()) return;
  localStorage.setItem(getUserStorageKey(userId), JSON.stringify(contacts));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  window.dispatchEvent(new CustomEvent("zivan-contacts-updated", { detail: contacts }));
}

export function addEmergencyContact(
  contact: Omit<EmergencyContactItem, "id">,
  userId = getActiveUserId()
): EmergencyContactItem {
  const newContact: EmergencyContactItem = {
    ...contact,
    id: `contact_${Date.now()}`,
  };
  const current = getEmergencyContacts(userId);
  const updated = [newContact, ...current];
  saveEmergencyContacts(updated, userId);

  // Sync to Supabase in real-time for active user
  if (isSupabaseConfigured) {
    addSupabaseContact({
      patient_id: userId,
      name: contact.name,
      phone: contact.phone,
      relationship: contact.relationship,
      priority: contact.priority,
    }).then((created) => {
      if (created && created.id) {
        const local = getEmergencyContacts(userId).map((c) =>
          c.id === newContact.id ? { ...c, id: created.id! } : c
        );
        saveEmergencyContacts(local, userId);
      }
    });
  }

  return newContact;
}

export function removeEmergencyContact(id: string, userId = getActiveUserId()): void {
  const current = getEmergencyContacts(userId);
  const updated = current.filter((c) => c.id !== id);
  saveEmergencyContacts(updated, userId);

  // Sync delete to Supabase
  if (isSupabaseConfigured) {
    removeSupabaseContact(id);
  }
}

export function subscribeEmergencyContacts(
  listener: (contacts: EmergencyContactItem[]) => void,
  userId = getActiveUserId()
) {
  // Sync from Supabase on subscription for active user
  if (isSupabaseConfigured) {
    fetchSupabaseContacts(userId).then((remote) => {
      if (remote && remote.length > 0) {
        const mapped: EmergencyContactItem[] = remote.map((c) => ({
          id: c.id || `contact_${Date.now()}`,
          name: c.name,
          phone: c.phone,
          relationship: c.relationship,
          priority: c.priority,
        }));
        saveEmergencyContacts(mapped, userId);
        listener(mapped);
      }
    });
  }

  if (!canUseStorage()) return () => undefined;
  const emit = () => listener(getEmergencyContacts(userId));
  const onStorage = (event: StorageEvent) => {
    if (event.key === getUserStorageKey(userId) || event.key === STORAGE_KEY) emit();
  };
  const onCustom = () => emit();

  window.addEventListener("storage", onStorage);
  window.addEventListener("zivan-contacts-updated", onCustom);
  window.addEventListener("zivan-auth-user-updated", onCustom);
  emit();

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("zivan-contacts-updated", onCustom);
    window.removeEventListener("zivan-auth-user-updated", onCustom);
  };
}
