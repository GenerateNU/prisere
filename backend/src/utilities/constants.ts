export const LINE_ITEM_DESCRIPTION_CHARS = 400;
export const LINE_ITEM_CATEGORY_CHARS = 100;

export const TESTING_PREFIX = "/api/prisere";

// AWS SQS batch limit is 10 messages per request
export const BATCH_SIZE = 10;

export const SQS_QUEUE_URL_PROD =
    "https://sqs.us-east-1.amazonaws.com/478867930449/prisere-disaster-notifications-queue-prod";
export const SQS_QUEUE_URL_DEV =
    "https://sqs.us-east-1.amazonaws.com/478867930449/prisere-disaster-notifications-queue-dev";
export const OBJECTS_STORAGE_BUCKET_NAME = "prisere-objects-storage";
export const TFSTATE_BUCKET_NAME = "prisere-bucket";
