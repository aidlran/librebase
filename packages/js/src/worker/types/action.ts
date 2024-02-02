export type Action = PostToAllAction | PostToOneAction;

export type PostToAllAction = 'session.clear' | 'session.load';

export type PostToOneAction = 'session.create' | 'session.import';
