import { Card } from "../../components/ui/card";
import { RiskPillFactory } from "../../components/dashboard/RiskPillFactory";

interface RiskIndexOverviewCardProps {
    riskAttributes:
        | {
              countyFipsCode: string;
              riskRating: string;
              ealRating: string;
              socialVuln: string;
              communityResilience: string;
              coastalFlooding: string;
              drought: string;
              wildFire: string;
          }
        | undefined;
    loading: boolean
}

export const RiskIndexOverviewCard = ({ riskAttributes, loading = false }: RiskIndexOverviewCardProps) => {
    return (
        <Card className={`${loading && "shadow-none border-none"}`}>
            <div className="flex flex-col gap-4 p-4 pt-0">
                <div className="flex flex-row justify-between">
                    <p className="font-bold">Risk Index Overview</p>
                </div>
                <div className="flex items-center flex-row justify-between">
                    <p>Expected Annual Loss</p>
                    <RiskPillFactory riskLevel={riskAttributes?.ealRating || "UNDEFINED"} />
                </div>
                <div className="flex items-center flex-row justify-between">
                    <p>Social Vulnerability</p>
                    <RiskPillFactory riskLevel={riskAttributes?.socialVuln || "UNDEFINED"} />
                </div>
                <div className="flex items-center flex-row justify-between">
                    <p>Community Resilience</p>
                    <RiskPillFactory riskLevel={riskAttributes?.communityResilience || "UNDEFINED"} />
                </div>
            </div>
        </Card>
    );
};

export const HazardIndexOverviewCard = ({ riskAttributes, loading=false }: RiskIndexOverviewCardProps) => {
    return (
        <Card  className={`${loading && "shadow-none border-none"}`}>
            <div className="flex flex-col gap-4 p-4 pt-0">
                <div className="flex flex-row justify-between">
                    <p className="font-bold">Hazard Risk Rating</p>
                </div>
                <div className="flex items-center flex-row justify-between">
                    <p>Coastal Flooding</p>
                    <RiskPillFactory riskLevel={riskAttributes?.coastalFlooding || "UNDEFINED"} />
                </div>

                <div className="flex items-center flex-row justify-between">
                    <p>Drought</p>
                    <RiskPillFactory riskLevel={riskAttributes?.drought || "UNDEFINED"} />
                </div>
                <div className="flex items-center flex-row justify-between">
                    <p>Wildfire</p>
                    <RiskPillFactory riskLevel={riskAttributes?.wildFire || "UNDEFINED"} />
                </div>
            </div>
        </Card>
    );
};
