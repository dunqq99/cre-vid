export type Provider = 'facebook' | 'x';
export type Account = {id:string;provider:Provider;name:string;remoteId:string;accessToken:string;refreshToken?:string;expiresAt?:number};
export type PublicAccount = Pick<Account,'id'|'provider'|'name'|'remoteId'>;
export type Publication = {
 id:string;projectId:string;renderId:string;revision:number;accountId:string;accountName:string;provider:Provider;text:string;
 state:'queued'|'running'|'succeeded'|'failed'|'uncertain'|'canceled';
 createdAt:string;heartbeat?:number;message:string;mediaId?:string;postId?:string;url?:string;
 // Persisted BEFORE the request which can make the post public. Never auto-retry this phase.
 submitted?:boolean;
};
export type SocialStatus={accounts:PublicAccount[];publications:Publication[];configuration:Record<Provider,{ready:boolean;missing:string[];callback:string}>};
