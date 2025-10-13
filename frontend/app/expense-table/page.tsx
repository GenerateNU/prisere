import { getCurrentUser } from "@/actions/auth";
import { redirect } from "next/dist/client/components/redirect";
import { getUserCompany } from "../../api/user";
import ExpenseTable from "./expense-table";

export default async function ExpenseTracker() {
    /*
     const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    let companyId: string;
    const company = await getUserCompany("836b63ec-3c20-42a5-9c0d-a77ffaf72020");
    companyId = company.companyId;
    return <div>You have not added a company to your account.</div>
     */

    return <ExpenseTable companyId="f91a274e-cc9d-47e5-bd48-42ea3a7c202e"></ExpenseTable>
}