import { useState, useEffect, useMemo } from "react";
import { getFemaRiskIndexData } from "@/api/fema-risk-index";
import { FemaRisKIndexCountiesFemaDisaster } from "@/types/fema-risk-index";

export function useFEMARiskScore() {
    const [data, setData] = useState<FemaRisKIndexCountiesFemaDisaster>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRiskData = async () => {
            setLoading(true);
            const res = await getFemaRiskIndexData();
            setData(res);
            setLoading(false);
            console.log(res[0].updatedAt);
        };
        fetchRiskData();
    }, []);

    const countyLookup = useMemo(() => {
        return new Map<string, FemaRisKIndexCountiesFemaDisaster[number]>(
            data.map((element) => [element.countyFipsCode, element])
        );
    }, [data]);

    const lastUpdated = new Date(data?.[0]?.updatedAt);
    lastUpdated.setHours(lastUpdated.getHours() - 5);

    return { data, loading, countyLookup, lastUpdated };
}
