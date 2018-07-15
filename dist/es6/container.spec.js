import React from 'react';
import renderer from 'react-test-renderer';
import { partial } from 'ramda';
import { container } from './container';
import { TextComponent, FetchingTextComponent } from './test-components/TextComponent';
function updateText(newText) {
    return { text: newText };
}
test('initial state can be set', () => {
    const Container = container({ text: 'initial' }, {
        updateText,
    })(TextComponent);
    const component = renderer.create(React.createElement(Container, { foo: "test" }));
    const tree = component.toTree();
    expect(tree).not.toBeNull();
    const textComponent = component.root.findByType(TextComponent);
    expect(textComponent.props.text).toBe('initial');
});
test('actions update state', () => {
    const Container = container({ text: 'initial' }, {
        updateText,
    })(TextComponent);
    const component = renderer.create(React.createElement(Container, { foo: "test" }));
    const tree = component.toTree();
    expect(tree).not.toBeNull();
    const textComponent = component.root.findByType(TextComponent);
    textComponent.props.updateText('foo');
    expect(textComponent.props.text).toBe('foo');
});
test('state can be derived from props', () => {
    const Container = container({ text: 'bar' }, {
        updateText,
    }, {
        derivedState: (props, state) => {
            return {
                text: `${props.prefix}${state.text}`,
            };
        },
    })(TextComponent);
    const component = renderer.create(React.createElement(Container, { foo: "test", prefix: "foo" }));
    const tree = component.toTree();
    expect(tree).not.toBeNull();
    const textComponent = component.root.findByType(TextComponent);
    expect(textComponent.props.text).toBe('foobar');
    component.update(React.createElement(Container, { foo: "test", prefix: "mee" }));
    expect(textComponent.props.text).toBe('meefoobar');
});
test('state can be mapped to props', () => {
    const updateText = (text) => {
        return {
            num: parseInt(text, 10),
        };
    };
    const Container = container({ num: 0 }, {
        updateText,
    }, {
        mapStateToProps: state => {
            return {
                text: state.num.toString(),
            };
        },
    })(TextComponent);
    const component = renderer.create(React.createElement(Container, { foo: "test" }));
    const tree = component.toTree();
    expect(tree).not.toBeNull();
    const textComponent = component.root.findByType(TextComponent);
    expect(textComponent.props.text).toBe('0');
});
test('one middleware can be applied', () => {
    const Container = container({ text: 'initial' }, {
        updateText,
    }, {
        middlewares: [
            (container, action, next) => {
                action._args = ['mid'];
                const state = next(container, action);
                state.text += 'dled';
                return state;
            },
        ],
    })(TextComponent);
    const component = renderer.create(React.createElement(Container, { foo: "test" }));
    const tree = component.toTree();
    expect(tree).not.toBeNull();
    const textComponent = component.root.findByType(TextComponent);
    textComponent.props.updateText('foo');
    expect(textComponent.props.text).toBe('middled');
});
test('multiple middlewares can be applied in correct order', () => {
    const Container = container({ text: 'initial' }, {
        updateText,
    }, {
        middlewares: [
            (container, action, next) => {
                const state = next(container, action);
                state.text += '1';
                return state;
            },
            (container, action, next) => {
                const state = next(container, action);
                state.text += '2';
                return state;
            },
            (container, action, next) => {
                const state = next(container, action);
                state.text += '3';
                return state;
            },
        ],
    })(TextComponent);
    const component = renderer.create(React.createElement(Container, { foo: "test" }));
    const tree = component.toTree();
    expect(tree).not.toBeNull();
    const textComponent = component.root.findByType(TextComponent);
    textComponent.props.updateText('foo');
    expect(textComponent.props.text).toBe('foo321');
});
test('actions can be used onMount', () => {
    const Container = container({ text: 'initial' }, {
        updateText,
    }, {
        onMount: () => ({ text: 'mounted' }),
    })(TextComponent);
    const component = renderer.create(React.createElement(Container, { foo: "test" }));
    const tree = component.toTree();
    expect(tree).not.toBeNull();
    const textComponent = component.root.findByType(TextComponent);
    expect(textComponent.props.text).toBe('mounted');
});
test('actions can be used onUpdate', () => {
    const Container = container({ text: 'initial' }, {
        updateText,
    }, {
        onUpdate: (prevProps, prevState) => (prevState.text === 'initial' ? { text: 'mounted' } : {}),
    })(TextComponent);
    const component = renderer.create(React.createElement(Container, { foo: "test" }));
    const tree = component.toTree();
    expect(tree).not.toBeNull();
    const textComponent = component.root.findByType(TextComponent);
    textComponent.props.updateText('foo');
    expect(textComponent.props.text).toBe('mounted');
});
function fetchText(updateText) {
    setTimeout(() => {
        updateText('fetched');
    }, 100);
    return {
        loading: true,
    };
}
test('actions can have other actions injected', done => {
    const Container = container({ text: 'initial', loading: false }, {
        updateText,
        fetchText,
    }, {
        injects: {
            fetchText: actions => partial(fetchText, [actions.updateText]),
        },
    })(FetchingTextComponent);
    const component = renderer.create(React.createElement(Container, null));
    const tree = component.toTree();
    expect(tree).not.toBeNull();
    const textComponent = component.root.findByType(FetchingTextComponent);
    textComponent.props.fetchText();
    expect(textComponent.props.loading).toBe(true);
    setTimeout(() => {
        expect(textComponent.props.text).toBe('fetched');
        done();
    }, 110);
});
test('lifecycle actions can have other actions injected', done => {
    const Container = container({ text: 'initial', loading: false }, {
        updateText,
        fetchText,
    }, {
        onMount: fetchText,
        injects: {
            componentDidMount: actions => partial(fetchText, [actions.updateText]),
        },
    })(FetchingTextComponent);
    const component = renderer.create(React.createElement(Container, null));
    const tree = component.toTree();
    expect(tree).not.toBeNull();
    const textComponent = component.root.findByType(FetchingTextComponent);
    expect(textComponent.props.loading).toBe(true);
    setTimeout(() => {
        expect(textComponent.props.text).toBe('fetched');
        done();
    }, 110);
});
