import './e.d.ts'

declare global {
    type ObjUpdatesMap = Record<string, vanilla.Binding[]>
    type UpdatesMap = Map<Symbol, ObjUpdatesMap>
    type UpdateType = vanilla.Binding['type']

    interface AppState {
        lastSymbols: { key: string, symbol: Symbol }[]
        updates: Record<UpdateType, UpdatesMap>
    }

    interface Window {
        __APP_STATE: AppState
    }
}

export { }
