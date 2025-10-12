import type { paths } from "../schema";

// Now you can extract types like this:
export type Purchase = paths["/purchase/{id}"]["get"]["responses"]["200"]["content"]["application/json"];