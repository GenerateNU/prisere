'use client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import NavBarCircle from '@/icons/NavBarCircle';
import { GetCompanyLocationsResponse } from '@/types/company';
import React from 'react';

type DisasterInfo = {
    name: string,
    dateOfIncident: Date, // date
    location: string, // from business locations (location id?)
    description: string,
}

type Props = {
    disasterInfo: DisasterInfo,
    setInfo: React.Dispatch<React.SetStateAction<DisasterInfo>>,
    handleStepForward: () => void,
    handleStepBack: () => void,
    locations: GetCompanyLocationsResponse | undefined,
}

export default function DisasterInfoStep({ disasterInfo, setInfo, handleStepForward, handleStepBack, locations }: Props) {
    const names = ["Claim type 1", "Claim type 2", "Claim type 3"];

    const [name, setName] = React.useState(disasterInfo.name);
    const [locationId, setLocationId] = React.useState(disasterInfo.location);
    const [description, setDescription] = React.useState(disasterInfo.description);
    const [errors, setErrors] = React.useState<{ [key: string]: string }>({});

    const validateForm = () => {
        const newErrors: { [key: string]: string } = {};

        if (!name) {
            newErrors.name = "Name is required";
        }

        if (!locationId) {
            newErrors.location = "Location is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleProceed = () => {
        if (validateForm()) {
            setInfo({ ...disasterInfo, name: name, location: locationId, description: description });
            handleStepForward();
        }
    };

    return (
        <div className="flex flex-col gap-[40px]">
            <h3 className="text-[25px] font-bold">Disaster Specific Information</h3>
            <Card className="p-[25px] border-[1px]">
                <div className="flex flex-col gap-2">
                    <Label className="text-[16px]">
                        Type of claim being filed <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Input className={`h-[58px] rounded-[10px] text-[16px] ${errors.name ? 'border-red-500' : ''}`}
                        value={name}
                        placeholder="Enter a disaster name"
                        onChange={(e) => {
                            setName(e.target.value);
                            if (errors.name) setErrors({ ...errors, name: '' });
                        }} />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                <div className="flex flex-col gap-2">
                    <Label className="text-[16px]">
                        Location of incident <span className="text-red-500 ml-1">*</span>
                    </Label>
                    <Select
                        value={locationId}
                        onValueChange={(value) => {
                            setLocationId(value);
                            if (errors.location) setErrors({ ...errors, location: '' });
                        }}
                    >
                        <SelectTrigger className={`rounded-full px-[20px] py-[8px] w-[175px] ${errors.location ? 'border-red-500' : ''}`}>
                            <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent>
                            {locations?.map((l) =>
                                <SelectItem key={l.id} value={l.id} className="text-[16px]" >{l.streetAddress}</SelectItem>
                            )}
                        </SelectContent>
                    </Select>
                    {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                </div>
                <div className="flex flex-col gap-2">
                    <Label className="text-[16px]">Description of the incident</Label>
                    <Textarea className="min-h-64 text-[16px]" rows={5}
                        placeholder="Begin typing or "
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>
            </Card>
            <Card className="p-[25px] border-[1px]">
                <h4 className="text-[24px] font-bold">Select Relevant Transactions</h4>
                {/*<ExpenseTable />*/}
            </Card>
            <Card className="p-[25px] border-[1px] flex flex-col gap-[10px]">
                <h4 className="text-[24px] font-bold">Upload additional documents</h4>
                <div className="flex flex-col gap-[16px]">
                    <Button className='w-fit h-fit rounded-full py-[12px] px-[20px]'>
                        <Label>
                            <NavBarCircle size={24} />
                            <p>Upload from computer</p>
                        </Label>
                    </Button>
                    <Button className='w-fit h-fit rounded-full py-[12px] px-[20px]'>
                        <Label>
                            <NavBarCircle size={24} />
                            <p>Select from business profile</p>
                        </Label>
                    </Button>
                </div>
            </Card>
            <div className="flex justify-end gap-1">
                <Button className="px-[20px] py-[12px] w-fit h-fit rounded-50 text-[16px]"
                    onClick={handleStepBack}>
                    Back
                </Button>
                <Button
                    className="px-[20px] py-[12px] w-fit h-fit rounded-50 text-[16px] text-white bg-[#2e2f2d]"
                    onClick={handleProceed}
                >
                    Proceed to Business Information
                </Button>
            </div>
        </div>
    );
}