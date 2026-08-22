export type UserRole = 'support' | 'compliance' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Jordan Lee',
    email: 'jordan.lee@company.com',
    role: 'support'
  },
  {
    id: '2',
    name: 'Priya Shah',
    email: 'priya.shah@company.com',
    role: 'compliance'
  },
  {
    id: '3',
    name: 'Morgan Chen',
    email: 'morgan.chen@company.com',
    role: 'admin'
  }
];
