/**
 * Determines if the given value is a well formed ID.
 * An ID is defined as "Well formed" if it follows the form: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx,
 * is composed of 32 hexadecimal digits and four hyphens, and totals 36 characters.
 *
 * @param id The id that will be checked to see if the value is a "well formed ID"
 * @returns True if the given value is a well formed id
 */
const isIdWellFormed = (id: unknown) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

    return typeof id === "string" && uuidRegex.test(id);
};

export default isIdWellFormed;
