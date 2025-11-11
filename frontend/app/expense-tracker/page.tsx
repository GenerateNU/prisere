import ExpenseTable from "./expense-table";

export default async function ExpenseTracker() {
    return <ExpenseTable title={"Business Transactions"} rowOption={'collapsible'} editableTags={true}/>;
}
