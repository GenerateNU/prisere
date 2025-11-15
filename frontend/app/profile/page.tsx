import { LinkedAccountsSettings } from "./linked-accounts";
import { NotificationSettings } from "./notifications";
import { PersonalInfoSettings } from "./personal-info";

export default function SettingsPage() {
    return (
        <div className="flex flex-col gap-6 bg-slate p-12 min-h-screen">
            <h1 className="font-bold text-3xl">Settings</h1>

            <PersonalInfoSettings />

            <LinkedAccountsSettings />

            <NotificationSettings />
        </div>
    );
}
