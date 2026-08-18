import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";
import EditProfileForm from "@/components/EditProfileForm";

export default async function ProfilePage() {
  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="mb-1 text-2xl font-black uppercase tracking-tight text-slate-100">👤 Your Profile</h1>
      <p className="mb-6 text-sm text-slate-500">
        Update how your name and team show up around the league.
      </p>
      <EditProfileForm profile={profile} />
    </div>
  );
}
