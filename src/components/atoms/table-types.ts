export interface ColumnDef {
    key: string;
    label: React.ReactNode;
    /** width as percentage (0-100) */
    width?: number;
    className?: string;
    /** optional custom header render */
    headerRender?: () => React.ReactNode;
}

export type Columns = ColumnDef[];
