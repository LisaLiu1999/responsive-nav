// import {useState} from "react";
// import { getAuth,onAuthStateChanged,signInWithEmailAndPassword } from "firebase/auth";
// import { getAuth, signOut } from "firebase/auth";
// import {user, setUser} from "react";

// function Login() {

//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [user, setUser] = useState(null);
//   const auth = getAuth('');
  
//   // check if now is login //
//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged (auth,(currentuser) => {setUser(currentuser);
//   })
//   return unsubscribe; 
// }, []);




//   // log in function // 

//   async function handleLogIn() {
  
//   try{
//     const userCredential = await signInWithEmailAndPassword (auth, email, password);
//     console.log ("Login Success:", userCredential.user);
//   }
//   catch(error){
//     console.error("Login error:", error.message );
//   }
// }
//   function handleLogOut (){// 
//     try {
//       await signOut(auth);
//       console.log("User signed out")
//     }
//   function updateEmailState(element){
//     console.log("element.target.value")
//     setEmail(element.target.value)
//   }
//   }
//   function signOut (){

//   }

//   return (
//     <div>
//       <h1>My Profile</h1>

//       <form>

//         <div>
//           <label>Email:</label>
//           <input type="email" placeholder="Your email" 
//           value={email} 
//           onChange={(element) => setEmail(element.target.value)}
//           />
//         </div>

//         <div>
//           <label>Password:</label>
//           <input type="password" placeholder="Your password" 
//           value={password}
//           onChange={(element) => setPassword(element.target.value)}
//           />
//         </div>

//         <button type="submit">Log In</button>
//         <button type="submit">Log Out</button>

//       </form>
//     </div>
//   );
// }

// export default Login;
function Login() {
return (
      <div>
        <h1>My Profile</h1>
  
        <form>
  
          <div>
            <label>Email:</label>
            <input type="email" placeholder="Your email"/>
          </div>
  
          <div>
            <label>Password:</label>
            <input type="password" placeholder="Your password"/>
          </div>
  
          <button type="submit">Log In</button>
          <button type="submit">Log Out</button>
  
        </form>
      </div>
);
}
  export default Login;
  