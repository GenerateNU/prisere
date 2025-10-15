"use client"
import Progress from "@/components/progress"
import Company from "./company"
import Insurance from "./insurance"
import UserInfoPage from "./user"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface OnboardingProps{
    email:string
}

export default function Onboarding({email}: OnboardingProps){
    const [progress, setProgress] = useState(0);

    const components = [
        <UserInfoPage email={email} progress={progress} setProgress={setProgress}/>,
        <Company progress={progress} setProgress={setProgress}/>,
        <Insurance/>
    ]
    
    const onboardingList = [
        "Profile",
        "Business",
        "Insurance"
    ]

    return (
        <div className = "flex flex-col items-center w-full">
            <div className = "absolute top-15">
                <Progress items={onboardingList} progress={progress}/>
            </div>
            <div className="max-w-lg w-full space-y-8 mt-50 mb-50">
                {components[progress]}
            </div>

        </div>
    )

}