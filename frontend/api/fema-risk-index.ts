import { FemaRisKIndexCountiesFemaDisaster } from "@/types/fema-risk-index";
import { authHeader, clientAuthWrapper, getClient } from "./client";

export const getFemaRiskIndexData = async (): Promise<FemaRisKIndexCountiesFemaDisaster> => {
    const req = async (token: string): Promise<FemaRisKIndexCountiesFemaDisaster> => {
        const client = getClient();
        const { data, error, response } = await client.GET("/fema-risk-index", {
            headers: authHeader(token),
        });
        if (response.ok) {
            return data!;
        } else {
            throw Error(error?.error);
        }
    };
    return clientAuthWrapper<FemaRisKIndexCountiesFemaDisaster>()(req);
};

export const refreshFemaRiskIndexData = async (): Promise<void> => {
    const req = async (token: string): Promise<void> => {
        const client = getClient();
        const { error, response } = await client.POST("/fema-risk-index", {
            headers: authHeader(token),
        });
        if (!response.ok) {
            throw Error(error?.error);
        }
    };
    return clientAuthWrapper<void>()(req);
};
