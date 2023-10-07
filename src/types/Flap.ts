export interface PromptInput {
  type: 'input';
  name: string;
  message: string;
  default?: string;
}

export interface PromptSelect {
  type: 'select';
  name: string;
  message: string;
  choices: string[];
}

export interface PromptConfirm {
  type: 'confirm';
  name: string;
  message: string;
  default?: 'true' | 'false';
}

export type Prompt = PromptInput | PromptSelect | PromptConfirm;

export interface Flap {
  name: string;
  actions: Actions[];
  prompts: Prompt[];
}

export interface FlapWithPath extends Flap {
  path: string;
}

export interface ActionFileUpload {
  type: 'file-upload';
  from: string;
  to: string;
  template?: true;
}

export interface ActionFileDownload {
  type: 'file-download';
  from: string;
  to: string;
}

export interface ActionFolderUpload {
  type: 'folder-upload';
  from: string;
  to: string;
  template?: true;
}

export interface ActionFolderDownload {
  type: 'folder-download';
  from: string;
  to: string;
}

export interface ActionChangeCvar {
  type: 'change-cvar';
  path: string;
  cvar: string;
  value: string;
}

type Actions =
  | ActionFileUpload
  | ActionFileDownload
  | ActionFolderUpload
  | ActionFolderDownload
  | ActionChangeCvar;
