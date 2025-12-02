"use client";

import InsuranceCard from "@/app/business-profile/overview/InsuranceCard";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InsurerInfo } from "@/types/claim";
import { useState } from "react";

type Props = {
    insurerInfo: InsurerInfo;
    setInsurerInfo: (info: Partial<InsurerInfo>) => void;
    handleStepForward: (data: Partial<InsurerInfo>) => void;
    handleStepBack: () => void;
};

export default function InsurerInfoStep({ insurerInfo, setInsurerInfo, handleStepForward, handleStepBack }: Props) {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const handleNext = () => {
        setShowConfirmDialog(true);
    };

    const handleConfirm = () => {
        setShowConfirmDialog(false);
        handleStepForward(insurerInfo);
    };

    const handleInsuranceSelect = (insuranceId: string) => {
        if (insuranceId === insurerInfo.id) {
            setInsurerInfo({ id: undefined });
        } else {
            setInsurerInfo({ id: insuranceId });
        }
    };

    return (
        <div>
            <h3 className="text-[30px] font-bold mb-8">Insurance Information</h3>
            <Card className="border-none shadow-none p-[28px] mb-10">
                <h4 className="font-bold text-2xl">Choose which insurance applies</h4>
                <p className="text-sm">
                    We know that you might have different insurance coverage for different locations. Please select
                    which insurance applies to this specific claim report.
                </p>
                <InsuranceCard insuranceSelected={insurerInfo.id} onInsuranceSelect={handleInsuranceSelect} />
            </Card>
            <div className="flex items-center justify-end gap-3 w-full">
                <Button onClick={handleStepBack} className="text-sm bg-light-fuchsia text-fuchsia w-[70px]" size="lg">
                    Back
                </Button>
                <Button
                    size="lg"
                    onClick={handleNext}
                    className="bg-fuchsia text-white px-[20px] py-[12px] w-[230px] h-[42px] text-[14px] rounded-50"
                >
                    Proceed to Exporting
                </Button>
            </div>

            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-[24px]">Confirm and Save</AlertDialogTitle>
                        <AlertDialogDescription className="text-[18px]">
                            Moving to the next step will create a claim with the provided information. You will not be
                            able to edit previous steps after confirming. Do you wish to proceed?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="w-1/2 h-10">Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm} className="bg-fuchsia text-white w-1/2 h-10">
                            Confirm & Save
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

// function InsuranceCard({
//     data,
//     isSelected,
//     onClick,
// }: {
//     data: InsurancePolicy;
//     isSelected: boolean;
//     onClick: (policy: InsurancePolicy) => void;
// }) {
//     return (
//         <div
//             className={cn(
//                 "rounded-[10px] border border-gray px-7 py-5 flex flex-col gap-3 cursor-pointer hover:border-fuchsia transition-all duration-150",
//                 isSelected && "border-fuchsia"
//             )}
//             onClick={() => onClick(data)}
//         >
//             <div className="font-bold">
//                 {/* TODO: edit button */}
//                 {data.policyName}
//             </div>
//             <div className="w-full h-px bg-gray" />
//             <div className="grid grid-cols-2 gap-x-10 gap-y-5">
//                 <InfoBlock label="Insurance Company" value={data.insuranceCompanyName} />
//                 <InfoBlock label="Insurance Type" value={data.insuranceType} />
//                 <InfoBlock label="Insured Name" value={`${data.policyHolderFirstName} ${data.policyHolderLastName}`} />
//                 <InfoBlock label="Policy Number" value={data.policyNumber} />
//             </div>
//         </div>
//     );
// }

// function InfoBlock({ label, value }: { label: string; value: string }) {
//     return (
//         <div>
//             <div className="font-bold">{label}</div>
//             <div className="">{value}</div>
//         </div>
//     );
// }
