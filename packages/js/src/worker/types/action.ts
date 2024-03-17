export type Action = PostToAllAction | PostToOneAction;

export type PostToAllAction = 'keyring.clear' | 'keyring.load';

export type PostToOneAction =
  | 'identity.get'
  | 'identity.sign'
  | 'identity.verify'
  | 'keyring.create'
  | 'keyring.import';
