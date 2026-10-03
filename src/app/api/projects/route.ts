import {NextResponse} from 'next/server';import {endpoint,jsonBody} from '@/lib/http';import {store} from '@/lib/store';import {z} from 'zod';
export const runtime='nodejs';
export const GET=endpoint(async()=>NextResponse.json(await store.listProjects()));
export const POST=endpoint(async req=>{const {title}=z.object({title:z.string().trim().min(1).max(100)}).parse(await jsonBody(req));return NextResponse.json(await store.createProject(title));});
