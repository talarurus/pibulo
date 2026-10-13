import type {ReactElement} from 'react';
import type {AvatarConfig, Motion} from './index.js';
export interface FaceProps {
 name?: string;
 config?: AvatarConfig;
 size?: number;
 motion?: Motion;
 pointerGaze?: boolean;
 target?: 'pointer'|'rest'|{x:number;y:number}|Element|null;
 label?: string;
 decorative?: boolean;
 travel?: number;
}
export function Face(props: FaceProps): ReactElement;
