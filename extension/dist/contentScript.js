"use strict";(()=>{var u="http://localhost:3000",b=`${u}/api/trpc/comment.create`,f=`${u}/api/trpc/links.getByUrl`,c=null;function k(e){return{startOffset:e.startOffset,endOffset:e.endOffset,startContainer:m(e.startContainer),endContainer:m(e.endContainer),commonAncestor:m(e.commonAncestorContainer)}}function C(e){try{let n=p(e.startContainer),t=p(e.endContainer);if(!n||!t)return null;let o=document.createRange();return o.setStart(n,e.startOffset),o.setEnd(t,e.endOffset),o}catch(n){return console.error("Error deserializing range:",n),null}}function m(e){if(e.nodeType===Node.DOCUMENT_NODE)return"/";if(e.parentNode===null)return"";let n=e.parentNode.childNodes,t=1;for(let o=0;o<n.length;o++){let r=n[o];if(r===e){let i=e.nodeName.toLowerCase();return m(e.parentNode)+"/"+i+"["+t+"]"}r.nodeName===e.nodeName&&t++}return""}function p(e){try{return document.evaluate(e,document,null,XPathResult.FIRST_ORDERED_NODE_TYPE,null).singleNodeValue}catch(n){return console.error("Error evaluating XPath:",n),null}}async function E(){chrome.storage.local.get(["knotion_auth_token"],e=>{c=e.knotion_auth_token}),document.addEventListener("mouseup",x),await S()}function x(e){let n=window.getSelection();if(g(),!n||n.toString().trim().length===0)return;let t=n.getRangeAt(0);v(t,e)}function v(e,n){let t=document.createElement("div");t.id="knotion-comment-toolbar",t.className="knotion-toolbar";let o=document.createElement("button");o.textContent="Comment",o.addEventListener("click",()=>{N(e)}),t.appendChild(o);let r=e.getBoundingClientRect();t.style.position="absolute",t.style.left=`${r.right}px`,t.style.top=`${window.scrollY+r.top-30}px`,document.body.appendChild(t),document.addEventListener("mousedown",h)}function h(e){let n=document.getElementById("knotion-comment-toolbar"),t=document.getElementById("knotion-comment-dialog");n&&!n.contains(e.target)&&t&&!t.contains(e.target)&&(g(),document.removeEventListener("mousedown",h))}function g(){let e=document.getElementById("knotion-comment-toolbar");e&&e.remove()}function N(e){g();let n=document.createElement("div");n.id="knotion-comment-container",document.body.appendChild(n);let t=n.attachShadow({mode:"open"}),o=document.createElement("style");o.textContent=`
    .knotion-dialog {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 10000;
      width: 300px;
    }
    
    .knotion-dialog textarea {
      width: 100%;
      height: 100px;
      margin-bottom: 10px;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      resize: none;
    }
    
    .knotion-dialog-buttons {
      display: flex;
      justify-content: flex-end;
    }
    
    .knotion-dialog-buttons button {
      margin-left: 8px;
      padding: 8px 12px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    
    .knotion-dialog-buttons button.cancel {
      background: #f1f1f1;
    }
    
    .knotion-dialog-buttons button.submit {
      background: #0070f3;
      color: white;
    }
  `;let r=document.createElement("div");r.id="knotion-comment-dialog",r.className="knotion-dialog",r.innerHTML=`
    <h3>Add Comment</h3>
    <textarea placeholder="Enter your comment here..."></textarea>
    <div class="knotion-dialog-buttons">
      <button class="cancel">Cancel</button>
      <button class="submit">Save</button>
    </div>
  `,t.appendChild(o),t.appendChild(r);let i=t.querySelector("textarea"),a=t.querySelector(".cancel"),s=t.querySelector(".submit");a==null||a.addEventListener("click",()=>{n.remove()}),s==null||s.addEventListener("click",async()=>{if(i&&i.value.trim()){let d=k(e);await w({text:i.value,range:d}),n.remove(),y(e,i.value)}})}async function w({text:e,range:n}){if(!c){l("Please log in to KNotion to save comments","error");return}try{let t=await fetch(f,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${c}`},body:JSON.stringify({json:{url:window.location.href}})});if(!t.ok){l("This page is not saved in KNotion yet","error");return}let i={linkId:(await t.json()).result.data.id,text:e,rangeStart:n.startOffset,rangeEnd:n.endOffset,rangeSelector:JSON.stringify(n)};(await fetch(b,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${c}`},body:JSON.stringify({json:i})})).ok?l("Comment saved successfully!","success"):l("Failed to save comment","error")}catch(t){console.error("Error saving comment:",t),l("An error occurred while saving your comment","error")}}function l(e,n){let t=document.createElement("div");t.className=`knotion-notification ${n}`,t.textContent=e,document.body.appendChild(t),setTimeout(()=>{t.remove()},3e3)}async function S(){if(c)try{let e=await fetch(f,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${c}`},body:JSON.stringify({json:{url:window.location.href}})});if(!e.ok)return;let t=(await e.json()).result.data.id,o=await fetch(`${u}/api/trpc/comment.getByLinkId`,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${c}`},body:JSON.stringify({json:{linkId:t}})});if(!o.ok)return;(await o.json()).result.data.forEach(a=>{try{let s=JSON.parse(a.rangeSelector),d=C(s);d&&y(d,a.text)}catch(s){console.error("Error highlighting comment:",s)}})}catch(e){console.error("Error loading highlights:",e)}}function y(e,n){let t=document.createElement("mark");t.className="knotion-highlight",t.setAttribute("data-comment",n),t.style.backgroundColor="rgba(255, 230, 0, 0.3)",t.style.cursor="pointer",t.addEventListener("mouseover",o=>{let r=t.getAttribute("data-comment");r&&R(r,o)}),t.addEventListener("mouseout",()=>{O()});try{e.surroundContents(t)}catch(o){console.error("Error highlighting range:",o)}}function R(e,n){let t=document.createElement("div");t.id="knotion-tooltip",t.className="knotion-tooltip",t.textContent=e,t.style.position="absolute",t.style.left=`${n.pageX}px`,t.style.top=`${n.pageY-30}px`,t.style.backgroundColor="black",t.style.color="white",t.style.padding="5px 10px",t.style.borderRadius="4px",t.style.zIndex="10000",document.body.appendChild(t)}function O(){let e=document.getElementById("knotion-tooltip");e&&e.remove()}E();})();
