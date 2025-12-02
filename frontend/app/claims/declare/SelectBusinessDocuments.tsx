import BusinessDocumentFilters from "@/app/business-profile/view-documents/BusinessDocumentFilters";
import { Table, TableBody, TableCell, TableFooter, TableHead, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { TableHeader } from "@/components/ui/table";
import { IoFilterOutline } from "react-icons/io5";
import { IoIosArrowRoundDown, IoIosArrowRoundUp } from "react-icons/io";

interface SelectBusinessDocumentsProps {}

export const SelectBusinessDocuments = ({}: SelectBusinessDocumentsProps) => {
    return (
        <div>
            <div className="flex flex-row justify-between items-end">
                <div className="flex flex-col">
                    <h2 className="text-[24px] font-bold">Business Documents</h2>
                    <p>Select from business documents below to add to the current claim</p>
                </div>
                <Button className="bg-[var(--slate)] text-black text-[14px] h-[34px] w-fit" onClick={() => undefined}>
                    <IoFilterOutline className="text-black mr-2" />
                    Filters
                </Button>
            </div>
            <div className="pt-5">
                <BusinessDocumentFilters
                    dateFilter={""}
                    categoryFilter={""}
                    searchQuery={""}
                    setDateFilter={function (value: string): void {
                        throw new Error("Function not implemented.");
                    }}
                    setCategoryFilter={function (value: string): void {
                        throw new Error("Function not implemented.");
                    }}
                    setSearchQuery={function (value: string): void {
                        throw new Error("Function not implemented.");
                    }}
                />
            </div>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="text-[14px]">Title</TableHead>
                        <TableHead className="text-[14px]">File Type</TableHead>
                        <TableHead className="text-[14px]">Category</TableHead>
                        <TableHead className="text-[14px]">
                            {/* <div className="flex items-center hover:text-slate-700" onClick={handleDateSort}>
                                {dateSort === "asc" ? (
                                    <IoIosArrowRoundUp style={{ width: "18px", height: "18px" }} />
                                ) : (
                                    <IoIosArrowRoundDown style={{ width: "18px", height: "18px" }} />
                                )}
                                Date
                            </div> */}
                        </TableHead>
                        <TableHead className="text-[14px]"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {/* {documents.length !== 0 &&
                        documents.map((doc, index) => (
                            <TableRow key={index}>
                                <TableCell className="border-y text-[12px]">{doc.title}</TableCell>
                                <TableCell className="border-y text-[12px]">{doc.fileType}</TableCell>
                                <TableCell className="border-y text-[12px]">
                                    <CategorySelector
                                        selectedCategory={(doc.category as DocumentCategories | null) ?? ""}
                                        onCategoryChange={(newCategory) =>
                                            onCategoryChange(doc.documentId, newCategory)
                                        }
                                        categories={categories}
                                        categoryColors={categoryColors}
                                    />
                                </TableCell>
                                <TableCell className="border-y text-[12px]">{doc.date.toLocaleDateString()}</TableCell>
                            </TableRow>
                        ))} */}
                </TableBody>
                <TableFooter>
                    {/* {documents.length === 0 && !initialPending && (
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
                    )} */}
                </TableFooter>
            </Table>
        </div>
    );
};
