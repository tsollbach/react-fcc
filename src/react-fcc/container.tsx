import React, { ComponentType, Component, PureComponent, ComponentClass, StatelessComponent } from 'react'

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

export function container<State, Actions extends ActionsParameter<State>, Props = {}, TStateProps = State>(
  initialState: State,
  actions: Actions,
  options: ContainerOptions<State, Actions, Props, TStateProps> = {},
) {
  const middlewares = options.middlewares ? options.middlewares.reverse() : []

  // these type definitions are basicly taken from react-redux typings and only slightly
  // modified. See https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-redux/index.d.ts
  return <P extends Shared<TStateProps & MappedActions<Actions>, P>>(WrappedComponent: ComponentType<P>) => {
    type TOuterProps = Omit<P, keyof Shared<TStateProps & MappedActions<Actions>, P>> & Props
    const Container = class FPContainer extends PureComponent<TOuterProps, State> {
      mappedActions: MappedActions<Actions>
      apply: Middleware<State, MappedActions<ActionsParameter<State>>, TOuterProps>

      state = initialState

      static getDerivedStateFromProps: undefined | GetDerivedState<TOuterProps, State> = undefined

      constructor(props: TOuterProps) {
        super(props)
        this.mappedActions = this.mapActions(actions)
        this.apply = middlewares.reduce(
          (prev, next) => {
            return (container: Container<State, Actions, TOuterProps>, action: ApplyingAction<State>) => {
              return next(container, action, prev)
            }
          },
          (container: Container<State, Actions, TOuterProps>, action: ApplyingAction<State>) => {
            return action.apply(null, ([] as Array<any>).concat(action._args))
          },
        )
      }

      mapAction = (action: Action<State>, args: any, name: keyof Actions | 'componentDidMount' | 'componentDidUpdate') => {
        this.setState((state: State, props: TOuterProps) => {
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
          ? () => this.mapAction(options.onMount!, [], 'componentDidMount')
          : noop
        this.componentDidUpdate = options.onUpdate
          ? (prevProps: TOuterProps, prevState: State) =>
              this.mapAction(options.onUpdate!, [prevProps, prevState], 'componentDidUpdate')
          : noop

        return Object.entries(actions).reduce<MappedActions<Actions>>(
          (mappedActions, entry) => {
            const name = entry[0]
            const action = entry[1]
            mappedActions[name] = (...args: any[]) => this.mapAction(action, args, name)
            return mappedActions
          },
          {} as MappedActions<Actions>,
        )
      }

      render() {
        const { mapStateToProps } = options
        const props = Object.assign({}, this.mappedActions, mapStateToProps ? mapStateToProps(this.state) : this.state)
        return <WrappedComponent {...props} />
      }
    }

    if (typeof options.derivedState === 'function') {
      Container.getDerivedStateFromProps = (nextProps: TOuterProps, prevState: State) => {
        return options.derivedState!(nextProps, prevState)
      }
    }
    return Container
  }
}
