import { ActionFactoriesParameter, ActionsParameter, MappedActions, Action, ActionFactory, Container } from './Container'

export type MapStateToProps<State, TStateProps> = (state: State) => TStateProps

export type GetDerivedState<Props, State> = (nextProps: Props, prevState: State) => State

export interface ApplyingAction<State> extends Action<State> {
  _name: string
  _args: any[]
}

export type Middleware<State, Actions extends MappedActions<Actions>, Props> = (
  container: Container<State, Actions, Props>,
  action: ApplyingAction<State>,
  next: InternalMiddleware<State, Actions, Props>,
) => Partial<State>

export type InternalMiddleware<State, Actions extends MappedActions<Actions>, Props> = (
  container: Container<State, Actions, Props>,
  action: ApplyingAction<State>,
  next?: InternalMiddleware<State, Actions, Props>,
) => Partial<State>

export interface ContainerOptions<State, Actions extends MappedActions<Actions>, Props, TStateProps> {
  injects?: Partial<ActionFactoriesParameter<State, Actions, Props>>
  onMount?: Action<State>
  onUpdate?: Action<State>
  derivedState?: GetDerivedState<Props, State>
  mapStateToProps?: MapStateToProps<State, TStateProps>
  middlewares?: Middleware<State, Actions, Props>[]
}
