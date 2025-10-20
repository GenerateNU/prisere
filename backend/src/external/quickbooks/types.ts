export type QBOAuthTokenResponse = {
    expires_in: number;
    x_refresh_token_expires_in: number;
    refresh_token: string;
    access_token: string;
    token_type: "bearer";
};

export type QBAuthenticationErrorResponse = {
    fault: {
        error: [
            {
                message: string;
                detail: "Token revoked" | (string & {});
                code: string;
                element: unknown | null;
            },
        ];
        type: "AUTHENTICATION" | (string & {});
    };
    /**
     * Timestamp of the error return (UNIX epoch time)
     */
    time: number;

    // ... there are more fields, but they are seemningly unimportant
};

export type QBSuccessfulQueryResponse<T> = {
    _id: "valid";
    data: {
        QueryResponse: T;
        /**
         * Treated as datetime string
         */
        time: string;
    };
};

export type QBQueryResponse<T> = { _id: "unauthorized" } | { _id: "revoked" } | QBSuccessfulQueryResponse<T>;
