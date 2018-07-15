import React, { createContext, PureComponent } from 'react';
const noop = () => ({});
export function context(initialState, actions, options = {}) {
    const middlewares = options.middlewares ? options.middlewares.reverse() : [];
    const { Provider, Consumer } = createContext({});
    // these type definitions are basicly taken from react-redux typing and only slightly
    // modified. See https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-redux/index.d.ts
    const withContext = (WrappedComponent) => {
        const ContextedComponent = props => {
            return React.createElement(Consumer, null, context => React.createElement(WrappedComponent, Object.assign({}, context)));
        };
        return ContextedComponent;
    };
    const ProviderContainer = (_a = class ProviderContainer extends PureComponent {
            constructor(props) {
                super(props);
                this.state = initialState;
                this.mapAction = (action, args, name) => {
                    this.setState((state, props) => {
                        const container = {
                            state,
                            actions: this.mappedActions,
                            props,
                        };
                        const applyingAction = (options.injects && options.injects.hasOwnProperty(name)
                            ? options.injects[name](this.mappedActions, state, props)
                            : action);
                        applyingAction._args = args;
                        applyingAction._name = name;
                        return (this.apply(container, applyingAction, noop) || {});
                    });
                };
                this.mapActions = (actions) => {
                    this.componentDidMount = options.onMount
                        ? () => this.mapAction(options.onMount, [], options.onMount.name || 'componentDidMount')
                        : noop;
                    this.componentDidUpdate = options.onUpdate
                        ? (prevProps, prevState) => this.mapAction(options.onUpdate, [prevProps, prevState], options.onUpdate.name || 'componentDidUpdate')
                        : noop;
                    return Object.entries(actions).reduce((mappedActions, entry) => {
                        const name = entry[0];
                        const action = entry[1];
                        mappedActions[name] = (...args) => this.mapAction(action, args, name);
                        return mappedActions;
                    }, {});
                };
                this.mappedActions = this.mapActions(actions);
                this.apply = middlewares.reduce((prev, next) => {
                    return (container, action) => {
                        return next(container, action, prev);
                    };
                }, (container, action) => {
                    return action.apply(null, [].concat(action._args));
                });
            }
            render() {
                const value = Object.assign({}, this.state, this.mappedActions);
                return React.createElement(Provider, { value: value }, this.props.children);
            }
        },
        _a.getDerivedStateFromProps = undefined,
        _a);
    if (typeof options.derivedState === 'function') {
        ProviderContainer.getDerivedStateFromProps = (nextProps, prevState) => {
            return options.derivedState(nextProps, prevState);
        };
    }
    return {
        withContext,
        ProviderContainer,
    };
    var _a;
}
