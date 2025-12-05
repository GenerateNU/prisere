import { Card, CardAction, CardContent, CardHeader } from "@/components/ui/card";
import { PropsWithChildren } from "react";

export function ProfileSettingsCard({
    title,
    subtitle,
    action,
    children,
}: PropsWithChildren<{ title: string; subtitle: string; action?: React.ReactNode }>) {
    return (
        <Card className="gap-2.5 shadow-none">
            <CardHeader>
                <h2 className="text-xl font-bold">{title}</h2>
                {action ? <CardAction>{action}</CardAction> : null}

                <h3>{subtitle}</h3>
            </CardHeader>

            <CardContent>{children}</CardContent>
        </Card>
    );
}
