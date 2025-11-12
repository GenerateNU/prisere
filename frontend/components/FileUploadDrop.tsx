import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/shadcn-io/dropzone";

export default function FileUploadDrop() {
    return (
        <div>
            <Dropzone>
                <DropzoneEmptyState>
                    <div>File Upload area</div>
                </DropzoneEmptyState>
                <DropzoneContent />
            </Dropzone>
        </div>
    );
}
