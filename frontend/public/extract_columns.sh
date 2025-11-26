#!/bin/bash

# Check if input file is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <input_csv_file> [output_csv_file]"
    echo "Example: $0 input.csv output.csv"
    exit 1
fi

INPUT_FILE="$1"
OUTPUT_FILE="${2:-output.csv}"

# Check if input file exists
if [ ! -f "$INPUT_FILE" ]; then
    echo "Error: File '$INPUT_FILE' not found!"
    exit 1
fi

# Extract columns 5 and 14 using awk
awk -F',' 'BEGIN {OFS=","} {print $7, $14}' "$INPUT_FILE" > "$OUTPUT_FILE"

echo "Columns 5 and 14 extracted to '$OUTPUT_FILE'"