import type {Metadata} from 'next';
import './globals.css';
import './studio-layout.css';
export const metadata:Metadata={title:'Cre-vid — Newsroom Studio',description:'Studio biên tập video bản tin: tư liệu, kịch bản, giọng đọc và xuất bản.'};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="vi"><body>{children}</body></html>;}
