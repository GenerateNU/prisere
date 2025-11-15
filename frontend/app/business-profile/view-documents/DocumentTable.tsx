import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function DocumentTable() {
    const documents = [
        {
            title: "Business License",
            fileType: "PDF",
            category: "License",
            date: "2024-01-15",
        },
    ]

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableHead>Title</TableHead>
                    <TableHead>File Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Date</TableHead>
                </TableHeader>
                <TableBody>
                    {documents.map((doc, index) => (
                        <TableRow key={index}>
                            <TableCell>{doc.title}</TableCell>
                            <TableCell>{doc.fileType}</TableCell>
                            <TableCell>{doc.category}</TableCell>
                            <TableCell>{doc.date}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>

                </TableFooter>
            </Table>
        </div>
    );
}