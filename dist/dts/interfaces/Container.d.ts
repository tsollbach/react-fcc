export interface Container<S extends {
    [name: string]: any;
}, A extends MappedActions<A>, P extends {
    [name: string]: any;
} = {}> {
    state: S;
    actions: A;
    props: P;
}
export declare type MappedAction = (...args: any[]) => any;
export declare type MappedActions<Actions> = {
    [name in keyof Actions]: (...args: any[]) => any;
};
export interface Action<State> {
    (...args: any[]): Partial<State> | null;
}
export interface ActionFactory<State, Actions extends MappedActions<ActionsParameter<State>>, OuterProps = {}> {
    (actions: Actions, state: State, props: OuterProps): Action<State>;
}
export declare type ActionsParameter<State> = {
    [name: string]: Action<State>;
};
export declare type LifeCycleActions = {
    componentDidMount: any;
    componentDidUpdate: any;
};
export declare type ActionFactoriesParameter<State, Actions extends MappedActions<ActionsParameter<State>>, OuterProps> = {
    [name in keyof (Actions & LifeCycleActions)]: ActionFactory<State, Actions, OuterProps>;
};
export declare type Omit<T, K extends keyof T> = Pick<T, ({
    [P in keyof T]: P;
} & {
    [P in K]: never;
} & {
    [x: string]: never;
    [x: number]: never;
})[keyof T]>;
/**
 * a property P will be present if :
 * - it is present in both DecorationTargetProps and InjectedProps
 * - DecorationTargetProps[P] extends InjectedProps[P]
 * ie: decorated component can accept more types than decorator is injecting
 *
 * For decoration, inject props or ownProps are all optionnaly
 * required by the decorated (right hand side) component.
 * But any property required by the decorated component must extend the injected property
 */
export declare type Shared<InjectedProps, DecorationTargetProps extends Shared<InjectedProps, DecorationTargetProps>> = {
    [P in Extract<keyof InjectedProps, keyof DecorationTargetProps>]?: DecorationTargetProps[P] extends InjectedProps[P] ? InjectedProps[P] : never;
};
