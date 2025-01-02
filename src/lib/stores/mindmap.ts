import { writable } from 'svelte/store';
import type { Node, Link } from '../types';

export const nodes = writable<Node[]>([]);
export const links = writable<Link[]>([]);
export const activeUsers = writable<any[]>([]); 