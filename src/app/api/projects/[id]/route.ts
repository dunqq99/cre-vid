import {NextResponse} from 'next/server';import {endpoint,jsonBody} from '@/lib/http';import {store,AppError} from '@/lib/store';import {projectSchema} from '@/lib/model';
export const runtime='nodejs';
const id=(url:string)=>new URL(url).pathname.split('/').at(-1)!;
export const GET=endpoint(async req=>NextResponse.json(await store.getProject(id(req.url))));
export const PUT=endpoint(async req=>{const input=projectSchema.parse(await jsonBody(req));if(input.id!==id(req.url))throw new AppError('ID không khớp.');return NextResponse.json(await store.saveProject(input,input.revision));});
