import{R as Oe,g as Pe}from"../chunks/entry.CED2JQsL.js";import{s as Y,c as Ue}from"../chunks/supabase.BhBeyELt.js";import{f as Fe,e as y,a as P,t as V,g as Be,s as Je}from"../chunks/disclose-version.COp2Sx5X.js";import{i as Ze}from"../chunks/legacy.C6dZd77_.js";import{q as Xe,ax as Ge,ay as He,r as We,i as N,e as r,y as ge,z as I,w as u,v as c,x as m,t as we,az as Ye}from"../chunks/runtime.DExCUZGw.js";import{i as Ve}from"../chunks/preload-helper.DocKlGQB.js";import{r as Ke,a as et}from"../chunks/input.DoOhNRNz.js";import{b as tt,p as nt}from"../chunks/stores.D1wLCwxb.js";import{s as ot,a as it}from"../chunks/store._3t7VsMo.js";import{o as at,a as rt}from"../chunks/index-client.BmxZP1LF.js";function _e(h,s,q){if(q){if(h.classList.contains(s))return;h.classList.add(s)}else{if(!h.classList.contains(s))return;h.classList.remove(s)}}function L(h,s){throw new Oe(h,s.toString())}new TextEncoder;async function st({params:h}){try{const{data:{session:s},error:q}=await Y.auth.getSession();if(q||!s)throw L(303,"/login");const{data:b,error:p}=await Y.from("mindmaps").select(`
        *,
        mindmap_nodes (*)
      `).eq("id",h.id).single();if(p||!b)throw L(303,"/");const{data:_}=await Y.from("mindmap_collaborators").select("*").eq("mindmap_id",h.id).eq("user_id",s.user.id).single();if(b.owner_id!==s.user.id&&!_)throw L(303,"/");return{mindmap:b,nodes:b.mindmap_nodes||[],isOwner:b.owner_id===s.user.id,user:s.user}}catch(s){throw s instanceof L?s:L(303,"/login")}}const Et=Object.freeze(Object.defineProperty({__proto__:null,load:st},Symbol.toStringTag,{value:"Module"})),lt="https://fodqbncqvugtdiugukgv.supabase.co",ct="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvZHFibmNxdnVndGRpdWd1a2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU0MDYxMzksImV4cCI6MjA1MDk4MjEzOX0.bKcQoYy_XprQ1krc8Ox8yf7ihmEgxl9_aQUaKzG7LoU",v=Ue(lt,ct);var dt=Be('<script src="https://d3js.org/d3.v3.min.js"><\/script> <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"> <link href="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-lite.min.css" rel="stylesheet"> <script src="https://code.jquery.com/jquery-3.5.1.min.js"><\/script> <script src="https://cdn.jsdelivr.net/npm/summernote@0.8.18/dist/summernote-lite.min.js"><\/script>',1),ut=V('<div class="menu-container svelte-1lhqw0u"><div id="layoutMenu" style="margin-top: 100px;" class="svelte-1lhqw0u"><div class="controls-row  svelte-1lhqw0u" style="display: flex; align-items: center; gap: 15px; flex-direction: column;"><div class="dimention-control"><button class="svelte-1lhqw0u">Horizontal</button> <button class="svelte-1lhqw0u">Vertical</button></div> <div class="force-control svelte-1lhqw0u"><label>Force Strength:</label> <input type="range" min="10" max="300" value="100" class="svelte-1lhqw0u"></div> <div class="zoom-controls svelte-1lhqw0u"><button class="svelte-1lhqw0u"><i class="fas fa-plus"></i></button> <span class="zoom-level svelte-1lhqw0u"> </span> <button class="svelte-1lhqw0u"><i class="fas fa-minus"></i></button> <button class="svelte-1lhqw0u"><i class="fas fa-undo"></i></button> <label class="toggle-container svelte-1lhqw0u"><input type="checkbox" title="Toggle auto-level based on zoom" class="svelte-1lhqw0u"> <span class="toggle-label svelte-1lhqw0u">Auto-Level</span></label></div> <div class="level-control svelte-1lhqw0u"><label for="level-select">Level:</label> <select id="level-select" class="svelte-1lhqw0u"><option>Level 1 (Root only)</option><option>Level 2 (Root + Children)</option><option>Level 3 (Root + Children + Grandchildren)</option><option>Level 4</option><option>Level 5 (All)</option></select></div></div></div></div>'),mt=V('<div id="chart" style="width: 100%; height: calc(100vh - 64px);" class="svelte-1lhqw0u"><!> <div id="editDialog" style="display: none;" class="editor-dialog svelte-1lhqw0u"><div class="editor-content svelte-1lhqw0u"><div id="summernote"></div> <div class="dialog-buttons"><button>Save</button> <button>Cancel</button></div></div></div></div>');function pt(h,s){Xe(s,!1);const q=ot(),b=()=>it(nt,"$page",q),p=I();let _=1e3,z=800,f=null,S=I("horizontal"),d,x,K=I(!1),U,F=I(100),k=I(5),g,ee=null,B=I(!0),w={content:"Root",children:[],id:0};async function te(){const{data:e,error:n}=await v.from("mindmap_nodes").select("*").eq("mindmap_id",r(p)).order("created_at");if(n){console.error("Error loading nodes:",n);return}const t=new Map;e.forEach(o=>{t.set(o.id,{...o,children:[]})}),w={content:"Root",children:[],id:0},e.forEach(o=>{if(o.parent_id){const a=t.get(o.parent_id);a&&a.children.push(t.get(o.id))}else Object.assign(w,t.get(o.id))}),A()}async function ye(){U=v.channel("mindmap_changes").on("postgres_changes",{event:"*",schema:"public",table:"mindmap_nodes",filter:`mindmap_id=eq.${r(p)}`},e=>{be(e)}).subscribe()}function be(e){const{eventType:n,new:t,old:o}=e;switch(console.log("Realtime update:",n,e),n){case"INSERT":Q(w,t.id)||ne(t);break;case"UPDATE":xe(t);break;case"DELETE":te();break}}function ne(e){const n={...e,children:[]};if(e.parent_id){const t=Q(w,e.parent_id);t&&t.children.push(n)}else w.children.push(n);A()}function xe(e){const n=Q(w,e.id);n&&(n.content=e.content,n.rich_content=e.rich_content,A())}function ke(e){function n(t){if(!t.children)return!1;const o=t.children.length;return t.children=t.children.filter(a=>a.id===e?!1:(n(a),!0)),o!==t.children.length}n(w)}function Q(e,n){if(e.id===n)return e;if(e.children)for(const t of e.children){const o=Q(t,n);if(o)return o}return null}async function Ae(){if(f){const n={id:Date.now(),content:"New Node",parent_id:f.id,mindmap_id:r(p),rich_content:null},{error:t}=await v.from("mindmap_nodes").insert(n);if(t){console.error("Error adding node:",t);return}ne(n),A(),ie()}}async function Ee(){if(f&&f.id!==0){let n=function(o){e.push(o.id),o.children&&o.children.forEach(a=>n(a))};const e=[];n(f);const{error:t}=await v.from("mindmap_nodes").delete().in("id",e).eq("mindmap_id",r(p));if(t){console.error("Error deleting nodes:",t);return}e.forEach(o=>ke(o)),A(),ie()}}async function qe(){if(f&&f.id!==0){const e=window.jQuery("#summernote").summernote("code"),n=window.jQuery("<div>").html(e).text(),{error:t}=await v.from("mindmap_nodes").update({content:n||"Empty Node",rich_content:e}).eq("id",f.id).eq("mindmap_id",r(p));if(t){console.error("Error updating node:",t);return}ae()}}async function ze(){try{const{data:e,error:n}=await v.from("mindmaps").select("*").eq("id",r(p)).single();if(n)throw n;if(!e)throw new Error("Mindmap not found");const{data:t}=await v.from("mindmap_nodes").select("*").eq("mindmap_id",r(p));if(!t||t.length===0){const o=Date.now(),{data:a,error:l}=await v.from("mindmap_nodes").insert([{id:o,content:"Root",parent_id:null,mindmap_id:r(p),rich_content:null}]).select().single();if(l)throw l;const i=[{id:o+1,content:"Child 1",parent_id:o,mindmap_id:r(p),rich_content:null},{id:o+2,content:"Child 2",parent_id:o,mindmap_id:r(p),rich_content:null}],{error:E}=await v.from("mindmap_nodes").insert(i);if(E)throw E}await te(),ee=null}catch(e){console.error("Error initializing mindmap:",e),ee=e.message||"Failed to load mindmap",setTimeout(()=>Pe("/"),3e3)}}function Me(){const e=g.scale(),n=Math.min(e*1.2,3),t=g.translate();g.scale(n).translate(t),d.transition().duration(300).call(g.event)}function Ne(){const e=g.scale(),n=Math.max(e*.8,.1),t=g.translate();g.scale(n).translate(t),d.transition().duration(300).call(g.event)}function Ie(){g.scale(1).translate([0,0]),d.transition().duration(300).call(g.event)}function oe(e,n,t=0){e&&(t>=n?e.children&&(e._children=e.children,e.children=null):(e._children&&(e.children=e._children,e._children=null),e.children&&e.children.forEach(o=>oe(o,n,t+1))))}at(async()=>{if(await new Promise(e=>setTimeout(e,1e3)),window.d3){_=window.innerWidth,z=window.innerHeight,d=window.d3.select("#chart").append("svg").attr("width",_).attr("height",z);const e=d.append("g");g=window.d3.behavior.zoom().scaleExtent([.1,3]).on("zoom",()=>{if(e.attr("transform","translate("+window.d3.event.translate+")scale("+window.d3.event.scale+")"),N(F,Math.round(window.d3.event.scale*100)),r(B)){const n=r(F);let t;n<=30?t=1:n<=50?t=2:n<=70?t=3:n<=90?t=4:t=5,r(k)!==t&&(N(k,t),console.log(`Zoom: ${n}%, Level: ${t}`),oe(w,r(k)),A())}}),d.call(g),d=e,x=window.d3.layout.force().size([_,z]).charge(-1e3).linkDistance(100).gravity(.1).on("tick",Le),N(K,!0),await ze(),await ye()}}),rt(()=>{U&&U.unsubscribe()});function A(){if(!d)return;const e=J(w),n=e.filter(i=>i.depth<r(k)),t=window.d3.layout.tree().links(e).filter(i=>i.source.depth<r(k)-1);x.nodes(n).links(t).start();const o=d.selectAll(".link").data(t,i=>i.target.id);o.enter().insert("path",".node").attr("class","link"),o.exit().remove();const a=d.selectAll(".node").data(n,i=>i.id),l=a.enter().append("g").attr("class","node").call(x.drag);l.append("circle").attr("r",10),l.append("foreignObject").attr("width",200).attr("height",100).attr("x",12).attr("y",-25).append("xhtml:div").style("font","14px sans-serif").html(i=>(console.log("Node data:",i),i.rich_content||i.content||i.name||"Unnamed Node")),Se(l),a.select("foreignObject div").html(i=>i.rich_content||i.content||i.name||"Unnamed Node"),a.exit().remove()}function Le(){r(S)==="horizontal"?d.selectAll(".node").each(e=>{e.y=Math.max(50,Math.min(z-50,e.y)),e.x=e.depth*180+60}):d.selectAll(".node").each(e=>{e.x=Math.max(50,Math.min(_-50,e.x)),e.y=e.depth*180+60}),d.selectAll(".link").attr("d",e=>`M${e.source.x},${e.source.y}L${e.target.x},${e.target.y}`),d.selectAll(".node").attr("transform",e=>`translate(${e.x},${e.y})`)}function J(e){const n=[];function t(o,a,l){o.depth=a,o.parent=l,n.push(o),o.children&&o.children.forEach(i=>{t(i,a+1,o)})}return t(e,0,null),n}function je(e,n){f=n,window.d3.select("#menu").style("display","block").style("left",e.pageX+"px").style("top",e.pageY+"px")}function ie(){window.d3.select("#menu").style("display","none")}function $e(e){x.linkDistance(Number(e)).start()}function De(){if(f){const e=f.rich_content||f.content;window.d3.select("#editDialog").style("display","block"),window.jQuery("#summernote").summernote({height:200,callbacks:{async onImageUpload(n){var a;const t=window.jQuery("#summernote");let o;for(let l of n)try{if(!l.type.startsWith("image/")){alert("Please upload only image files.");continue}if(l.size>5*1024*1024){alert("Image size should be less than 5MB.");continue}o=document.createElement("img"),o.src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",t.summernote("insertNode",o);const i=l.name.split(".").pop(),E=`${Date.now()}-${Math.random().toString(36).substring(7)}.${i}`,j=`${r(p)}/${E}`,{data:C,error:$}=await v.storage.from("mindmap-images").upload(j,l,{cacheControl:"3600",upsert:!1});if($)throw $;const{data:{publicUrl:D}}=v.storage.from("mindmap-images").getPublicUrl(j),M=document.createElement("img");M.src=D,M.style.maxWidth="100%",M.onload=()=>{window.jQuery(o).replaceWith(M)},M.onerror=()=>{window.jQuery(o).remove(),alert("Failed to load the uploaded image."),v.storage.from("mindmap-images").remove([j]).then(({error:R})=>{R&&console.error("Failed to cleanup:",R)})}}catch(i){console.error("Error uploading image:",i),(a=window.jQuery(o))==null||a.remove(),alert("Failed to upload image. Please try again.")}},async onMediaDelete(n){try{const t=n[0].src;if(t.includes("mindmap-images")){const o=t.split("mindmap-images/")[1];await v.storage.from("mindmap-images").remove([o])}}catch(t){console.error("Error deleting image:",t)}}},toolbar:[["style",["style"]],["font",["bold","underline","clear"]],["color",["color"]],["para",["ul","ol","paragraph"]],["table",["table"]],["insert",["link","picture"]],["view",["fullscreen","codeview","help"]]]}),window.jQuery("#summernote").summernote("code",e)}}function ae(){window.jQuery("#summernote").summernote("destroy"),window.d3.select("#editDialog").style("display","none")}function re(e){if(N(S,e),x.stop(),e==="horizontal"){x.gravity(.1).charge(-1e3).linkDistance(100).size([_,z]);const n=J(w);n.forEach((t,o)=>{t.x=t.depth*180,t.y=z/2+(o-n.length/2)*50})}else{x.gravity(.3).charge(-800).linkDistance(80).size([_,z]);const n=J(w);n.forEach((t,o)=>{t.y=t.depth*180,t.x=_/2+(o-n.length/2)*50})}A(),x.start()}function Re(e){d.selectAll(".link").classed("highlighted",n=>{let t=e;for(;t.parent;){if(n.source===t.parent&&n.target===t)return!0;t=t.parent}return!1})}function Te(){d.selectAll(".link").classed("highlighted",!1)}function Se(e){const n=e.append("g").attr("class","node-controls");e.on("mouseover",Re).on("mouseout",Te).on("click",o=>je(window.d3.event,o)),[{angle:20,icon:"+",action:Ae,class:"add"},{angle:260,icon:"✎",action:De,class:"edit"},{angle:140,icon:"",action:Ee,class:"delete"}].forEach(o=>{const a=Math.cos(o.angle*Math.PI/180)*25,l=Math.sin(o.angle*Math.PI/180)*25;n.append("circle").attr("class",`control-button ${o.class}`).attr("r",12).attr("cx",a).attr("cy",l).on("click",i=>{window.d3.event.stopPropagation(),f=i,o.action()}),n.append("text").attr("class",`control-icon ${o.class}`).attr("x",a).attr("y",l).attr("text-anchor","middle").attr("dominant-baseline","central").text(o.icon)})}Ge(()=>b(),()=>{N(p,b().params.id)}),He(),Ze();var Z=mt();Fe(e=>{var n=dt();ge(8),P(e,n)});var se=u(Z);{var Qe=e=>{var n=ut(),t=u(n),o=u(t),a=u(o),l=u(a),i=c(l,2);m(a);var E=c(a,2),j=c(u(E),2);m(E);var C=c(E,2),$=u(C),D=c($,2),M=u(D);m(D);var R=c(D,2),me=c(R,2),pe=c(me,2),he=u(pe);Ke(he),ge(2),m(pe),m(C);var fe=c(C,2),O=c(u(fe),2);we(()=>{r(k),Ye(()=>{})});var X=u(O);X.value=(X.__value=1)==null?"":1;var G=c(X);G.value=(G.__value=2)==null?"":2;var H=c(G);H.value=(H.__value=3)==null?"":3;var W=c(H);W.value=(W.__value=4)==null?"":4;var ve=c(W);ve.value=(ve.__value=5)==null?"":5,m(O),m(fe),m(o),m(t),m(n),we(()=>{_e(l,"active",r(S)==="horizontal"),_e(i,"active",r(S)==="vertical"),Je(M,`${r(F)??""}%`)}),y("click",l,()=>re("horizontal")),y("click",i,()=>re("vertical")),y("input",j,T=>$e(T.currentTarget.value)),y("click",$,Me),y("click",R,Ne),y("click",me,Ie),et(he,()=>r(B),T=>N(B,T)),tt(O,()=>r(k),T=>N(k,T)),y("change",O,()=>A()),P(e,n)};Ve(se,e=>{r(K)&&e(Qe)})}var le=c(se,2),ce=u(le),de=c(u(ce),2),ue=u(de),Ce=c(ue,2);m(de),m(ce),m(le),m(Z),y("click",ue,qe),y("click",Ce,ae),P(h,Z),We()}var ht=V('<div class="w-full h-screen"><!></div>');function qt(h){var s=ht(),q=u(s);pt(q,{}),m(s),P(h,s)}export{qt as component,Et as universal};
