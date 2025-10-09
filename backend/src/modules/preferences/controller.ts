import { Context, TypedResponse } from "hono";
import { ControllerResponse } from "../../utilities/response";
import { IPreferenceService } from "./service";
import {
    GetUserNotificationPreferencesRequestParams,
    GetUserNotificationPreferencesResponse,
    UpdateUesrNotificationPreferencesDTOSchema,
    UpdateUserNotificationPreferencesRequestParams,
    UpdateUserNotificationPreferencesResponse,
    UserMissingErrorResponse,
} from "../../types/Preferences";
import { withControllerErrorHandling } from "../../utilities/error";

export interface IPreferencesController {
    getUserPreferences(
        ctx: Context
    ): ControllerResponse<
        TypedResponse<GetUserNotificationPreferencesResponse, 200> | TypedResponse<UserMissingErrorResponse, 404>
    >;
    updateUserPreferences(
        ctx: Context
    ): ControllerResponse<
        TypedResponse<UpdateUserNotificationPreferencesResponse, 201> | TypedResponse<UserMissingErrorResponse, 404>
    >;
}

export class PreferencesController implements IPreferencesController {
    constructor(private preferenceService: IPreferenceService) {}

    getUserPreferences = withControllerErrorHandling(async (ctx: Context) => {
        const { id: userId } = GetUserNotificationPreferencesRequestParams.parse(ctx.req.param());

        const preferences = await this.preferenceService.getUserPreferences(userId);

        if (!preferences) {
            return ctx.json({ error: "Unknown user" }, 404);
        }

        return ctx.json(
            {
                emailEnabled: preferences.emailEnabled,
                webNotificationsEnabled: preferences.webNotificationsEnabled,
                notificationFrequency: preferences.notificationFrequency,
            },
            200
        );
    });

    updateUserPreferences = withControllerErrorHandling(async (ctx: Context) => {
        const { id: userId } = UpdateUserNotificationPreferencesRequestParams.parse(ctx.req.param());
        const preferences = UpdateUesrNotificationPreferencesDTOSchema.parse(await ctx.req.json());

        const result = await this.preferenceService.updateUserPreferences({ userId, preferences });

        if (!result) {
            return ctx.json({ error: "Unknown user" }, 404);
        }

        return ctx.json(
            {
                emailEnabled: result.emailEnabled,
                webNotificationsEnabled: result.webNotificationsEnabled,
                notificationFrequency: result.notificationFrequency,
            },
            201
        );
    });
}
