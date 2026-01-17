export const SetSceneKey = Symbol('SetScene');
export const UpdateKey = Symbol('Update');
export const PostUpdateKey = Symbol('PostUpdate');
export const BeginPlayKey = Symbol('BeginPlay');
export const EndPlayKey = Symbol('EndPlay');

// New key for Engine -> Scene injection
export const SetGameEngineKey = Symbol('SetGameEngine');
export const RenderKey = Symbol('Render');
