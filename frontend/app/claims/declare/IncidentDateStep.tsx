"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { isValidDate, validateAndSetDate } from "./utils/validationUtils";

type Props = {
    incidentDate: Date | null;
    setIncidentDate: (date: Date) => void;
    incidentEndDate: Date | null;
    setIncidentEndDate: (date: Date) => void;
    handleStepForward: () => void;
    handleStepBack: () => void;
};

function formatDate(date: Date | undefined) {
    if (!date) {
        return "";
    }
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}

export default function IncidentDateStep({
    incidentDate,
    setIncidentDate,
    incidentEndDate,
    setIncidentEndDate,
    handleStepForward,
    handleStepBack,
}: Props) {
    // Start date states
    const [openStart, setOpenStart] = React.useState(false);
    const [startDate, setStartDate] = React.useState<Date | undefined>(incidentDate ?? undefined);
    const [startMonth, setStartMonth] = React.useState<Date>(incidentDate ?? new Date());
    const [startValue, setStartValue] = React.useState(formatDate(incidentDate ?? undefined));
    const [startError, setStartError] = React.useState<string>("");
    const [startValid, setStartValid] = React.useState<boolean>(true);

    const [openEnd, setOpenEnd] = React.useState(false);
    const [endDate, setEndDate] = React.useState<Date | undefined>(incidentEndDate ?? undefined);
    const [endMonth, setEndMonth] = React.useState<Date>(incidentEndDate ?? new Date());
    const [endValue, setEndValue] = React.useState(formatDate(incidentEndDate ?? undefined));
    const [endError, setEndError] = React.useState<string>("");
    const [endValid, setEndValid] = React.useState<boolean>(true);

    const validateAndSetStartDate = (date: string) =>
        validateAndSetDate({
            date,
            validate: setStartValid,
            setDate: setStartDate,
            setDateValue: setStartValue,
            setMonth: setStartMonth,
            setError: setStartError,
            isStartDate: true,
            otherDate: endDate,
        });

    const validateAndSetEndDate = (date: string) =>
        validateAndSetDate({
            date,
            validate: setEndValid,
            setDate: setEndDate,
            setDateValue: setEndValue,
            setMonth: setEndMonth,
            setError: setEndError,
            isStartDate: false,
            otherDate: startDate,
        });

    const handleProceed = () => {
        if (!endValid || !startValid) {
            return;
        }
        // Final validation before proceeding
        if (!startDate) {
            setStartError("Please select a valid start date");
            return;
        }

        if (!isValidDate(startValue, startDate)) {
            setStartError("Please enter a valid date");
            return;
        }

        // Validate end date if provided
        if (endValue && endDate && !isValidDate(endValue, endDate)) {
            setEndError("Please enter a valid date");
            return;
        }

        setIncidentDate(startDate);
        if (endDate) {
            setIncidentEndDate(endDate);
        }
        handleStepForward();
    };

    return (
        <div className="flex flex-col items-center justify-center h-full gap-8 self-center">
            <div className="w-full max-w-md flex flex-col gap-8">
                <div className="flex flex-col gap-5">
                    <h3 className="text-4xl font-bold">When did the disaster occur?</h3>
                    <p>If you are currently still collecting expenses for this disaster, leave the end date blank.</p>
                </div>

                {/* Start Date */}
                <div className="flex flex-col gap-3">
                    <Label htmlFor="start-date" className="px-1 text-[16px]">
                        Start Date<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative flex gap-1">
                        <Input
                            id="start-date"
                            value={startValue}
                            placeholder="MM/DD/YYYY"
                            className={`bg-background rounded-[11px] h-[52px] ${startError ? "border-red-500" : ""}`}
                            onChange={(e) => validateAndSetStartDate(e.target.value)}
                            onBlur={(e) => {
                                if (e.target.value) {
                                    validateAndSetStartDate(e.target.value);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "ArrowDown") {
                                    e.preventDefault();
                                    setOpenStart(true);
                                }
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleProceed();
                                }
                            }}
                        />
                        <Popover open={openStart} onOpenChange={setOpenStart}>
                            <PopoverTrigger asChild>
                                <Button
                                    id="start-date-picker"
                                    variant="ghost"
                                    className="absolute top-1/2 right-2 size-8 -translate-y-1/2"
                                >
                                    <CalendarIcon className="size-4" />
                                    <span className="sr-only">Select start date</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto overflow-hidden p-0"
                                align="end"
                                alignOffset={-8}
                                sideOffset={10}
                            >
                                <Calendar
                                    mode="single"
                                    required={true}
                                    selected={startDate}
                                    captionLayout="dropdown"
                                    month={startMonth}
                                    onMonthChange={setStartMonth}
                                    onSelect={(selectedDate: Date | undefined) => {
                                        if (selectedDate) {
                                            setStartDate(selectedDate);
                                            setStartValue(formatDate(selectedDate));
                                            setStartError("");
                                            setOpenStart(false);
                                        }
                                    }}
                                    disabled={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        // Disable future dates and dates after end date
                                        if (date > today) return true;
                                        if (endDate && date > endDate) return true;
                                        return false;
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    {startError && <p className="text-red-500 text-sm px-1">{startError}</p>}
                </div>

                {/* End Date */}
                <div className="flex flex-col gap-3">
                    <Label htmlFor="end-date" className="px-1 text-[16px]">
                        End Date
                    </Label>
                    <div className="relative flex gap-1">
                        <Input
                            id="end-date"
                            value={endValue}
                            placeholder="MM/DD/YYYY"
                            className={`bg-background rounded-[11px] h-[52px] ${endError ? "border-red-500" : ""}`}
                            onChange={(e) => validateAndSetEndDate(e.target.value)}
                            onBlur={(e) => {
                                if (e.target.value) {
                                    validateAndSetEndDate(e.target.value);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "ArrowDown") {
                                    e.preventDefault();
                                    setOpenEnd(true);
                                }
                                if (e.key === "Enter") {
                                    e.preventDefault();
                                    handleProceed();
                                }
                            }}
                        />
                        <Popover open={openEnd} onOpenChange={setOpenEnd}>
                            <PopoverTrigger asChild>
                                <Button
                                    id="end-date-picker"
                                    variant="ghost"
                                    className="absolute top-1/2 right-2 size-8 -translate-y-1/2"
                                >
                                    <CalendarIcon className="size-4" />
                                    <span className="sr-only">Select end date</span>
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent
                                className="w-auto overflow-hidden p-0"
                                align="end"
                                alignOffset={-8}
                                sideOffset={10}
                            >
                                <Calendar
                                    mode="single"
                                    required={false}
                                    selected={endDate}
                                    captionLayout="dropdown"
                                    month={endMonth}
                                    onMonthChange={setEndMonth}
                                    onSelect={(selectedDate: Date | undefined) => {
                                        if (selectedDate) {
                                            setEndDate(selectedDate);
                                            setEndValue(formatDate(selectedDate));
                                            setEndError("");
                                            setOpenEnd(false);
                                        }
                                    }}
                                    disabled={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        // Disable future dates and dates before start date
                                        if (date > today) return true;
                                        if (startDate && date < startDate) return true;
                                        return false;
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    {endError && <p className="text-red-500 text-sm px-1">{endError}</p>}
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 w-full">
                <Button onClick={handleStepBack} className="text-sm bg-light-fuchsia text-fuchsia w-[70px] hover:bg-fuchsia hover:text-white" size="lg">
                    Back
                </Button>
                <Button
                    onClick={handleProceed}
                    className="bg-fuchsia text-white hover:bg-pink hover:text-fuchsia px-[20px] py-[12px] w-[170px] h-[42px] text-[14px] rounded-50"
                    size="lg"
                >
                    Proceed to filing report
                </Button>
            </div>
        </div>
    );
}
