import { IQuickbooksClient } from "../../external/quickbooks/client";
import { spyOn } from "bun:test";

export function mockQuerySuccessReturn<T>(client: IQuickbooksClient, data: T) {
    spyOn(client, "query").mockResolvedValueOnce({
        _id: "valid",
        data: {
            QueryResponse: data,
            time: "",
        },
    });
}
