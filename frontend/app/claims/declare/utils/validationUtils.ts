import { DisasterInfo, PersonalInfo } from "@/types/claim";

export const isValidDate = (dateString: string, dateObj: Date): boolean => {
    // Check MM/DD/YYYY format
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(dateString)) {
        return false;
    }

    // Check if date object is valid
    if (isNaN(dateObj.getTime())) {
        return false;
    }

    // Check if date is not in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (dateObj > today) {
        return false;
    }

    return true;
};

type ValidationParams = {
    date: string;
    validate: (valid: boolean) => void;
    setDate: (date: Date | undefined) => void;
    setDateValue: (value: string) => void;
    setMonth: (date: Date) => void;
    setError: (error: string) => void;
    isStartDate: boolean;
    otherDate: Date | undefined;
};

export const validateAndSetDate = ({
    date,
    validate,
    setDate,
    setDateValue,
    setMonth,
    setError,
    isStartDate,
    otherDate,
}: ValidationParams): void => {
    setDateValue(date);
    setError("");
    validate(true);

    // End date is optional
    if (!isStartDate && !date.trim()) {
        setDate(undefined);
        validate(true);
        return;
    }

    // Validate format
    const regex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!regex.test(date)) {
        setError("Please use MM/DD/YYYY format");
        setDate(undefined);
        validate(false);
        return;
    }

    // Parse date
    const [monthStr, dayStr, yearStr] = date.split("/");
    const parsedDate = new Date(parseInt(yearStr), parseInt(monthStr) - 1, parseInt(dayStr));

    // Validate parsed date
    if (isNaN(parsedDate.getTime())) {
        setError("Invalid date");
        setDate(undefined);
        validate(false);
        return;
    }

    // Check if date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (parsedDate > today) {
        setError("Date cannot be in the future");
        setDate(undefined);
        validate(false);
        return;
    }

    // Validate date range
    if (otherDate) {
        if (isStartDate && parsedDate > otherDate) {
            setError("Start date cannot be after end date");
            setDate(undefined);
            validate(false);
            return;
        }

        if (!isStartDate && parsedDate < otherDate) {
            setError("End date cannot be before start date");
            setDate(undefined);
            validate(false);
            return;
        }
    }

    // Success
    setDate(parsedDate);
    setMonth(parsedDate);
};

export const validateBusinessInfo = (
    businessName: string,
    businessOwner: string,
    businessType: string,
    setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>
) => {
    const newErrors: { [key: string]: string } = {};

    if (!businessName.trim()) {
        newErrors.businessName = "Business name is required";
    }

    if (!businessOwner.trim()) {
        newErrors.businessOwner = "Business owner is required";
    }

    if (!businessType) {
        newErrors.businessType = "Business type is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

export const validateDisasterInfo = (
    disasterInfo: DisasterInfo,
    setErrors: React.Dispatch<React.SetStateAction<Partial<Record<keyof DisasterInfo, string>>>>
) => {
    const newErrors: Partial<Record<keyof DisasterInfo, string>> = {};

    if (!disasterInfo.location) {
        newErrors.location = "Location is required";
    }

    if (disasterInfo.isFema && !disasterInfo.femaDisasterId) {
        newErrors.femaDisasterId = "FEMA disaster ID is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};

export const validatePersonalInfo = (
    { firstName, lastName, phone, email }: PersonalInfo,
    setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>
) => {
    const newErrors: { [key: string]: string } = {};

    if (!firstName.trim()) {
        newErrors.firstName = "First name is required";
    }

    if (!lastName.trim()) {
        newErrors.lastName = "Last name is required";
    }

    if (!email.trim()) {
        newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        newErrors.email = "Please enter a valid email";
    }

    // Phone is optional, but validate format if provided
    if (phone && !/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(phone)) {
        newErrors.phone = "Please enter a valid phone number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
};
