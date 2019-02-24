declare function createElement(name: string, props?: {
    [id: string]: any;
}, ...children: any[]): HTMLElement;
declare enum SelectionType {
    Range = "Range",
    Caret = "Caret"
}
declare class SeoIwyg {
    private onSelectionEvent;
    private onChangeEvent;
    private static PlaceholderChar;
    private static PlaceHolderCharRegExp;
    private _container;
    private _content;
    private outlineVisible;
    private toolbar;
    readonly registeredCommands: Command[];
    readonly content: Element;
    readonly container: Element;
    constructor(selector: string);
    onSelection(handler: (editor: SeoIwyg, selection: EditorSelection) => void): void;
    onChange(handler: (editor: SeoIwyg, selection: EditorSelection) => void): void;
    addCommand(command: Command): void;
    focusContent(): void;
    invokeCommand(command: Command): void;
    getSelection(): EditorSelection;
    wrapSelection(selection: Selection, into: Node): void;
    unwrapSelection(selection: Selection, nodeOrSelector: Node | string | null): void;
    getFocusedElement(selection: Selection): Element | null;
    getFocusedTextNode(selection: Selection, __node?: Node | undefined | null): Node | null;
    private init;
    private findAndStoreContainer;
    private initOnReady;
    private handleChanges;
    private createEditor;
    private removePlaceholdingNodes;
}
declare abstract class Command {
    private _name;
    private _icon;
    entity: Node | null;
    active: boolean;
    private _onClick;
    readonly onClick: EditorEvent<(event: Event) => void>;
    readonly name: string;
    readonly icon: string;
    constructor(name: string, icon: string);
    render(): Node;
    onChange(editor: SeoIwyg, selection: EditorSelection): void;
    onSelection(editor: SeoIwyg, selection: EditorSelection): void;
    abstract apply(editor: SeoIwyg, selection: EditorSelection): void;
    abstract redo(editor: SeoIwyg, selection: EditorSelection): void;
    abstract isActive(editor: SeoIwyg, selection: EditorSelection): boolean;
}
declare class BoldCommand extends Command {
    constructor();
    apply(editor: SeoIwyg, selection: EditorSelection): void;
    redo(editor: SeoIwyg, selection: EditorSelection): void;
    isActive(editor: SeoIwyg, selection: EditorSelection): boolean;
}
declare class DocumentOutliner {
    constructor(any: any);
}
declare class OutlineCommand extends Command {
    private static className;
    private outlineContainer;
    constructor();
    apply(editor: SeoIwyg, selection: EditorSelection): void;
    redo(editor: SeoIwyg, selection: EditorSelection): void;
    isActive(editor: SeoIwyg, selection: EditorSelection): boolean;
    onChange(editor: SeoIwyg, selection: EditorSelection): void;
    private createOutlineContainer;
    private updateOutline;
}
declare class EditorEvent<THandler extends Function> {
    private handlers;
    private invoked;
    add(handler: THandler): void;
    invoke(...args: any[]): void;
}
declare class Toolbar {
    private seoIwyg;
    private commands;
    private entity;
    readonly registeredCommands: Command[];
    constructor(seoiwyg: SeoIwyg);
    addCommand(command: Command): void;
    render(): Element;
    private onEditorChange;
    private onEditorSelection;
    private reRenderCommand;
}
declare class HeadingCommand extends Command {
    constructor();
    apply(editor: SeoIwyg, selection: EditorSelection): void;
    redo(editor: SeoIwyg, selection: EditorSelection): void;
    isActive(editor: SeoIwyg, selection: EditorSelection): boolean;
    private getSectionHeadingRank;
}
declare class SimpleTagCommand extends Command {
    private tagName;
    private secondaryTagName;
    private selector;
    constructor(name: string, icon: string, tag: string, secondaryTag?: string | null);
    apply(editor: SeoIwyg, selection: EditorSelection): void;
    redo(editor: SeoIwyg, selection: EditorSelection): void;
    isActive(editor: SeoIwyg, selection: EditorSelection): boolean;
}
