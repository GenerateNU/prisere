/**
 * @see https://developer.intuit.com/app/developer/qbo/docs/api/accounting/all-entities/invoice#the-invoice-object
 */
export type QBInvoice = {
    /**
     * A stringified integer id
     */
    Id: string;
    Line: QBInvoiceLineItem[];
    TotalAmt: number;
    MetaData: {
        CreateTime: string;
        LastUpdatedTime: string;
    };
    CustomerRef: {
        name: string;
        value?: string;
    };

    // There are a lot more fields, but for now we are not importing them and do not care
};

type QBSalesLineItem = {
    DetailType: "SalesLineItemDetail";
    /**
     * A stringified integer id
     */
    Id: string;
    /**
     * In dollars
     */
    Amount: number;
    Description?: string;
    LineNum?: number;
};

type QBGroupLineItem = {
    DetailType: "GroupLineDetail";
    /**
     * A stringified integer id
     */
    Id: string;
    GroupLineDetail: {
        Quantity?: number;
        Line: QBSalesLineItem[];
        GroupItemRef?: {
            value: string;
            name?: string;
        };
    };
    LineNum?: number;
    Description?: string;
};

type DescriptionLineDetail = {
    DetailType: "DescriptionOnly";
    /**
     * A stringified integer id
     */
    Id: string;
    DescriptionLineDetail: {
        TaxCodeRef?: {
            value: string;
            name?: string;
        };
        /** Datetime */
        ServiceDate?: string;
    };
    Description?: string;
    LineNum?: number;
    Amount: number;
};

type DiscountLine = {
    DetailType: "DiscountLineDetail";
    /**
     * A stringified integer id
     */
    Id: string;
    DiscountLineDetail: {
        ClassRef?: {
            value: string;
            name?: string;
        };
        TaxCodeRef?: {
            value: string;
            name?: string;
        };
        DiscountAccountRef?: {
            value: string;
            name?: string;
        };
        PercentBased?: boolean;
        /**
         * Expressed in the % of discount, i.e. 8.5% = 8.5, not 0.085 in this field
         */
        DiscountPercent?: number;
    };
    Amount: number;
    Description?: string;
    LineNum?: number;
};

type SubTotalLine = {
    DetailType: "SubTotalLineDetail";
    /**
     * A stringified integer id
     */
    Id: string;
    SubTotalLineDetail: {
        ItemRef?: {
            value: string;
            name?: string;
        };
    };
    Amount: number;
    Description?: string;
    LineNum?: number;
};

type QBInvoiceLineItem = QBSalesLineItem | QBGroupLineItem | DescriptionLineDetail | DiscountLine | SubTotalLine;
