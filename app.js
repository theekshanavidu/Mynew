import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, updateProfile, updatePassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ---------------- FIREBASE ----------------
const firebaseConfig = { /* your config */ };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_UID = "m1rddMA36WbVunFW3B0BzuqOwyI2"; // replace with admin UID
let currentUser = null;
const root = document.getElementById("root");

// ---------------- DARK/LIGHT MODE ----------------
const modeBtn = document.getElementById("toggle-mode");
let mode = localStorage.getItem("mode") || "dark";
document.body.classList.add(mode);

modeBtn.onclick = () => {
  mode = mode === "dark" ? "light" : "dark";
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
  localStorage.setItem("mode", mode);
};

// ---------------- ELEMENT HELPER ----------------
function el(tag, attrs={}, children=[]){
  const e=document.createElement(tag);
  for(const k in attrs){
      if(k==="cls") e.className=attrs[k];
      else if(k==="html") e.innerHTML=attrs[k];
      else e.setAttribute(k, attrs[k]);
  }
  if(typeof children==="string") e.textContent=children;
  else children.forEach(c => e.appendChild(typeof c==="string"?document.createTextNode(c):c));
  return e;
}

// ---------------- AUTH ----------------
document.addEventListener("DOMContentLoaded", renderLanding);
onAuthStateChanged(auth,user=>{
  currentUser=user;
  if(user){
    if(user.uid===ADMIN_UID) renderAdminDashboard();
    else renderDashboard();
  }
});

// ---------------- Landing / Login / Signup ----------------
function renderLanding(){
  if(!root) return;
  root.innerHTML="";

  const frame = el("div",{cls:"app-frame"});
  const top = el("div",{cls:"topbar"},[ el("div",{cls:"brand"},"StudyTracker") ]);
  frame.appendChild(top);

  const panel = el("div",{cls:"split-container panel"});
  const left = el("div",{cls:"left"},[
    el("h2",{},["WELCOME BACK!"]),
    el("p",{},["Login or sign up to continue."])
  ]);

  const right = el("div",{cls:"right"});

  // Login form
  const login = el("form",{id:"login-form"});
  login.append(
    el("div",{cls:"form-field"},[el("label",{},["Email"]), el("input",{name:"email",type:"email",required:true})]),
    el("div",{cls:"form-field"},[el("label",{},["Password"]), el("input",{name:"password",type:"password",required:true})]),
    el("button",{cls:"neon-btn",type:"submit"},"Login"),
    el("div",{cls:"small-link",html:`No account? <a href="#" id="go-sign">Sign up</a>`})
  );

  // Signup form
  const signup = el("form",{id:"signup-form",style:"display:none"});
  signup.append(
    el("div",{cls:"form-field"},[el("label",{},["First Name"]), el("input",{name:"firstName",required:true})]),
    el("div",{cls:"form-field"},[el("label",{},["Last Name"]), el("input",{name:"lastName",required:true})]),
    el("div",{cls:"form-field"},[el("label",{},["Birthday"]), el("input",{name:"birthday",type:"date",required:true})]),
    el("div",{cls:"form-field"},[el("label",{},["School"]), el("input",{name:"school",required:true})]),
    el("div",{cls:"form-field"},[el("label",{},["Phone"]), el("input",{name:"phone",required:true})]),
    el("div",{cls:"form-field"},[el("label",{},["Exam Year"]), el("input",{name:"examYear",required:true})]),
    el("div",{cls:"form-field"},[el("label",{},["Email"]), el("input",{name:"email",type:"email",required:true})]),
    el("div",{cls:"form-field"},[el("label",{},["Password"]), el("input",{name:"password",type:"password",required:true})]),
    el("button",{cls:"neon-btn",type:"submit"},"Sign Up"),
    el("div",{cls:"small-link",html:`Have an account? <a href="#" id="go-login">Login</a>`})
  );

  right.append(login,signup);
  panel.append(left,right);
  frame.append(panel);
  root.append(frame);

  document.getElementById("go-sign").onclick=e=>{e.preventDefault(); signup.style.display="block"; login.style.display="none";}
  document.getElementById("go-login").onclick=e=>{e.preventDefault(); signup.style.display="none"; login.style.display="block";}

  login.onsubmit=async e=>{
    e.preventDefault();
    try{ await signInWithEmailAndPassword(auth,e.target.email.value,e.target.password.value); }
    catch(err){ alert(err.message);}
  };

  signup.onsubmit=async e=>{
    e.preventDefault();
    const f=e.target;
    try{
      const cred = await createUserWithEmailAndPassword(auth,f.email.value,f.password.value);
      await updateProfile(cred.user,{displayName:f.firstName.value+" "+f.lastName.value});
      await setDoc(doc(db,"users",cred.user.uid),{
        firstName:f.firstName.value,lastName:f.lastName.value,
        birthday:f.birthday.value,school:f.school.value,
        phone:f.phone.value,examYear:f.examYear.value,
        email:f.email.value,createdAt:new Date().toISOString()
      });
    }catch(err){alert(err.message);}
  };
}
