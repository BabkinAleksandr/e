declare namespace vanilla {
    export type Styles = CSSStyleDeclaration | string
    export type AttrValue = string | number | boolean | EventListener | Styles | void
    type Falsy = string | number | boolean | null | void

    type Ref<T extends Text | HTMLElement> = { ref: T | undefined }
    type Computed<T> = { value: T }

    export interface State<T extends Object> extends Proxy<T> {
        onUpdate?: (k: string, cb: ((n: T[string | number]) => void)) => void
        __originalObject?: T
    }

    type State<T> = ObjState<T> | ArrState<T>

    interface SpecialAttributes {
        key?: string | number | (() => string | number)
        ref?: Ref<Text | HTMLElement>
    }

    type Attributes = Record<string, AttrValue> & SpecialAttributes

    export interface TextComponent extends StaticComponent {
        type: 'textnode'
        attrs: SpecialAttributes
        children: string
    }

    export interface DefinedComponent {
        type: StaticComponent['type'] | DynamicComponentBody['type']
        attrs: StaticComponent['attrs'] | DynamicComponentBody['attrs']
        children: StaticComponent['children'] | DynamicComponentBody['children']

    }
    export type Component = string | DefinedComponent | (() => DefinedComponent) | (() => Falsy)

    export type ErrorBoundaryComponent = ((e: Error) => string | DefinedComponent | StaticComponent | Falsy)

    export interface StaticComponent {
        type: string
        attrs: Attributes
        children: Array<Component>
        errorBoundaryRendered?: boolean
    }

    interface DynamicComponentBody {
        type: () => string
        attrs: () => ((Record<string, (() => AttrValue) | EventListener> & SpecialAttributes) | void)
        children: () => Array<Component>
    }
    export type DynamicComponent = DynamicComponentBody | (() => DynamicComponentBody)

    export type ParentDescriptor = ComponentDescriptor<DefinedComponent | (() => DefinedComponent) | (() => Falsy), StaticComponent, HTMLElement>

    export interface ComponentDescriptor<C = Component, R = TextComponent | StaticComponent | void, N = HTMLElement | Text | undefined> {
        id: string
        // dynamic - component can appear and disappear and require marker comment
        type: 'dynamic' | 'static'
        parent: ParentDescriptor
        node: N
        component: C
        errorBoundaryComponent?: Component | ((e: Error) => string | DefinedComponent | StaticComponent | Falsy)
        renderErrorBoundary?: (e: Error) => void
        rendered: R
        children: ComponentDescriptor[]
        bindings: Binding[]
        lifecycleHook: {
            onMount: () => (() => void) | undefined
            onUnmount?: () => void
        }
    }

    interface BaseBinding {
        symbol: Symbol
        key: string
        descriptor: ComponentDescriptor
        updateFunction: () => void
    }
    interface ComponentBinding extends BaseBinding {
        type: 'component'
    }
    interface TypeBinding extends BaseBinding {
        type: 'type'
    }
    interface AttributesBinding extends BaseBinding {
        type: 'attributes'
    }
    interface AttributeBinding extends BaseBinding {
        type: 'attribute'
        attributeName: string
    }
    interface ChildrenBinding extends BaseBinding {
        type: 'children'
    }
    interface ComputedValueBinding extends BaseBinding {
        type: 'computed_value'
        descriptor: undefined
    }

    export type Binding =
        | ComponentBinding
        | TypeBinding
        | AttributesBinding
        | AttributeBinding
        | ChildrenBinding
        | ComputedValueBinding


    // DOM Updates
    export interface RemoveElementOperation {
        type: 'remove'
        descriptorId: string
        fromIndex: number
    }
    export interface MoveElementOperation {
        type: 'move'
        descriptorId: string
        fromIndex: number
        insertBefore: ComponentDescriptor | null
    }
    export interface InsertElementOperation {
        type: 'insert'
        descriptorId: string
        toIndex: number
        insertBefore: ComponentDescriptor | null
    }
    export type UpdateOperation =
        | RemoveElementOperation
        | MoveElementOperation
        | InsertElementOperation
}
