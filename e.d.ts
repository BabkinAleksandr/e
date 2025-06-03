declare namespace vanilla {
    export type Styles = CSSStyleDeclaration | string
    export type AttrValue = string | number | boolean | EventListener | Styles | void
    type Falsy = string | number | boolean | null | void

    interface SpecialAttributes {
        key?: string | number | (() => string | number)
        ref?: () => void
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

    export interface StaticComponent {
        type: string
        attrs: Attributes
        children: Array<Component>
    }

    interface DynamicComponentBody {
        type: () => string
        attrs: () => ((Record<string, (() => AttrValue) | EventListener> & SpecialAttributes) | void)
        children: () => Array<Component>
    }
    export type DynamicComponent = DynamicComponentBody | (() => DynamicComponentBody)

    export interface ComponentDescriptor<C = Component> {
        id: string
        parentNode: HTMLElement | undefined
        node: HTMLElement | Text | undefined
        component: C
        rendered: TextComponent | StaticComponent | void
        children: ComponentDescriptor[]
        bindings: Binding[]
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

    export type Binding =
        | ComponentBinding
        | TypeBinding
        | AttributesBinding
        | AttributeBinding
        | ChildrenBinding

    export interface State<T extends Object> extends Proxy<T> {
        __originalObject: T
    }

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
        toIndex: number
    }
    export interface InsertElementOperation {
        type: 'insert'
        descriptorId: string
        toIndex: number
        insertAfter: {
            type: 'before' | 'after'
            descriptorId: string
        } | { type: 'beginning' }
    }
    export type UpdateOperation =
        | RemoveElementOperation
        | MoveElementOperation
        | InsertElementOperation
}
