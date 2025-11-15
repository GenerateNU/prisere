import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FiDownload } from "react-icons/fi";
import { HiOutlineTrash } from "react-icons/hi2";
import { SlPencil } from "react-icons/sl";
import { IoIosArrowRoundUp } from "react-icons/io";
import { IoIosArrowRoundDown } from "react-icons/io";
import { Spinner } from "@/components/ui/spinner";

export type BusinessDocument = {
    title: string;
    fileType: string;
    category: string;
    date: Date;
};

export type DocumentTableProps = {
    documents: BusinessDocument[];
    onDownload: (documentId: string) => void;
    onEdit: (documentId: string) => void;
    onDelete: (documentId: string) => void;
    dateSort: "asc" | "desc";
    setDateSort: (sort: "asc" | "desc") => void;
    initialPending: boolean;
};

export default function DocumentTable({
    documents,
    onDownload,
    onEdit,
    onDelete,
    dateSort,
    setDateSort,
    initialPending,
}: DocumentTableProps) {
    const renderCategory = (category: string) => {
        let color = "";
        switch (category) {
            case "Expenses":
                color = "bg-[var(--light-fuchsia)] text-[var(--fuchsia)]";
                break;
            case "Revenues":
                color = "bg-[var(--light-teal)] text-[var(--teal)]";
                break;
            case "Insurance":
                color = "bg-[var(--gold)] text-[var(--deep-gold)]";
                break;
            default:
                color = "";
        }
        return (
            <div
                className={
                    color +
                    " flex items-center justify-center rounded-[4px] w-[66px] h-[24px] text-[12px] px-[8px] py-[4px] font-bold"
                }
            >
                {category}
            </div>
        );
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
                                <TableCell className="border-y text-[12px]">{renderCategory(doc.category)}</TableCell>
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
                                            onClick={() => onDelete}
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
