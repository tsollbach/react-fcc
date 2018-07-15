import React from 'react';
import renderer from 'react-test-renderer';
import { context } from './context';
import { TextComponent } from './test-components/TextComponent';
function updateText(newText) {
    return { text: newText };
}
test('initial state can be set', () => {
    const { ProviderContainer: TextProvider, withContext: withText } = context({ text: 'initial' }, {
        updateText,
    });
    const TextComponentWithContext = withText(TextComponent);
    const component = renderer.create(React.createElement(TextProvider, null,
        React.createElement(TextComponentWithContext, { foo: "test" })));
    const tree = component.toTree();
    expect(tree).not.toBeNull();
    const textComponent = component.root.findByType(TextComponent);
    expect(textComponent.props.text).toBe('initial');
    expect(textComponent.props.updateText).toBeInstanceOf(Function);
});
test('actions update state', () => {
    const { ProviderContainer: TextProvider, withContext: withText } = context({ text: 'initial' }, {
        updateText,
    });
    const TextComponentWithContext = withText(TextComponent);
    const component = renderer.create(React.createElement(TextProvider, null,
        React.createElement(TextComponentWithContext, { foo: "test" })));
    const tree = component.toTree();
    expect(tree).not.toBeNull();
    const textComponent = component.root.findByType(TextComponent);
    textComponent.props.updateText('foo');
    expect(textComponent.props.text).toBe('foo');
});
test('one middleware can be applied', () => {
    const { ProviderContainer: TextProvider, withContext: withText } = context({ text: 'initial' }, {
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
    });
    const TextComponentWithContext = withText(TextComponent);
    const component = renderer.create(React.createElement(TextProvider, null,
        React.createElement(TextComponentWithContext, { foo: "test" })));
    const tree = component.toTree();
    expect(tree).not.toBeNull();
    const textComponent = component.root.findByType(TextComponent);
    textComponent.props.updateText('foo');
    expect(textComponent.props.text).toBe('middled');
});
test('multiple middlewares can be applied in correct order', () => {
    const { ProviderContainer: TextProvider, withContext: withText } = context({ text: 'initial' }, {
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
    });
    const TextComponentWithContext = withText(TextComponent);
    const component = renderer.create(React.createElement(TextProvider, null,
        React.createElement(TextComponentWithContext, { foo: "test" })));
    const tree = component.toTree();
    expect(tree).not.toBeNull();
    const textComponent = component.root.findByType(TextComponent);
    textComponent.props.updateText('foo');
    expect(textComponent.props.text).toBe('foo321');
});
