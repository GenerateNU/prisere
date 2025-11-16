import { PurchaseLineItem, PurchaseLineItemType } from "../../entities/PurchaseLineItem";
import { execFile, execFileSync } from 'child_process';

export async function classifyLineItem(p: PurchaseLineItem): Promise<PurchaseLineItemType> {
    const amount = p.amountCents.toString();
    const category = p.category!;
    const merchant = p.description!;

    try {
        const stdout = execFileSync(
            "python3",
            ["predict.py", "--amount", amount, "--category", category, "--merchant", merchant],
            { encoding: 'utf8' }
        );

        const label = parseInt(stdout.trim(), 10);

        if (label === 1) {
            return PurchaseLineItemType.SUG_EX;
        } else {
            return PurchaseLineItemType.SUG_TY;
        }
    } catch (error) {
        throw new Error("Model failed");
    }
}