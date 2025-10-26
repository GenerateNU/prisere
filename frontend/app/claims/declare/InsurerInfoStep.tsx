'use client';

import { Button } from "@/components/ui/button";
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
import { useState } from "react";

type insurerInfo = {
}

type Props = {
    insurerInfo: insurerInfo,
    setInfo: React.Dispatch<React.SetStateAction<insurerInfo>>,
    handleStepForward: () => void,
    handleStepBack: () => void,
}

export default function InsurerInfoStep({ insurerInfo, setInfo, handleStepForward, handleStepBack }: Props) {
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const handleNext = () => {
        setShowConfirmDialog(true);
    };

    const handleConfirm = () => {
        setShowConfirmDialog(false);
        handleStepForward();
    };

    return (
        <>
            <div className="flex flex-col gap-[40px] h-full">
                <div className="flex justify-end gap-[25px]">
                    <Button
                        className="flex-1/2 px-[20px] py-[12px] h-fit rounded-50 text-[16px]"
                        onClick={handleStepBack}
                    >
                        Back
                    </Button>
                    <Button
                        className="flex-1/2 px-[20px] py-[12px] h-fit rounded-50 text-[16px] text-white bg-[#2e2f2d]"
                        onClick={handleNext}
                    >
                        Proceed to Export Step
                    </Button>
                </div>
            </div>

            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-[24px]">Confirm and Save</AlertDialogTitle>
                        <AlertDialogDescription className="text-[18px]">
                            Moving to the next step will create a claim with the provided information. You will not be able to edit previous steps after confirming. Do you wish to proceed?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="w-1/2 h-10">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirm}
                            className="bg-[#2e2f2d] text-white w-1/2 h-10"
                        >
                            Confirm & Save
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}