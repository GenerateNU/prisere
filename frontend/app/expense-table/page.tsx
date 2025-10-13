import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/dist/client/components/redirect";
import { getUserCompany } from "../../api/user";
import ExpenseTable from "./expense-table";

export default async function ExpenseTracker() {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }
    let companyId: string;
    try {
        const company = await getUserCompany(user.id);
        companyId = company.companyId;
    } catch (Error) {
        return <div>You have not added a company to your account.</div>
    }

    return <ExpenseTable companyId={companyId}></ExpenseTable>
}