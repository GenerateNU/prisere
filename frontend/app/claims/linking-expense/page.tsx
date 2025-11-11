import ExpenseTable from "../../expense-tracker/expense-table";

export default async function ExpenseLinker() {
    return <ExpenseTable title={"Select Relevant Transactions"} rowOption={'checkbox'} editableTags={false}/>;
}