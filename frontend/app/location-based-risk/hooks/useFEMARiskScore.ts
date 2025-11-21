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
        };
        fetchRiskData();
    }, []);

    const countyLookup = useMemo(() => {
        return new Map<string, FemaRisKIndexCountiesFemaDisaster[number]>(
            data.map((element) => [element.countyFipsCode, element])
        );
    }, [data]);

    return { data, loading, countyLookup };
}
