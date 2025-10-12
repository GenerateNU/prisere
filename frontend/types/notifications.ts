import type { paths } from "../schema";

export type GetNotificationsParams = 
  paths["/disasterNotification/{id}"]["get"]["parameters"];

export type GetNotificationsResponse = 
  paths["/disasterNotification/{id}"]["get"]["responses"]["200"]["content"]["application/json"];
