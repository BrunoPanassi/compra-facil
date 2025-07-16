import type { Register } from './Register';
import type { ProjectType } from './ProjectType';
import type { User } from './User';

export interface Project {
  id: number;
  name: string;
  begin: Date;
  estimated_end: Date;
  registers: Register[];
  estimated_value: number;
  actual_value: number;
  type: ProjectType;
  person: User;
}