import './globals.css';
import {Cormorant_Garamond,Inter} from 'next/font/google';
const serif=Cormorant_Garamond({subsets:['latin'],weight:['300','400','500'],style:['normal','italic'],variable:'--serif'});
const sans=Inter({subsets:['latin'],variable:'--sans'});
export const metadata={title:'A Story Worth Remembering',description:'Some moments deserve a place to stay forever.'};
export default function L({children}){return <html lang="en" className={`${serif.variable} ${sans.variable}`}><body>{children}</body></html>}
