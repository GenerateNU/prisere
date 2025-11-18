import { paths } from "../schema";

export type UserPreferences = paths["/preferences"]["get"]["responses"]["200"]["content"]["application/json"];
export type UpdateUserNotificationPreferencesDTO = NonNullable<
    paths["/preferences"]["put"]["requestBody"]
>["content"]["application/json"];
