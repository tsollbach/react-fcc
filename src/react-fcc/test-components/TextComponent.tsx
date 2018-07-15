import React, {SFC} from 'react'

export type UpdateTextAction = (newText: string) => void

export interface TextComponentProps {
  foo: string
  text: string
  updateText: UpdateTextAction
}

export const TextComponent: SFC<TextComponentProps> = (props) => {
  return <span>{props.text}</span>
}

export interface TextComponentMappedActionsProps {
  text: string
  actions: {
    updateText: UpdateTextAction
  }
}

export const TextComponentMappedActions: SFC<TextComponentMappedActionsProps> = (props) => {
  return <span>{props.text}</span>
}

export const TextComponentWithPrefix: SFC<TextComponentMappedActionsProps> = (props) => {
  return <span>{props.text}</span>
}

export interface FetchingTextComponentProps {
  text: string
  loading: boolean
  updateText: UpdateTextAction
  fetchText: () => void
}

export const FetchingTextComponent: SFC<FetchingTextComponentProps> = (props) => {
  return <span>{props.text}</span>
}
