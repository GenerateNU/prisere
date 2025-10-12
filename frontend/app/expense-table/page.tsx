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


const fetchCompanyId = async () => {
    const supabase = await createSupabaseClient();
    const supabaseResponse = await supabase.auth.getUser();
    const user = await supabaseResponse.data.user;
    if (user == null) {
        throw Error("Could not fetch user info.")
    }

    const backEndResponse = await fetch(`${API_URL}/users/${user.id}/company`)
    const companyId = await backEndResponse.json();
    return companyId;
}


const fetchPurchaseAndInvoiceData = async (companyId: string) => {
    const purchaseResponse = await fetch(`${API_URL}/purchase?companyId=${companyId}`);
    const purchases = await purchaseResponse.json();

    const invoiceResponse = await fetch(`${API_URL}/invoice?companyId=${companyId}`);
    const invoices = await invoiceResponse.json();

    const result = [...purchases, ...invoices];
    return result;
}