import { Request } from 'express';
import { Model, Document, Query, FilterQuery } from 'mongoose';

interface PaginationOptions {
    page: number;
    limit: number;
}

interface PaginationResult<T> {
    data: T[];
    count: number;
    totalPages: number;
    currentPage: number;
    previous: string | null;
    next: string | null;
}

export const setPageUrl = (url: string, page?: number) => {
    return `${url}`.replace(/page=\d+/g, `page=${page}`);
};

export async function paginate<T extends Document>(
    // model: Model<T>,
    model: any,
    query: FilterQuery<T>,
    options: PaginationOptions,
    req: Request
): Promise<PaginationResult<T>> {
    const { page, limit } = options;

    const countQuery: Query<number, T, {}> = model.countDocuments(query);

    // add query filters to dataQuery
    const dataQuery: Query<T[], T, {}> = model.find(query).skip((page - 1) * limit).limit(limit);
    // const dataQuery: Query<T[], T, {}> = model.find().skip((page - 1) * limit).limit(limit);

    const [count, data] = await Promise.all([countQuery, dataQuery]);

    const totalPages = Math.ceil(count / limit);

    // add next and previous page urls
    const absoluteUrl = `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    let next = page >= totalPages ? null : setPageUrl(absoluteUrl, page + 1);
    let previous = page > 1 ? setPageUrl(absoluteUrl, page - 1) : null;

    return {
        data,
        count,
        totalPages,
        currentPage: page,
        previous,
        next
    };
}
