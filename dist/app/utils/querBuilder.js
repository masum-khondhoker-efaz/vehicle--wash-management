"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class QueryBuilder {
    constructor(query) {
        this.filters = {};
        this.sortOptions = {};
        this.selectedFields = [];
        this.pagination = { page: 1, limit: 10 };
        this.searchParams = null;
        this.query = query;
    }
    // .filter({ key: value })
    filter(filters) {
        this.filters = filters;
        return this;
    }
    // .sort({ key: 'asc' })
    sort(sortOptions) {
        this.sortOptions = sortOptions;
        return this;
    }
    // .fields(['field1', 'field2'])
    fields(fields) {
        this.selectedFields = fields;
        return this;
    }
    // .paginate({ page: 1, limit: 10 })
    paginate({ page = 1, limit = 10 }) {
        this.pagination = { page, limit };
        return this;
    }
    // .search(['field1', 'field2'], 'searchTerm')
    setSearch(fields, searchTerm) {
        if (fields && searchTerm) {
            this.searchParams = {
                fields,
                searchTerm: new RegExp(searchTerm, 'i'), // 'i' for case-insensitive search
            };
        }
        return this;
    }
    // Build the final Mongoose query
    build() {
        let finalQuery = Object.assign({}, this.query); // Start with the initial query
        // Apply filters
        if (Object.keys(this.filters).length > 0) {
            finalQuery = Object.assign(Object.assign({}, finalQuery), this.filters);
        }
        // Apply search (case-insensitive regex)
        if (this.searchParams &&
            this.searchParams.fields.length > 0 &&
            this.searchParams.searchTerm) {
            const searchConditions = this.searchParams.fields.map(field => ({
                [field]: { $regex: this.searchParams.searchTerm, $options: 'i' }, // Case-insensitive
            }));
            finalQuery = Object.assign(Object.assign({}, finalQuery), { $or: searchConditions });
        }
        // Set up options for sorting and pagination
        const options = {};
        // Apply sorting
        if (Object.keys(this.sortOptions).length > 0) {
            options.sort = this.sortOptions;
        }
        // Apply fields selection
        if (this.selectedFields.length > 0) {
            options.select = this.selectedFields.join(' ');
        }
        // Apply pagination
        if (this.pagination.page && this.pagination.limit) {
            options.skip = (this.pagination.page - 1) * this.pagination.limit;
            options.limit = this.pagination.limit;
        }
        return { query: finalQuery, options };
    }
}
exports.default = QueryBuilder;
