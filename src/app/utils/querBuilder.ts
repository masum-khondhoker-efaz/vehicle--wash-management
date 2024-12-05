import { FilterQuery, QueryOptions, Document } from 'mongoose';

class QueryBuilder<T extends Document> {
  private query: FilterQuery<T>; // Mongoose query filter (initially empty or base)
  private filters: FilterQuery<T> = {};
  private sortOptions: Record<string, 'asc' | 'desc'> = {};
  private selectedFields: string[] = [];
  private pagination: { page: number; limit: number } = { page: 1, limit: 10 };
  private searchParams: { fields: string[]; searchTerm: RegExp } | null = null;

  constructor(query: FilterQuery<T>) {
    this.query = query;
  }

  // .filter({ key: value })
  filter(filters: FilterQuery<T>) {
    this.filters = filters;
    return this;
  }

  // .sort({ key: 'asc' })
  sort(sortOptions: Record<string, 'asc' | 'desc'>) {
    this.sortOptions = sortOptions;
    return this;
  }

  // .fields(['field1', 'field2'])
  fields(fields: string[]) {
    this.selectedFields = fields;
    return this;
  }

  // .paginate({ page: 1, limit: 10 })
  paginate({ page = 1, limit = 10 }: { page: number; limit: number }) {
    this.pagination = { page, limit };
    return this;
  }

  // .search(['field1', 'field2'], 'searchTerm')
  setSearch(fields: string[], searchTerm: string) {
    if (fields && searchTerm) {
      this.searchParams = {
        fields,
        searchTerm: new RegExp(searchTerm, 'i'), // 'i' for case-insensitive search
      };
    }
    return this;
  }

  // Build the final Mongoose query
  build(): { query: FilterQuery<T>; options: QueryOptions } {
    let finalQuery: FilterQuery<T> = { ...this.query }; // Start with the initial query

    // Apply filters
    if (Object.keys(this.filters).length > 0) {
      finalQuery = { ...finalQuery, ...this.filters };
    }

    // Apply search (case-insensitive regex)
    if (
      this.searchParams &&
      this.searchParams.fields.length > 0 &&
      this.searchParams.searchTerm
    ) {
      const searchConditions = this.searchParams.fields.map(field => ({
        [field]: { $regex: this.searchParams!.searchTerm, $options: 'i' }, // Case-insensitive
      }));
      finalQuery = { ...finalQuery, $or: searchConditions };
    }

    // Set up options for sorting and pagination
    const options: QueryOptions = {};

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

export default QueryBuilder;
