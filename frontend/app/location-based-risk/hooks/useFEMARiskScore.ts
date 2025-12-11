import { useState, useEffect, useMemo } from "react";
import { getFemaRiskIndexData, refreshFemaRiskIndexData } from "@/api/fema-risk-index";
import { FemaRisKIndexCountiesFemaDisaster } from "@/types/fema-risk-index";
import { isServerActionSuccess } from "@/api/types";

export function useFEMARiskScore() {
    const [data, setData] = useState<FemaRisKIndexCountiesFemaDisaster>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let retries = 0;
        const fetchRiskData = async () => {
            setLoading(true);
            const result = await getFemaRiskIndexData();
            if (isServerActionSuccess(result)) {
                setData(result.data);
                if (result.data.length === 0 && retries < 5) {
                    await refreshFemaRiskIndexData();
                    retries++;
                    fetchRiskData();
                }
            } else {
                console.error(result.error);
            }
            setLoading(false);
        };
        fetchRiskData();
    }, []);

    const countyLookup = useMemo(() => {
        return data
            ? new Map<string, FemaRisKIndexCountiesFemaDisaster[number]>(
                  data.map((element) => [element.countyFipsCode, element])
              )
            : null;
    }, [data]);

    const lastUpdated = new Date(data?.[0]?.updatedAt);
    lastUpdated.setHours(lastUpdated.getHours() - 5);

    return { data, loading, countyLookup, lastUpdated };
}
