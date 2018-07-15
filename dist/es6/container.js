import React, { PureComponent } from 'react';
const noop = () => ({});
export function container(initialState, actions, options = {}) {
    const middlewares = options.middlewares ? options.middlewares.reverse() : [];
    // these type definitions are basicly taken from react-redux typings and only slightly
    // modified. See https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/react-redux/index.d.ts
    return (WrappedComponent) => {
        const Container = (_a = class FPContainer extends PureComponent {
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
                    const { mapStateToProps } = options;
                    const props = Object.assign({}, this.mappedActions, mapStateToProps ? mapStateToProps(this.state) : this.state);
                    return React.createElement(WrappedComponent, Object.assign({}, props));
                }
            },
            _a.getDerivedStateFromProps = undefined,
            _a);
        if (typeof options.derivedState === 'function') {
            Container.getDerivedStateFromProps = (nextProps, prevState) => {
                return options.derivedState(nextProps, prevState);
            };
        }
        return Container;
        var _a;
    };
}
