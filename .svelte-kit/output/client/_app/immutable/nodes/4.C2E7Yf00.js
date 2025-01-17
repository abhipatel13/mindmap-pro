import{e as T,a as u,t as _,c as ae,s as k}from"../chunks/disclose-version.COp2Sx5X.js";import{i as ie}from"../chunks/legacy.C6dZd77_.js";import{q as se,t as b,r as oe,i as o,e as t,z as w,w as d,v as g,x as s,A as de}from"../chunks/runtime.DExCUZGw.js";import{i as B}from"../chunks/preload-helper.DocKlGQB.js";import{e as ne,i as le}from"../chunks/each.DPzY1_RN.js";import{b as me,r as ce,s as J}from"../chunks/input.DoOhNRNz.js";import{p as pe}from"../chunks/event-modifiers.Bfc47y5P.js";import{o as ve}from"../chunks/index-client.BmxZP1LF.js";import{s as n}from"../chunks/supabase.BhBeyELt.js";var fe=_('<div class="bg-red-50 border-l-4 border-red-400 p-4" role="alert"><p class="text-sm text-red-700"> </p></div>'),ue=_('<div class="text-center py-12"><svg class="animate-spin h-8 w-8 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>'),he=_('<div class="text-center py-12"><h3 class="text-lg font-medium text-gray-900">No mindmaps yet</h3> <p class="mt-1 text-sm text-gray-500">Get started by creating your first mindmap!</p></div>'),we=_('<div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"><div class="px-4 py-5 sm:p-6"><div class="flex justify-between items-start"><div><h3 class="text-lg font-medium text-gray-900 truncate"><a class="hover:text-indigo-600"> </a></h3> <p class="mt-1 text-sm text-gray-500"> </p></div> <button class="text-gray-400 hover:text-red-600"><svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div></div></div>'),ge=_('<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"></div>'),_e=_('<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><div class="space-y-6"><div class="flex justify-between items-center"><h1 class="text-2xl font-semibold text-gray-900">My Mindmaps</h1></div> <div class="bg-white shadow sm:rounded-lg p-4"><form class="flex gap-4"><input type="text" placeholder="Enter mindmap title" class="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"> <button type="submit" class="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"> </button></form></div> <!> <!></div></div>');function je(K,O){se(O,!1);let p=w([]),H=w(!0),v=w(""),h=w(""),x=w(!1),E=w();ve(async()=>{const{data:{user:e}}=await n.auth.getUser();o(E,e),P()});async function P(){try{const{data:{user:e}}=await n.auth.getUser();if(!e)throw new Error("Not authenticated");const{data:a,error:r}=await n.from("mindmaps").select("*").eq("owner_id",e.id).order("created_at",{ascending:!1}),{data:i,error:M}=await n.from("mindmap_collaborators").select(`
          mindmap_id,
          role,
          mindmaps!mindmap_collaborators_mindmap_id_fkey (
            id,
            title,
            created_at,
            owner_id
          )
        `).eq("user_id",e.id);if(r||M)throw r||M;if(i){const m=[...new Set(i.map(f=>f.mindmaps.owner_id))],{data:l}=await n.from("profiles").select("id, email").in("id",m);o(p,[...a||[],...i.map(f=>({...f.mindmaps,isShared:!0,role:f.role,owner:l==null?void 0:l.find(c=>c.id===f.mindmaps.owner_id)}))||[]])}}catch(e){o(v,e.message),console.error("Error loading mindmaps:",e)}finally{o(H,!1)}}async function Q(){if(!(!t(h).trim()||t(x)))try{o(x,!0),o(v,"");const{data:{user:e}}=await n.auth.getUser();if(!e)throw new Error("Not authenticated");const{data:a,error:r}=await n.from("mindmaps").insert([{title:t(h).trim(),owner_id:e.id}]).select().single();if(r)throw r;if(!a)throw new Error("Failed to create mindmap");o(p,[a,...t(p)]),o(h,"")}catch(e){o(v,e.message),console.error("Error creating mindmap:",e)}finally{o(x,!1)}}async function W(e,a){try{o(v,"");const{data:{user:r}}=await n.auth.getUser();if(a){if(!confirm("Are you sure you want to delete this mindmap?"))return;const{error:i}=await n.from("mindmaps").delete().match({id:e});if(i)throw i}else{if(!confirm("Are you sure you want to remove this mindmap from your workspace?"))return;const{error:i}=await n.from("mindmap_collaborators").delete().match({mindmap_id:e,user_id:r==null?void 0:r.id});if(i)throw i}o(p,t(p).filter(i=>i.id!==e))}catch(r){o(v,r.message),console.error("Error:",r)}}ie();var C=_e(),L=d(C),A=g(d(L),2),U=d(A),j=d(U);ce(j);var D=g(j,2);b(()=>D.disabled=t(x)||!t(h).trim());var X=d(D,!0);s(D),s(U),s(A);var V=g(A,2);{var Y=e=>{var a=fe(),r=d(a),i=d(r,!0);s(r),s(a),b(()=>k(i,t(v))),u(e,a)};B(V,e=>{t(v)&&e(Y)})}var Z=g(V,2);{var $=e=>{var a=ue();u(e,a)},ee=e=>{var a=ae(),r=de(a);{var i=m=>{var l=he();u(m,l)},M=m=>{var l=ge();ne(l,5,()=>t(p),le,(f,c)=>{var N=we(),F=d(N),G=d(F),q=d(G),z=d(q),S=d(z),te=d(S,!0);s(S),s(z);var I=g(z,2),re=d(I);b(()=>k(re,`Created ${new Date(t(c).created_at).toLocaleDateString()??""}`)),s(I),s(q);var R=g(q,2);s(G),s(F),s(N),b(()=>{var y;J(S,"href",`/mindmaps/${t(c).id}`),k(te,t(c).title),J(R,"title",t(c).owner_id===((y=t(E))==null?void 0:y.id)?"Delete mindmap":"Remove from workspace")}),T("click",R,()=>{var y;return W(t(c).id,t(c).owner_id===((y=t(E))==null?void 0:y.id))}),u(f,N)}),s(l),u(m,l)};B(r,m=>{t(p).length===0?m(i):m(M,!1)},!0)}u(e,a)};B(Z,e=>{t(H)?e($):e(ee,!1)})}s(L),s(C),b(()=>k(X,t(x)?"Creating...":"Create New Mindmap")),me(j,()=>t(h),e=>o(h,e)),T("submit",U,pe(Q)),u(K,C),oe()}export{je as component};
