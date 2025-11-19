import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FiDownload } from "react-icons/fi";
import { HiOutlineTrash } from "react-icons/hi2";
import { SlPencil } from "react-icons/sl";
import { IoIosArrowRoundUp } from "react-icons/io";
import { IoIosArrowRoundDown } from "react-icons/io";
import { Spinner } from "@/components/ui/spinner";
import CategorySelector from "@/components/table/CategorySelector";
import { BusinessDocument } from "@/types/documents";

export type DocumentTableProps = {
    documents: BusinessDocument[];
    onDownload: (documentId: string) => void;
    onEdit: (documentId: string) => void;
    onDelete: (document: BusinessDocument) => void;
    onCategoryChange: (documentId: string, category: string) => void;
    dateSort: "asc" | "desc";
    setDateSort: (sort: "asc" | "desc") => void;
    initialPending: boolean;
};

export default function DocumentTable({
    documents,
    onDownload,
    onEdit,
    onDelete,
    onCategoryChange,
    dateSort,
    setDateSort,
    initialPending,
}: DocumentTableProps) {
    const categories = [
        "Expenses",
        "Revenues",
        "Insurance"
    ]
    const categoryColors: Record<string, string> = {
        "Expenses": "bg-[var(--light-fuchsia)] text-[var(--fuchsia)]",
        "Revenues": "bg-[var(--light-teal)] text-[var(--teal)]",
        "Insurance": "bg-[var(--gold)] text-[var(--deep-gold)]",
    };

    const handleDateSort = () => {
        if (dateSort === "asc") {
            setDateSort("desc");
        } else {
            setDateSort("asc");
        }
    };

    return (
        <div>
            <Table>
                <TableHeader>
                    <TableHead className="text-[14px]">Title</TableHead>
                    <TableHead className="text-[14px]">File Type</TableHead>
                    <TableHead className="text-[14px]">Category</TableHead>
                    <TableHead className="text-[14px]">
                        <div className="flex items-center hover:text-slate-700" onClick={handleDateSort}>
                            {dateSort === "asc" ? (
                                <IoIosArrowRoundUp style={{ width: "18px", height: "18px" }} />
                            ) : (
                                <IoIosArrowRoundDown style={{ width: "18px", height: "18px" }} />
                            )}
                            Date
                        </div>
                    </TableHead>
                    <TableHead className="text-[14px]"></TableHead>
                </TableHeader>
                <TableBody>
                    {documents.length !== 0 &&
                        documents.map((doc, index) => (
                            <TableRow key={index}>
                                <TableCell className="border-y text-[12px]">{doc.title}</TableCell>
                                <TableCell className="border-y text-[12px]">{doc.fileType}</TableCell>
                                <TableCell className="border-y text-[12px]">
                                    <CategorySelector
                                        selectedCategory={doc.category}
                                        onCategoryChange={(newCategory) => onCategoryChange(doc.documentId, newCategory)}
                                        categories={categories}
                                        categoryColors={categoryColors}
                                    />
                                </TableCell>
                                <TableCell className="border-y text-[12px]">{doc.date.toLocaleDateString()}</TableCell>
                                <TableCell className="border-y h-[53px]">
                                    <div className="flex justify-end gap-[6px]">
                                        <Button
                                            className="w-[35px] h-[35px] flex items-center justify-center rounded-100 bg-[var(--slate)]"
                                            onClick={() => onDownload}
                                        >
                                            <FiDownload className="text-[14px]" style={{ width: "14px" }} />
                                        </Button>
                                        <Button
                                            className="w-[35px] h-[35px] flex items-center justify-center rounded-100 bg-[var(--slate)]"
                                            onClick={() => onEdit}
                                        >
                                            <SlPencil className="text-[14px]" style={{ width: "14px" }} />
                                        </Button>
                                        <Button
                                            className="w-[35px] h-[35px] flex items-center justify-center rounded-100 bg-[var(--slate)]"
                                            onClick={() => onDelete(doc)}
                                        >
                                            <HiOutlineTrash className="text-[14px]" style={{ width: "14px" }} />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
                <TableFooter>
                    {documents.length === 0 && !initialPending && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-[20px] text-[14px] bg-white">
                                No documents to show
                            </TableCell>
                        </TableRow>
                    )}
                    {documents.length === 0 && initialPending && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-[20px] text-[14px] bg-white">
                                <div className="flex justify-center">
                                    <Spinner />
                                </div>
                            </TableCell>
                        </TableRow>
                    )}
                </TableFooter>
            </Table>
        </div>
    );
}
