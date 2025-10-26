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

export default function IncidentDateStep({ incidentDate, setIncidentDate, handleStepForward, handleStepBack }: Props) {
    const [open, setOpen] = React.useState(false)
    const [date, setDate] = React.useState<Date | undefined>(incidentDate ?? undefined)
    const [month, setMonth] = React.useState<Date>(incidentDate ?? new Date())
    const [value, setValue] = React.useState(formatDate(incidentDate ?? undefined))
    const [error, setError] = React.useState<string>("")

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

    const validateAndSetDate = (inputValue: string) => {
        setValue(inputValue);
        setError("");

        // If field is empty
        if (!inputValue.trim()) {
            setError("Date is required");
            setDate(undefined);
            return;
        }

        // Check format
        const regex = /^\d{2}\/\d{2}\/\d{4}$/;
        if (!regex.test(inputValue)) {
            setError("Please use MM/DD/YYYY format");
            setDate(undefined);
            return;
        }

        // Parse and validate date
        const parsedDate = new Date(inputValue);

        if (isNaN(parsedDate.getTime())) {
            setError("Invalid date");
            setDate(undefined);
            return;
        }

        // Check if date is in the future
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (parsedDate > today) {
            setError("Date cannot be in the future");
            setDate(undefined);
            return;
        }

        // Valid date
        setDate(parsedDate);
        setMonth(parsedDate);
    };

    const handleProceed = () => {
        // Final validation before proceeding
        if (!date) {
            setError("Please select a valid date");
            return;
        }

        if (!isValidDate(value, date)) {
            setError("Please enter a valid date");
            return;
        }

        console.log(date.toISOString());
        setIncidentDate(date);
        handleStepForward();
    };

    return (
        <div className="flex flex-col items-center justify-center h-full gap-8 self-center">
            <div className="w-full max-w-md">
                <h3 className="text-4xl font-bold mb-8">When did the disaster occur?</h3>

                <div className="flex flex-col gap-3">
                    <Label htmlFor="date" className="px-1 text-[16px]">
                        Date of incident<span className="text-red-500 ml-1">*</span>
                    </Label>
                    <div className="relative flex gap-1">
                        <Input
                            id="date"
                            value={value}
                            placeholder="MM/DD/YYYY"
                            className={`bg-background rounded-[11px] h-[52px] ${error ? 'border-red-500' : ''}`}
                            onChange={(e) => validateAndSetDate(e.target.value)}
                            onBlur={(e) => {
                                // Validate on blur if there's a value
                                if (e.target.value) {
                                    validateAndSetDate(e.target.value);
                                }
                            }}
                            onKeyDown={(e) => {
                                if (e.key === "ArrowDown") {
                                    e.preventDefault()
                                    setOpen(true)
                                }
                                if (e.key === "Enter") {
                                    e.preventDefault()
                                    handleProceed()
                                }
                            }}
                        />
                        <Popover open={open} onOpenChange={setOpen}>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date-picker"
                                    variant="ghost"
                                    className="absolute top-1/2 right-2 size-8 -translate-y-1/2"
                                >
                                    <CalendarIcon className="size-4" />
                                    <span className="sr-only">Select date</span>
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
                                    selected={date}
                                    captionLayout="dropdown"
                                    month={month}
                                    onMonthChange={setMonth}
                                    onSelect={(selectedDate: Date | undefined) => {
                                        if (selectedDate) {
                                            setDate(selectedDate)
                                            setValue(formatDate(selectedDate))
                                            setError("")
                                            setOpen(false)
                                        }
                                    }}
                                    disabled={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        return date > today;
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    {error && (
                        <p className="text-red-500 text-sm px-1">{error}</p>
                    )}
                </div>
            </div>

            <div className="flex flex-col items-center gap-[20px]">
                <Button
                    onClick={handleProceed}
                    disabled={!date || !!error}
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