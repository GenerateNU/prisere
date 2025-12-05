import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FiDownload } from "react-icons/fi";
import { HiOutlineTrash } from "react-icons/hi2";
import { SlPencil } from "react-icons/sl";
import { IoIosArrowRoundUp } from "react-icons/io";
import { IoIosArrowRoundDown } from "react-icons/io";
import { Spinner } from "@/components/ui/spinner";
import CategorySelector from "@/components/table/CategorySelector";
import { BusinessDocument, DocumentCategories } from "@/types/documents";

export type DocumentTableProps = {
    documents: BusinessDocument[];
    onDownload: (url: string) => void;
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
    const categories = ["Expenses", "Revenues", "Insurance"];
    const categoryColors: Record<string, string> = {
        Expenses: "bg-[var(--light-fuchsia)] text-[var(--fuchsia)]",
        Revenues: "bg-[var(--light-teal)] text-[var(--teal)]",
        Insurance: "bg-[var(--gold)] text-[var(--deep-gold)]",
    };

    const handleDateSort = () => {
        if (dateSort === "asc") {
            setDateSort("desc");
        } else {
            setDateSort("asc");
        }
    };

    return (
        <div className="w-full">
            <Table className="w-full table-fixed text-sm">
                <TableHeader>
                    <TableRow>
                        <TableHead className="">Title</TableHead>
                        <TableHead className="">File Type</TableHead>
                        <TableHead className="">Category</TableHead>
                        <TableHead className="">
                            <div className="flex items-center hover:text-slate-700" onClick={handleDateSort}>
                                {dateSort === "asc" ? (
                                    <IoIosArrowRoundUp style={{ width: "18px", height: "18px" }} />
                                ) : (
                                    <IoIosArrowRoundDown style={{ width: "18px", height: "18px" }} />
                                )}
                                Date
                            </div>
                        </TableHead>
                        <TableHead className="w-[200px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {documents.length !== 0 &&
                        documents.map((doc, index) => (
                            <TableRow key={index}>
                                <TableCell className="truncate overflow-hidden whitespace-nowrap">
                                    {doc.title}
                                </TableCell>
                                <TableCell className="truncate overflow-hidden whitespace-nowrap">
                                    {doc.fileType}
                                </TableCell>
                                <TableCell className="truncate overflow-hidden whitespace-nowrap">
                                    <CategorySelector
                                        selectedCategory={(doc.category as DocumentCategories | null) ?? ""}
                                        onCategoryChange={(newCategory) =>
                                            onCategoryChange(doc.documentId, newCategory)
                                        }
                                        categories={categories}
                                        categoryColors={categoryColors}
                                    />
                                </TableCell>
                                <TableCell className="border-y">{doc.date.toLocaleDateString()}</TableCell>
                                <TableCell className="border-y h-[53px]">
                                    <div className="flex justify-end gap-[6px]">
                                        <Button
                                            className="group hover:bg-fuchsia hover:text-white w-[35px] h-[35px] flex items-center justify-center rounded-100 bg-slate"
                                            onClick={() => onDownload(doc.url)}
                                        >
                                            <FiDownload
                                                className="group-hover:bg-fuchsia group-hover:text-white"
                                                style={{ width: "14px" }}
                                            />
                                        </Button>
                                        <Button
                                            className="group hover:bg-fuchsia hover:text-white w-[35px] h-[35px] flex items-center justify-center rounded-100 bg-slate"
                                            onClick={() => onEdit(doc.documentId)}
                                        >
                                            <SlPencil
                                                className="text-[14px] group-hover:bg-fuchsia group-hover:text-white"
                                                style={{ width: "14px" }}
                                            />
                                        </Button>
                                        <Button
                                            className="group hover:bg-fuchsia hover:text-white w-[35px] h-[35px] flex items-center justify-center rounded-100 bg-slate"
                                            onClick={() => onDelete(doc)}
                                        >
                                            <HiOutlineTrash
                                                className="text-[14px] group-hover:bg-fuchsia group-hover:text-white"
                                                style={{ width: "14px" }}
                                            />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
                <TableFooter>
                    {documents.length === 0 && !initialPending && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-[20px] bg-white">
                                No documents to show
                            </TableCell>
                        </TableRow>
                    )}
                    {documents.length === 0 && initialPending && (
                        <TableRow>
                            <TableCell colSpan={5} className="text-center py-[20px] bg-white">
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
