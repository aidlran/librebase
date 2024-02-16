export type Action = PostToAllAction | PostToOneAction;

export type PostToAllAction = 'session.clear' | 'session.load';

export type PostToOneAction = 'node.root.get' | 'session.create' | 'session.import';
