
import { PaginatedResult } from '../../src/utils/pagination/types';

export const paginate = async <T, Args>(
    model: any,
    args: any = {},
    page: number = 1,
    limit: number = 10
): Promise<PaginatedResult<T>> => {
    const skip = (page - 1) * limit;

    // Separate count args (remove select/include/orderBy for count efficiency usually, 
    // though safe to keep where)
    const countArgs = { where: args.where };

    const [total, data] = await Promise.all([
        model.count(countArgs),
        model.findMany({
            ...args,
            take: limit,
            skip,
        })
    ]);

    return {
        data,
        meta: {
            total,
            lastPage: Math.ceil(total / limit),
            currentPage: page,
            perPage: limit,
            prev: page > 1 ? page - 1 : null,
            next: page < Math.ceil(total / limit) ? page + 1 : null,
        }
    };
};
