"use client";
import { useCallback, useState } from "react";

export const useColumnOrderSelection = (startingState: string[] = []) => {
    const REQUIRED_COLUMNS = ["amountcents"];
    const OPTIONAL_COLUMNS = ["category", "description"];
    const [columnOrder, setColumnOrder] = useState<string[]>(startingState);

    const setFieldPosition = useCallback(
        (fieldName: string, posnIdx: number) => {
            if (
                !REQUIRED_COLUMNS.includes(fieldName.toLowerCase()) ||
                !OPTIONAL_COLUMNS.includes(fieldName.toLowerCase())
            ) {
                throw Error(
                    "The given field name must be one of: " + [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS].join(", ")
                );
            }

            setColumnOrder((prev) => {
                //If the new index is at the end of the list or further, push the position to the end of the order
                if (prev.length >= posnIdx) {
                    return [...prev, fieldName];
                }

                const shallowCopy = [...prev];
                //Insert the given field name at the given index
                shallowCopy.splice(posnIdx, 0, fieldName);

                return shallowCopy;
            });
        },
        [setColumnOrder]
    );

    return {
        isValidColumnOrder: REQUIRED_COLUMNS.every((requiredField) => columnOrder.includes(requiredField)),
        setFieldPosition,
        columnOrder,
    };
};
