"use client";
import {useState} from "react";
const workflows=[
  ["✍️","Content Studio","Create posts, captions, hooks and scripts"],
  ["🛍️","Business Campaign","Turn a product idea into a complete promotion"],
  ["📱","Social Pack","Generate platform-ready content from one idea"],
  ["📄","Resume & Jobs","Build resumes, cover letters and applications"],
  ["🔄","Repurpose","Transform one piece of content into multiple formats"]
] as const;

export default function Home(){
  const [selected,setSelected]=useState("");
  const [prompt,setPrompt]=useState("");
  const [result,setResult]=useState("");
  const [loading,setLoading]=useState(false);
  async function generate(){
    if(!prompt.trim()||loading)return;
    setLoading(true);setResult("");
    try{
      const res=await fetch("/api/ai",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({prompt:"Workflow: "+selected+"\nUser request: "+prompt+"\nCreate a practical, ready-to-use result. Be concise, useful and professional."})});
      const data=await res.json();setResult(data.text||data.error||"Unable to generate right now.");
    }catch{setResult("Connection error. Please try again.");}finally{setLoading(false);}
  }
  return <main>
    <header><div className="brand"><span className="logo">✦</span><div><b>AI Creator Tools</b><small>Telegram-first AI Workflows</small></div></div><span className="status">● Ready</span></header>
    <section className="hero"><span className="eyebrow">CREATE • AUTOMATE • GROW</span><h1>Turn one idea into<br/><em>real work.</em></h1><p>Fast AI workflows for creators, businesses, students and everyday users.</p><button onClick={()=>document.getElementById("tools")?.scrollIntoView({behavior:"smooth"})}>Start creating <span>→</span></button></section>
    <section id="tools" className="section"><div className="sectionhead"><div><span className="eyebrow">WORKFLOWS</span><h2>What do you want to create?</h2></div><span className="count">5 workflows</span></div>
      <div className="grid">{workflows.map(([icon,name,desc])=><button className={"card "+(selected===name?"active":"")} key={name} onClick={()=>setSelected(name)}><span className="icon">{icon}</span><span><strong>{name}</strong><small>{desc}</small></span><span className="arrow">↗</span></button>)}</div>
      <div className="studio"><div className="studiohead"><div><span className="eyebrow">AI STUDIO</span><h2>{selected||"Choose a workflow"}</h2></div><span className="secure">🔒 Secure gateway</span></div>
        <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder={selected?"Tell AI what you need for "+selected+"...":"Choose a workflow, then describe what you want..."}/>
        <button className="generate" disabled={!selected||!prompt.trim()||loading} onClick={generate}>{loading?"Generating…":"Generate with AI →"}</button>
        {result&&<div className="result"><div className="resulttitle">AI RESULT</div><pre>{result}</pre></div>}
      </div>
    </section><footer><span>AI Creator Tools</span><span>Telegram • Fast • Secure • Scalable</span></footer>
  </main>
}