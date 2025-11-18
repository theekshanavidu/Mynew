// app.js - Neon UI + Firebase + Dashboard + Profile navigation

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, addDoc, collection, getDocs, getDoc, query, where, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";


// ---------------- Firebase Config ----------------
const firebaseConfig = {
    apiKey: "AIzaSyDYhulc8Qz_xGfIeb1g9A6BGO2wwbrz82M",
    authDomain: "study-9c374.firebaseapp.com",
    projectId: "study-9c374",
    storageBucket: "study-9c374.appspot.com",
    messagingSenderId: "82946998504",
    appId: "1:82946998504:web:290cd36a2559846891095d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_UID = "m1rddMA36WbVunFW3B0BzuqOwyI2";

let currentUser = null;

const root = document.getElementById("root");


// Helper
function el(tag, attrs={}, children=[]) {
  const e = document.createElement(tag);
  for(const k in attrs){
    if(k==="cls") e.className = attrs[k];
    else if(k==="html") e.innerHTML = attrs[k];
    else e.setAttribute(k, attrs[k]);
  }
  if(typeof children === 'string') e.textContent = children;
  else children.forEach(c => e.appendChild(typeof c==='string' ? document.createTextNode(c) : c));
  return e;
}


// 🔹 When Auth Changes
onAuthStateChanged(auth, u=>{
  currentUser = u;
  if(u && u.uid===ADMIN_UID) u.displayName = "Admin";

  if(u) renderDashboard();
  else renderLanding();
});


// ---------------- Landing (Login / Sign-up neon UI) ----------------
function renderLanding(){
  root.innerHTML = "";

  const frame = el("div",{cls:"app-frame"});
  const top = el("div",{cls:"topbar"},[
    el("div",{cls:"brand"},"StudyTracker")
  ]);
  frame.appendChild(top);

  const split = el("div",{cls:"split-container panel"});
  const left = el("div",{cls:"left"},[
    el("h2",{},["WELCOME BACK!"]),
    el("p",{},["Track your study hours easily. Login to continue."])
  ]);

  const right = el("div",{cls:"right"});

  // ------- Login form -------
  const login = el("form",{id:"login-form"});
  login.append(
    el("div",{cls:"form-field"},[
      el("label",{},["Email"]),
      el("input",{type:"email",name:"email",required:true})
    ]),
    el("div",{cls:"form-field"},[
      el("label",{},["Password"]),
      el("input",{type:"password",name:"password",required:true})
    ]),
    el("button",{cls:"neon-btn",type:"submit"},"Login"),
    el("div",{cls:"small-link",html:`Don't have an account? <a href="#" id="go-sign">Sign up</a>`})
  );

  // ------- Signup form -------
  const sign = el("form",{id:"signup-form",style:"display:none"});
  sign.append(
    el("div",{cls:"form-field"},[
      el("label",{},["First Name"]),
      el("input",{name:"firstName",required:true})
    ]),
    el("div",{cls:"form-field"},[
      el("label",{},["Last Name"]),
      el("input",{name:"lastName",required:true})
    ]),
    el("div",{cls:"form-field"},[
      el("label",{},["Birthday"]),
      el("input",{type:"date",name:"birthday",required:true})
    ]),
    el("div",{cls:"form-field"},[
      el("label",{},["School"]),
      el("input",{name:"school",required:true})
    ]),
    el("div",{cls:"form-field"},[
      el("label",{},["Phone"]),
      el("input",{name:"phone",required:true})
    ]),
    el("div",{cls:"form-field"},[
      el("label",{},["Exam Year"]),
      el("input",{name:"examYear",placeholder:"2026 A/L",required:true})
    ]),
    el("div",{cls:"form-field"},[
      el("label",{},["Email"]),
      el("input",{type:"email",name:"email",required:true})
    ]),
    el("div",{cls:"form-field"},[
      el("label",{},["Password"]),
      el("input",{type:"password",name:"password",required:true})
    ]),
    el("button",{cls:"neon-btn",type:"submit"},"Sign Up"),
    el("div",{cls:"small-link",html:`Already have an account? <a href="#" id="go-login">Login</a>`})
  );

  right.append(login, sign);
  split.append(left, right);
  frame.append(split);
  root.append(frame);


  // --------- Switch Pages ---------
  document.getElementById("go-sign").onclick = (e)=>{
    e.preventDefault();
    login.style.display = "none";
    sign.style.display = "block";
  };

  document.getElementById("go-login").onclick = (e)=>{
    e.preventDefault();
    sign.style.display = "none";
    login.style.display = "block";
  };


  // --------- Login ---------
  login.onsubmit = async e=>{
    e.preventDefault();
    const f = e.target;

    try{
      await signInWithEmailAndPassword(auth, f.email.value, f.password.value);
    }catch(err){
      alert(err.message);
    }
  };


  // --------- Sign-up ---------
  sign.onsubmit = async e=>{
    e.preventDefault();
    const f = e.target;

    try{
      const cred = await createUserWithEmailAndPassword(auth, f.email.value, f.password.value);
      await updateProfile(cred.user,{ displayName: f.firstName.value+" "+f.lastName.value });

      await setDoc(doc(db,"users",cred.user.uid),{
        firstName:f.firstName.value,
        lastName:f.lastName.value,
        birthday:f.birthday.value,
        school:f.school.value,
        phone:f.phone.value,
        examYear:f.examYear.value,
        email:f.email.value,
        createdAt:new Date().toISOString()
      });

    }catch(err){
      alert(err.message);
    }
  };
}


// ---------------- Dashboard ----------------
async function renderDashboard(){
  root.innerHTML = "";

  const frame = el("div",{cls:"app-frame"});

  const top = el("div",{cls:"topbar"},[
    el("div",{cls:"brand"},"StudyTracker"),
    el("div",{},[
      el("button",{cls:"neon-btn",id:"btn-profile"},"Profile"),
      el("button",{cls:"neon-btn",id:"btn-logout",style:"margin-left:8px;background:transparent;color:white;border:1px solid rgba(255,255,255,.1)"},"Logout")
    ])
  ]);

  frame.append(top);

  const dash = el("div",{cls:"dashboard"});

  // Entry Card
  const entry = el("div",{cls:"card"});
  entry.append(
    el("h3",{},["Daily Entry"]),
    el("form",{id:"daily-form"},[
      el("input",{type:"date",name:"date",value:new Date().toISOString().slice(0,10),required:true,
        style:"padding:8px;margin-top:6px;background:transparent;color:white;border:1px solid rgba(255,255,255,.1);border-radius:6px"
      }),
      el("input",{type:"number",name:"hours",placeholder:"Hours",required:true,
        style:"padding:8px;margin-top:6px;background:transparent;color:white;border:1px solid rgba(255,255,255,.1);border-radius:6px"
      }),
      el("button",{cls:"neon-btn",style:"margin-top:10px"},"Save")
    ])
  );

  // Logs
  const logs = el("div",{cls:"card"},[
    el("h3",{},["Your Logs"]),
    el("div",{id:"logs-list"},"Loading...")
  ]);

  dash.append(entry, logs);
  frame.append(dash);
  root.append(frame);


  document.getElementById("btn-profile").onclick = ()=>renderProfileView();
  document.getElementById("btn-logout").onclick = async()=>await signOut(auth);

  loadLogs();


  // Add log
  document.getElementById("daily-form").onsubmit = async e=>{
    e.preventDefault();
    const f = e.target;

    try{
      await addDoc(collection(db,"studyLogs"),{
        userId:currentUser.uid,
        date:f.date.value,
        hours:Number(f.hours.value),
        createdAt:new Date().toISOString()
      });
      alert("Saved!");
      loadLogs();
    }catch(err){ alert(err.message); }
  };


  async function loadLogs(){
    const q = query(collection(db,"studyLogs"),where("userId","==",currentUser.uid));
    const snap = await getDocs(q);

    const list = document.getElementById("logs-list");
    list.innerHTML="";

    if(snap.empty) list.textContent="No logs yet";
    else{
      snap.forEach(d=>{
        const x = d.data();
        list.append(el("div",{},`${x.date} — ${x.hours} hour(s)`));
      });
    }
  }
}


// ---------------- Profile page ----------------
async function renderProfileView(){
  root.innerHTML="";

  const frame = el("div",{cls:"app-frame"});
  const top = el("div",{cls:"topbar"},[
    el("div",{cls:"brand"},"StudyTracker"),
    el("div",{},[
      el("button",{cls:"neon-btn",id:"btn-back"},"Back to dashboard"),
      el("button",{cls:"neon-btn",id:"btn-logout",style:"margin-left:8px;background:transparent;color:white;border:1px solid rgba(255,255,255,.1)"},"Logout")
    ])
  ]);
  frame.append(top);

  const prof = el("div",{cls:"card profile-view"},["Loading..."]);
  frame.append(prof);
  root.append(frame);

  document.getElementById("btn-back").onclick = ()=>renderDashboard();
  document.getElementById("btn-logout").onclick = async()=>await signOut(auth);

  // Load user profile
  if(currentUser.uid === ADMIN_UID){
    prof.innerHTML="Admin has no profile";
    return;
  }

  const snap = await getDoc(doc(db,"users",currentUser.uid));
  if(!snap.exists()){
    prof.innerHTML="Profile not found";
    return;
  }

  const u = snap.data();

  prof.innerHTML = `
    <div>
      <h3 style="font-weight:700;font-size:20px">${u.firstName} ${u.lastName}</h3>
      <p>Email: ${u.email}</p>
      <p>Phone: ${u.phone}</p>
      <p>Birthday: ${u.birthday}</p>
      <p>School: ${u.school}</p>
      <p>Exam Year: ${u.examYear}</p>
    </div>
  `;
}


// Initial load
renderLanding();
// app.js - main frontend logic (Firebase + UI interactions)
// Note: this file keeps your database structure unchanged. It provides a modern neon split login/signup UI and a dashboard/profile navigation.
// Replace firebaseConfig values below with your existing project (if different).

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, signOut, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, addDoc, collection, getDocs, getDoc, query, where, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ---------- Firebase Config (from your original file) ----------
const firebaseConfig = {
    apiKey: "AIzaSyDYhulc8Qz_xGfIeb1g9A6BGO2wwbrz82M",
    authDomain: "study-9c374.firebaseapp.com",
    projectId: "study-9c374",
    storageBucket: "study-9c374.appspot.com",
    messagingSenderId: "82946998504",
    appId: "1:82946998504:web:290cd36a2559846891095d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ---------- Admin UID (same as original) ----------
const ADMIN_UID = "m1rddMA36WbVunFW3B0BzuqOwyI2";

let currentUser = null;

// Root element
const root = document.getElementById('root');

// Small utility
function el(tag, attrs={}, children=[]){ const e=document.createElement(tag); for(const k in attrs){ if(k==='html'){ e.innerHTML=attrs[k]; } else if(k==='cls'){ e.className=attrs[k]; } else e.setAttribute(k, attrs[k]); } if(typeof children === 'string') e.textContent = children; else children.forEach(c=> e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c)); return e; }

// --------- Authentication state ---------
onAuthStateChanged(auth, u => {
  currentUser = u;
  if(currentUser && currentUser.uid===ADMIN_UID) currentUser.displayName = "Admin";
  if(currentUser) renderDashboard();
  else renderLanding();
});

// --------- Landing (split panel with login/signup) ---------
function renderLanding(){
  root.innerHTML='';
  const frame = el('div',{cls:'app-frame'});
  const topbar = el('div',{cls:'topbar'},[ el('div',{cls:'brand'}, 'StudyTracker') , el('div',{cls:'text-sm'}, '') ]);
  frame.appendChild(topbar);

  const split = el('div',{cls:'split-container panel'});

  const left = el('div',{cls:'left'},[
    el('h2',{}, ['WELCOME BACK!']),
    el('p',{}, ['Track your study hours easily. Login to see your dashboard or create an account.'])
  ]);

  const right = el('div',{cls:'right'});

  // Login form
  const loginForm = el('form',{id:'login-form'});
  loginForm.appendChild(el('div',{cls:'form-field'},[ el('label',{},'Email'), el('input',{type:'email',name:'email',placeholder:'you@example.com',required:true}) ]));
  loginForm.appendChild(el('div',{cls:'form-field'},[ el('label',{},'Password'), el('input',{type:'password',name:'password',placeholder:'password',required:true}) ]));
  const loginBtn = el('button',{cls:'neon-btn',type:'submit'},'Login');
  loginForm.appendChild(loginBtn);
  loginForm.appendChild(el('div',{cls:'small-link',html:'<span>Don\\'t have an account?</span> <a href="#" id="show-signup">Sign up</a>'}));

  // Signup form (hidden by default)
  const signupForm = el('form',{id:'signup-form', style:'display:none;'});
  signupForm.appendChild(el('div',{cls:'form-field'},[ el('label',{},'First name'), el('input',{type:'text',name:'firstName',placeholder:'First name',required:true}) ]));
  signupForm.appendChild(el('div',{cls:'form-field'},[ el('label',{},'Last name'), el('input',{type:'text',name:'lastName',placeholder:'Last name',required:true}) ]));
  signupForm.appendChild(el('div',{cls:'form-field'},[ el('label',{},'Birthday'), el('input',{type:'date',name:'birthday',required:true}) ]));
  signupForm.appendChild(el('div',{cls:'form-field'},[ el('label',{},'School'), el('input',{type:'text',name:'school',placeholder:'School',required:true}) ]));
  signupForm.appendChild(el('div',{cls:'form-field'},[ el('label',{},'Phone'), el('input',{type:'text',name:'phone',placeholder:'Phone',required:true}) ]));
  signupForm.appendChild(el('div',{cls:'form-field'},[ el('label',{},'Exam Year'), el('input',{type:'text',name:'examYear',placeholder:'2026 A/L',required:true}) ]));
  signupForm.appendChild(el('div',{cls:'form-field'},[ el('label',{},'Email'), el('input',{type:'email',name:'email',placeholder:'you@example.com',required:true}) ]));
  signupForm.appendChild(el('div',{cls:'form-field'},[ el('label',{},'Password'), el('input',{type:'password',name:'password',placeholder:'password',required:true}) ]));
  const signupBtn = el('button',{cls:'neon-btn',type:'submit'},'Sign up');
  signupForm.appendChild(signupBtn);
  signupForm.appendChild(el('div',{cls:'small-link',html:'<span>Already have an account?</span> <a href="#" id="show-login">Login</a>'}));

  right.appendChild(loginForm);
  right.appendChild(signupForm);

  split.appendChild(left);
  split.appendChild(right);

  frame.appendChild(split);
  root.appendChild(frame);

  // event listeners
  document.getElementById('show-signup').onclick = e=>{ e.preventDefault(); loginForm.style.display='none'; signupForm.style.display='block'; left.querySelector('h2').textContent='CREATE ACCOUNT'; left.querySelector('p').textContent='Fill the form to create a free account.'; };
  document.getElementById('show-login').onclick = e=>{ e.preventDefault(); signupForm.style.display='none'; loginForm.style.display='block'; left.querySelector('h2').textContent='WELCOME BACK!'; left.querySelector('p').textContent='Track your study hours easily. Login to see your dashboard or create an account.'; };

  loginForm.onsubmit = async e=>{
    e.preventDefault();
    const f = e.target;
    try{
      await signInWithEmailAndPassword(auth,f.email.value,f.password.value);
    }catch(err){
      alert(err.message);
    }
  };

  signupForm.onsubmit = async e=>{
    e.preventDefault();
    const f = e.target;
    try{
      const cred = await createUserWithEmailAndPassword(auth,f.email.value,f.password.value);
      await updateProfile(cred.user, { displayName: f.firstName.value + ' ' + f.lastName.value });
      await setDoc(doc(db,'users',cred.user.uid),{
        firstName: f.firstName.value,
        lastName: f.lastName.value,
        birthday: f.birthday.value,
        school: f.school.value,
        phone: f.phone.value,
        examYear: f.examYear.value,
        email: f.email.value,
        createdAt: new Date().toISOString()
      });
    }catch(err){ alert(err.message); }
  };
}

// --------- Dashboard (home) ---------
async function renderDashboard(){
  root.innerHTML='';
  const frame = el('div',{cls:'app-frame'});

  const topbar = el('div',{cls:'topbar'},[ el('div',{cls:'brand'}, 'StudyTracker'), el('div',{}, [
    el('button',{cls:'neon-btn', id:'btn-profile'}, 'Profile'),
    el('button',{cls:'neon-btn', id:'btn-logout', style:'margin-left:8px; background:transparent; color:#fff; border:1px solid rgba(255,255,255,0.06);'}, 'Logout')
  ])]);
  frame.appendChild(topbar);

  const dash = el('div',{cls:'dashboard'});
  // daily entry card
  const cardEntry = el('div',{cls:'card'},[ el('h3',{},'Daily Entry'), el('form',{id:'daily-form'}, [
    el('input',{type:'date',name:'date', value:new Date().toISOString().slice(0,10), required:true, style:'padding:8px; margin-top:6px; background:transparent; color:#fff; border:1px solid rgba(255,255,255,0.06); border-radius:6px;'}),
    el('input',{type:'number',name:'hours', placeholder:'Hours studied', min:0, max:24, required:true, style:'padding:8px; margin-top:6px; background:transparent; color:#fff; border:1px solid rgba(255,255,255,0.06); border-radius:6px;'}),
    el('div',{}, [ el('button',{cls:'neon-btn', style:'margin-top:8px;'}, 'Save') ] )
  ]) ]);

  // charts placeholder (we keep Chart.js usage optional to reduce complexity)
  const charts = el('div',{cls:'card'},[ el('h3',{},'Your study logs'), el('div',{id:'logs-list'} ,'Loading...') ]);

  dash.appendChild(cardEntry);
  dash.appendChild(charts);

  frame.appendChild(dash);
  root.appendChild(frame);

  document.getElementById('btn-logout').onclick = async ()=>{ await signOut(auth); };
  document.getElementById('btn-profile').onclick = ()=> renderProfileView();

  // load logs for this user
  async function loadLogs(){
    const q = query(collection(db,'studyLogs'), where('userId','==', currentUser.uid));
    const snap = await getDocs(q);
    const list = document.getElementById('logs-list');
    list.innerHTML='';
    if(snap.empty) list.textContent='No logs yet';
    else{
      const ul = el('ul');
      snap.docs.forEach(d=>{
        const data = d.data();
        ul.appendChild(el('li',{}, `${data.date} — ${data.hours} hour(s)`));
      });
      list.appendChild(ul);
    }
  }
  loadLogs();

  document.getElementById('daily-form').onsubmit = async e=>{
    e.preventDefault();
    const f = e.target;
    try{
      await addDoc(collection(db,'studyLogs'),{
        userId: currentUser.uid,
        date: f.date.value,
        hours: Number(f.hours.value),
        createdAt: new Date().toISOString()
      });
      alert('Saved!');
      loadLogs();
    }catch(err){ alert(err.message); }
  };
}

// --------- Profile view with back to dashboard ---------
async function renderProfileView(){
  root.innerHTML='';
  const frame = el('div',{cls:'app-frame'});
  const topbar = el('div',{cls:'topbar'},[ el('div',{cls:'brand'}, 'StudyTracker'), el('div',{}, [
    el('button',{cls:'neon-btn', id:'btn-back'}, 'Back to dashboard'),
    el('button',{cls:'neon-btn', id:'btn-logout', style:'margin-left:8px; background:transparent; color:#fff; border:1px solid rgba(255,255,255,0.06);'}, 'Logout')
  ])]);
  frame.appendChild(topbar);

  const profileCard = el('div',{cls:'card profile-view'});
  profileCard.appendChild(el('div',{}, 'Loading profile...'));

  frame.appendChild(profileCard);
  root.appendChild(frame);

  document.getElementById('btn-back').onclick = ()=> renderDashboard();
  document.getElementById('btn-logout').onclick = async ()=>{ await signOut(auth); };

  // load user from users collection (admin has no profile)
  if(currentUser.uid === ADMIN_UID){ profileCard.innerHTML = '<div class=\"card\">Admin has no profile</div>'; return; }
  const snap = await getDoc(doc(db,'users', currentUser.uid));
  if(!snap.exists()){ profileCard.innerHTML = '<div class=\"card\">Profile not found</div>'; return; }
  const u = snap.data();
  profileCard.innerHTML = `
    <div>
      <h3 style="font-weight:700; font-size:20px;">${u.firstName} ${u.lastName}</h3>
      <p>Email: ${u.email}</p>
      <p>Phone: ${u.phone}</p>
      <p>School: ${u.school}</p>
      <p>Birthday: ${u.birthday}</p>
      <p>Exam Year: ${u.examYear}</p>
    </div>
  `;
}

// initial render if not logged
renderLanding();
