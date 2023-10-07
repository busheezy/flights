export interface Flap {
  name: string;
  actions: Actions[];
}

export interface FlapWithPath extends Flap {
  path: string;
}

interface ActionFileUpload {
  type: 'file-upload';
  from: string;
  to: string;
  template?: true;
}

interface ActionFileDownload {
  type: 'file-download';
  from: string;
  to: string;
}

interface ActionFolderUpload {
  type: 'folder-upload';
  from: string;
  to: string;
  template?: true;
}

interface ActionFolderDownload {
  type: 'folder-download';
  from: string;
  to: string;
}

interface ActionChangeCvar {
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
