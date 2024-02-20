export type Action = PostToAllAction | PostToOneAction;

export type PostToAllAction = 'keyring.clear' | 'keyring.load';

export type PostToOneAction = 'identity.get' | 'keyring.create' | 'keyring.import';
