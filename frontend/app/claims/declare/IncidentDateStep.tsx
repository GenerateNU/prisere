'use client';

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

type Props = {
    incidentDate: Date | null,
    setIncidentDate: (date: Date) => void,
    incidentEndDate: Date | null,
    setIncidentEndDate: (date: Date) => void,
    handleStepForward: () => void
    handleStepBack: () => void
}

function formatDate(date: Date | undefined) {
    if (!date) {
        return ""
    }
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = date.getFullYear()
    return `${month}/${day}/${year}`
}

export default function IncidentDateStep({ incidentDate, setIncidentDate, incidentEndDate, setIncidentEndDate, handleStepForward, handleStepBack }: Props) {
    // Start date states
    const [openStart, setOpenStart] = React.useState(false)
    const [startDate, setStartDate] = React.useState<Date | undefined>(incidentDate ?? undefined)
    const [startMonth, setStartMonth] = React.useState<Date>(incidentDate ?? new Date())
    const [startValue, setStartValue] = React.useState(formatDate(incidentDate ?? undefined))
    const [startError, setStartError] = React.useState<string>("")

    const [openEnd, setOpenEnd] = React.useState(false)
    const [endDate, setEndDate] = React.useState<Date | undefined>(incidentEndDate ?? undefined)
    const [endMonth, setEndMonth] = React.useState<Date>(incidentEndDate ?? new Date())
    const [endValue, setEndValue] = React.useState(formatDate(incidentEndDate ?? undefined))
    const [endError, setEndError] = React.useState<string>("")

    const isValidDate = (dateString: string, dateObj: Date) => {
        // date is MM/DD/YYYY format
        const regex = /^\d{2}\/\d{2}\/\d{4}$/
        if (!regex.test(dateString)) {
            return false
        }

        // date object is valid
        if (isNaN(dateObj.getTime())) {
            return false
        }

        // date is not in the future
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        if (dateObj > today) {
            return false
        }

        return true
    }

    const validateAndSetStartDate = (inputValue: string) => {
        setStartValue(inputValue);
        setStartError("");

        if (!inputValue.trim()) {
            setStartError("Start date is required");
            setStartDate(undefined);
            return;
        }

        // Check format
        const regex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!regex.test(inputValue)) {
            setStartError("Please use MM/DD/YYYY format");
            setStartDate(undefined);
            return;
        }

        // Parse and validate date
        const [monthStr, dayStr, yearStr] = inputValue.split('/');
        const parsedDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));

        if (isNaN(parsedDate.getTime())) {
            setStartError("Invalid date");
            setStartDate(undefined);
            return;
        }

        // Check if date is in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (parsedDate > today) {
            setStartError("Date cannot be in the future");
            setStartDate(undefined);
            return;
        }

        // Check if start date is after end date
        if (endDate && parsedDate > endDate) {
            setStartError("Start date cannot be after end date");
            setStartDate(undefined);
            return;
        }

        // Valid date
        setStartDate(parsedDate);
        setStartMonth(parsedDate);
    };

    const validateAndSetEndDate = (inputValue: string) => {
        setEndValue(inputValue);
        setEndError("");

    // End date is optional
        if (!inputValue.trim()) {
            setEndDate(undefined);
            return;
        }

        // Check format
        const regex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!regex.test(inputValue)) {
            setEndError("Please use MM/DD/YYYY format");
            setEndDate(undefined);
            return;
        }

        // Parse and validate date
        const [monthStr, dayStr, yearStr] = inputValue.split('/');
        const parsedDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));

        if (isNaN(parsedDate.getTime())) {
            setEndError("Invalid date");
            setEndDate(undefined);
            return;
        }

        // Check if date is in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (parsedDate > today) {
            setEndError("Date cannot be in the future");
            setEndDate(undefined);
            return;
        }

        // Check if end date is before start date
        if (startDate && parsedDate < startDate) {
            setEndError("End date cannot be before start date");
            setEndDate(undefined);
            return;
        }

        // Valid date
        setEndDate(parsedDate);
        setEndMonth(parsedDate);
    };

    const handleProceed = () => {
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
            <div className="w-full max-w-md">
                <h3 className="text-4xl font-bold mb-8">When did the disaster occur?</h3>

                {/* Start Date */}
                <div className="flex flex-col gap-3 mb-6">
                    <Label htmlFor="start-date" className="px-1 text-[16px]">
                        Incident Start Date<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative flex gap-1">
                        <Input
                            id="start-date"
                            value={startValue}
                            placeholder="MM/DD/YYYY"
                            className={`bg-background rounded-[11px] h-[52px] ${startError ? 'border-red-500' : ''}`}
                            onChange={(e) => validateAndSetStartDate(e.target.value)}
                            onBlur={(e) => {
                                if (e.target.value) {
                                    validateAndSetStartDate(e.target.value);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "ArrowDown") {
                                    e.preventDefault()
                                    setOpenStart(true)
                                }
                                if (e.key === "Enter") {
                                    e.preventDefault()
                                    handleProceed()
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
                                            setStartDate(selectedDate)
                                            setStartValue(formatDate(selectedDate))
                                            setStartError("")
                                            setOpenStart(false)
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
                    {startError && (
                        <p className="text-red-500 text-sm px-1">{startError}</p>
                    )}
                </div>

                {/* End Date */}
                <div className="flex flex-col gap-3">
                    <Label htmlFor="end-date" className="px-1 text-[16px]">
                        Incident End Date
                    </Label>
                    <div className="relative flex gap-1">
                        <Input
                            id="end-date"
                            value={endValue}
                            placeholder="MM/DD/YYYY"
                            className={`bg-background rounded-[11px] h-[52px] ${endError ? 'border-red-500' : ''}`}
                            onChange={(e) => validateAndSetEndDate(e.target.value)}
                            onBlur={(e) => {
                                if (e.target.value) {
                                    validateAndSetEndDate(e.target.value);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "ArrowDown") {
                                    e.preventDefault()
                                    setOpenEnd(true)
                                }
                                if (e.key === "Enter") {
                                    e.preventDefault()
                                    handleProceed()
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
                                            setEndDate(selectedDate)
                                            setEndValue(formatDate(selectedDate))
                                            setEndError("")
                                            setOpenEnd(false)
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
                    {endError && (
                        <p className="text-red-500 text-sm px-1">{endError}</p>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center gap-[20px]">
                <Button
                    onClick={handleProceed}
                    className="px-[20px] py-[12px] w-[170px] h-[42px] text-[14px] rounded-50"
                    size="lg"
                >
                    Next
                </Button>
                <Button
                    onClick={handleStepBack}
                    variant="link"
                    className="text-base underline text-[19px] h-fit p-0"
                >
                    Previous
                </Button>
            </div>
        </div >
    );
}