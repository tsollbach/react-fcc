/// <reference types="react" />
import { SFC } from 'react';
export declare type UpdateTextAction = (newText: string) => void;
export interface TextComponentProps {
    foo: string;
    text: string;
    updateText: UpdateTextAction;
}
export declare const TextComponent: SFC<TextComponentProps>;
export interface TextComponentMappedActionsProps {
    text: string;
    actions: {
        updateText: UpdateTextAction;
    };
}
export declare const TextComponentMappedActions: SFC<TextComponentMappedActionsProps>;
export declare const TextComponentWithPrefix: SFC<TextComponentMappedActionsProps>;
export interface FetchingTextComponentProps {
    text: string;
    loading: boolean;
    updateText: UpdateTextAction;
    fetchText: () => void;
}
export declare const FetchingTextComponent: SFC<FetchingTextComponentProps>;
