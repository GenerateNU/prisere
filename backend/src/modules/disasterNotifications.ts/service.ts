import { Context, TypedResponse } from "hono";
// import { ICompanyService } from "./service";
import { withControllerErrorHandling } from "../../utilities/error";
import {
    GetCompanyByIdAPIResponse,
    CreateCompanyAPIResponse,
    CreateCompanyDTOSchema,
    UpdateQuickBooksImportTimeDTOSchema,
} from "../../types/Company";
import { logMessageToFile } from "../../utilities/logger";
import { validate } from "uuid";

export interface IDisasterNotificationController {
    getUsersDisasterNotifications(ctx: Context): 
}