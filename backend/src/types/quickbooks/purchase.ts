export type QBPurchase = {
    Id: string;
    Line: QBPurchaseLineItem[];
    /**
     * In dollars (i.e. $4.50 = 4.5)
     */
    TotalAmt: number;
    MetaData: {
        CreateTime: string;
        LastUpdatedTime: string;
    };
    Credit?: boolean;
};

type QBItemBasedExpense = {
    Id: string;
    DetailType: "ItemBasedExpenseLineDetail";
    Description?: string;
    ItemBasedExpenseLineDetail: {
        TaxInclusiveAmt: number;
        CustomerRef?: {
            value: string;
            name?: string;
        };
    };
};

type QBAccountBasedExpense = {
    Id: string;
    DetailType: "AccountBasedExpenseLineDetail";
    Description?: string;
    Amount: number;
    AccountBasedExpenseLineDetail: {
        AccountRef: {
            value: string;
            name?: string;
        };
    };
};

type QBPurchaseLineItem = QBItemBasedExpense | QBAccountBasedExpense;
