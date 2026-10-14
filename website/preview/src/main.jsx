/*! Website layout adapted from Alain00/blobatar, Copyright (c) 2026 Alain, MIT. Full notice: /THIRD-PARTY-NOTICES.txt. */
import {BRAND} from './brand.mjs';
import React,{lazy,Suspense} from 'react';
const AgentStudio=lazy(()=>import('./AgentStudio.tsx'));
import {createRoot} from 'react-dom/client';
import {AgentScenes} from './AgentScenes.jsx';
import {Home} from './Home.jsx';
import {Editor} from './Editor.jsx';
import {Components} from './Components.jsx';
import {Docs,About,Contact,Privacy,NotFound} from './Pages.jsx';
const path=location.pathname.replace(/\/$/,'')||'/';
const pages={'/':Home,'/studio':AgentStudio,'/design-lab':Editor,'/agent-scenes':AgentScenes,'/editor':Editor,'/components':Components,'/docs':Docs,'/about':About,'/contact':Contact,'/privacy':Privacy};
const Page=pages[path]||NotFound;
document.title=(path==='/'?`${BRAND.name} — a familiar face for every agent`:`${BRAND.name} ${path.slice(1)||'preview'}`)+' · v0.2.0 development';
class ErrorBoundary extends React.Component{state={failed:false};static getDerivedStateFromError(){return {failed:true}}render(){return this.state.failed?<main className="not-found"><h1>Something went astray.</h1><p>Try reloading with the default settings.</p><a href={location.pathname}>Reset this page ↗</a></main>:this.props.children}}
function App(){return <ErrorBoundary><a className="skip-link" href="#content">Skip to content</a><header className="nav"><a href="/" className="brand" aria-label={BRAND.name+' home'}>{BRAND.wordmark}</a><nav aria-label="Main navigation">{['studio','editor','docs'].map(x=><a key={x} href={'/'+x} aria-current={path==='/'+x?'page':undefined}>{x==='design-lab'?'Design lab':x[0].toUpperCase()+x.slice(1)}</a>)}</nav></header><main id="content"><Suspense fallback={<p role="status">Loading Studio…</p>}><Page/></Suspense></main><footer><span>{BRAND.wordmark} <span className="muted">/ Talarurus</span></span><nav aria-label="Footer">{['studio','docs','components','editor','agent-scenes','about','contact','privacy'].map(x=><a key={x} href={'/'+x}>{x==='agent-scenes'?'agent scenes':x}</a>)}</nav><small>{BRAND.status} · Source package · not on npm <a href="/THIRD-PARTY-NOTICES.txt">Blobatar artwork · MIT & third-party notices</a></small></footer></ErrorBoundary>}
createRoot(document.getElementById('root')).render(<App/>);
