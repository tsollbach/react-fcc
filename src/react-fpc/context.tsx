import React, { createContext, PureComponent, ComponentType, SFC } from 'react'

import {
  Container,
  Action,
  ActionFactory,
  ApplyingAction,
  GetDerivedState,
  ContainerOptions,
  ActionsParameter,
  MappedActions,
  Middleware,
  Shared,
  Omit,
} from './interfaces'

const noop = () => ({})

export function context<State, Actions extends ActionsParameter<State>, Props = {}, TStateProps = State>(
  initialState: State,
  actions: Actions,
  options: ContainerOptions<State, Actions, Props, TStateProps> = {},
) {
  const middlewares = options.middlewares ? options.middlewares.reverse() : []

  const { Provider, Consumer } = createContext({})

  // these type definitions are basicly taken from react-redux typing and only slightly
  // modified. See https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-redux/index.d.ts
  const withContext = <P extends Shared<TStateProps & MappedActions<Actions>, P>>(WrappedComponent: ComponentType<P>) => {
    type TOuterProps = Omit<P, keyof Shared<TStateProps & MappedActions<Actions>, P>> & Props
    const ContextedComponent: SFC<TOuterProps> = props => {
      return <Consumer>{context => <WrappedComponent {...context} />}</Consumer>
    }
    return ContextedComponent
  }

  const ProviderContainer = class ProviderContainer extends PureComponent<Props, State> {
    mappedActions: MappedActions<Actions>
    apply: Middleware<State, MappedActions<Actions>, Props>

    state = initialState

    static getDerivedStateFromProps: undefined | GetDerivedState<Props, State> = undefined

    constructor(props: Props) {
      super(props)
      this.mappedActions = this.mapActions(actions)
      this.apply = middlewares.reduce(
        (prev, next) => {
          return (container: Container<State, Actions, Props>, action: ApplyingAction<State>) => {
            return next(container, action, prev)
          }
        },
        (container: Container<State, Actions, Props>, action: ApplyingAction<State>) => {
          return action.apply(null, ([] as Array<any>).concat(action._args))
        },
      )
    }

    mapAction = (action: Action<State>, args: any, name: keyof Actions) => {
      this.setState((state: State, props: Props) => {
        const container = {
          state,
          actions: this.mappedActions,
          props,
        }

        const applyingAction = (options.injects && options.injects.hasOwnProperty(name)
          ? options.injects[name]!(this.mappedActions, state, props)
          : action) as ApplyingAction<State>
        applyingAction._args = args
        applyingAction._name = name

        return (this.apply(container, applyingAction, noop) || {}) as Pick<State, keyof State>
      })
    }

    mapActions = (actions: Actions) => {
      this.componentDidMount = options.onMount
        ? () => this.mapAction(options.onMount!, [], options.onMount!.name || 'componentDidMount')
        : noop
      this.componentDidUpdate = options.onUpdate
        ? (prevProps: Props, prevState: State) =>
            this.mapAction(options.onUpdate!, [prevProps, prevState], options.onUpdate!.name || 'componentDidUpdate')
        : noop

      return Object.entries(actions).reduce<MappedActions<Actions>>(
        (mappedActions, entry) => {
          const name = entry[0] as keyof ActionsParameter<State>
          const action = entry[1] as Action<State>
          mappedActions[name] = (...args: any[]) => this.mapAction(action, args, name)
          return mappedActions
        },
        {} as MappedActions<Actions>,
      )
    }

    render() {
      const value = Object.assign({}, this.state, this.mappedActions)
      return <Provider value={value}>{this.props.children}</Provider>
    }
  }

  if (typeof options.derivedState === 'function') {
    ProviderContainer.getDerivedStateFromProps = (nextProps: Props, prevState: State) => {
      return options.derivedState!(nextProps, prevState)
    }
  }

  return {
    withContext,
    ProviderContainer,
  }
}
