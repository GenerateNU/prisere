import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { createSupabaseClient } from "@/utils/supabase/server";
const API_URL = process.env.NEXT_PUBLIC_LOCAL_API_BASE_URL;

type CashFlows = Purchase | Invoice;

export default function ExpenseTable() {
    const [purchases, setPurchases] = useState<Purchase[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchPurchases() {
            // Your API call here
            const response = await fetch('http://localhost:3001/purchase?companyId=...');
            const data = await response.json();
            setPurchases(data.purchases);
            setLoading(false);
        }

        fetchPurchases();
    }, []);

    return (
        <BasicTable />
    );
}

function BasicTable() {
    return (
        <Table>
            <TableCaption>A list of your recent cash-flows.</TableCaption>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-[100px]">Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Disaster?</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow>
                    <TableCell className="font-medium">INV001</TableCell>
                    <TableCell>Paid</TableCell>
                    <TableCell>Credit Card</TableCell>
                    <TableCell>$250.00</TableCell>
                </TableRow>
            </TableBody>
        </Table>
    );
}

