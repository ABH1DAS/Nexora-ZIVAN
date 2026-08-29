import { HospitalAuthProvider } from "@/lib/hospitalAuth";

export default function HospitalPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HospitalAuthProvider>{children}</HospitalAuthProvider>;
}
