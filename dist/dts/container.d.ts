/// <reference types="react" />
import React from 'react';
import { Action, GetDerivedState, ContainerOptions, ActionsParameter, MappedActions, Middleware, Shared } from './interfaces';
export declare function container<State, Actions extends ActionsParameter<State>, Props = {}, TStateProps = State>(initialState: State, actions: Actions, options?: ContainerOptions<State, Actions, Props, TStateProps>): <P extends Shared<TStateProps & MappedActions<Actions>, P>>(WrappedComponent: React.ComponentType<P>) => {
    new (props: Pick<P, ({ [P in keyof P]: P; } & { [P in Extract<keyof Actions, keyof P> | Extract<keyof TStateProps, keyof P>]: never; } & {
        [x: string]: never;
        [x: number]: never;
    })[keyof P]> & Props): {
        mappedActions: MappedActions<Actions>;
        apply: Middleware<State, MappedActions<ActionsParameter<State>>, Pick<P, ({ [P in keyof P]: P; } & { [P in Extract<keyof Actions, keyof P> | Extract<keyof TStateProps, keyof P>]: never; } & {
            [x: string]: never;
            [x: number]: never;
        })[keyof P]> & Props>;
        state: State;
        mapAction: (action: Action<State>, args: any, name: keyof Actions) => void;
        mapActions: (actions: Actions) => MappedActions<Actions>;
        render(): JSX.Element;
        setState<K extends keyof State>(state: State | ((prevState: Readonly<State>, props: Pick<P, ({ [P in keyof P]: P; } & { [P in Extract<keyof Actions, keyof P> | Extract<keyof TStateProps, keyof P>]: never; } & {
            [x: string]: never;
            [x: number]: never;
        })[keyof P]> & Props) => State | Pick<State, K> | null) | Pick<State, K> | null, callback?: (() => void) | undefined): void;
        forceUpdate(callBack?: (() => void) | undefined): void;
        props: Readonly<{
            children?: React.ReactNode;
        }> & Readonly<Pick<P, ({ [P in keyof P]: P; } & { [P in Extract<keyof Actions, keyof P> | Extract<keyof TStateProps, keyof P>]: never; } & {
            [x: string]: never;
            [x: number]: never;
        })[keyof P]> & Props>;
        context: any;
        refs: {
            [key: string]: React.ReactInstance;
        };
    };
    getDerivedStateFromProps: GetDerivedState<Pick<P, ({ [P in keyof P]: P; } & { [P in Extract<keyof Actions, keyof P> | Extract<keyof TStateProps, keyof P>]: never; } & {
        [x: string]: never;
        [x: number]: never;
    })[keyof P]> & Props, State> | undefined;
};
