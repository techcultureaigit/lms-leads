export type FilterVisibility = "private" | "public";

export type FilterOperator =
  | "contains"
  | "equals"
  | "not_equals"
  | "starts_with"
  | "is_empty"
  | "is_not_empty"
  | "gt"
  | "lt";

export type FilterJoin = "AND" | "OR";

export type FilterCondition = {
  field: string;
  operator: FilterOperator;
  value: string;
};

export type SavedFilter = {
  id: string;
  name: string;
  visibility: FilterVisibility;
  createdBy: string;
  conditions: FilterCondition[];
  joins: FilterJoin[];
  createdAt?: string;
  updatedAt?: string;
};

export type FilterFieldDef = {
  key: string;
  label: string;
  type: "text" | "select" | "date";
  options?: string[];
};
