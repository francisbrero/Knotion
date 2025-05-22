declare module 'rangy' {
  interface RangyStatic {
    init(): void;
    createClassApplier(className: string, options?: any): any;
    serializeRange(range: Range, root: boolean | Element, options?: any): string;
    deserializeRange(serialized: string, root: Node | null): Range | null;
    getSelection(): RangySelection;
    createRange(): Range;
  }

  interface RangySelection {
    isCollapsed: boolean;
    getRangeAt(index: number): Range;
    toString(): string;
    removeAllRanges(): void;
  }

  const rangy: RangyStatic;
  export = rangy;
} 