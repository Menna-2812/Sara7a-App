export const ErrorResponse = ({
    message = "Error",
    status = 400,
    extra = undefined
}) => {
    const error = new Error(
        typeof message === "string" ? message : message?.message
    );
    error.status = status;
    error.extra = extra;
    throw error;
};

export const BadRequestException = (
    message = "Bad Requst Exception",
    extra = undefined
) => {
    return ErrorResponse({ message, status: 400, extra });
};

export const conflictException = (
    message = "Conflict Exception",
    extra = undefined
) => {
    return ErrorResponse({ message, status: 409, extra });
};

export const UnauthorrizedException = (
    message = "Unauthorrized Exception",
    extra = undefined,
) => {
    return ErrorResponse({ message, status: 401, extra });
};

export const NotFoundException = (
    message = "Not Found Exception",
    extra = undefined,
) => {
    return ErrorResponse({ message, status: 404, extra });
};

export const ForbiddenException = (
    message = "Forbidden Exception",
    extra = undefined,
) => {
    return ErrorResponse({ message, status: 403, extra });
};

export const globalErrorHandler = (error, req, res, next) => {
    const status = error.status ?? 500;

    return res.status(status).json({ message: error.message, stack: error.stack, status})
};